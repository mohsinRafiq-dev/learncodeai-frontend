// Billing API client — wraps the backend /api/billing endpoints and exposes
// helpers for the Pricing page, locked-content overlay, and settings panel.

const API_BASE_URL =
  import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

export type SubscriptionTier = 'free' | 'pro' | 'lifetime';

export interface BillingStatus {
  tier: SubscriptionTier;
  status: string | null;
  expiresAt: string | null;
  purchasedCourses: string[];
  hasStripeCustomer: boolean;
  hasActiveSubscription: boolean;
}

const authHeaders = () => {
  const token = localStorage.getItem('authToken');
  return token ? { Authorization: `Bearer ${token}` } : {};
};

export const fetchMyBilling = async (): Promise<BillingStatus | null> => {
  try {
    const res = await fetch(`${API_BASE_URL}/billing/me`, {
      headers: { ...authHeaders() },
      credentials: 'include',
    });
    if (!res.ok) return null;
    const data = await res.json();
    return data.data as BillingStatus;
  } catch (err) {
    console.error('billing/me failed:', err);
    return null;
  }
};

export type CheckoutPlan = 'pro_monthly' | 'pro_yearly' | 'lifetime' | 'course';

export const startCheckout = async (params: {
  plan: CheckoutPlan;
  courseId?: string;
  courseLanguage?: 'python' | 'javascript' | 'cpp';
}): Promise<{ ok: boolean; url?: string; message?: string }> => {
  try {
    const res = await fetch(`${API_BASE_URL}/billing/create-checkout-session`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', ...authHeaders() },
      credentials: 'include',
      body: JSON.stringify(params),
    });
    const data = await res.json();
    if (!res.ok) {
      return { ok: false, message: data?.message || 'Checkout failed' };
    }
    return { ok: true, url: data?.data?.url };
  } catch (err) {
    console.error('startCheckout failed:', err);
    return { ok: false, message: 'Network error' };
  }
};

export const openBillingPortal = async (): Promise<{
  ok: boolean;
  url?: string;
  message?: string;
}> => {
  try {
    const res = await fetch(`${API_BASE_URL}/billing/create-portal-session`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', ...authHeaders() },
      credentials: 'include',
    });
    const data = await res.json();
    if (!res.ok) return { ok: false, message: data?.message || 'Portal failed' };
    return { ok: true, url: data?.data?.url };
  } catch (err) {
    console.error('openBillingPortal failed:', err);
    return { ok: false, message: 'Network error' };
  }
};

export const hasProAccess = (b: BillingStatus | null): boolean => {
  if (!b) return false;
  if (b.tier === 'lifetime') return true;
  if (b.tier !== 'pro') return false;
  const okStatus = ['active', 'trialing'].includes(b.status || '');
  const notExpired =
    !b.expiresAt || new Date(b.expiresAt).getTime() > Date.now();
  return okStatus && notExpired;
};
