import { createServer } from 'node:http';
import { parseUrl } from './util.js';
import { getArticles, getArticle } from './article.js';

function requestToString(method, url) {
  const params = Object.keys(url.params)
    .map(key => key + '=' + url.params[key]);
  return `${method} ${url.route} ${params}`;
}

const baseMarkup = (params) => `<!DOCTYPE html>

<html>
  <head>
    <title>${params.title} | Bloog</title>
  </head>
  <body>
    <h1>Bloog</h1>
    ${params.content}
  </body>
</html>
`;

const port = 8080;

const routes = [
  {
    exp: /^\/admin$/,
    handler: async (req, res, urlParams, queryParams) => {
      const articles = await getArticles();

      const articleMarkup = (article) => {
        const date = new Date(article.date).toLocaleString();
        return `
<li>
  <a href="/article/${article.id}">${article.title} (${date})</a>
  <a href="/edit/${article.id}">Edit</a>
  <form action="/delete/${article.id}" method="post">
    <input type="submit" value="Delete" />
  </form>
</li>`;
      };

      const content = `
<ul>
  <a href="/new">New article</a>
  ${articles.map(article => articleMarkup(article)).join('')}
</ul>`;

      const params = { title: 'Admin', content };
      res.end(baseMarkup(params));
    }
  },
  {
    exp: /^\/article\/(\d+)$/,
    handler: async (req, res, urlParams, queryParams) => {
      const article = await getArticle(urlParams[0]);
      if (!article) {
        const params = {
          title: 'Page not found',
          content: '<p>Article not found</p>'
        };
        res.end(baseMarkup(params));
      } else {
        const articleMarkup = `<h2>${article.title}</h2>`
          + `<date>${new Date(article.date).toLocaleString()}</date>`
          + '<p>' + article.content.trimEnd().replace('\n', '</p><p>') + '</p>';
        const params = { title: article.title, content: articleMarkup };
        res.end(baseMarkup(params));
      }
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
            return `<li><a href="/article/${article.id}">${article.title}</a> (${date})</li>`;
          })
          .join('')
        + '</ul>';
      const params = { title: 'Home', content: articlesMarkup };
      res.end(baseMarkup(params));
    }
  },
  {
    exp: /.*/,
    handler: (req, res, urlParams, queryParams) => {
      res.statusCode = 404;
      const params = { title: 'Not found', content: '<p>Page not found</p>' };
      res.end(baseMarkup(params));
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
