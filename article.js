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

export { getArticles };
