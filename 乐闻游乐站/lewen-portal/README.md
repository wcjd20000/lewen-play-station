# 乐闻游乐站：新闻资讯 + 5 款网页小游戏

一个无需构建工具的静态网站原型，可部署到 Cloudflare Pages、GitHub Pages 或 Netlify。

## 功能清单

- 响应式首页、新闻资讯页、游戏大厅、项目说明页
- 5 款原生 JavaScript 小游戏：2048、贪吃蛇、记忆翻牌、反应力测试、点击挑战
- `news.json` 本地新闻数据，可手动编辑
- 可选 Cloudflare Worker RSS 聚合 API
- 2048 和点击挑战最高分保存在浏览器 `localStorage`
- 新闻搜索、分类筛选、手机菜单
- 广告位和后续后端扩展空间

## 本地运行

建议在项目根目录运行：

```bash
python -m http.server 8000
```

然后访问 `http://localhost:8000`。不要直接双击 `index.html`，部分浏览器会限制 `file://` 页面读取 `news.json`。

## 手动编辑新闻

编辑根目录 `news.json`，结构示例：

```json
{
  "items": [
    {
      "id": "unique-id",
      "category": "科技",
      "date": "2026-10-23",
      "title": "新闻标题",
      "summary": "新闻摘要",
      "source": "来源名称",
      "url": "https://example.com/article"
    }
  ]
}
```

分类建议使用 `科技`、`游戏`、`生活`、`综合`。项目自带的新闻是演示文案，不是真实新闻；正式上线前请替换为已核实、获准展示的内容。

## 免费部署到 Cloudflare Pages

1. 注册 GitHub 和 Cloudflare 账号。
2. 将本项目文件上传到 GitHub 仓库。
3. 在 Cloudflare Dashboard 选择 **Workers & Pages → Create → Pages → Connect to Git**。
4. 选择仓库。静态站不需要构建命令；输出目录设为仓库根目录（`/` 或界面要求的根目录值）。
5. 部署后会获得 `项目名.pages.dev` 免费子域名及 HTTPS。
6. 后续更新 `news.json`、HTML、CSS 或 JS 并推送到仓库，Pages 会自动重新部署。

也可以使用 GitHub Pages 或 Netlify。平台设置界面与免费额度可能变化，请以各自官方文档为准：
- Cloudflare Pages: https://developers.cloudflare.com/pages/
- Pages limits: https://developers.cloudflare.com/pages/platform/limits/
- GitHub Pages: https://pages.github.com/
- Netlify: https://www.netlify.com/

## 可选：RSS 自动新闻更新（Cloudflare Worker）

静态 HTML 本身不会定时抓取新闻。本项目提供 `worker/` 中的示例 RSS 聚合接口，需单独部署后才能自动更新。

1. 安装 Node.js LTS。
2. 在终端进入 `worker` 目录，运行 `npm install`。
3. 执行：

   ```bash
   npx wrangler login
   npx wrangler deploy
   ```

4. 在 Cloudflare Worker 的 Settings → Variables 中添加 `RSS_FEEDS` 环境变量，值为逗号分隔的 HTTPS RSS 地址（最多处理 8 个源）。只配置允许你读取和展示标题、摘要、来源链接的 RSS 源。
5. 打开 `https://你的-worker地址/news`，检查是否返回 JSON。
6. 编辑根目录 `config.js`，将 `NEWS_API_URL` 设置为该 Worker 的 `/news` 地址：

   ```js
   window.PORTAL_CONFIG = {
     NEWS_API_URL: "https://你的-worker地址/news"
   };
   ```

7. 重新部署静态网站。若 Worker 暂时不可用，网站会尝试回退到 `news.json` 的内容。

RSS 格式各不相同，示例解析器不保证兼容所有源。生产环境建议增加来源白名单、缓存、监控、错误告警和更严格的超时/响应大小限制。不要把私密 API key 写入前端 `config.js`。

## 免费服务的限制

- 免费托管并非无限量：可能限制带宽、构建次数、文件大小、请求量或公平使用；以服务商当前套餐为准。
- Workers 免费额度、CPU 时间和请求限制可能调整。RSS 聚合接口的请求失败、限流和源站改版都可能影响更新。
- 本项目没有真正的编辑后台、登录系统、数据库、多人实时排行榜、评论、支付或云端存档。编辑新闻需要修改 `news.json` 并重新部署。
- 成绩保存在用户自己的浏览器中，可以被修改或清除；不能用于有价值的奖励、真钱兑换或可信排名。
- 读取 RSS 不等于获得全文转载权。只展示获准使用的标题、摘要、来源与链接，遵守源站条款、署名要求、版权法和当地新闻相关规定。
- 未集成广告平台。接入广告通常需要审核、隐私政策、Cookie/广告披露并遵守广告平台规则；收入不作保证。不要使用误导点击或影响游戏操作的广告。
- 正式商业运营前，应增加隐私政策、版权/纠错联系入口、安全检查与适用地区合规审查。

## 推荐后续迭代

1. 替换演示新闻并确定获准使用的新闻源。
2. 增加可登录的管理后台与数据库（例如 Workers + D1）。
3. 把排行榜移至服务端并加入校验和反作弊措施。
4. 增加隐私政策、版权联系页和内容纠错流程。
5. 取得广告平台批准后再接入广告。
