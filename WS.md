# WS reference

## To Request in web socket use JSON string

```typescript
{
  type: RequestMessageType;
  data?: T;
}
```

## To Response web socket uses JSON string

```typescript
{
  type: ResponseMessageType;
  message?: string;
  data?: T;
}
```

## Response On error

```typescript
{
  type: BaseResponseMessageType.Error; // error
  message: string;
}
```

## How to use

> Use WebSocket to subscribe on EventSub events

## Query parameters

- `token` - Twitch token

## On connect

1. Check for twitch token
2. Get user by twitch token
3. Initialize WsClient and push into WsClients

## On message

1. Convert Buffer to string
2. Convert string to json data
3. Check type of request

### On `RequestMessageType.SubscribeFollow`

1. Subscribe on eventSub channel.follow

#### Subscribe on Follow EventSub

1. Get WsClient
2. Check subscribe types against an existing type
3. Get App access token
4. Subscribe on EventSub channel.follow
5. Add subscribe type to subscribe types
6. Send `WSResponseMessageType.Subscribed`

### On `RequestMessageType.SubscribePrediction`

1. Subscribe on eventSub channel.prediction.begin
2. Subscribe on eventSub channel.prediction.progress
3. Subscribe on eventSub channel.prediction.end

#### Subscribe on Prediction Begin|Progress|End EventSub

1. Get WsClient
2. Check subscribe types against an existing type
3. Get App access token
4. Subscribe on EventSub channel.prediction.begin
5. Subscribe on EventSub channel.prediction.progress
6. Subscribe on EventSub channel.prediction.end
7. Add subscribe type to subscribe types
8. Send `WSResponseMessageType.Subscribed`

### On `RequestMessageType.Ping`

1. Send `WSResponseMessageType.Pong`

```typescript
{
  type: WSResponseMessageType.Pong; // PONG
}
```

## On error

1. Send to client error message

```typescript
{
  type: BaseResponseMessageType.Error; // error
  message: string;
}
```

## On close

1. Remove WsClient (unsubscribe from eventSub events and remove from WsClients)

## Results

- `1011` - on get twitch token error
- `3000` - on incorrect token
- `3000` - on invalid token
- `3002` - on incorrect request type
