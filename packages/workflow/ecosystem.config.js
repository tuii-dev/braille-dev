module.exports = {
  apps: [
    {
      name: 'workflow',
      script: 'dist/apps/workflow/main.js',
      env: {
        NODE_ENV: 'production',
      },
    },
    {
      name: 'scheduler',
      script: 'dist/apps/scheduler/main.js',
      env: {
        NODE_ENV: 'production',
      },
    },
  ],
};
