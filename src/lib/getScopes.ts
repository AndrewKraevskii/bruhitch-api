import { TwitchScope } from '../types/twitch';

const getScopes = (): TwitchScope[] => {
  return [
    TwitchScope.OpenId,
    TwitchScope.ReadEmail,
    TwitchScope.Subscriptions,
    TwitchScope.Bits,
    TwitchScope.Predictions
  ];
};

export default getScopes;
