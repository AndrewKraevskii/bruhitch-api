import { Router } from 'express';
import { StatusCodes } from 'http-status-codes';
import { getErrorMessage } from '../../../../lib/error';
import fetchChannelBadges from '../../../../lib/fetchChannelBadges';
import fetchGlobalBadges from '../../../../lib/fetchGlobalBadges';
import getAccessToken from '../../../../lib/getAccessToken';
import getEnv from '../../../../lib/getEnv';
import getUserId from '../../../../lib/getUserId';
import { TwitchBadge } from '../../../../types/badge';
import { Environment } from '../../../../types/env';

const badges = Router();

const mergeBadges = (badges: TwitchBadge[], badges2: TwitchBadge[]): TwitchBadge[] => {
  let mergedBadges = badges2;

  badges.forEach((twitchBadge) => {
    const sameBadge = mergedBadges.find((m) => m.set_id === twitchBadge.set_id);
    if (!sameBadge) return mergedBadges.push(twitchBadge);
    const resultVersions = [
      ...sameBadge.versions,
      ...twitchBadge.versions.filter((tb) => !sameBadge.versions.map((v) => v.id).includes(tb.id))
    ];
    mergedBadges = [
      ...mergedBadges.filter((b) => b.set_id !== sameBadge.set_id),
      { set_id: sameBadge.set_id, versions: resultVersions }
    ];
  });

  return mergedBadges;
};

const fetchAllBadges = async (
  broadcasterId: string,
  clientId: string,
  accessToken: string
): Promise<TwitchBadge[]> => {
  const globalBadges = await fetchGlobalBadges(clientId, accessToken);

  const chatBadges = await fetchChannelBadges(broadcasterId, clientId, accessToken);

  return mergeBadges(globalBadges, chatBadges);
};

badges.get('/', async (req, res) => {
  const clientId = getEnv(Environment.TwitchClientId);
  const secretKey = getEnv(Environment.TwitchSecretKey);

  const { channel } = req.query as { channel: string | undefined };
  if (!channel)
    return res.status(StatusCodes.BAD_REQUEST).json(getErrorMessage('channel is not defined'));

  const accessToken = await getAccessToken(clientId, secretKey);
  if (!accessToken)
    return res
      .status(StatusCodes.INTERNAL_SERVER_ERROR)
      .json(getErrorMessage('error on get access token'));

  const broadcasterId = await getUserId(channel, clientId, accessToken);
  if (!broadcasterId)
    return res
      .status(StatusCodes.INTERNAL_SERVER_ERROR)
      .json(getErrorMessage('error on get broadcaster id'));

  const badges = await fetchAllBadges(broadcasterId, clientId, accessToken);

  res.json({
    broadcasterId,
    badges
  });
});

export default badges;
