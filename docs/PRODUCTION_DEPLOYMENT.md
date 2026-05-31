# Kuli 生产部署说明

## 当前服务器结构

- 服务器：腾讯云轻量应用服务器，Ubuntu 24.04。
- 域名：`https://kuly.com.cn`，`https://www.kuly.com.cn`。
- 应用目录：`/opt/kuly/app`。
- 服务器环境变量：`/opt/kuly/app/.env`，不要提交到 Git。
- Postgres 数据目录：`/var/lib/postgresql/16/main`。
- Redis 数据目录：系统默认 Redis 目录。
- 本地附件目录：`/var/lib/kuly/uploads`。
- 备份目录：`/opt/kuly/backups`。
- 管理员初始凭据：`/opt/kuly/ADMIN_CREDENTIALS.txt`。

## systemd 服务

- `kuly-api`：FastAPI 后端，监听 `127.0.0.1:8000`。
- `kuly-web`：Nuxt 前端，监听 `127.0.0.1:3000`。
- `kuly-worker`：Celery worker。
- `nginx`：公网反向代理和 HTTPS。
- `postgresql`：Postgres + pgvector。
- `redis-server`：Redis 队列和缓存。
- `kuly-backup.timer`：每天 03:20 备份数据库和上传目录。

## 当前还缺什么配置

### 必须补

- SMTP 邮件配置。当前 `MAIL_PROVIDER` 为空，站内通知可用，但邮箱验证、密码重置、订单邮件通知不会真实发送。

需要在服务器 `/opt/kuly/app/.env` 里配置：

```env
MAIL_PROVIDER=smtp
MAIL_FROM=no-reply@kuly.com.cn
MAIL_REPLY_TO=support@kuly.com.cn
SMTP_HOST=
SMTP_PORT=587
SMTP_USERNAME=
SMTP_PASSWORD=
SMTP_TIMEOUT_SECONDS=20
```

腾讯企业邮箱要使用已开启客户端服务的成员邮箱或公共邮箱，并填写“客户端专用密码/授权码”。普通网页登录密码如果被 SMTP 拒绝，就不要打开 `MAIL_PROVIDER=smtp`，否则邮件 worker 会持续失败；站内通知仍然可用。

当前已验证 `team@kuly.com.cn` 的普通密码无法通过 `smtp.exmail.qq.com` 登录，错误为 535 认证失败。拿到客户端专用密码后再更新 `SMTP_PASSWORD` 并打开 `MAIL_PROVIDER=smtp`。

### 以后建议补

- 对象存储 bucket。当前 `OBJECT_STORAGE_PROVIDER=local`，用户上传附件会存到服务器 `/var/lib/kuly/uploads`，第一版可用。后续正式运营建议迁到腾讯云 COS 或阿里云 OSS，降低服务器磁盘和迁移风险。
- 真实微信/支付宝收款码。把图片放到 `apps/web/public/pay/wechat-qr.png`、`apps/web/public/pay/alipay-qr.png`，并在服务器 `.env` 设置 `NUXT_PUBLIC_WECHAT_PAY_QR_URL=/pay/wechat-qr.png`、`NUXT_PUBLIC_ALIPAY_PAY_QR_URL=/pay/alipay-qr.png`。普通收款码不能自动回调支付状态，自动识别到账需要后续接入微信支付/支付宝商户 API。
- 备案。大陆服务器面向公众长期开放时，需要完成 ICP 备案。
- 邮箱域名认证。如果使用 `@kuly.com.cn` 发信，建议配置 SPF、DKIM、DMARC。
- 监控告警。建议后续加磁盘、内存、服务状态和证书过期提醒。

## 一键部署新版本

本地开发完成后，在项目根目录运行：

```bash
bash scripts/deploy-production.sh
```

脚本会自动完成：

1. 将当前本地代码同步到服务器 `/opt/kuly/app`。
2. 保留服务器 `.env`，不会覆盖生产密钥。
3. 执行 `/usr/local/bin/kuly-backup` 备份数据库和上传目录。
4. 执行 `npm ci` 安装前端依赖。
5. 执行 `uv sync --project apps/api --no-dev` 安装后端依赖。
6. 执行 `npm run build` 构建 Nuxt。
7. 执行 `npm run db:migrate` 迁移数据库。
8. 执行 `scripts/index_knowledge.py` 重建知识库索引。
9. 重启 `kuly-api`、`kuly-worker`、`kuly-web`。
10. 验证本机 API 和公网 API。

可选覆盖项：

```bash
KULI_REMOTE=kuly \
KULI_REMOTE_APP_DIR=/opt/kuly/app \
KULI_SITE_URL=https://kuly.com.cn \
bash scripts/deploy-production.sh
```

## 常用运维命令

查看服务状态：

```bash
ssh kuly
systemctl status kuly-api kuly-web kuly-worker nginx postgresql redis-server
```

查看日志：

```bash
journalctl -u kuly-api -f
journalctl -u kuly-web -f
journalctl -u kuly-worker -f
```

手动备份：

```bash
/usr/local/bin/kuly-backup
ls -lh /opt/kuly/backups
```

检查健康状态：

```bash
curl -fsS https://kuly.com.cn/api/health
curl -fsS https://kuly.com.cn/api/health/deps | python3 -m json.tool
```

## 安全与防抖动

当前服务器侧已经启用：

- Nginx `server_tokens off`，减少版本暴露。
- HTTPS + HSTS。
- `X-Content-Type-Options`、`X-Frame-Options`、`Referrer-Policy`、`Permissions-Policy`、`Cross-Origin-Resource-Policy` 和 CSP。
- API 限流：`10r/s`，burst `40`，超出返回 429。
- Web 限流：`30r/s`，burst `100`，超出返回 429。
- 单 IP 连接数限制：40。
- 基础恶意扫描 UA 拦截：sqlmap、nikto、nmap、masscan、wpscan、gobuster 等。
- API 侧最大 JSON/表单请求体限制：`MAX_REQUEST_BODY_BYTES=2097152`，附件上传入口单独保留 100MB Nginx 限制。

复查安全头：

```bash
curl -sI https://kuly.com.cn/ | sed -n '1,80p'
curl -sI https://kuly.com.cn/api/health | sed -n '1,80p'
```

轻量压力测试：

```bash
LOAD_TEST_URL=https://kuly.com.cn npm run load:production
```

默认并发 6、目标 6 RPS、持续 20 秒，覆盖首页、服务页、文档页、产品页、健康检查和公开 API。生产机器规格较小时不要直接做高并发破坏性压测；如需逐步加压：

```bash
LOAD_TEST_URL=https://kuly.com.cn \
LOAD_TEST_CONCURRENCY=12 \
LOAD_TEST_TARGET_RPS=12 \
LOAD_TEST_DURATION_SECONDS=30 \
npm run load:production
```

## 清理旧 demo 数据

生产环境不会再自动写入 demo 用户和 demo 订单。如果历史数据库里还残留 `KULI-DEMO-001`、`KULI-OTHER-001` 或 `demo@kuli.local`、`other@kuli.local`，可以执行：

```bash
ssh kuly
cd /opt/kuly/app
set -a && . ./.env && set +a
PYTHONPATH=apps/api uv run --project apps/api python scripts/cleanup_demo_data.py
```

脚本只删除已知 demo 订单、demo 用户和它们关联的通知、附件记录、消息、报价、付款、交付与自动化记录，不会删除真实注册用户、真实订单或生产管理员账号。

## 线上浏览器烟测

线上 smoke 不再依赖 demo 普通用户。脚本会自动注册一个临时普通账号、提交一张测试订单，然后用你提供的管理员账号处理这张订单：

```bash
BASE_URL=https://kuly.com.cn \
API_BASE_URL=https://kuly.com.cn \
SMOKE_ADMIN_EMAIL=admin@kuly.com.cn \
SMOKE_ADMIN_PASSWORD='从 /opt/kuly/ADMIN_CREDENTIALS.txt 读取' \
npm run smoke:browser
```

也可以指定固定测试用户：

```bash
SMOKE_USER_EMAIL=smoke@example.com \
SMOKE_USER_PASSWORD='SmokePass123!' \
SMOKE_USER_DISPLAY_NAME='Smoke 用户' \
npm run smoke:browser
```
