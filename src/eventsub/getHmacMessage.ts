import { EventSubHeader } from '$types/eventsub';
import { IncomingHttpHeaders } from 'http';

const getHmacMessage = (headers: IncomingHttpHeaders, body: string): string => {
  const id = headers[EventSubHeader.Id] as string;
  const timestamp = headers[EventSubHeader.Timestamp] as string;
  return id + timestamp + body;
};
export default getHmacMessage;
