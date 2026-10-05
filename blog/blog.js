const categories = window.BLOG_CATEGORIES;
const posts = [...window.BLOG_POSTS].sort((a, b) => b.date.localeCompare(a.date));
const categoryList = document.getElementById("category-list");
const postList = document.getElementById("post-list");
const postCount = document.getElementById("post-count");

function makeElement(tag, className, value) {
    const element = document.createElement(tag);
    if (className) element.className = className;
    if (value !== undefined) element.textContent = value;
    return element;
}

function renderPosts(category) {
    const visible = category === "全部" ? posts : posts.filter(post => post.category === category);
    postList.replaceChildren();
    postCount.textContent = `${visible.length} 篇文章`;

    if (!visible.length) {
        postList.append(makeElement("p", "empty-posts", "这个分类暂时没有公开文章。"));
        return;
    }

    visible.forEach(post => {
        const card = makeElement("article", "post-card");
        const top = makeElement("div", "post-card-top");
        top.append(
            makeElement("span", "post-category", post.category),
            makeElement("time", "post-date", post.date)
        );
        top.querySelector("time").dateTime = post.date;

        const title = makeElement("h3", "post-title", post.title);
        const series = makeElement("p", "post-series", post.series);
        const description = makeElement("p", "post-description", post.description);
        const tags = makeElement("div", "post-tags");
        post.tags.forEach(tag => tags.append(makeElement("span", "post-tag", `#${tag}`)));
        const bottom = makeElement("div", "post-card-bottom");
        bottom.append(makeElement("span", "", post.draftLabel || "ARTICLE"), makeElement("span", "", "阅读全文 →"));
        const link = makeElement("a", "post-card-link");
        link.href = `article.html?post=${encodeURIComponent(post.slug)}`;
        link.setAttribute("aria-label", `阅读 ${post.title}`);
        link.append(top, title, series, description, tags, bottom);
        card.append(link);
        postList.append(card);
    });
}

const allCategories = ["全部", ...categories];
allCategories.forEach(category => {
    const button = makeElement("button", "category-button", category);
    button.type = "button";
    button.setAttribute("aria-pressed", category === "全部" ? "true" : "false");
    button.addEventListener("click", () => {
        categoryList.querySelectorAll("button").forEach(item => {
            item.setAttribute("aria-pressed", item === button ? "true" : "false");
        });
        renderPosts(category);
    });
    categoryList.append(button);
});

renderPosts("全部");
