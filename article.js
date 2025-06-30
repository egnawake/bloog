import fs from 'node:fs/promises';

async function getArticles() {
  return [
    {
      id: 1,
      title: "Article 1",
      date: Date.now(),
      content: "This is article number 1."
    },
    {
      id: 2,
      title: "Article 2",
      date: Date.now(),
      content: "This is article number 2."
    }
  ];
}

async function getArticle(id) {
  try {
    const data = await fs.readFile(`./data/articles/${id}.json`);
    const article = JSON.parse(data);
    return article;
  } catch (err) {
    console.error(err);
    return null;
  }
}

export { getArticles, getArticle };
