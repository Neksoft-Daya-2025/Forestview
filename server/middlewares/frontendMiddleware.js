/**
 * Front-end middleware (adapted from react-boilerplate).
 * Production: serve Vite build output from /dist.
 */
module.exports = (app, options) => {
  if (process.env.NODE_ENV === "production") {
    const addProdMiddlewares = require("./addProdMiddlewares");
    addProdMiddlewares(app, options);
  }
  return app;
};
