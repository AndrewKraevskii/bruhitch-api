import createWebSocketCallback from '$eventsub/createWebSocketCallback';
import http from 'http';
import WebSocket from 'ws';

export const createWebSocketServer = (server: http.Server): WebSocket.Server => {
  const webSocketServer = new WebSocket.Server({ server, path: '/ws/v1' });

  webSocketServer.on('connection', createWebSocketCallback(webSocketServer));

  return webSocketServer;
};

export default createWebSocketServer;
