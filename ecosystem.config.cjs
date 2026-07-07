module.exports = {
  apps: [
    {
      name: "forestview-api",
      script: "server/index.js",
      cwd: "/opt/forestview-api",
      instances: 1,
      autorestart: true,
      watch: false,
      env: {
        NODE_ENV: "production",
        PORT: 3010,
        API_ONLY: "1",
        DATA_DIR: "/var/lib/forestview-submissions",
      },
    },
  ],
};
