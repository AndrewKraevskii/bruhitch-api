import ApiError from '$exceptions/apiError';
import handleErrorAsync from '$lib/handleErrorAsync';
import { Router } from 'express';
import { StatusCodes } from 'http-status-codes';

const user = Router();

user.get(
  '/',
  handleErrorAsync(async (req, res) => {
    //#region Check for twitch token
    const { access_token } = req.query as { [key: string]: string | undefined };
    if (!access_token) throw new ApiError(StatusCodes.FORBIDDEN, 'Incorrect token');
    //#endregion

    const data = await fetch('https://donationalerts.com/api/v1/user/oauth', {
      headers: {
        Authorization: `Bearer ${access_token}`
      }
    }).then((r) => r.json());

    res.status(StatusCodes.OK).json(data);
  })
);

export default user;
