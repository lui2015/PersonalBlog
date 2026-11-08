#!/usr/bin/env bash
# =============================================================================
# Personal Blog 旧 release 清理脚本（配合 crontab 定期执行）
#
# 用法（在服务器上）：
#   DRY_RUN=1 bash deploy/release-cleanup.sh   # 只预览，不删除
#   bash deploy/release-cleanup.sh             # 实际清理
#
# 安全设计：
#   1. 永远保留 current 软链指向的版本（即使它不在最近 N 个里）
#   2. 只删除 RELEASES_DIR 下的目录，绝不触碰 /opt/luliming-blog/data
#   3. 默认保留最近 5 个版本，可按 KEEP_RELEASES 调整
#   4. 磁盘可用空间充足时默认不动手，避免无谓删除
#   5. 出错立即退出，删除前逐条打印
# =============================================================================

set -euo pipefail

APP_DIR="${APP_DIR:-/var/www/luliming-blog}"
RELEASES_DIR="${APP_DIR}/releases"
CURRENT_LINK="${APP_DIR}/current"
KEEP_RELEASES="${KEEP_RELEASES:-5}"
DRY_RUN="${DRY_RUN:-0}"
# 可用空间低于该值（MB）才触发清理；设为 0 表示总是按数量清理
TRIGGER_FREE_MB="${TRIGGER_FREE_MB:-6144}"

log() { printf '[%s] %s\n' "$(date '+%F %T')" "$*"; }

if [ ! -d "${RELEASES_DIR}" ]; then
  log "ABORT: ${RELEASES_DIR} 不存在"
  exit 1
fi

CURRENT_TARGET="$(readlink -f "${CURRENT_LINK}" 2>/dev/null || true)"
if [ -z "${CURRENT_TARGET}" ] || [ ! -d "${CURRENT_TARGET}" ]; then
  log "ABORT: 无法解析 current 指向的目录，拒绝清理（避免误删线上版本）"
  exit 1
fi

FREE_MB="$(df -Pm / | awk 'NR==2 {print $4}')"
log "磁盘可用 ${FREE_MB}MB，阈值 ${TRIGGER_FREE_MB}MB；current -> ${CURRENT_TARGET}"

if [ "${TRIGGER_FREE_MB}" != "0" ] && [ "${FREE_MB}" -ge "${TRIGGER_FREE_MB}" ]; then
  log "磁盘空间充足，跳过清理"
  exit 0
fi

# 按 mtime 倒序取 release 目录（最新在前）
mapfile -t ALL < <(find "${RELEASES_DIR}" -mindepth 1 -maxdepth 1 -type d -printf '%T@ %p\n' \
  | sort -rn | cut -d' ' -f2-)

if [ "${#ALL[@]}" -eq 0 ]; then
  log "没有 release 目录，跳过"
  exit 0
fi

# 构建保留集合：current + 最近 KEEP_RELEASES 个
declare -A KEEP=()
KEEP["${CURRENT_TARGET}"]=1
kept=1
for d in "${ALL[@]}"; do
  [ "${kept}" -ge "$((KEEP_RELEASES + 1))" ] && break
  if [ -z "${KEEP[$d]:-}" ]; then
    KEEP["$d"]=1
    kept=$((kept + 1))
  fi
done

deleted=0
for d in "${ALL[@]}"; do
  if [ -n "${KEEP[$d]:-}" ]; then
    continue
  fi
  # 二次保险：路径必须在 RELEASES_DIR 之下，且不能是 current
  case "$d" in
    "${RELEASES_DIR}"/*) ;;
    *) log "SKIP 异常路径: $d"; continue ;;
  esac
  if [ "$d" = "${CURRENT_TARGET}" ]; then
    continue
  fi
  if [ "${DRY_RUN}" = "1" ]; then
    log "DRY-RUN 将删除: $d"
  else
    log "删除: $d"
    rm -rf -- "$d"
  fi
  deleted=$((deleted + 1))
done

# 顺带清理部署临时文件
for f in /tmp/blog.tar.gz /tmp/blog_extract /tmp/build_openapi.log /tmp/build_openapi.pid; do
  if [ -e "$f" ]; then
    if [ "${DRY_RUN}" = "1" ]; then
      log "DRY-RUN 将清理临时文件: $f"
    else
      rm -rf -- "$f"
      log "清理临时文件: $f"
    fi
  fi
done

log "完成：将删除/已删除 ${deleted} 个旧版本；当前保留 $(find "${RELEASES_DIR}" -mindepth 1 -maxdepth 1 -type d | wc -l) 个"
df -h / | tail -n 1
