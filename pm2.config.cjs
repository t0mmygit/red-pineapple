module.exports = {
  apps: [
    {
      name: "ikuyo-kita",
      script: "dist/main.js",

      exec_mode: "cluster",
      instances: 2,

      autorestart: true,
      max_memory_restart: "200M",

      env: {
        NODE_ENV: "production",
      },

      watch: false,
      ignore_watch: ["node_modules", "logs"],
      kill_timeout: 3000,
    },
  ],
};
