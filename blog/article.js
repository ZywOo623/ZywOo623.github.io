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
        enhanceArticle();
    } catch (error) {
        console.error("Article load failed:", error);
        const detail = error instanceof Error ? `（${error.message}）` : "";
        showError(`文章加载失败${detail}。请刷新页面重试。`);
    }
}

function enhanceArticle() {
    // Keep the rendered code text intact; controls live outside each <pre>.
    content.querySelectorAll("pre").forEach(pre => {
        const code = pre.querySelector("code");
        if (!code) return;

        const frame = document.createElement("div");
        frame.className = "code-frame";
        pre.replaceWith(frame);
        frame.append(pre);

        const bar = document.createElement("div");
        bar.className = "code-bar";
        const language = document.createElement("span");
        language.className = "code-lang";
        language.textContent = code.className.match(/(?:^|\s)language-([\w+#-]+)/)?.[1] || "text";
        const copy = document.createElement("button");
        copy.type = "button";
        copy.className = "code-copy";
        copy.textContent = "复制代码";
        copy.setAttribute("aria-label", `复制 ${language.textContent} 代码`);
        copy.addEventListener("click", async () => {
            try {
                await navigator.clipboard.writeText(code.textContent);
                copy.textContent = "已复制 ✓";
            } catch {
                copy.textContent = "复制失败";
            }
            window.setTimeout(() => { copy.textContent = "复制代码"; }, 1600);
        });
        bar.append(language, copy);
        frame.prepend(bar);
    });

    const toc = document.getElementById("article-toc");
    const tocLinks = document.getElementById("toc-links");
    const tocProgress = document.getElementById("toc-progress");
    const headings = [...content.querySelectorAll("h2, h3")];
    const links = headings.map((heading, index) => {
        heading.id ||= `section-${index + 1}`;
        const link = document.createElement("a");
        link.href = `#${heading.id}`;
        link.textContent = heading.textContent.trim();
        link.dataset.depth = heading.tagName.slice(1);
        tocLinks.append(link);
        return link;
    });
    toc.hidden = headings.length === 0;

    const backToTop = document.getElementById("back-to-top");
    backToTop.addEventListener("click", () => {
        const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
        window.scrollTo({ top: 0, behavior: reduceMotion ? "auto" : "smooth" });
    });

    let pending = false;
    function updateReadingUI() {
        const showBackToTop = window.scrollY > 600;
        backToTop.classList.toggle("is-visible", showBackToTop);
        backToTop.tabIndex = showBackToTop ? 0 : -1;
        if (headings.length) {
            const articleTop = window.scrollY + content.getBoundingClientRect().top;
            const ratio = (window.scrollY + window.innerHeight * .55 - articleTop) / Math.max(1, content.offsetHeight);
            const percent = Math.round(Math.min(1, Math.max(0, ratio)) * 100);
            tocProgress.textContent = `${percent}%`;
            tocProgress.style.setProperty("--toc-angle", `${percent * 3.6}deg`);
            let active = 0;
            headings.forEach((heading, index) => {
                if (heading.getBoundingClientRect().top <= 160) active = index;
            });
            links.forEach((link, index) => {
                if (index === active) link.setAttribute("aria-current", "location");
                else link.removeAttribute("aria-current");
            });
        }
        pending = false;
    }

    window.addEventListener("scroll", () => {
        if (!pending) {
            pending = true;
            window.requestAnimationFrame(updateReadingUI);
        }
    }, { passive: true });
    window.addEventListener("resize", updateReadingUI);
    updateReadingUI();
}

