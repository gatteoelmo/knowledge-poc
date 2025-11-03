module.exports = {
  apps: [
    {
      name: 'knowledge-backend',
      script: 'server/index.js',
      instances: 1,
      exec_mode: 'fork',
      autorestart: true,
      watch: false,
      max_memory_restart: '750M',
      env: {
        NODE_ENV: 'production',
        PORT: process.env.PORT || 3001
      },
      error_file: 'logs/backend-error.log',
      out_file: 'logs/backend-out.log',
      log_file: 'logs/backend-combined.log',
      time: true
    },
    {
      name: 'knowledge-frontend',
      script: 'npx',
      args: 'serve -l 5173 frontend/dist',
      cwd: process.cwd(),
      instances: 1,
      exec_mode: 'fork',
      autorestart: true,
      watch: false,
      max_memory_restart: '300M',
      env: {
        NODE_ENV: 'production'
      },
      time: true
    },
    {
      name: 'ollama',
      script: 'ollama',
      args: 'serve',
      instances: 1,
      exec_mode: 'fork',
      autorestart: true,
      watch: false,
      max_memory_restart: '300M',
      time: true
    }
  ]
};
