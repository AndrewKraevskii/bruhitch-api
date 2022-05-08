import unsubscribeFromFailed from '$eventsub/unsubscribeFromFailed';
import http from 'http';

const unsubscribe = (server: http.Server) => {
  server.once('listening', () => {
    unsubscribeFromFailed(true);
    setInterval(unsubscribeFromFailed, 1000 * 60 * 5);
  });
};

export default unsubscribe;
