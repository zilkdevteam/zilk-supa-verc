import { supabase } from './supabase';

// Types for analytics events
export type AnalyticsEvent = 
  | 'page_view'
  | 'deal_view'
  | 'deal_redemption'
  | 'spin_attempt'
  | 'spin_win'
  | 'search'
  | 'filter_change'
  | 'sort_change';

export interface AnalyticsEventData {
  [key: string]: any;
}

// Function to get or generate a device ID for anonymous tracking
function getDeviceId(): string {
  if (typeof window === 'undefined') return '';
  
  let deviceId = localStorage.getItem('zilk_device_id');
  if (!deviceId) {
    deviceId = crypto.randomUUID();
    localStorage.setItem('zilk_device_id', deviceId);
  }
  return deviceId;
}

// Generic event tracking function
async function trackEvent(
  eventType: AnalyticsEvent,
  businessId?: string,
  dealId?: string,
  eventData: AnalyticsEventData = {}
) {
  try {
    const deviceId = getDeviceId();
    if (!deviceId) return;

    const { error } = await supabase.rpc('track_analytics_event', {
      p_event_type: eventType,
      p_business_id: businessId,
      p_deal_id: dealId,
      p_user_device_id: deviceId,
      p_event_data: {
        ...eventData,
        user_agent: navigator.userAgent,
        timestamp: new Date().toISOString(),
      }
    });

    if (error) throw error;
  } catch (error) {
    console.error(`Error tracking ${eventType}:`, error);
  }
}

// Track when a deal is viewed
export async function trackDealView(dealId: string, businessId: string) {
  return trackEvent('deal_view', businessId, dealId);
}

// Track when a deal is redeemed
export async function trackDealRedemption(dealId: string, businessId: string) {
  return trackEvent('deal_redemption', businessId, dealId);
}

// Track spin wheel attempts
export async function trackSpinAttempt(dealId: string, businessId: string) {
  return trackEvent('spin_attempt', businessId, dealId);
}

// Track spin wheel wins
export async function trackSpinWin(dealId: string, businessId: string, prize: any) {
  return trackEvent('spin_win', businessId, dealId, { prize });
}

// Track search queries
export async function trackSearch(query: string, businessId?: string) {
  return trackEvent('search', businessId, undefined, { query });
}

// Track filter changes
export async function trackFilterChange(filters: any, businessId?: string) {
  return trackEvent('filter_change', businessId, undefined, { filters });
}

// Track sort changes
export async function trackSortChange(sortBy: string, businessId?: string) {
  return trackEvent('sort_change', businessId, undefined, { sortBy });
}

// Get analytics for a specific deal
export async function getDealAnalytics(dealId: string) {
  try {
    const { data: events } = await supabase
      .from('analytics_events')
      .select('*')
      .eq('deal_id', dealId);

    if (!events) return { views: 0, redemptions: 0, conversion_rate: 0 };

    const views = events.filter(e => e.event_type === 'deal_view').length;
    const redemptions = events.filter(e => e.event_type === 'deal_redemption').length;
    const spinAttempts = events.filter(e => e.event_type === 'spin_attempt').length;
    const spinWins = events.filter(e => e.event_type === 'spin_win').length;

    return {
      views,
      redemptions,
      conversion_rate: views ? (redemptions / views) * 100 : 0,
      spin_attempts: spinAttempts,
      spin_wins: spinWins,
      spin_conversion_rate: spinAttempts ? (spinWins / spinAttempts) * 100 : 0
    };
  } catch (error) {
    console.error('Error getting deal analytics:', error);
    return {
      views: 0,
      redemptions: 0,
      conversion_rate: 0,
      spin_attempts: 0,
      spin_wins: 0,
      spin_conversion_rate: 0
    };
  }
}

// Get business analytics summary
export async function getBusinessAnalytics(businessId: string, timeRange?: string) {
  try {
    let query = supabase
      .from('business_analytics_summary')
      .select('*')
      .eq('business_id', businessId);

    if (timeRange) {
      const now = new Date();
      let startDate = new Date();

      switch (timeRange) {
        case 'week':
          startDate.setDate(now.getDate() - 7);
          break;
        case 'month':
          startDate.setMonth(now.getMonth() - 1);
          break;
        case 'year':
          startDate.setFullYear(now.getFullYear() - 1);
          break;
      }

      query = query.gte('date', startDate.toISOString());
    }

    const { data, error } = await query;
    if (error) throw error;

    return data || [];
  } catch (error) {
    console.error('Error getting business analytics:', error);
    return [];
  }
} 