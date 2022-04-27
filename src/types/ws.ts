import { TwitchEventFollowData } from './twitch';

export enum MessageType {
  SubscribeFollow = 'subscribe/follow'
}

export type SubscribeFollowRequest = {
  type: MessageType.SubscribeFollow;
};
export type SubscribeFollowResponse = {
  type: MessageType.SubscribeFollow;
  data: TwitchEventFollowData;
};

export type MessageRequest = SubscribeFollowRequest;
export type MessageResponse = { message: MessageType } | SubscribeFollowResponse;
