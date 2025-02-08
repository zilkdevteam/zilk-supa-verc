import { supabase } from './supabase';

// Generate a unique device ID for anonymous tracking
const getDeviceId = () => {
  let deviceId = localStorage.getItem('device_id');
  if (!deviceId) {
    deviceId = crypto.randomUUID();
    localStorage.setItem('device_id', deviceId);
  }
  return deviceId;
};

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

export const trackEvent = async (
  eventType: AnalyticsEvent,
  businessId?: string,
  dealId?: string,
  eventData: AnalyticsEventData = {}
) => {
  try {
    const deviceId = getDeviceId();
    
    const { data, error } = await supabase.rpc('track_analytics_event', {
      p_event_type: eventType,
      p_business_id: businessId,
      p_deal_id: dealId,
      p_user_device_id: deviceId,
      p_event_data: eventData,
      p_ip_address: null, // We'll let Supabase handle this server-side
      p_user_agent: navigator.userAgent
    });

    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Error tracking analytics event:', error);
    return null;
  }
};

// Helper functions for common events
export const trackPageView = (businessId?: string) => 
  trackEvent('page_view', businessId);

export const trackDealView = (dealId: string, businessId: string) =>
  trackEvent('deal_view', businessId, dealId);

export const trackDealRedemption = (dealId: string, businessId: string) =>
  trackEvent('deal_redemption', businessId, dealId);

export const trackSpinAttempt = (dealId: string, businessId: string) =>
  trackEvent('spin_attempt', businessId, dealId);

export const trackSpinWin = (dealId: string, businessId: string, prize: any) =>
  trackEvent('spin_win', businessId, dealId, { prize });

export const trackSearch = (businessId: string | undefined, query: string) =>
  trackEvent('search', businessId, undefined, { query });

export const trackFilterChange = (businessId: string | undefined, filters: any) =>
  trackEvent('filter_change', businessId, undefined, { filters });

export const trackSortChange = (businessId: string | undefined, sortBy: string) =>
  trackEvent('sort_change', businessId, undefined, { sortBy }); 