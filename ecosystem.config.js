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
        // 数据目录：复用线上已存在的真实内容（site-content.json + uploads）
        // 注意：Docker 里是 /app/.data，PM2 部署在宿主机需指向实际挂载路径
        DATA_DIR: "/opt/luliming-blog/data",
        // 以下鉴权变量从服务器 .env 注入（不写进仓库，避免泄露密钥）
        ADMIN_USERNAME: process.env.ADMIN_USERNAME,
        ADMIN_PASSWORD_HASH: process.env.ADMIN_PASSWORD_HASH,
        SESSION_SECRET: process.env.SESSION_SECRET,
        PUBLIC_BASE_URL: process.env.PUBLIC_BASE_URL || "https://www.luliming.xyz",
      },
      // 日志独立目录，避免与其他应用混在一起
      out_file: "/var/log/luliming-blog/out.log",
      error_file: "/var/log/luliming-blog/error.log",
      merge_logs: true,
      time: true,
    },
  ],
};
