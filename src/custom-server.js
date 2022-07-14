const bodyParser = require('body-parser');
const express = require('express');

const setupCustomServer = (app) => {
  const port = Number(process.env.PORT) || 5000;

  // the request handler of the bottender app
  const handle = app.getRequestHandler();

  const server = express();

  const verify = (req, _, buf) => {
    req.rawBody = buf.toString();
  };
  server.use(bodyParser.json({ verify }));
  server.use(bodyParser.urlencoded({ extended: false, verify }));

  // route for webhook request
  server.all('*', (req, res) => {
    return handle(req, res);
  });

  server.listen(port, (err) => {
    if (err) throw err;
    console.log(`> Ready on http://localhost:${port}`);
  });
};

module.exports = {
  setupCustomServer,
};
