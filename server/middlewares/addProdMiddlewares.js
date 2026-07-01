const path = require("path");
const express = require("express");
const compression = require("compression");

module.exports = function addProdMiddlewares(app, options) {
  const publicPath = options.publicPath || "/";
  const outputPath = options.outputPath || path.resolve(process.cwd(), "dist");

  app.use(compression());
  app.use(publicPath, express.static(outputPath, { index: false }));

  app.get("*", (req, res, next) => {
    if (req.path.startsWith("/api")) return next();
    res.sendFile(path.resolve(outputPath, "index.html"));
  });
};
