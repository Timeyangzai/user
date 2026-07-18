# Mingyang Storefront

名扬科技商城用户端，基于上游开源项目进行二次开发。

## Development

```bash
pnpm install --frozen-lockfile
pnpm dev
```

Production build:

```bash
pnpm build
```

## Container Image

Pushes to `main` automatically publish:

```text
ghcr.io/timeyangzai/mingyang-shop-user:latest
```

## Upstream

- Upstream repository: https://github.com/dujiao-next/user
- License: GNU General Public License v3.0

Update this fork with:

```bash
git fetch upstream
git merge upstream/main
git push origin main
```
