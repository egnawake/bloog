function parseUrl(url) {
  const [route, queryString] = url.split('?');

  const params = (queryString ?? '').split('&')
    .reduce((acc, cur) => {
      const [key, value] = cur.split('=');
      if (key !== '') {
        acc[key] = value ?? true;
      }
      return acc;
    }, {});

  return { route, params };
}

async function getBody(req) {
  return new Promise((resolve, reject) => {
    let body = [];

    req.on('error', err => {
      reject(err);
    }).on('data', chunk => {
      body.push(chunk);
    }).on('end', async () => {
      body = Buffer.concat(body).toString();
      resolve(body);
    });
  });
}

export { parseUrl, getBody };
