import { co2, hosting } from '@tgwf/co2';

import { cleanUrl, getFileSize } from '@/lib/util';

const emissions = new co2();

export default async function handler(req, res) {
  const { images } = JSON.parse(req.body);

  const hosts = {};

  const results = await Promise.all(images.map(async (image) => {
    const host = cleanUrl(image).split('/')?.[0];

    if ( typeof hosts[host] === 'undefined' ) {
      hosts[host] = await hosting.check(host);
    }

    const size = await getFileSize(image);

    return {
      url: image,
      size,
      co2: emissions.perByte(size, hosts[host])
    }
  }));

  res.status(200).json({
    images: results
  })
}
