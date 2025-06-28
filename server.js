import { createServer } from 'node:http';
import { parseUrl } from './util.js';

function requestToString(method, url) {
  const params = Object.keys(url.params)
    .map(key => key + '=' + url.params[key]);
  return `${method} ${url.route} ${params}`;
}

const homepage = `<!DOCTYPE html>

<html>
  <head>
    <title>Home | Bloog</title>
  </head>
  <body>
    <h1>Bloog</h1>
    <p>Welcome to best blog!</p>
  </body>
</html>
`;

const port = 8080;

const server = createServer((req, res) => {
  res.statusCode = 200;
  res.setHeader('Content-Type', 'text/html');

  const url = parseUrl(req.url);

  console.log(requestToString(req.method, url));

  if (url.route == '/') {
    res.end(homepage);
  } else if (url.route == '/hello') {
    res.end('<h1>Hello!</h1>');
  }
});

server.listen(port, () => {
  console.log(`Server listening on port ${port}`);
});
