import { createServer } from 'node:http';
import { parseUrl } from './util.js';

function requestToString(method, url) {
  const params = Object.keys(url.params)
    .map(key => key + '=' + url.params[key]);
  return `${method} ${url.route} ${params}`;
}

async function getArticles() {
  return [
    {
      title: "Article 1",
      date: Date.now(),
      content: "This is article number 1."
    },
    {
      title: "Article 2",
      date: Date.now(),
      content: "This is article number 2."
    }
  ];
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

const server = createServer(async (req, res) => {
  res.statusCode = 200;
  res.setHeader('Content-Type', 'text/html');

  const url = parseUrl(req.url);

  console.log(requestToString(req.method, url));

  if (url.route == '/') {
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
  } else if (url.route == '/hello') {
    res.end('<h1>Hello!</h1>');
  }
});

server.listen(port, () => {
  console.log(`Server listening on port ${port}`);
});
