const slug = new URLSearchParams(window.location.search).get("post");
const post = window.BLOG_POSTS.find(item => item.slug === slug);
const header = document.getElementById("article-header");
const content = document.getElementById("article-content");

function showError(message) {
    content.replaceChildren();
    const paragraph = document.createElement("p");
    paragraph.className = "article-error";
    paragraph.textContent = message;
    content.append(paragraph);
}

if (!post) {
    document.title = "文章未找到 · ZywOo623";
    showError("文章不存在。请返回 Blog 查看已公开的文章。");
} else {
    document.title = `${post.title} · ZywOo623`;
    const category = document.createElement("span");
    category.className = "article-category";
    category.textContent = post.category;
    const title = document.createElement("h1");
    title.textContent = post.title;
    const subtitle = document.createElement("p");
    subtitle.className = "article-series";
    subtitle.textContent = post.series;
    const meta = document.createElement("div");
    meta.className = "article-meta";
    const date = document.createElement("time");
    date.dateTime = post.date;
    date.textContent = post.date;
    meta.append(date);
    if (post.draftLabel) {
        const label = document.createElement("span");
        label.textContent = post.draftLabel;
        meta.append(label);
    }
    post.tags.forEach(tag => {
        const tagElement = document.createElement("span");
        tagElement.textContent = `#${tag}`;
        meta.append(tagElement);
    });
    header.append(category, title, subtitle, meta);

    loadArticle();
}

async function loadArticle() {
    if (!window.marked || !window.DOMPurify) {
        showError("文章组件未加载，请检查网络连接后刷新页面。");
        return;
    }

    try {
        const articleUrl = new URL(post.file, window.location.href);
        const response = await fetch(articleUrl);
        if (!response.ok) throw new Error(`HTTP ${response.status}`);
        const markdown = await response.text();
        const parsed = window.marked.parse(markdown, { gfm: true });
        content.innerHTML = window.DOMPurify.sanitize(parsed, { USE_PROFILES: { html: true } });

        // Markdown image paths are resolved next to the .md file, not article.html.
        content.querySelectorAll("img").forEach(img => {
            const source = img.getAttribute("src");
            if (source && !/^(?:[a-z][a-z\d+.-]*:|\/)/i.test(source)) {
                img.src = new URL(source, articleUrl).href;
            }
            img.loading = "lazy";
        });
        content.querySelectorAll("a[href]").forEach(link => {
            const href = link.getAttribute("href");
            if (href && !/^(?:[a-z][a-z\d+.-]*:|\/|#)/i.test(href)) {
                link.href = new URL(href, articleUrl).href;
            }
            if (link.origin !== window.location.origin) {
                link.target = "_blank";
                link.rel = "noopener noreferrer";
            }
        });
        content.querySelectorAll("table").forEach(table => {
            const wrapper = document.createElement("div");
            wrapper.className = "table-scroll";
            table.replaceWith(wrapper);
            wrapper.append(table);
        });
        if (window.renderMathInElement) {
            window.renderMathInElement(content, {
                delimiters: [
                    { left: "$$", right: "$$", display: true },
                    { left: "$", right: "$", display: false }
                ],
                throwOnError: false
            });
        }
    } catch (error) {
        console.error("Article load failed:", error);
        showError("文章加载失败。请通过本地服务器或网站地址访问，并检查网络连接。");
    }
}
