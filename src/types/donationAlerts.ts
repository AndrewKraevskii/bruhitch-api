export enum DonationAlertsScope {
  UserShow = 'oauth-user-show',
  DonationSubscribe = 'oauth-donation-subscribe',
  DonationIndex = 'oauth-donation-index',
  CustomAlerts = 'oauth-custom_alert-store',
  GoalSubscribe = 'oauth-goal-subscribe',
  PollSubscribe = 'oauth-poll-subscribe'
}

export type TokenResponse = {
  token_type: string;
  access_token: string;
  expires_in: number;
  refresh_token: string;
};
