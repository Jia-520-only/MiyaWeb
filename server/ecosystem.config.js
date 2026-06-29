module.exports = {
  apps: [{
    name: 'jiaandmiya-api',
    script: './index.js',
    cwd: __dirname,
    instances: 2,
    exec_mode: 'cluster',
    autorestart: true,
    watch: false,
    max_memory_restart: '300M',
    kill_timeout: 5000,
    min_uptime: '10s',
    max_restarts: 10,
    restart_delay: 3000,
    env: {
      NODE_ENV: 'production',
      PORT: 3000
    },
    env_production: {
      NODE_ENV: 'production',
      PORT: 3000
    },
    error_file: 'logs/err.log',
    out_file: 'logs/out.log',
    log_file: 'logs/combined.log',
    time: true,
    log_date_format: 'YYYY-MM-DD HH:mm:ss'
  }]
};