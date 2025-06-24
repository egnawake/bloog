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

export { parseUrl };
