import { supabase } from './supabase';

export type CanMessageResult = {
  canMessage: boolean;
  reason: 'job_interaction' | 'connected' | 'community_interaction' | 'blocked' | 'not_connected' | 'request_pending';
};

export async function canMessage(currentUserId: string, targetUserId: string): Promise<CanMessageResult> {
  // Check blocked
  const { data: blockedData } = await supabase
    .from('blocked_users')
    .select('id')
    .or(`and(blocker_id.eq.${currentUserId},blocked_id.eq.${targetUserId}),and(blocker_id.eq.${targetUserId},blocked_id.eq.${currentUserId})`)
    .limit(1);
    
  if (blockedData && blockedData.length > 0) {
    return { canMessage: false, reason: 'blocked' };
  }

  // Check connections
  const { data: connectedData } = await supabase
    .from('connections')
    .select('id')
    .or(`and(user_one.eq.${currentUserId},user_two.eq.${targetUserId}),and(user_one.eq.${targetUserId},user_two.eq.${currentUserId})`)
    .limit(1);

  if (connectedData && connectedData.length > 0) {
    return { canMessage: true, reason: 'connected' };
  }

  // Check pending request
  const { data: requestData } = await supabase
    .from('connection_requests')
    .select('id, status')
    .or(`and(sender_id.eq.${currentUserId},receiver_id.eq.${targetUserId}),and(sender_id.eq.${targetUserId},receiver_id.eq.${currentUserId})`)
    .eq('status', 'pending')
    .limit(1);

  if (requestData && requestData.length > 0) {
    return { canMessage: false, reason: 'request_pending' };
  }

  // Check job interactions (applications)
  // Simplified logic: If target user applied to current user's job or vice versa
  const { data: jobIntData1 } = await supabase
    .from('job_applications')
    .select('id')
    .eq('user_id', currentUserId)
    .in('job_id', (
       await supabase.from('jobs').select('id').eq('posted_by', targetUserId)
    ).data?.map(j => j.id) || [])
    .limit(1);
    
  const { data: jobIntData2 } = await supabase
    .from('job_applications')
    .select('id')
    .eq('user_id', targetUserId)
    .in('job_id', (
       await supabase.from('jobs').select('id').eq('posted_by', currentUserId)
    ).data?.map(j => j.id) || [])
    .limit(1);

  if ((jobIntData1 && jobIntData1.length > 0) || (jobIntData2 && jobIntData2.length > 0)) {
    return { canMessage: true, reason: 'job_interaction' };
  }

  // Check community interactions (target user liked or replied to current user's post)
  // Simplified check for now (we'll implement this later if needed, assuming no prior interaction)
  // In a real app we would join post likes/comments

  return { canMessage: false, reason: 'not_connected' };
}

export async function sendConnectionRequest(senderId: string, receiverId: string, message: string = '') {
  // Check 30-day cooldown
  const { data: existingDeclined } = await supabase
    .from('connection_requests')
    .select('*')
    .eq('sender_id', senderId)
    .eq('receiver_id', receiverId)
    .eq('status', 'declined')
    .order('responded_at', { ascending: false })
    .limit(1)
    .single();

  if (existingDeclined) {
    const declinedAt = new Date(existingDeclined.responded_at);
    const thirtyDaysLater = new Date(declinedAt.getTime() + 30 * 24 * 60 * 60 * 1000);
    if (new Date() < thirtyDaysLater) {
      throw new Error('You cannot send another request to this person yet. Please wait 30 days.');
    }
  }

  // Check weekly limit
  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('user_id', senderId)
    .single();

  if (profile) {
    const oneWeekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
    if (new Date(profile.connect_requests_reset_at) < oneWeekAgo) {
      await supabase.from('profiles').update({
        connect_requests_sent_this_week: 0,
        connect_requests_reset_at: new Date().toISOString()
      }).eq('user_id', senderId);
      profile.connect_requests_sent_this_week = 0;
    }

    const limit = profile.is_pro ? 20 : 5;
    if (profile.connect_requests_sent_this_week >= limit) {
      throw new Error(`You have reached your weekly connection limit. ${profile.is_pro ? '' : 'Upgrade to Pro for more.'}`);
    }
  }

  const { error } = await supabase.from('connection_requests').insert({
    sender_id: senderId,
    receiver_id: receiverId,
    message
  });

  if (error) throw error;
  
  if (profile) {
    await supabase.from('profiles').update({
      connect_requests_sent_this_week: profile.connect_requests_sent_this_week + 1
    }).eq('user_id', senderId);
  }

  // Add notification
  await supabase.from('notifications').insert({
    user_id: receiverId,
    message: `${profile?.full_name || 'Someone'} wants to connect with you on Kryd`,
  });
}

export async function sendMessage(senderId: string, conversationId: string, content: string) {
  // Check if first message
  const { data: existingMessages } = await supabase
    .from('messages')
    .select('id, sender_id')
    .eq('conversation_id', conversationId)
    .order('created_at', { ascending: true });
    
  const isFirstMessage = existingMessages?.length === 0;

  // Rule 1: No URLs in first message
  const containsUrl = /https?:\/\/|www\./i.test(content);
  if (containsUrl && isFirstMessage) {
    throw new Error('Links are not allowed in your first message. Build trust first.');
  }

  // Rule 2: Unanswered limit (10)
  if (existingMessages && existingMessages.length > 0) {
    let unansweredCount = 0;
    for (let i = existingMessages.length - 1; i >= 0; i--) {
      if (existingMessages[i].sender_id === senderId) {
        unansweredCount++;
      } else {
        break;
      }
    }
    if (unansweredCount >= 10) {
      throw new Error('Waiting for a reply before you can send more messages.');
    }
  }

  const { error } = await supabase.from('messages').insert({
    conversation_id: conversationId,
    sender_id: senderId,
    content: content,
    contains_url: containsUrl
  });

  if (error) throw error;
  
  // Update conversation last_message_at
  await supabase.from('conversations').update({
    last_message_at: new Date().toISOString()
  }).eq('id', conversationId);
}

export async function getOrCreateConversation(currentUserId: string, targetUserId: string) {
  const { data: conv } = await supabase
    .from('conversations')
    .select('*')
    .or(`and(participant_one.eq.${currentUserId},participant_two.eq.${targetUserId}),and(participant_one.eq.${targetUserId},participant_two.eq.${currentUserId})`)
    .limit(1)
    .single();
    
  if (conv) return conv;
  
  const { data: newConv, error } = await supabase
    .from('conversations')
    .insert({
      participant_one: currentUserId,
      participant_two: targetUserId
    })
    .select()
    .single();
    
  if (error) throw error;
  return newConv;
}
