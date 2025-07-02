import fs from 'node:fs/promises';
import path from 'node:path';

const basePath = './data/articles';

async function getArticles() {
  let paths = [];
  try {
    paths = await fs.readdir(basePath);
  } catch (err) {
    throw err;
  }
  const ids = paths.map(p => path.basename(p, '.json'));
  const articles = ids.map(id => getArticle(id));
  const result = await Promise.all(articles);
  return result.filter(article => article !== null);
}

async function getArticle(id) {
  try {
    const data = await fs.readFile(`${basePath}/${id}.json`);
    const article = JSON.parse(data);
    return article;
  } catch (err) {
    console.error(err);
    return null;
  }
}

export { getArticles, getArticle };
