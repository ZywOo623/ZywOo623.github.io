# Blog V1 发布说明

本站保持静态 HTML/CSS/JavaScript 结构，无需构建或数据库。

1. 在 `posts/` 下按分类新增公开版 `.md` 文章。请先从私人笔记中挑选和整理内容，不要直接上传完整 Obsidian 笔记或私人资料。
2. 在 `posts.js` 的 `BLOG_POSTS` 数组新增一条元数据：`slug`、`title`、`series`、`date`（`YYYY-MM-DD`）、`category`、`tags`、`description`、`file`。`category` 应与 `BLOG_CATEGORIES` 中的名称一致。正式文章不写 `draftLabel`。
3. 提交这两个文件即可。Blog 列表和首页最近三篇会自动读取索引。Learning 中某一节的“查看笔记”链接按实际发布状态手动添加。

文章支持常见 Markdown（含 GFM 表格）、`$...$` 与 `$$...$$` 数学公式、图片和 C++ 代码块。图片相对路径从 `.md` 文件所在目录解析，代码块的语言标记使用 `cpp`。文章页通过浏览器 `fetch` 读取 Markdown，因此本地预览请使用 Visual Studio 的本地 Web 服务器、Live Server 或其他静态文件服务器；不要直接双击 `article.html`。本站部署到 GitHub Pages 后可直接访问。

Markdown 渲染使用固定版本的 Marked、DOMPurify 和 KaTeX CDN 文件。文章页需要联网加载这些组件；页面会在组件加载失败时提示错误。新增文章前请检查是否含私人信息、无意公开的图片或密钥。
