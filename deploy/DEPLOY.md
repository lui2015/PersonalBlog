# 部署到轻量应用服务器（www.luliming.xyz）

> 设计原则：**对服务器上其他正在运行的服务零干扰、可随时回滚。**

---

## 隔离与安全策略

| 维度 | 做法 | 为什么 |
|---|---|---|
| 端口 | Next.js 仅监听 `127.0.0.1:3100` | 不暴露公网，避开常用 3000/8080 |
| 进程 | 用 PM2 单独命名 `luliming-blog` | 不影响其他 PM2 应用 |
| 目录 | `/var/www/luliming-blog/`（蓝绿 releases） | 独立目录，独立日志 |
| Nginx | 仅新增 `/etc/nginx/conf.d/luliming.xyz.conf` | 不改主配置，不动其他 server 块 |
| Node | 优先复用现有 Node 20+；缺失才装 | 不污染依赖旧 Node 的服务（建议用 nvm） |
| HTTPS | Let's Encrypt 单域证书 webroot 验证 | 不影响已有 SSL |
| 回滚 | `current` 软链 + 保留 5 个历史版本 | 一行命令切回旧版 |

---

## 部署前确认清单（请务必先核对）

```bash
# 1. 在服务器上执行下面命令，确认没有冲突：
ss -lntp | grep -E ':(80|443|3100)\s'    # 看 80/443 谁在用，3100 是否空闲
nginx -v 2>&1                            # Nginx 是否已装、版本
nginx -T 2>/dev/null | grep -E 'server_name'   # 当前已托管的域名
node -v && npm -v                        # Node >= 20？
pm2 list                                 # 现有 PM2 应用列表
```

如果 `3100` 端口已被占用，编辑下面两个文件改成其它空闲端口（如 3101）：
- `ecosystem.config.js`
- `deploy/nginx/luliming.xyz.conf`（`proxy_pass`）
- `deploy/deploy.sh`（`APP_PORT`）

---

## DNS 配置

在你的 DNS 服务商把以下两条 A 记录指向服务器公网 IP：

```
luliming.xyz       A   <你的服务器IP>
www.luliming.xyz   A   <你的服务器IP>
```

并确保轻量服务器**防火墙/安全组**已开放：`80/tcp`、`443/tcp`（一般已开放，无需新增）。
**3100 端口不要对公网开放。**

---

## 部署流程（首次）

### 步骤 1：本地把代码同步到服务器

在**本机**项目根目录执行（替换 `<user>` 和 `<server-ip>`）：

```bash
rsync -av --delete \
  --exclude node_modules --exclude .next --exclude .git --exclude .DS_Store \
  ./ <user>@<server-ip>:~/PersonalBlog/
```

### 步骤 2：SSH 到服务器，做一次性环境准备

```bash
ssh <user>@<server-ip>
cd ~/PersonalBlog
sudo bash deploy/server-setup.sh
```

脚本会：
- 检查 Node ≥ 20（不够则提示用 nvm 单独安装，**不会**强行升级系统 Node）
- 缺什么装什么：`pm2`、`rsync`
- 创建 `/var/www/luliming-blog`、`/var/log/luliming-blog`
- 若已装 Nginx：把 `luliming.xyz.conf` 复制到 `/etc/nginx/conf.d/`
- 不会启动任何服务，等你确认

### 步骤 3：申请 HTTPS 证书

先临时把 nginx 配置中的 `ssl_certificate`/`ssl_certificate_key`/443 server 块**注释掉**，只保留 80 server 用于校验：

```bash
# 用 webroot 模式（推荐，对其他站点零影响）
sudo certbot certonly --webroot -w /var/www/letsencrypt \
  -d luliming.xyz -d www.luliming.xyz \
  --agree-tos -m your@email.com -n
```

成功后取消注释，让 443 server 生效：

```bash
sudo nginx -t && sudo systemctl reload nginx
```

### 步骤 4：构建 + 启动应用

```bash
cd ~/PersonalBlog
bash deploy/deploy.sh
```

脚本流程：
1. 预检命令、端口、Node 版本
2. 把代码 rsync 到 `/var/www/luliming-blog/releases/<时间戳>`
3. `npm ci && npm run build`
4. 切换 `current` 软链（蓝绿）
5. PM2 reload（**零停机**）
6. `curl http://127.0.0.1:3100/` 健康检查
7. 失败自动回滚到上一个版本

### 步骤 5：开机自启（可选，推荐）

```bash
pm2 save
pm2 startup    # 按提示执行它返回的那条命令
```

---

## 后续发版（每次更新代码）

```bash
# 本地
rsync -av --delete --exclude node_modules --exclude .next --exclude .git \
  ./ <user>@<server-ip>:~/PersonalBlog/

# 服务器
ssh <user>@<server-ip> 'bash ~/PersonalBlog/deploy/deploy.sh'
```

---

## 回滚

```bash
ls /var/www/luliming-blog/releases/        # 看历史版本
ln -sfn /var/www/luliming-blog/releases/<旧时间戳> /var/www/luliming-blog/current
pm2 reload luliming-blog
```

---

## 常见问题

**Q：服务器上已经有 Nginx 在跑别的站，会被影响吗？**
A：不会。我们只新增一个独立的 `luliming.xyz.conf`，`server_name` 严格匹配本域名。`nginx -t` 通过后再 `reload`（不是 `restart`），其他站点连接不会中断。

**Q：3100 端口被别人占了？**
A：改 3 个文件里的端口（`ecosystem.config.js`、`luliming.xyz.conf`、`deploy.sh`）即可，无需重启服务器。

**Q：服务器 Node 版本是 16/18，不能升级（其他服务依赖它）？**
A：用 nvm 给部署用户单独装 Node 20，不影响系统全局：
```bash
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.40.1/install.sh | bash
source ~/.bashrc && nvm install 20 && nvm alias default 20
```

**Q：怎么完全移除该项目？**
```bash
pm2 delete luliming-blog && pm2 save
sudo rm /etc/nginx/conf.d/luliming.xyz.conf
sudo nginx -t && sudo systemctl reload nginx
sudo rm -rf /var/www/luliming-blog /var/log/luliming-blog
sudo certbot delete --cert-name luliming.xyz   # 可选
```
其他服务完全不受影响。

---

## 文件清单（本仓库新增）

```
deploy/
├── deploy.sh                    # 服务器端发版脚本（每次更新跑这个）
├── server-setup.sh              # 一次性环境准备
└── nginx/
    └── luliming.xyz.conf        # Nginx 站点配置
ecosystem.config.js              # PM2 进程配置
```
