export type Profile = {
  id: string;
  email: string;
  created_at: string;
  trial_started_at: string;
  subscription_status: "trial" | "active" | "past_due" | "canceled";
  stripe_customer_id: string | null;
  stripe_subscription_id: string | null;
};

const TRIAL_HOURS = 24;

export function getTrialInfo(profile: Profile) {
  const trialStart = new Date(profile.trial_started_at).getTime();
  const now = Date.now();
  const elapsedMs = now - trialStart;
  const trialMs = TRIAL_HOURS * 60 * 60 * 1000;
  const remainingMs = Math.max(0, trialMs - elapsedMs);

  const isTrialActive = profile.subscription_status === "trial" && remainingMs > 0;
  const hasPaidAccess = profile.subscription_status === "active";
  const hasAccess = isTrialActive || hasPaidAccess;

  return {
    isTrialActive,
    hasPaidAccess,
    hasAccess,
    remainingMs,
    remainingHours: Math.ceil(remainingMs / (60 * 60 * 1000)),
  };
}
