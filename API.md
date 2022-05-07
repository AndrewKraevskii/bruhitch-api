# API reference

## Response On error

| Status code                                                           | Body                                | Description                                                                                                    |
| :-------------------------------------------------------------------- | :---------------------------------- | :------------------------------------------------------------------------------------------------------------- |
| The status code will be generated and additionally placed in the body | `{status: number, message: string}` | On unexpected error status code is 500, message is 'Unexpected error: `id`', where id - id of error in console |

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

- `200` - user object
- `400` - on incorrect refresh token
- `403` - on invalid refresh token
- `500` - on user does not find by refresh token
- `500` - on create refresh token error
