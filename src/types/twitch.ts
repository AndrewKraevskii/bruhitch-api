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
  ReadEmail = 'user:read:email'
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
