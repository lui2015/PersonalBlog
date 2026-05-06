// PM2 进程配置
// 仅监听 127.0.0.1，外部访问统一走 Nginx 反向代理，避免暴露端口
module.exports = {
  apps: [
    {
      name: "luliming-blog",
      cwd: "/var/www/luliming-blog/current",
      script: "node_modules/next/dist/bin/next",
      args: "start -H 127.0.0.1 -p 3100",
      instances: 1,
      exec_mode: "fork",
      autorestart: true,
      watch: false,
      max_memory_restart: "512M",
      env: {
        NODE_ENV: "production",
        PORT: "3100",
        HOSTNAME: "127.0.0.1",
      },
      // 日志独立目录，避免与其他应用混在一起
      out_file: "/var/log/luliming-blog/out.log",
      error_file: "/var/log/luliming-blog/error.log",
      merge_logs: true,
      time: true,
    },
  ],
};
