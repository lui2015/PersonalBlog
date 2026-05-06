#!/usr/bin/env bash
# =============================================================================
# 服务器端【一次性环境准备】脚本 - 安全、幂等
# 用法：  sudo bash deploy/server-setup.sh
#
# 它做什么：
#   - 安装 Node 20（通过 NodeSource，不覆盖系统已有的 node 软链则跳过）
#   - 安装 PM2、rsync、certbot（仅安装缺失的）
#   - 创建项目目录、日志目录
#   - 仅在 Nginx 已安装时，软链入站点配置；不会自动安装 Nginx 以免影响现状
#   - 不修改 nginx.conf 主配置
#   - 不开放 3100 端口到公网（仍由 Nginx 反代）
# =============================================================================

set -euo pipefail

red()   { printf "\033[31m%s\033[0m\n" "$*"; }
green() { printf "\033[32m%s\033[0m\n" "$*"; }
yellow(){ printf "\033[33m%s\033[0m\n" "$*"; }

if [ "$(id -u)" -ne 0 ]; then
  red "请用 sudo 运行：sudo bash $0"
  exit 1
fi

echo "============================================================"
echo " 服务器环境检查与准备"
echo "============================================================"

# ---------- 1. 检测系统 ----------
. /etc/os-release || true
yellow "[INFO] 系统：${PRETTY_NAME:-unknown}"

# ---------- 2. Node ----------
if command -v node >/dev/null 2>&1; then
  NODE_VER="$(node -v)"
  NODE_MAJOR="$(node -p 'process.versions.node.split(".")[0]')"
  if [ "${NODE_MAJOR}" -ge 20 ]; then
    green "[OK] 已有 Node ${NODE_VER}，跳过安装"
  else
    yellow "[WARN] Node 版本过低 (${NODE_VER})，Next 16 需要 >= 20"
    yellow "      为避免影响其他依赖旧 Node 的服务，本脚本不会自动升级。"
    yellow "      建议使用 nvm 为当前部署用户单独安装 Node 20："
    echo   "        curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.40.1/install.sh | bash"
    echo   "        nvm install 20 && nvm alias default 20"
    exit 1
  fi
else
  yellow "[INFO] 未检测到 Node，准备安装 Node 20 (NodeSource)"
  if command -v apt-get >/dev/null; then
    curl -fsSL https://deb.nodesource.com/setup_20.x | bash -
    apt-get install -y nodejs
  elif command -v dnf >/dev/null; then
    curl -fsSL https://rpm.nodesource.com/setup_20.x | bash -
    dnf install -y nodejs
  elif command -v yum >/dev/null; then
    curl -fsSL https://rpm.nodesource.com/setup_20.x | bash -
    yum install -y nodejs
  else
    red "[ABORT] 不支持的包管理器，请手动安装 Node 20"
    exit 1
  fi
  green "[OK] Node 安装完成 $(node -v)"
fi

# ---------- 3. PM2 ----------
if ! command -v pm2 >/dev/null 2>&1; then
  npm install -g pm2
  green "[OK] PM2 安装完成"
else
  green "[OK] PM2 已存在 $(pm2 -v)"
fi

# ---------- 4. rsync ----------
if ! command -v rsync >/dev/null 2>&1; then
  if command -v apt-get >/dev/null; then apt-get install -y rsync
  elif command -v dnf >/dev/null; then dnf install -y rsync
  elif command -v yum >/dev/null; then yum install -y rsync; fi
fi

# ---------- 5. 项目目录 ----------
mkdir -p /var/www/luliming-blog/releases
mkdir -p /var/log/luliming-blog
mkdir -p /var/www/letsencrypt
DEPLOY_USER="${SUDO_USER:-$(whoami)}"
chown -R "${DEPLOY_USER}":"${DEPLOY_USER}" /var/www/luliming-blog /var/log/luliming-blog
green "[OK] 项目目录就绪 (owner=${DEPLOY_USER})"

# ---------- 6. Nginx 站点配置（仅当已装 Nginx）----------
if command -v nginx >/dev/null 2>&1; then
  CONF_DST="/etc/nginx/conf.d/luliming.xyz.conf"
  if [ -f "${CONF_DST}" ]; then
    yellow "[SKIP] 已存在 ${CONF_DST}，未覆盖（如需更新请手动 diff）"
  else
    SRC="$(dirname "$(readlink -f "$0")")/nginx/luliming.xyz.conf"
    if [ -f "${SRC}" ]; then
      cp "${SRC}" "${CONF_DST}"
      green "[OK] 已复制 Nginx 配置到 ${CONF_DST}"
      yellow "[NEXT] 先签发证书后再 reload Nginx："
      echo "  1) 临时注释掉 ssl 相关行，或用 --nginx 模式"
      echo "  2) certbot certonly --webroot -w /var/www/letsencrypt -d luliming.xyz -d www.luliming.xyz"
      echo "  3) nginx -t && systemctl reload nginx"
    fi
  fi
else
  yellow "[SKIP] 未检测到 Nginx。若你已有 Caddy/Apache 等其他反代，可跳过。"
  yellow "      若需要安装 Nginx，请确认不会与现有服务冲突后手动："
  echo   "        apt-get install -y nginx   或   dnf install -y nginx"
fi

# ---------- 7. certbot（HTTPS）----------
if ! command -v certbot >/dev/null 2>&1; then
  yellow "[INFO] certbot 未安装。如果你想用 Let's Encrypt 申请证书："
  echo "  Ubuntu/Debian:  apt-get install -y certbot python3-certbot-nginx"
  echo "  CentOS/Rocky :  dnf install -y certbot python3-certbot-nginx"
fi

echo "============================================================"
green " 服务器环境准备完成"
echo "============================================================"
echo " 下一步："
echo "   1. 把代码上传到服务器，例如：rsync -av ./ user@server:~/PersonalBlog/"
echo "   2. ssh 进服务器，运行：bash ~/PersonalBlog/deploy/deploy.sh"
echo "   3. 申请证书：certbot certonly --webroot -w /var/www/letsencrypt -d luliming.xyz -d www.luliming.xyz"
echo "   4. nginx -t && systemctl reload nginx"
echo "============================================================"
