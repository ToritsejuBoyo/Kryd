import { supabase } from './supabase'

export async function getProfile(userId: string) {
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('user_id', userId)
    .single()
  if (error) throw new Error('Could not load your profile. Please try again.')
  return data
}

export async function updateProfile(userId: string, updates: any) {
  const { data, error } = await supabase
    .from('profiles')
    .update(updates)
    .eq('user_id', userId)
    .select()
    .single()
  if (error) throw new Error('Could not update your profile. Please try again.')
  return data
}

export async function getCourses() {
  const { data, error } = await supabase
    .from('courses')
    .select('*')
    .order('created_at', { ascending: false })
  if (error) throw new Error('Could not load courses. Please try again.')
  return data
}

export async function getUserCourses(userId: string) {
  const { data, error } = await supabase
    .from('user_courses')
    .select('*, courses(*)')
    .eq('user_id', userId)
  if (error) throw new Error('Could not load your courses. Please try again.')
  return data
}

export async function getJobs() {
  const { data, error } = await supabase
    .from('jobs')
    .select('*')
    .order('created_at', { ascending: false })
  if (error) throw new Error('Could not load jobs. Please try again.')
  return data
}

export async function getUserApplications(userId: string) {
  const { data, error } = await supabase
    .from('job_applications')
    .select('*, jobs(*)')
    .eq('user_id', userId)
    .order('applied_at', { ascending: false })
  if (error) throw new Error('Could not load your job applications. Please try again.')
  return data
}

export async function getCommunityPosts(group?: string) {
  let query = supabase
    .from('community_posts')
    .select('*, profiles(full_name, avatar_url, role)')
    .order('created_at', { ascending: false })
  
  if (group) {
    query = query.eq('group_name', group)
  }

  const { data, error } = await query
  if (error) throw new Error('Could not load community posts. Please try again.')
  return data
}

export async function createCommunityPost(postData: { user_id: string, group_name: string, content: string }) {
  const { data, error } = await supabase
    .from('community_posts')
    .insert(postData)
    .select()
    .single()
  if (error) throw new Error('Could not create post. Please try again.')
  return data
}

export async function getUserPostCount(userId: string) {
  const { count, error } = await supabase
    .from('community_posts')
    .select('*', { count: 'exact', head: true })
    .eq('user_id', userId)
  if (error) throw new Error('Could not load post count. Please try again.')
  return count || 0
}

export async function getPointTransactions(userId: string) {
  const { data, error } = await supabase
    .from('point_transactions')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })
  if (error) throw new Error('Could not load your point history. Please try again.')
  return data
}

export async function getWithdrawals(userId: string) {
  try {
    const { data, error } = await supabase
      .from('withdrawals')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
    if (error) {
      console.warn('Withdrawals table query warning:', error.message)
      return []
    }
    return data || []
  } catch (err) {
    console.warn('Withdrawals fetch failed:', err)
    return []
  }
}


export async function addPoints(userId: string, amount: number, reason: string) {
  // First record the transaction
  const { error: txError } = await supabase
    .from('point_transactions')
    .insert({ user_id: userId, amount, reason })
    
  if (txError) throw new Error('Could not process points transaction. Please try again.')

  // Then update the user's total points (this could also be done via a Postgres trigger)
  // For now we'll do it manually by first fetching current points
  const profile = await getProfile(userId)
  const newPoints = (profile.points || 0) + amount

  const { data, error } = await supabase
    .from('profiles')
    .update({ points: newPoints })
    .eq('user_id', userId)
    .select()
    .single()

  if (error) throw new Error('Could not update your total points. Please try again.')
  return data
}

export async function convertPointsToCoins(userId: string, pointsToConvert: number, expectedCoinsCents: number) {
  const profile = await getProfile(userId)
  const currentPoints = profile.points || 0
  
  if (currentPoints < pointsToConvert) {
    throw new Error('Insufficient points.')
  }

  // 1. Insert points debit transaction
  const { error: txError1 } = await supabase
    .from('point_transactions')
    .insert({ user_id: userId, amount: -pointsToConvert, reason: 'converted_to_coins' })
  if (txError1) throw new Error('Could not process conversion transaction.')

  // 2. Insert coins credit transaction
  const { error: txError2 } = await supabase
    .from('point_transactions')
    .insert({ user_id: userId, amount: expectedCoinsCents, reason: 'coins_credited' })
  if (txError2) throw new Error('Could not process conversion transaction.')

  // 3. Update profile points and coins
  const { data, error } = await supabase
    .from('profiles')
    .update({ 
      points: currentPoints - pointsToConvert,
      coins: (profile.coins || 0) + expectedCoinsCents
    })
    .eq('user_id', userId)
    .select()
    .single()

  if (error) throw new Error('Could not update profile balance.')
  return data
}

export async function getCourseById(courseId: string) {
  const { data, error } = await supabase
    .from('courses')
    .select('*')
    .eq('id', courseId)
    .single()
  if (error) throw new Error('Could not load course details. Please try again.')
  return data
}

export async function enrollCourse(userId: string, courseId: string) {
  const { data, error } = await supabase
    .from('user_courses')
    .insert({ user_id: userId, course_id: courseId, progress_percent: 0 })
    .select()
    .single()
  if (error) throw new Error('Could not enrol in the course. Please try again.')
  return data
}

export async function updateCourseProgress(userId: string, courseId: string, newProgress: number) {
  const { data, error } = await supabase
    .from('user_courses')
    .update({ progress_percent: newProgress, completed_at: newProgress >= 100 ? new Date().toISOString() : null })
    .eq('user_id', userId)
    .eq('course_id', courseId)
    .select()
    .single()
  if (error) throw new Error('Could not update course progress. Please try again.')
  return data
}

export async function getJobById(jobId: string) {
  const { data, error } = await supabase
    .from('jobs')
    .select('*')
    .eq('id', jobId)
    .single()
  if (error) throw new Error('Could not load job details. Please try again.')
  return data
}

export async function applyToJob(userId: string, jobId: string) {
  const { data, error } = await supabase
    .from('job_applications')
    .insert({ user_id: userId, job_id: jobId, status: 'pending' })
    .select()
    .single()
  if (error) throw new Error('Could not apply to this job. Please try again.')
  return data
}

export async function postJob(jobData: any) {
  const { data, error } = await supabase
    .from('jobs')
    .insert(jobData)
    .select()
    .single()
  if (error) throw new Error('Could not post job. Please try again.')
  return data
}

export async function getLeaderboard() {
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .order('points', { ascending: false })
    .limit(10)
  if (error) throw new Error('Could not load leaderboard. Please try again.')
  return data
}

export async function updatePostLikes(postId: string, newLikesCount: number) {
  const { data, error } = await supabase
    .from('community_posts')
    .update({ likes_count: newLikesCount })
    .eq('id', postId)
    .select()
    .single()
  if (error) throw new Error('Could not update likes. Please try again.')
  return data
}

export async function getUnreadNotificationCount(userId: string) {
  const { count, error } = await supabase
    .from('notifications')
    .select('*', { count: 'exact', head: true })
    .eq('user_id', userId)
    .eq('is_read', false)
  if (error) throw new Error('Could not load notifications. Please try again.')
  return count || 0
}

export async function getNotifications(userId: string) {
  const { data, error } = await supabase
    .from('notifications')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })
  if (error) throw new Error('Could not load notifications. Please try again.')
  return data
}

export async function markNotificationAsRead(notificationId: string) {
  const { data, error } = await supabase
    .from('notifications')
    .update({ is_read: true })
    .eq('id', notificationId)
    .select()
    .single()
  if (error) throw new Error('Could not mark notification as read.')
  return data
}

export async function markAllNotificationsAsRead(userId: string) {
  const { error } = await supabase
    .from('notifications')
    .update({ is_read: true })
    .eq('user_id', userId)
    .eq('is_read', false)
  if (error) throw new Error('Could not mark all as read.')
  return true
}

export async function seedNotifications(userId: string) {
  const seedData = [
    { user_id: userId, message: "New job match: IT Support Specialist L2 at TechNova — 96% match", is_read: false },
    { user_id: userId, message: "You earned +50 points for completing Module 1 of CompTIA A+", is_read: false },
    { user_id: userId, message: "Your application to CloudBase Ltd was viewed by the employer", is_read: false },
    { user_id: userId, message: "Congratulations! You have advanced to Intermediate tier", is_read: false },
    { user_id: userId, message: "AI recommends: Google Cloud ACE based on your recent activity", is_read: false },
    { user_id: userId, message: "Daily challenge available — earn +50 points today", is_read: false },
  ];
  const { data, error } = await supabase
    .from('notifications')
    .insert(seedData)
    .select()
  if (error) throw new Error('Could not seed notifications.')
  return data
}

export async function saveWithdrawalInterest(userId: string) {
  const { data, error } = await supabase
    .from('notifications')
    .insert({ user_id: userId, message: 'SYSTEM: withdrawal_interest', is_read: false })
    .select()
    .single()
  if (error) throw new Error('Could not save your interest. Please try again.')
  return data
}
// Room Functions
export async function getLiveRooms() {
  const { data, error } = await supabase
    .from('rooms')
    .select('*, profiles:created_by(full_name, avatar_url)')
    .eq('is_live', true)
    .order('created_at', { ascending: false })
  
  if (error) throw new Error('Could not load live rooms.')
  return data
}

export async function getEndedRooms() {
  const { data, error } = await supabase
    .from('rooms')
    .select('*, profiles:created_by(full_name, avatar_url)')
    .eq('is_live', false)
    .order('ended_at', { ascending: false })
    .limit(10)
  
  if (error) throw new Error('Could not load ended rooms.')
  return data
}

export async function getRoomById(roomId: string) {
  const { data, error } = await supabase
    .from('rooms')
    .select('*, profiles:created_by(full_name, avatar_url)')
    .eq('id', roomId)
    .single()
  
  if (error) throw new Error('Could not load room details.')
  return data
}

export async function createRoom(roomData: any) {
  const { data, error } = await supabase
    .from('rooms')
    .insert({ ...roomData, is_live: true })
    .select()
    .single()
  
  if (error) throw new Error('Could not create room.')
  return data
}

export async function endRoom(roomId: string) {
  const { data, error } = await supabase
    .from('rooms')
    .update({ is_live: false, ended_at: new Date().toISOString() })
    .eq('id', roomId)
    .select()
    .single()
  
  if (error) throw new Error('Could not end room.')
  return data
}
