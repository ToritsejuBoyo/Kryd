import React, { useEffect, useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, ActivityIndicator, RefreshControl } from 'react-native';
import { useRouter } from 'expo-router';
import { Feather, FontAwesome5 } from '@expo/vector-icons';
import { getPointTransactions, getWithdrawals, getLeaderboard } from '@/lib/db';
import { useUserStore } from '@/store/userStore';
import { useUIStore } from '@/store/uiStore';
import { GlobalHeader } from '@/components/GlobalHeader';
import { PlatformFooter } from '@/components/PlatformFooter';
import { useTheme } from '@/lib/useTheme';
import { formatDual, CURRENCY_CONFIG } from '@/lib/currency';
import { DESIGN } from '@/lib/design';

export default function WalletScreen() {
  const router = useRouter();
  const profile = useUserStore((state) => state.profile);
  const { isSidebarCollapsed, toggleSidebar } = useUIStore();
  const { colors, mode } = useTheme();

  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [transactions, setTransactions] = useState<any[]>([]);
  const [withdrawals, setWithdrawals] = useState<any[]>([]);
  const [leaderboard, setLeaderboard] = useState<any[]>([]);

  const getStandardCardStyle = () => {
    const isLight = mode === 'light';
    return {
      backgroundColor: isLight ? '#FFFFFF' : 'rgba(255,255,255,0.06)',
      borderRadius: DESIGN.radius.lg,
      borderWidth: 1,
      borderColor: isLight ? '#F0F0F0' : 'rgba(255,255,255,0.1)',
      padding: DESIGN.cardPadding.md,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: isLight ? 0.08 : 0.4,
      shadowRadius: 8,
      elevation: 4,
    };
  };

  useEffect(() => {
    if (profile) fetchData();
  }, [profile?.id]);

  const fetchData = async () => {
    if (!profile) return;
    try {
      const [txData, wdData, lbData] = await Promise.all([
        getPointTransactions(profile.id),
        getWithdrawals(profile.id),
        getLeaderboard()
      ]);
      setTransactions(txData);
      setWithdrawals(wdData);
      setLeaderboard(lbData);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchData();
    setRefreshing(false);
  };

  if (loading && !refreshing) {
    return (
      <View className="flex-1 justify-center items-center" style={{ backgroundColor: colors.backgroundPrimary }}>
        <ActivityIndicator size="large" color={colors.accent} />
      </View>
    );
  }

  const pts = profile?.points || 0;
  const preferredCurrency = profile?.preferred_currency || 'USD';
  
  // Calculate balances
  const totalEarnedPoints = transactions.filter(tx => tx.amount > 0).reduce((sum, tx) => sum + tx.amount, 0);
  const totalSpentPoints = Math.abs(transactions.filter(tx => tx.amount < 0).reduce((sum, tx) => sum + tx.amount, 0));
  
  // The system stores everything internally in USD value. Points -> USD.
  const pointValueUSD = pts * CURRENCY_CONFIG.COIN_TO_USD;
  const pointValueNGN = pointValueUSD * CURRENCY_CONFIG.USD_TO_NGN;

  // Display value based on preference
  const displayTotalValue = preferredCurrency === 'USD' 
    ? `$${pointValueUSD.toFixed(2)}`
    : `₦${pointValueNGN.toLocaleString('en-NG', { minimumFractionDigits: 2 })}`;

  const displayPointsEarned = preferredCurrency === 'USD'
    ? `$${(totalEarnedPoints * CURRENCY_CONFIG.COIN_TO_USD).toFixed(2)}`
    : `₦${(totalEarnedPoints * CURRENCY_CONFIG.COIN_TO_USD * CURRENCY_CONFIG.USD_TO_NGN).toLocaleString('en-NG', { minimumFractionDigits: 2 })}`;

  const initials = profile?.full_name?.split(' ').map((n: string) => n[0]).join('').substring(0, 2).toUpperCase() || 'K';

  // Combine tx & withdrawals for history
  const history = [
    ...transactions.map(t => ({ ...t, type: 'tx' })),
    ...withdrawals.map(w => ({ ...w, type: 'wd', amount: -w.points_deducted, created_at: w.created_at }))
  ].sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());

  return (
    <View className="flex-1" style={{ backgroundColor: colors.backgroundPrimary }}>
      <GlobalHeader />
      <ScrollView 
        className="flex-1" 
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ flexGrow: 1 }}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.accent} />}
      >
        
        <View className="w-full max-w-7xl mx-auto px-4 md:px-8 py-8 flex-col lg:flex-row gap-8 relative">
          
          {/* ================= LEFT SIDEBAR ================= */}
          <View 
            className={`flex-col gap-6 transition-all duration-300 ${isSidebarCollapsed ? 'lg:w-20' : 'w-full lg:w-64 flex-shrink-0'}`}
            style={{ position: 'relative' }}
          >
            
            {/* Collapse Toggle */}
            <View className="hidden lg:flex" style={{ position: 'absolute', right: -12, top: '50%', transform: [{ translateY: -12 }], zIndex: 50 }}>
              <TouchableOpacity 
                onPress={toggleSidebar} 
                className="items-center justify-center" 
                style={{ 
                  width: 24, 
                  height: 24, 
                  borderRadius: 9999, 
                  borderWidth: 1, 
                  borderColor: colors.border, 
                  backgroundColor: colors.backgroundPrimary,
                  shadowColor: '#000',
                  shadowOpacity: 0.1,
                  shadowRadius: 4,
                  elevation: 3 
                }}
              >
                <Feather name={isSidebarCollapsed ? "chevron-right" : "chevron-left"} size={12} color={colors.textPrimary} />
              </TouchableOpacity>
            </View>

            {/* 1. User Identity Card */}
            <View 
              className="shadow-xl items-center" 
              style={{ 
                backgroundColor: '#0B2D2C', 
                borderRadius: 20, 
                borderWidth: 0,
                padding: isSidebarCollapsed ? 12 : 20,
                shadowColor: '#0B2D2C',
                shadowOffset: { width: 0, height: 4 },
                shadowOpacity: 0.4,
                shadowRadius: 16,
                elevation: 8 
              }}
            >
              <TouchableOpacity onPress={() => router.push('/(tabs)/profile' as any)}>
                <View 
                  className="rounded-full justify-center items-center mb-2 border-2" 
                  style={{ 
                    width: isSidebarCollapsed ? 40 : 48, 
                    height: isSidebarCollapsed ? 40 : 48, 
                    backgroundColor: '#CCDF1A',
                    borderColor: 'rgba(255,255,255,0.1)'
                  }}
                >
                  <Text className="font-inter-bold text-[#0B2D2C]" style={{ fontSize: isSidebarCollapsed ? 14 : 16 }}>{initials}</Text>
                </View>
              </TouchableOpacity>
              
              {!isSidebarCollapsed && (
                <>
                  <Text className="font-inter-bold text-sm mb-1 text-center text-white">{profile?.full_name}</Text>
                  
                  {/* Availability Pill inside the dark card */}
                  <View 
                    className="flex-row items-center px-3.5 py-1.5 rounded-full border mb-3 mt-1" 
                    style={{ 
                      backgroundColor: 'rgba(255,255,255,0.08)', 
                      borderColor: 'rgba(255,255,255,0.15)',
                      borderWidth: 1
                    }}
                  >
                    <View 
                      style={{ 
                        width: 8, 
                        height: 8, 
                        borderRadius: 9999, 
                        backgroundColor: '#1D9E75',
                        marginRight: 6
                      }} 
                    />
                    <Text className="font-inter text-xs text-white">Available now</Text>
                  </View>

                  <View className="px-3 py-1 rounded-full mb-4 bg-[#CCDF1A]">
                    <Text className="font-inter-bold text-[10px] text-[#0B2D2C]">
                      {profile?.points && profile.points >= 10000 ? 'Master' : profile?.points && profile.points >= 5000 ? 'Expert' : profile?.points && profile.points >= 2000 ? 'Advanced' : profile?.points && profile.points >= 500 ? 'Intermediate' : 'Novice'}
                    </Text>
                  </View>
                  
                  <View className="w-full border-t pt-3 flex-row justify-between" style={{ borderColor: 'rgba(255,255,255,0.15)' }}>
                    <View className="items-center flex-1">
                      <Text className="font-inter text-[10px] mb-1 text-white/60">Points</Text>
                      <Text className="font-inter-bold text-xs text-[#CCDF1A]">{pts.toLocaleString()}</Text>
                    </View>
                    <View className="w-[1px] h-full" style={{ backgroundColor: 'rgba(255,255,255,0.15)' }} />
                    <View className="items-center flex-1">
                      <Text className="font-inter text-[10px] mb-1 text-white/60">Balance</Text>
                      <Text className="font-inter-bold text-xs text-[#CCDF1A]">{pointValueUSD.toFixed(2)}</Text>
                    </View>
                  </View>
                </>
              )}
            </View>

            {/* Referral Widget */}
            {!isSidebarCollapsed && (
              <View 
                className="bg-gradient-to-br from-indigo-500/10 to-purple-500/10" 
                style={{ 
                  borderRadius: DESIGN.radius.lg, 
                  borderWidth: 1, 
                  borderColor: colors.border, 
                  padding: DESIGN.cardPadding.md 
                }}
              >
                <View className="flex-row items-center mb-3">
                  <View className="w-8 h-8 rounded-full items-center justify-center mr-3 bg-indigo-500/20 border border-indigo-500/30">
                    <Text className="text-sm">💰</Text>
                  </View>
                  <View>
                    <Text className="font-inter-bold text-xs" style={{ color: colors.textPrimary }}>Refer & Earn</Text>
                    <Text className="font-inter text-[10px]" style={{ color: colors.textSecondary }}>Earn 100 pts per friend</Text>
                  </View>
                </View>
                <View className="flex-row items-center p-2 rounded-lg border mb-3" style={{ backgroundColor: colors.backgroundSecondary, borderColor: colors.border }}>
                  <Text className="font-inter text-xs flex-1 ml-1" numberOfLines={1} style={{ color: colors.textSecondary }}>kryd.app/ref/user123</Text>
                  <TouchableOpacity className="px-2 py-1 rounded bg-white/10">
                    <Text className="font-inter-bold text-[10px]" style={{ color: colors.textPrimary }}>Copy</Text>
                  </TouchableOpacity>
                </View>
              </View>
            )}
          </View>

          {/* ================= MIDDLE COLUMN ================= */}
          <View className="w-full lg:flex-1 min-w-0 flex-col gap-6">
            
            <View className="border-b pb-4 mb-2" style={{ borderColor: colors.border }}>
              <Text className="font-inter-bold text-3xl mb-1" style={{ color: colors.textPrimary }}>Wallet</Text>
              <Text className="font-inter text-sm" style={{ color: colors.textSecondary }}>Manage your earnings, points, and withdrawals.</Text>
            </View>

            {/* Balance Cards side-by-side */}
            <View className="flex-col md:flex-row gap-6">
              <View 
                style={{ ...getStandardCardStyle(), position: 'relative', overflow: 'hidden', flex: 1 }}
              >
                <View className="absolute top-0 right-0 w-32 h-32 bg-accent rounded-full opacity-10 blur-3xl -mt-10 -mr-10" />
                <View className="flex-row justify-between items-start mb-4">
                  <View className="w-12 h-12 rounded-2xl bg-accent/20 items-center justify-center border border-accent/30">
                    <Feather name="zap" size={24} color={colors.accent} />
                  </View>
                </View>
                <Text className="font-inter text-sm mb-1" style={{ color: colors.textSecondary }}>Points Balance</Text>
                <Text className="font-inter-bold text-4xl mb-4" style={{ color: colors.textPrimary }}>{pts.toLocaleString()}</Text>
                <Text className="font-inter text-xs" style={{ color: colors.success }}>Total earned: {displayPointsEarned}</Text>
              </View>

              <View 
                style={{ ...getStandardCardStyle(), position: 'relative', overflow: 'hidden', flex: 1 }}
              >
                <View className="absolute top-0 right-0 w-32 h-32 bg-yellow-500 rounded-full opacity-10 blur-3xl -mt-10 -mr-10" />
                <View className="flex-row justify-between items-start mb-4">
                  <View className="w-12 h-12 rounded-2xl bg-yellow-500/20 items-center justify-center border border-yellow-500/30">
                    <FontAwesome5 name="coins" size={24} color="#FBBF24" />
                  </View>
                </View>
                <Text className="font-inter text-sm mb-1" style={{ color: colors.textSecondary }}>Fiat Balance</Text>
                <Text className="font-inter-bold text-4xl mb-4" style={{ color: colors.textPrimary }}>{displayTotalValue}</Text>
                <Text className="font-inter text-xs" style={{ color: colors.textSecondary }}>Ready for withdrawal</Text>
              </View>
            </View>

            {/* Action Buttons */}
            <View className="flex-row flex-wrap gap-4">
              <TouchableOpacity className="flex-1 min-w-[150px] p-4 rounded-2xl border items-center justify-center bg-accent/5 hover:bg-accent/10 transition-colors" style={{ borderColor: colors.accent }}>
                <Feather name="refresh-cw" size={20} color={colors.accent} className="mb-2" />
                <Text className="font-inter-medium text-xs text-center" style={{ color: colors.textPrimary }}>Convert Points to Coins</Text>
              </TouchableOpacity>
              <TouchableOpacity className="flex-1 min-w-[150px] p-4 rounded-2xl border items-center justify-center" style={{ backgroundColor: colors.cardSurface, borderColor: colors.border }}>
                <Feather name="shopping-cart" size={20} color={colors.textPrimary} className="mb-2" />
                <Text className="font-inter-medium text-xs text-center" style={{ color: colors.textPrimary }}>Buy Coins</Text>
              </TouchableOpacity>
              <TouchableOpacity className="flex-1 min-w-[150px] p-4 rounded-2xl border items-center justify-center" style={{ backgroundColor: colors.cardSurface, borderColor: colors.border }}>
                <Feather name="arrow-up-right" size={20} color={colors.textPrimary} className="mb-2" />
                <Text className="font-inter-medium text-xs text-center" style={{ color: colors.textPrimary }}>Withdraw Funds</Text>
              </TouchableOpacity>
            </View>

            {/* Transaction History */}
            <View className="mt-4">
              <Text className="font-inter-bold text-lg mb-4" style={{ color: colors.textPrimary }}>Transaction History</Text>
              <View style={{ ...getStandardCardStyle(), padding: 4, marginBottom: 16 }}>
                {history.length > 0 ? (
                  history.slice(0, 10).map((item, idx) => {
                    const isPositive = item.amount > 0;
                    return (
                      <View key={idx} className={`p-4 flex-row justify-between items-center ${idx !== history.length - 1 ? 'border-b' : ''}`} style={{ borderColor: colors.border }}>
                        <View className="flex-row items-center flex-1 pr-4">
                          <View className={`w-10 h-10 rounded-full items-center justify-center mr-4 ${isPositive ? 'bg-green-500/10' : 'bg-red-500/10'}`}>
                            <Feather name={item.type === 'wd' ? 'arrow-up-right' : (isPositive ? 'plus' : 'minus')} size={16} color={isPositive ? '#22C55E' : '#EF4444'} />
                          </View>
                          <View>
                            <Text className="font-inter-medium text-sm mb-1 capitalize" style={{ color: colors.textPrimary }}>
                              {item.type === 'wd' ? 'Withdrawal' : (item.reason?.replace(/_/g, ' ') || 'Transaction')}
                            </Text>
                            <Text className="font-inter text-xs" style={{ color: colors.textSecondary }}>
                              {new Date(item.created_at).toLocaleDateString()} at {new Date(item.created_at).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                            </Text>
                          </View>
                        </View>
                        <View className="items-end">
                          <Text className="font-inter-bold text-sm" style={{ color: isPositive ? colors.success : colors.textPrimary }}>
                            {isPositive ? '+' : ''}{item.amount} pts
                          </Text>
                          <Text className="font-inter text-[10px]" style={{ color: colors.textSecondary }}>
                            {item.status || 'Completed'}
                          </Text>
                        </View>
                      </View>
                    );
                  })
                ) : (
                  <View className="p-8 items-center justify-center">
                    <Feather name="inbox" size={32} color={colors.textSecondary} className="mb-4 opacity-50" />
                    <Text className="font-inter text-sm" style={{ color: colors.textSecondary }}>No transactions yet.</Text>
                  </View>
                )}
              </View>
              {history.length > 10 && (
                <TouchableOpacity className="py-3 items-center">
                  <Text className="font-inter-medium text-xs hover:underline" style={{ color: colors.accent }}>Load More</Text>
                </TouchableOpacity>
              )}
            </View>

          </View>

          {/* ================= RIGHT SIDEBAR ================= */}
          <View className="hidden xl:flex w-[280px] flex-shrink-0 flex-col gap-6 pt-16">
            
            {/* Currency Info */}
            <View style={getStandardCardStyle()}>
              <Text className="font-inter-bold text-[10px] uppercase mb-4" style={{ color: colors.textSecondary }}>Your Currency</Text>
              
              <View className="flex-row justify-between items-center mb-4 pb-4 border-b" style={{ borderColor: colors.border }}>
                <Text className="font-inter text-xs" style={{ color: colors.textPrimary }}>Preference:</Text>
                <View className="px-3 py-1 rounded bg-white/10 border" style={{ borderColor: colors.border }}>
                  <Text className="font-inter-bold text-xs" style={{ color: colors.textPrimary }}>{preferredCurrency}</Text>
                </View>
              </View>
              
              <Text className="font-inter-medium text-xs mb-3" style={{ color: colors.textSecondary }}>Current Exchange Rate</Text>
              <View className="flex-row justify-between items-center">
                <Text className="font-inter text-xs" style={{ color: colors.textPrimary }}>100 Points</Text>
                <Text className="font-inter-bold text-xs" style={{ color: colors.success }}>
                  {preferredCurrency === 'USD' ? `$${(100 * CURRENCY_CONFIG.COIN_TO_USD).toFixed(2)}` : `₦${(100 * CURRENCY_CONFIG.COIN_TO_USD * CURRENCY_CONFIG.USD_TO_NGN).toLocaleString()}`}
                </Text>
              </View>
            </View>

            {/* Security and Trust */}
            <View 
              style={{ 
                ...getStandardCardStyle(), 
                backgroundColor: mode === 'light' ? '#F4FBF7' : 'rgba(34,197,94,0.05)', 
                borderColor: 'rgba(34,197,94,0.2)' 
              }}
            >
              <View className="flex-row items-center mb-4">
                <Feather name="shield" size={16} color="#22C55E" className="mr-2" />
                <Text className="font-inter-bold text-[10px] uppercase text-green-500">Security & Trust</Text>
              </View>
              
              <View className="flex-col gap-y-3">
                <View className="flex-row items-start">
                  <Feather name="check" size={12} color="#22C55E" className="mr-2 mt-0.5" />
                  <Text className="font-inter text-xs flex-1 leading-relaxed" style={{ color: colors.textPrimary }}>All funds are held in secure escrow accounts.</Text>
                </View>
                <View className="flex-row items-start">
                  <Feather name="check" size={12} color="#22C55E" className="mr-2 mt-0.5" />
                  <Text className="font-inter text-xs flex-1 leading-relaxed" style={{ color: colors.textPrimary }}>End-to-end encryption for all transactions.</Text>
                </View>
                <View className="flex-row items-start">
                  <Feather name="check" size={12} color="#22C55E" className="mr-2 mt-0.5" />
                  <Text className="font-inter text-xs flex-1 leading-relaxed" style={{ color: colors.textPrimary }}>Withdrawals processed within 24-48 business hours.</Text>
                </View>
              </View>
            </View>

          </View>

        </View>

        <PlatformFooter />
      </ScrollView>
    </View>
  );
}
