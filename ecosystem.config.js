module.exports = {
  apps: [
    {
      name: 'discord-clock-bot',
      script: 'src/index.js',
      restart_delay: 5000,
      max_restarts: 20,
      autorestart: true,
      env: { NODE_ENV: 'production' },
    },
  ],
};
