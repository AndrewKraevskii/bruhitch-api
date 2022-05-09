import handleErrorAsync from '$lib/handleErrorAsync';
import { Router } from 'express';

const sound = Router();

sound.get(
  '/',
  handleErrorAsync(async (req, res) => {
    const { url } = req.query as { [key: string]: string };

    const blob = await fetch(url).then((r) => r.blob());

    const filename = url.split('/').pop();

    res.type(blob.type);
    res.setHeader('Content-Disposition', `attachment; filename="${filename ?? 'sound.wav'}";`);
    blob.arrayBuffer().then((buf) => {
      res.send(Buffer.from(buf));
    });
  })
);

export default sound;
