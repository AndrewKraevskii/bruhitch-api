export enum EventSubHeader {
  Id = 'twitch-eventsub-message-id',
  Retry = 'twitch-eventsub-message-retry',
  Signature = 'twitch-eventsub-message-signature',
  Timestamp = 'twitch-eventsub-message-timestamp',
  Type = 'twitch-eventsub-message-type',
  SubscriptionType = 'twitch-eventsub-subscription-type',
  SubscriptionVersion = 'twitch-eventsub-subscription-version'
}

export enum EventSubCallbackType {
  Verification = 'webhook_callback_verification',
  Notification = 'notification',
  Revocation = 'revocation'
}

export type EventSubFollowData = {
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

export type EventSubPredictionData = {
  id: string;
  broadcaster_user_id: string;
  broadcaster_user_login: string;
  broadcaster_user_name: string;
  title: string;
  outcomes: PredictionOutcome[];
  started_at: string;
  locks_at: string;
};

export type EventSubPredictionEndData = {
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

export type EventSubData = EventSubFollowData | EventSubPredictionData | EventSubPredictionEndData;

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
  event: EventSubData;
};

export enum EventSubType {
  Follow = 'channel.follow',
  PredictionBegin = 'channel.prediction.begin',
  PredictionProgress = 'channel.prediction.progress',
  PredictionEnd = 'channel.prediction.end'
}
