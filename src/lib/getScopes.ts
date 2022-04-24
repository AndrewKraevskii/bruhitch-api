import { TwitchScope } from '../types/twitch';

const getScopes = (): TwitchScope[] => {
  return [TwitchScope.OpenId, TwitchScope.ReadEmail];
};

export default getScopes;
