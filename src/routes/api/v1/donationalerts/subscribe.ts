import handleErrorAsync from '$lib/handleErrorAsync';
import { Router } from 'express';

const subscribe = Router();

subscribe.post(
  '/',
  handleErrorAsync(async (req, res) => {
    const authorization = req.headers.authorization;
    const body = req.body;

    const headers = new Headers();

    headers.append('Authorization', authorization ?? '');

    headers.append('Content-Type', 'application/json');

    const response = await fetch('https://www.donationalerts.com/api/v1/centrifuge/subscribe', {
      method: 'POST',
      headers,
      body: JSON.stringify(body)
    }).then(async (r) => ({ status: r.status, data: await r.json() }));

    res.status(response.status).json(response.data);
  })
);

export default subscribe;
