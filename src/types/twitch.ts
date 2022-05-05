export type TwitchClaims = {
  id_token?: { email?: null; email_verified?: null; picture?: null; preferred_username?: null };
  userinfo?: {
    email?: null;
    email_verified?: null;
    picture?: null;
    preferred_username?: null;
  };
};

export enum TwitchScope {
  OpenId = 'openid',
  ReadEmail = 'user:read:email',
  Subscriptions = 'channel:read:subscriptions',
  Bits = 'bits:read',
  Predictions = 'channel:read:predictions'
}

export type OAuthToken = {
  access_token: string;
  expires_in: number;
  id_token: string;
  nonce?: string;
  refresh_token: string;
  scope: TwitchScope[];
  token_type: string;
};

export type RefreshToken = Omit<Omit<OAuthToken, 'id_token'>, 'nonce'>;

export type TwitchError = { status: number; message: string };

export type UserData = {
  aud: string;
  exp: number;
  iat: number;
  iss: string;
  sub: string;
  email: string;
  email_verified: boolean;
  picture: string;
  preferred_username: string;
};

export enum TwitchHeader {
  Id = 'twitch-eventsub-message-id',
  Retry = 'twitch-eventsub-message-retry',
  Signature = 'twitch-eventsub-message-signature',
  Timestamp = 'twitch-eventsub-message-timestamp',
  Type = 'twitch-eventsub-message-type',
  SubscriptionType = 'twitch-eventsub-subscription-type',
  SubscriptionVersion = 'twitch-eventsub-subscription-version'
}

export enum TwitchEventSubType {
  Verification = 'webhook_callback_verification',
  Notification = 'notification',
  Revocation = 'revocation'
}

export type TwitchEventFollowData = {
  user_id: string;
  user_login: string;
  user_name: string;
  broadcaster_user_id: string;
  broadcaster_user_login: string;
  broadcaster_user_name: string;
  followed_at: string;
};

export type Predictor = {
  user_id: string;
  user_login: string;
  user_name: string;
  channel_points_won: number | null;
  channel_points_used: number;
};

export type PredictionOutcome = {
  id: string;
  title: string;
  color: 'blue' | 'pink';
  users?: number;
  channel_points?: number;
  top_predictors?: Predictor[];
};

export type TwitchEventPredictionData = {
  id: string;
  broadcaster_user_id: string;
  broadcaster_user_login: string;
  broadcaster_user_name: string;
  title: string;
  outcomes: PredictionOutcome[];
  started_at: string;
  locks_at: string;
};

export type TwitchEventPredictionEndData = {
  id: string;
  broadcaster_user_id: string;
  broadcaster_user_login: string;
  broadcaster_user_name: string;
  title: string;
  winning_outcome_id: string;
  outcomes: PredictionOutcome[];
  status: 'resolved' | 'canceled';
  started_at: string;
  ended_at: string;
};

export type TwitchEventData =
  | TwitchEventFollowData
  | TwitchEventPredictionData
  | TwitchEventPredictionEndData;

export type TwitchEventSubResponse = {
  challenge: string;
  subscription: {
    id: string;
    status: string;
    type: string;
    version: string;
    condition: object;
    transport: {
      method: string;
      callback: string;
    };
    created_at: string;
    cost: number;
  };
  event: TwitchEventData;
};

export enum TwitchEventType {
  Follow = 'channel.follow',
  PredictionBegin = 'channel.prediction.begin',
  PredictionProgress = 'channel.prediction.progress',
  PredictionEnd = 'channel.prediction.end'
}
