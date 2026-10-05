const latestPosts = document.getElementById("latest-posts");

[...window.BLOG_POSTS]
    .sort((a, b) => b.date.localeCompare(a.date))
    .slice(0, 3)
    .forEach(post => {
        const card = document.createElement("a");
        card.className = "latest-post";
        card.href = `blog/article.html?post=${encodeURIComponent(post.slug)}`;
        const type = document.createElement("span");
        type.className = "latest-post-type";
        type.textContent = `${post.category}${post.draftLabel ? ` · ${post.draftLabel}` : ""}`;
        const title = document.createElement("strong");
        title.textContent = post.title;
        const read = document.createElement("span");
        read.className = "latest-post-link";
        read.textContent = "阅读全文 →";
        card.append(type, title, read);
        latestPosts.append(card);
    });
