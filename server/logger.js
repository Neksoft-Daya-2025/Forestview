const divider = "\n-----------------------------------";

const logger = {
  error: (err) => {
    console.error("[server error]", err);
  },
  appStarted: (port, host = "localhost") => {
    console.log(`Server started ✓`);
    console.log(`
Access URLs:${divider}
Local:   http://${host}:${port}
API:     http://${host}:${port}/api/health${divider}
Press CTRL-C to stop
`);
  },
};

module.exports = logger;
