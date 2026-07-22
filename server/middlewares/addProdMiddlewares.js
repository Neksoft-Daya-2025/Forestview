const path = require("path");
const express = require("express");
const compression = require("compression");

module.exports = function addProdMiddlewares(app, options) {
  const publicPath = options.publicPath || "/";
  const outputPath = options.outputPath || path.resolve(process.cwd(), "dist");

  app.use(compression());
  app.use(
    publicPath,
    express.static(outputPath, {
      index: false,
      setHeaders(res, filePath) {
        if (/\.[a-f0-9]{8,}\./i.test(path.basename(filePath))) {
          res.setHeader("Cache-Control", "public, max-age=31536000, immutable");
        } else if (path.basename(filePath) === "index.html") {
          res.setHeader("Cache-Control", "no-cache");
        } else {
          res.setHeader("Cache-Control", "public, max-age=3600");
        }
      },
    }),
  );

  app.get("*", (req, res, next) => {
    if (req.path.startsWith("/api")) return next();
    res.setHeader("Cache-Control", "no-cache");
    res.sendFile(path.resolve(outputPath, "index.html"));
  });
};
