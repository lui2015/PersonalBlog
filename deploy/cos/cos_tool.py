#!/usr/bin/env python3
"""PersonalBlog → 腾讯云 COS 同步工具（仅在 Lighthouse 服务器运行）。

凭据只从服务器本地 .env 读取，绝不写入仓库、数据文件或日志。
对象统一放在独立前缀 personalblog/ 下，与其他项目互不干扰。

子命令：
  upload <local-url>  同步单个 /uploads/xxx 到 COS，stdout 输出 {"url": "https://..."}
  migrate             上传全部 uploads、public/images、数据 JSON / 备份到 COS
  rewrite             备份 site-content.json，并把本地图片引用改写为 COS 绝对 URL
  backup              每日备份 site-content.json，清理 14 天前的旧备份
  verify              统计 COS 上 personalblog/ 前缀的对象
"""
from __future__ import annotations

import json
import mimetypes
import os
import re
import shutil
import sys
from datetime import datetime, timedelta
from pathlib import Path

DATA_DIR = Path("/opt/luliming-blog/data")
CONTENT_FILE = DATA_DIR / "site-content.json"
UPLOADS_DIR = DATA_DIR / "uploads"
PUBLIC_IMAGES = Path("/var/www/luliming-blog/current/public/images")
CREDENTIALS_FILE = Path("/opt/experience/backend/.env")
PREFIX = os.environ.get("COS_PREFIX", "personalblog").strip("/")


def load_env(path: Path) -> dict[str, str]:
    cfg: dict[str, str] = {}
    if not path.exists():
        return cfg
    for line in path.read_text(encoding="utf-8").splitlines():
        line = line.strip()
        if not line or line.startswith("#") or "=" not in line:
            continue
        key, value = line.split("=", 1)
        cfg[key.strip()] = value.strip().strip('"').strip("'")
    return cfg


CFG = load_env(CREDENTIALS_FILE)
BUCKET = CFG.get("COS_BUCKET", "lyman-1258661753")
REGION = CFG.get("COS_REGION", "ap-guangzhou")
SECRET_ID = CFG.get("COS_SECRET_ID", "")
SECRET_KEY = CFG.get("COS_SECRET_KEY", "")
PUBLIC_BASE = f"https://{BUCKET}.cos.{REGION}.myqcloud.com"
BASE = f"{PUBLIC_BASE}/{PREFIX}"


def client():
    if not SECRET_ID or not SECRET_KEY:
        raise RuntimeError("COS credentials missing")
    from qcloud_cos import CosConfig, CosS3Client

    return CosS3Client(
        CosConfig(
            Region=REGION,
            SecretId=SECRET_ID,
            SecretKey=SECRET_KEY,
            Scheme="https",
        )
    )


def content_type(path: Path) -> str:
    guessed = mimetypes.guess_type(str(path))[0]
    if path.suffix.lower() == ".svg":
        return "image/svg+xml"
    if path.suffix.lower() in {".json", ".bak"}:
        return "application/json; charset=utf-8"
    return guessed or "application/octet-stream"


def put_file(c, local: Path, key: str) -> None:
    with local.open("rb") as fh:
        c.put_object(
            Bucket=BUCKET,
            Body=fh,
            Key=key,
            ContentType=content_type(local),
        )


def url_for(key: str) -> str:
    return f"{PUBLIC_BASE}/{key}"


# ---------------- 子命令 ----------------

def cmd_upload(arg: str) -> None:
    name = Path(arg).name
    if not re.fullmatch(r"[A-Za-z0-9._-]+", name):
        raise RuntimeError("invalid upload filename")
    local = UPLOADS_DIR / name
    if not local.is_file():
        raise RuntimeError(f"file not found: {name}")
    key = f"{PREFIX}/uploads/{name}"
    put_file(client(), local, key)
    print(json.dumps({"ok": True, "url": url_for(key), "key": key}))


def cmd_migrate() -> None:
    c = client()
    stats = {"uploads": 0, "images": 0, "data": 0}

    for f in sorted(UPLOADS_DIR.iterdir()):
        if f.is_file():
            put_file(c, f, f"{PREFIX}/uploads/{f.name}")
            stats["uploads"] += 1

    for f in sorted(PUBLIC_IMAGES.rglob("*")):
        if f.is_file():
            rel = f.relative_to(PUBLIC_IMAGES).as_posix()
            put_file(c, f, f"{PREFIX}/images/{rel}")
            stats["images"] += 1

    for f in sorted(DATA_DIR.iterdir()):
        if f.is_file() and (
            f.name == "site-content.json"
            or ".bak." in f.name
            or f.name.startswith("site-content.json.bak")
        ):
            put_file(c, f, f"{PREFIX}/data/{f.name}")
            stats["data"] += 1

    print(json.dumps({"ok": True, **stats, "base": BASE}))


URL_RE = re.compile(
    r"https://[^\s\"'<>]*myqcloud\.com/[^\s\"'<>]*"
    r"|https?://picsum\.photos/[^\s\"'<>)]*"
    r"|/uploads/[A-Za-z0-9._-]+"
    r"|/images/[A-Za-z0-9._/-]+"
)


def rewrite_text(text: str, counter: list[int]) -> str:
    """单次扫描替换：已有 COS URL 原样保留；picsum 与本地路径改写为 COS 绝对 URL。
    新生成的 URL 不会被再次匹配，天然幂等。"""
    def repl(match: re.Match[str]) -> str:
        value = match.group(0)
        if "myqcloud.com" in value:
            return value
        if "picsum.photos" in value:
            counter[0] += 1
            return f"{BASE}/images/gallery/g{(counter[0] - 1) % 6 + 1}.svg"
        return f"{BASE}{value}"

    return URL_RE.sub(repl, text)


def walk(value, counter: list[int]):
    if isinstance(value, dict):
        return {k: walk(v, counter) for k, v in value.items()}
    if isinstance(value, list):
        return [walk(v, counter) for v in value]
    if isinstance(value, str):
        return rewrite_text(value, counter)
    return value


def cmd_rewrite() -> None:
    c = client()
    stamp = datetime.now().strftime("%Y%m%d-%H%M%S")
    backup = DATA_DIR / f"site-content.json.bak.cos-{stamp}"
    shutil.copy2(CONTENT_FILE, backup)
    put_file(c, backup, f"{PREFIX}/data/backups/{backup.name}")

    data = json.loads(CONTENT_FILE.read_text(encoding="utf-8"))
    counter = [0]
    rewritten = walk(data, counter)
    tmp = DATA_DIR / "site-content.json.tmp"
    tmp.write_text(json.dumps(rewritten, ensure_ascii=False, indent=2), encoding="utf-8")
    os.replace(tmp, CONTENT_FILE)
    print(
        json.dumps(
            {
                "ok": True,
                "backup": str(backup),
                "picsum_replaced": counter[0],
            }
        )
    )


def cmd_backup() -> None:
    c = client()
    stamp = datetime.now().strftime("%Y%m%d-%H%M%S")
    key = f"{PREFIX}/data/daily/site-content.{stamp}.json"
    put_file(c, CONTENT_FILE, key)

    cutoff = datetime.now() - timedelta(days=14)
    resp = c.list_objects(Bucket=BUCKET, Prefix=f"{PREFIX}/data/daily/", MaxKeys=1000)
    removed = 0
    for obj in resp.get("Contents", []):
        match = re.search(r"site-content\.(\d{8})-\d{6}\.json$", obj["Key"])
        if match and datetime.strptime(match.group(1), "%Y%m%d") < cutoff:
            c.delete_object(Bucket=BUCKET, Key=obj["Key"])
            removed += 1
    print(json.dumps({"ok": True, "key": key, "removed": removed}))


def cmd_verify() -> None:
    c = client()
    resp = c.list_objects(Bucket=BUCKET, Prefix=f"{PREFIX}/", MaxKeys=1000)
    keys = [obj["Key"] for obj in resp.get("Contents", [])]
    print(json.dumps({"ok": True, "count": len(keys), "sample": keys[:5]}))


def main() -> None:
    if len(sys.argv) < 2:
        raise RuntimeError("usage: cos_tool.py <upload|migrate|rewrite|backup|verify> [arg]")
    cmd, args = sys.argv[1], sys.argv[2:]
    handlers = {
        "upload": lambda: cmd_upload(args[0]),
        "migrate": cmd_migrate,
        "rewrite": cmd_rewrite,
        "backup": cmd_backup,
        "verify": cmd_verify,
    }
    if cmd not in handlers:
        raise RuntimeError(f"unknown command: {cmd}")
    handlers[cmd]()


if __name__ == "__main__":
    try:
        main()
    except Exception as exc:  # noqa: BLE001
        print(json.dumps({"ok": False, "error": str(exc)}), file=sys.stderr)
        sys.exit(1)
