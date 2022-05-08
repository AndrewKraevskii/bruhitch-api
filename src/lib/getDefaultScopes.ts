import { TwitchScope } from '$types/twitch';

const getDefaultScopes = (): TwitchScope[] => {
  return [
    TwitchScope.OpenId,
    TwitchScope.ReadEmail,
    TwitchScope.Subscriptions,
    TwitchScope.Bits,
    TwitchScope.Predictions
  ];
};

export default getDefaultScopes;
