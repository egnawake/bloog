import { createServer } from 'node:http';
import { parseUrl } from './util.js';
import { getArticles } from './article.js';

function requestToString(method, url) {
  const params = Object.keys(url.params)
    .map(key => key + '=' + url.params[key]);
  return `${method} ${url.route} ${params}`;
}

const homepage = (params) => `<!DOCTYPE html>

<html>
  <head>
    <title>Home | Bloog</title>
  </head>
  <body>
    <h1>Bloog</h1>
    ${params.articles}
  </body>
</html>
`;

const port = 8080;

const routes = [
  {
    exp: /^\/article\/(\d+)$/,
    handler: async (req, res, urlParams, queryParams) => {
      res.end(`<p>Article ID: ${urlParams[0]}`);
    }
  },
  {
    exp: /^\/$/,
    handler: async (req, res, urlParams, queryParams) => {
      const articles = await getArticles();
      const articlesMarkup = '<ul>'
        + articles
          .map(article => {
            const date = new Date(article.date).toLocaleString();
            return `<li>${article.title} (${date})</li>`;
          })
          .join('')
        + '</ul>';
      const params = { articles: articlesMarkup };
      res.end(homepage(params));
    }
  },
  {
    exp: /.*/,
    handler: (req, res, urlParams, queryParams) => {
      res.statusCode = 404;
      res.end('<p>Page not found</p>');
    }
  }
];

const server = createServer(async (req, res) => {
  res.statusCode = 200;
  res.setHeader('Content-Type', 'text/html');

  const url = parseUrl(req.url);

  console.log(requestToString(req.method, url));

  for (const route of routes) {
    const match = url.route.match(route.exp);
    if (match !== null) {
      res.statusCode = 200;
      route.handler(req, res, match.slice(1), url.params);
      break;
    }
  }
});

server.listen(port, () => {
  console.log(`Server listening on port ${port}`);
});
