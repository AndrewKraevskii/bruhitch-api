import ApiError from '$exceptions/apiError';
import fetchChannelBadges from '$lib/fetchChannelBadges';
import fetchGlobalBadges from '$lib/fetchGlobalBadges';
import getAppAccessToken from '$lib/getAppAccessToken';
import getUserId from '$lib/getUserId';
import handleErrorAsync from '$lib/handleErrorAsync';
import { TwitchBadge } from '$types/badge';
import { Router } from 'express';
import { StatusCodes } from 'http-status-codes';

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
  accessToken: string
): Promise<TwitchBadge[]> => {
  const globalBadges = await fetchGlobalBadges(accessToken);

  const chatBadges = await fetchChannelBadges(broadcasterId, accessToken);

  return mergeBadges(globalBadges, chatBadges);
};

const badges = Router();

badges.get(
  '/',
  handleErrorAsync(async (req, res) => {
    //#region Check for channel
    const { channel } = req.query as { [key: string]: string | undefined };
    if (!channel) throw new ApiError(StatusCodes.BAD_REQUEST, 'Channel is not defined');
    //#endregion

    //#region Get App access token
    const accessToken = await getAppAccessToken();
    if (!accessToken)
      throw new ApiError(StatusCodes.INTERNAL_SERVER_ERROR, 'Get access token error');
    //#endregion

    //#region Get Broadcaster Id
    const broadcasterId = await getUserId(channel, accessToken);
    if (!broadcasterId)
      throw new ApiError(StatusCodes.INTERNAL_SERVER_ERROR, 'Get broadcaster id error');
    //#endregion

    //#region Fetch all badges
    const badges = await fetchAllBadges(broadcasterId, accessToken);
    //#endregion

    res.status(StatusCodes.OK).json({
      broadcasterId,
      badges
    });
  })
);

export default badges;
