// PM2 进程配置
// 仅监听 127.0.0.1，外部访问统一走 Nginx 反向代理，避免暴露端口
const fs = require("fs");

// 启动时直接从服务器 .env 文件读取鉴权变量，避免依赖 PM2 守护进程环境
// （之前因 daemon 环境未 source .env，导致 ADMIN_PASSWORD_HASH 为空而登录失败）
function loadEnvFile(p) {
  const env = {};
  try {
    const raw = fs.readFileSync(p, "utf8");
    for (const line of raw.split("\n")) {
      const m = line.match(/^\s*([\w.-]+)\s*=\s*(.*)\s*$/);
      if (!m) continue;
      let v = m[2];
      if (
        (v.startsWith('"') && v.endsWith('"')) ||
        (v.startsWith("'") && v.endsWith("'"))
      ) {
        v = v.slice(1, -1);
      }
      env[m[1]] = v;
    }
  } catch {
    // .env 不存在时退化为环境变量
  }
  return env;
}

const fileEnv = loadEnvFile("/opt/luliming-blog/.env");

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
        DATA_DIR:
          fileEnv.DATA_DIR || process.env.DATA_DIR || "/opt/luliming-blog/data",
        // 以下鉴权变量优先从服务器 .env 文件读取（不写进仓库，避免泄露密钥）
        ADMIN_USERNAME: fileEnv.ADMIN_USERNAME || process.env.ADMIN_USERNAME,
        ADMIN_PASSWORD_HASH:
          fileEnv.ADMIN_PASSWORD_HASH || process.env.ADMIN_PASSWORD_HASH,
        SESSION_SECRET: fileEnv.SESSION_SECRET || process.env.SESSION_SECRET,
        PUBLIC_BASE_URL:
          fileEnv.PUBLIC_BASE_URL ||
          process.env.PUBLIC_BASE_URL ||
          "https://www.luliming.xyz",
      },
      // 日志独立目录，避免与其他应用混在一起
      out_file: "/var/log/luliming-blog/out.log",
      error_file: "/var/log/luliming-blog/error.log",
      merge_logs: true,
      time: true,
    },
  ],
};
