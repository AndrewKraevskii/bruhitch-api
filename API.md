# API reference

## Response On error

```typescript
{
  status: number;
  message: string;
}
```

| Status code                                                           | Description                                                                                                    |
| :-------------------------------------------------------------------- | :------------------------------------------------------------------------------------------------------------- |
| The status code will be generated and additionally placed in the body | On unexpected error status code is 500, message is 'Unexpected error: `id`', where id - id of error in console |

## `GET` /api/v1/auth/login

### How to use

> Use to authorize user by Twitch

### Description

1. Generate redirect URI
2. Add Claims, ClientId, RedirectURI, ResponseType and Scope

### Result

- `307` - redirect to Twitch OAuth page

## `GET` /api/v1/auth/logout

### How to use

> Use to logout

### Description

1. Clear access token and refresh token

### Result

- `308` - redirect to /

## `GET` /api/v1/auth/callback

### How to use

> Uses Twitch after OAuth

### Query Parameters

- `error` - Error from Twitch
- `error_description` - Error description
- `code` - Code. Result of OAuth
- `scope` - List of scope

### Description

1. Validate callback
2. Get OAuth token
3. Get User Info
4. Create or Get User from DataBase
5. Update or Create Twitch. On create Twitch also create Twitch Token
6. Generate Access Token
7. Update or Create Refresh Token
8. Set Access and Refresh tokens in cookie
9. Redirect to /

### Result

- `308` - redirect to /
- `400` - on code is invalid
- `403` - on twitch send error. In message error description
- `403` - on scopes are not equals of default app scopes
- `500` - on get OAuth Token error
- `500` - on get User Info error

## `POST` /api/v1/auth/refresh

### How to use

> Uses to refresh auth tokens

### Cookies

- `rt` - Refresh token

### Description

1. Check for refresh token
2. Validate refresh token
3. Get User using refresh token
4. Update refresh token
5. Set new access and refresh tokens in cookie
6. Send user object

### Result

- `200` - Result object
- `400` - on incorrect refresh token
- `403` - on invalid refresh token
- `500` - on user does not find by refresh token
- `500` - on create refresh token error

#### Result Object

```typescript
{
  id: string;
  username: string;
  avatar: string;
  createdAt: string;
  updatedAt: string;
}
```

## `GET` /api/v1/chat/badges

### How to use

> Use to get badges from specific channel

### Query Parameters

- `channel` - Channel on twitch

### Description

1. Check for channel
2. Get App access token
3. Get Broadcaster Id
4. Fetch All Badges
5. Send badges with broadcasterId

### Result

- `200` - Result Object
- `400` - on channel is not defined
- `500` - on get access token error
- `500` - on get broadcaster id error

#### Result Object

```typescript
{
  broadcasterId: string;
  badges: TwitchBadge[]
}
```

## `GET` /api/v1/chat/link

### How to use

> Get chat config link

### Cookies

- `at` - Access token

### Description

1. Check for access token
2. Validate access token
3. Get chat settings link
4. Send link

### Result

- `200` - Result Object
- `403` - on incorrect access token
- `403` - on invalid access token

#### Result Object

```typescript
{
  link: string | null;
}
```

## `POST` /api/v1/chat/link

### How to use

> Save chat config link

### Body

```typescript
{
  link: string;
}
```

### Cookies

- `at` - Access token

### Description

1. Check for link
2. Check for access token
3. Validate access token
4. Save chat settings link
5. Send link

### Result

- `200` - Result Object
- `400` - on incorrect link
- `403` - on incorrect access token
- `403` - on invalid access token

#### Result Object

```typescript
{
  link: string;
}
```

## `DELETE` /api/v1/user/remove

### How to use

> Remove account

### Cookies

- `at` - Access token

### Description

1. Check for access token
2. Validate access token
3. Delete user and revoke twitch access token
4. Send deleted user

### Result

- `200` - Result Object
- `403` - on incorrect access token
- `403` - on invalid access token
- `500` - on delete user error

#### Result Object

```typescript
{
  id: string;
  username: string;
  avatar: string;
  createdAt: string;
  updatedAt: string;
}
```

## `GET` /api/v1/user/token

### How to use

> Get token to use in widgets

### Cookies

- `at` - Access token

### Description

1. Check for access token
2. Validate access token
3. Get token
4. Send token

### Result

- `200` - Result Object
- `403` - on incorrect access token
- `403` - on invalid access token

#### Result Object

```typescript
{
  token: TwitchToken | null;
}
```

## `PATCH` /api/v1/user/token

### How to use

> Refresh token

### Cookies

- `at` - Access token

### Description

1. Check for access token
2. Validate access token
3. Recreate token

### Result

- `200` - Result Object
- `403` - on incorrect access token
- `403` - on invalid access token

#### Result Object

```typescript
{
  token: TwitchToken | null;
}
```

## `GET` /api/v1/user/twitch

### How to use

> Get twitch user token and other info

### Query parameters

- `token` - Twitch token

### Description

1. Check for twitch token
2. Get user by twitch token and select Twitch refresh token
3. Refresh token
4. Check required scopes to equal default scopes
5. Update Twitch, add access and refresh tokens
6. Send user info

### Result

- `200` - Result Object
- `403` - on incorrect twitch token
- `403` - on invalid twitch token
- `403` - required scopes are not equals default scopes
- `500` - does not find twitch token
- `500` - does not find twitch
- `500` - on refresh token error

#### Result Object

```typescript
{
  accessToken: string;
  userId: string;
  user: string;
  clientId: string;
  scope: TwitchScope[];
}
```

## `GET` /api/v1/subscribe/settings

### How to use

> Get subscribe config

### Query parameters

- `token` - Twitch token

### Description

1. Check for twitch token
2. Get subscribe settings by twitch token
3. Delete private fields
4. Send subscribe settings

### Result

- `200` - Result Object
- `403` - on incorrect twitch token
- `403` - on invalid twitch token

#### Result Object

```typescript
SubscribeSettings || null;
```

## `POST` /api/v1/subscribe/settings

### How to use

> Save subscribe config

### Cookies

- `at` - Access token

### Description

1. Check for access token
2. Validate access token
3. Update or subscribe settings
4. Delete private fields
5. Send subscribe settings

### Result

- `200` - Result Object
- `403` - on incorrect access token
- `403` - on invalid access token

#### Result Object

```typescript
SubscribeSettings || null;
```

## `GET` /api/v1/follow/settings

### How to use

> Get follow config

### Query parameters

- `token` - Twitch token

### Description

1. Check for twitch token
2. Get follow settings by twitch token
3. Delete private fields
4. Send follow settings

### Result

- `200` - Result Object
- `403` - on incorrect twitch token
- `403` - on invalid twitch token

#### Result Object

```typescript
FollowSettings || null;
```

## `POST` /api/v1/follow/settings

### How to use

> Save follow config

### Cookies

- `at` - Access token

### Description

1. Check for access token
2. Validate access token
3. Update or follow settings
4. Delete private fields
5. Send follow settings

### Result

- `200` - Result Object
- `403` - on incorrect access token
- `403` - on invalid access token

#### Result Object

```typescript
FollowSettings || null;
```

## `POST` /api/v1/follow/callback

### How to use

> Uses as EventSub callback on channel.follow subscription

### Query parameters

- `clientId` - WsClient Id

### Description

1. Check for clientId
2. Verify message
3. Validate clientId
4. Check for type of subscription
5. Check for type of message

#### On Notification

1. Add EventSub Id if does not already exist
2. Check notification life time
3. Send event to client

#### On Verification

1. Add EventSub Id if does not already exist
2. Send Verification CallbackResponseMessageType.VerificationFollow
3. Set Status Code as 200
4. Set Content-Type as text/plain
5. Set content as `data.challenge`

#### On Revocation

1. Send Reconnect to WsClient
2. Send No Content

#### On Undefined

1. Log type
2. Send Not Found

### Result

- `202` - on revocation
- `202` - on notification is over lifetime
- `400` - on incorrect clientId
- `400` - on incorrect subscription type
- `403` - on invalid clientId
- `403` - on failed verification
- `404` - on undefined message type

## `GET` /api/v1/prediction/settings

### How to use

> Get prediction config

### Query parameters

- `token` - Twitch token

### Description

1. Check for twitch token
2. Get prediction settings by twitch token
3. Delete private fields
4. Send prediction settings

### Result

- `200` - Result Object
- `403` - on incorrect twitch token
- `403` - on invalid twitch token

#### Result Object

```typescript
PredictionSettings || null;
```

## `POST` /api/v1/prediction/settings

### How to use

> Save prediction config

### Cookies

- `at` - Access token

### Description

1. Check for access token
2. Validate access token
3. Update or prediction settings
4. Delete private fields
5. Send prediction settings

### Result

- `200` - Result Object
- `403` - on incorrect access token
- `403` - on invalid access token

#### Result Object

```typescript
PredictionSettings || null;
```

## `POST` /api/v1/prediction/callback

### How to use

> Uses as EventSub callback on channel.prediction.(begin|progress|end) subscription

### Query parameters

- `clientId` - WsClient Id

### Description

1. Check for clientId
2. Verify message
3. Validate clientId
4. Check for type of subscription
5. Check for type of message

#### On Notification

1. Add EventSub Id if does not already exist
2. Check notification life time
3. Send event to client

#### On Verification

1. Add EventSub Id if does not already exist
2. Send Verification CallbackResponseMessageType.VerificationPrediction(Begin|Progress|End)
3. Set Status Code as 200
4. Set Content-Type as text/plain
5. Set content as `data.challenge`

#### On Revocation

1. Send Reconnect to WsClient
2. Send No Content

#### On Undefined

1. Log type
2. Send Not Found

### Result

- `202` - on revocation
- `202` - on notification is over lifetime
- `400` - on incorrect clientId
- `400` - on incorrect subscription type
- `403` - on invalid clientId
- `403` - on failed verification
- `404` - on undefined message type
