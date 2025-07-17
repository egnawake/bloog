import fs from 'node:fs/promises';
import path from 'node:path';

const basePath = './data/articles';

async function getNextId() {
  let data = '';
  try {
    data = await fs.readFile(`${basePath}/id`);
  } catch (err) {
    throw err;
  }

  const id = Number.parseInt(data);
  if (Number.isNaN(id)) {
    throw new Error("Invalid ID format");
  }
  return id;
}

async function saveId(id) {
  try {
    await fs.writeFile(`${basePath}/id`, id.toString());
  } catch (err) {
    throw err;
  }
}

async function getArticles() {
  let paths = [];
  try {
    paths = await fs.readdir(basePath);
    paths = paths.filter(p => p.includes('.json'));
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

async function writeArticle(id, title, date, content) {
  const article = {
    id,
    title,
    date,
    content
  };

  const data = JSON.stringify(article);

  try {
    await fs.writeFile(`${basePath}/${id}.json`, data);
    await saveId(id + 1);
  } catch (err) {
    throw err;
  }
}

async function createArticle(title, content) {
  const id = await getNextId();
  const date = new Date().toISOString();

  try {
    await writeArticle(id, title, date, content);
    await saveId(id + 1);
  } catch (err) {
    throw err;
  }
}

async function updateArticle(id, title, date, content) {
  try {
    await writeArticle(id, title, date, content);
  } catch (err) {
    throw err;
  }
}

export {
  getArticles,
  getArticle,
  createArticle,
  updateArticle
};
