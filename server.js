import { createServer } from 'node:http';
import path from 'node:path';
import fs from 'node:fs/promises';
import pug from 'pug';
import { parseUrl, getBody } from './util.js';
import {
  getArticles,
  getArticle,
  createArticle,
  updateArticle,
  deleteArticle
} from './article.js';

const TEMPLATE_DIR = 'templates';

function requestToString(method, url) {
  const params = Object.keys(url.params)
    .map(key => key + '=' + url.params[key]);
  return `${method} ${url.route} ${params}`;
}

function render(template, options = {}) {
  options = {
    ...options,
    basedir: TEMPLATE_DIR
  };
  const templatePath = path.join(TEMPLATE_DIR, template) + '.pug';
  return pug.renderFile(templatePath, options);
}

const port = 8080;

const mime = {
  'css': 'text/css'
};

const routes = [
  {
    exp: /^\/new$/,
    get: async (req, res, urlParams, queryParams) => {
      const locals = { title: 'New article', formUrl: '/new' };
      res.end(render('article/new', locals));
    },
    post: async (req, res, urlParams, queryParams) => {
      const body = await getBody(req);

      const formData = new URLSearchParams(body);

      let template = 'article/created';
      let locals = { title: 'New article' };

      try {
        await createArticle(
          formData.get('title'),
          formData.get('date'),
          formData.get('content'));
      } catch (err) {
        console.log(err);
        template = 'error';
        locals = {
          title: 'Error',
          errorMessage: err.toString()
        };
      }

      res.end(render(template, locals));
    }
  },
  {
    exp: /^\/edit\/(\d+)/,
    get: async (req, res, urlParams, queryParams) => {
      const article = await getArticle(urlParams[0]);
      if (article === null) {
        const locals = { title: 'Page not found' };
        res.end(render('404', locals));
      } else {
        const locals = { title: 'Edit' };
        locals.article = article;
        locals.editEndpoint = `/edit/${urlParams[0]}`;
        res.end(render('article/edit', locals));
      }
    },
    post: async (req, res, urlParams, queryParams) => {
      const article = await getArticle(urlParams[0]);
      if (article === null) {
        const locals = { title: 'Page not found' };
        res.end(render('404', locals));
      } else {
        const body = await getBody(req);

        const formData = new URLSearchParams(body);

        let template = 'article/created';
        let locals = { title: 'New article' };

        try {
          await updateArticle(
            Number(urlParams[0]),
            formData.get('title'),
            formData.get('date'),
            formData.get('content')
          );
        } catch (err) {
          console.log(err);
          template = 'error';
          locals = {
            title: 'Error',
            errorMessage: err.toString()
          };
        }

        res.end(render(template, locals));
      }
    }
  },
  {
    exp: /^\/delete\/(\d+)/,
    get: async (req, res, urlParams, queryParams) => {
      const article = await getArticle(urlParams[0]);
      if (!article) {
        const locals = { title: 'Page not found' };
        res.end(render('404', locals));
      } else {
        const locals = {
          title: 'Delete',
          articleTitle: article.title,
          deleteEndpoint: `/delete/${article.id}`
        };
        res.end(render('article/delete', locals));
      }
    },
    post: async (req, res, urlParams, queryParams) => {
      let template = 'article/created';
      let locals = { title: 'Deleted' };
      try {
        await deleteArticle(urlParams[0]);
      } catch (err) {
        console.log(err);
        template = 'error';
        locals.errorMessage = err.message;
      }
      res.end(render(template, locals));
    }
  },
  {
    exp: /^\/admin$/,
    get: async (req, res, urlParams, queryParams) => {
      const articles = await getArticles();

      const locals = { title: 'Admin', newRoute: '/new' };
      locals.articles = articles.map(a => {
        return {
          ...a,
          formattedDate: new Date(a.date).toLocaleString(),
          route: `/article/${a.id}`,
          editRoute: `/edit/${a.id}`,
          deleteRoute: `/delete/${a.id}`
        };
      });
      res.end(render('admin', locals));
    }
  },
  {
    exp: /^\/article\/(\d+)$/,
    get: async (req, res, urlParams, queryParams) => {
      const article = await getArticle(urlParams[0]);
      if (!article) {
        const locals = { title: 'Page not found' };
        res.end(render('404', locals));
      } else {
        const locals = { title: article.title };
        locals.article = {
          ...article,
          formattedDate: new Date(article.date).toLocaleString()
        };
        res.end(render('article', locals));
      }
    }
  },
  {
    exp: /^\/$/,
    get: async (req, res, urlParams, queryParams) => {
      const articles = await getArticles();

      const locals = { title: 'Home' };
      locals.articles = articles.map(a => {
        return {
          ...a,
          formattedDate: new Date(a.date).toLocaleString(),
          route: `/article/${a.id}`
        };
      });
      res.end(render('home', locals));
    }
  },
  {
    exp: /^\/static\/(.+)\.(.+)$/,
    get: async (req, res, urlParams, queryParams) => {
      const [fileName, extension] = urlParams;
      res.setHeader('content-type', mime[extension]);

      const data = await fs.readFile(`./static/${fileName}.${extension}`);
      res.end(data);
    }
  },
  {
    exp: /.*/,
    get: (req, res, urlParams, queryParams) => {
      res.statusCode = 404;
      const locals = { title: 'Page not found' };
      res.end(render('404', locals));
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
      const handler = req.method.toLowerCase();
      route[handler](req, res, match.slice(1), url.params);
      break;
    }
  }
});

server.listen(port, () => {
  console.log(`Server listening on port ${port}`);
});
