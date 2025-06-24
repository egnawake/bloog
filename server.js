import { createServer } from 'node:http';

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
  res.end(homepage);
});

server.listen(port, () => {
  console.log(`Server listening on port ${port}`);
});
