#!/usr/bin/env bash
# =============================================================================
# Personal Blog 服务器端一键部署脚本
# 用法（在【服务器】上执行，非本地）：
#   sudo bash deploy/server-setup.sh   # 首次环境准备
#   bash deploy/deploy.sh              # 后续每次发版
#
# 安全设计：
#   1. 端口 3100 仅监听 127.0.0.1，不开放到公网
#   2. Nginx 仅新增独立 conf 文件，不动其他站点
#   3. 每步预检（端口占用/Nginx 测试），失败立即退出
#   4. 蓝绿目录切换：current -> releases/<timestamp>，回滚一行命令
#   5. 出错保留旧版本，不删除
# =============================================================================

set -euo pipefail

# ---- 可调参数 ----------------------------------------------------------------
APP_NAME="luliming-blog"
APP_PORT="3100"
APP_DIR="/var/www/luliming-blog"
RELEASES_DIR="${APP_DIR}/releases"
CURRENT_LINK="${APP_DIR}/current"
KEEP_RELEASES=5
NODE_BIN_HINT="$(command -v node || true)"
# -----------------------------------------------------------------------------

red()   { printf "\033[31m%s\033[0m\n" "$*"; }
green() { printf "\033[32m%s\033[0m\n" "$*"; }
yellow(){ printf "\033[33m%s\033[0m\n" "$*"; }

echo "============================================================"
echo " Personal Blog 部署脚本  $(date '+%F %T')"
echo "============================================================"

# ---------- 预检 1：必要命令 ----------
for cmd in node npm pm2 rsync; do
  if ! command -v "$cmd" >/dev/null 2>&1; then
    red "[ABORT] 缺少命令: $cmd  请先执行 server-setup.sh"
    exit 1
  fi
done
green "[OK] 必要命令齐全（node/npm/pm2/rsync）"

# ---------- 预检 2：端口占用（仅警告非本应用占用）----------
if ss -lntp 2>/dev/null | grep -E ":${APP_PORT}\s" | grep -v "PM2" >/dev/null; then
  red "[ABORT] 端口 ${APP_PORT} 已被【非 PM2】进程占用，停止部署，避免冲突。"
  ss -lntp | grep ":${APP_PORT}" || true
  exit 1
fi
green "[OK] 端口 ${APP_PORT} 可用（或仅本应用占用）"

# ---------- 预检 3：Node 版本（Next 16 要求 Node >= 20）----------
NODE_MAJOR="$(node -p 'process.versions.node.split(".")[0]')"
if [ "${NODE_MAJOR}" -lt 20 ]; then
  red "[ABORT] Node 版本过低: $(node -v)，Next.js 16 需要 Node >= 20"
  exit 1
fi
green "[OK] Node 版本 $(node -v)"

# ---------- 准备目录 ----------
sudo mkdir -p "${RELEASES_DIR}" /var/log/luliming-blog
sudo chown -R "$USER":"$USER" "${APP_DIR}" /var/log/luliming-blog

TS="$(date '+%Y%m%d-%H%M%S')"
RELEASE_DIR="${RELEASES_DIR}/${TS}"
mkdir -p "${RELEASE_DIR}"
green "[OK] 新版本目录: ${RELEASE_DIR}"

# ---------- 同步代码 ----------
# 假设你已通过 scp/rsync/git 把代码推到服务器临时目录 ~/PersonalBlog
SRC_DIR="${SRC_DIR:-$HOME/PersonalBlog}"
if [ ! -d "${SRC_DIR}" ]; then
  red "[ABORT] 源码目录不存在: ${SRC_DIR}（设置环境变量 SRC_DIR 或先把代码放过来）"
  exit 1
fi

rsync -a --delete \
  --exclude='node_modules' \
  --exclude='.next' \
  --exclude='.git' \
  --exclude='.DS_Store' \
  "${SRC_DIR}/" "${RELEASE_DIR}/"
green "[OK] 代码已同步"

# ---------- 安装依赖 + 构建 ----------
cd "${RELEASE_DIR}"
yellow "[INFO] 安装依赖..."
npm ci --omit=dev=false --no-audit --no-fund

yellow "[INFO] 构建中..."
npm run build
green "[OK] 构建完成"

# ---------- 切换 current 软链 ----------
PREV_TARGET=""
if [ -L "${CURRENT_LINK}" ]; then
  PREV_TARGET="$(readlink -f "${CURRENT_LINK}")"
fi
ln -sfn "${RELEASE_DIR}" "${CURRENT_LINK}"
green "[OK] current -> ${RELEASE_DIR}"

# ---------- PM2 启动 / 重载（零停机）----------
if pm2 describe "${APP_NAME}" >/dev/null 2>&1; then
  pm2 reload "${APP_NAME}" --update-env
  green "[OK] PM2 reload ${APP_NAME}"
else
  pm2 start "${RELEASE_DIR}/ecosystem.config.js"
  pm2 save
  green "[OK] PM2 start ${APP_NAME}"
fi

# ---------- 健康检查 ----------
sleep 3
if ! curl -fsS -o /dev/null "http://127.0.0.1:${APP_PORT}/"; then
  red "[FAIL] 健康检查失败，开始回滚..."
  if [ -n "${PREV_TARGET}" ] && [ -d "${PREV_TARGET}" ]; then
    ln -sfn "${PREV_TARGET}" "${CURRENT_LINK}"
    pm2 reload "${APP_NAME}" || true
    yellow "[ROLLBACK] 已回滚到 ${PREV_TARGET}"
  fi
  exit 1
fi
green "[OK] 健康检查通过 http://127.0.0.1:${APP_PORT}/"

# ---------- 清理旧版本 ----------
cd "${RELEASES_DIR}"
ls -1t | tail -n +$((KEEP_RELEASES + 1)) | xargs -r rm -rf
green "[OK] 已保留最近 ${KEEP_RELEASES} 个版本"

echo "============================================================"
green " 部署成功！外部访问：https://www.luliming.xyz"
echo " 回滚命令： ln -sfn <旧版本路径> ${CURRENT_LINK} && pm2 reload ${APP_NAME}"
echo "============================================================"
