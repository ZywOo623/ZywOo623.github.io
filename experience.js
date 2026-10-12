(() => {
    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    // A thin reading indicator works on long articles and the homepage alike.
    const progress = document.createElement("div");
    progress.className = "scroll-progress";
    progress.setAttribute("aria-hidden", "true");
    progress.append(document.createElement("span"));
    document.body.prepend(progress);
    const progressFill = progress.firstElementChild;
    const reveal = document.querySelector(".reveal-gates");
    const revealHero = reveal && document.querySelector(".hero");
    const revealMedia = window.matchMedia("(min-width: 801px) and (min-height: 761px) and (prefers-reduced-motion: no-preference)");
    let progressPending = false;

    function updateProgress() {
        const scrollable = document.documentElement.scrollHeight - window.innerHeight;
        const ratio = scrollable > 0 ? window.scrollY / scrollable : 0;
        progressFill.style.width = `${Math.min(100, Math.max(0, ratio * 100))}%`;
        if (revealHero && revealMedia.matches) {
            const distance = Math.max(1, revealHero.offsetHeight - window.innerHeight);
            const phase = Math.min(1, Math.max(0, -revealHero.getBoundingClientRect().top / distance));
            reveal.style.setProperty("--gate-left", `${-205 * phase}%`);
            reveal.style.setProperty("--gate-right", `${205 * phase}%`);
            reveal.style.setProperty("--gate-opacity", String(1 - phase));
        }
        progressPending = false;
    }

    window.addEventListener("scroll", () => {
        if (!progressPending) {
            progressPending = true;
            window.requestAnimationFrame(updateProgress);
        }
    }, { passive: true });
    window.addEventListener("resize", updateProgress);
    updateProgress();

    const metrics = document.getElementById("blog-metrics");
    if (metrics && Array.isArray(window.BLOG_POSTS)) {
        const figures = [
            [window.BLOG_POSTS.length, "公开文章"],
            [new Set(window.BLOG_POSTS.map(post => post.series)).size, "学习系列"],
            [window.BLOG_CATEGORIES.length, "文章分类"]
        ];
        figures.forEach(([value, label]) => {
            const item = document.createElement("div");
            item.className = "blog-metric";
            const number = document.createElement("strong");
            number.textContent = String(value).padStart(2, "0");
            const caption = document.createElement("span");
            caption.textContent = label;
            item.append(number, caption);
            metrics.append(item);
        });
    }

    if (!reduceMotion && window.matchMedia("(hover: hover) and (pointer: fine)").matches) {
        document.querySelectorAll(
            ".project-card, .skill-row, .learning-blog-link, .latest-post, .post-card-link"
        ).forEach(card => {
            card.classList.add("spotlight-card");
            card.addEventListener("pointermove", event => {
                const bounds = card.getBoundingClientRect();
                card.style.setProperty("--pointer-x", `${event.clientX - bounds.left}px`);
                card.style.setProperty("--pointer-y", `${event.clientY - bounds.top}px`);
            }, { passive: true });
        });
    }

    if (!reduceMotion) {
        const heroItems = document.querySelectorAll(".hero-copy > *");
        heroItems.forEach((item, index) => {
            item.animate(
                [
                    { opacity: .65, transform: "translateY(16px)" },
                    { opacity: 1, transform: "translateY(0)" }
                ],
                { duration: 650, delay: 90 + index * 75, easing: "cubic-bezier(.2,.75,.25,1)" }
            );
        });
        const visual = document.querySelector(".hero-visual");
        if (visual) {
            visual.animate(
                [
                    { opacity: .72, transform: "scale(.96)" },
                    { opacity: 1, transform: "scale(1)" }
                ],
                { duration: 900, delay: 230, easing: "cubic-bezier(.2,.75,.25,1)" }
            );
        }
    }

    if (!reduceMotion && "IntersectionObserver" in window) {
        const observer = new IntersectionObserver(entries => {
            entries.forEach(entry => {
                if (!entry.isIntersecting) return;
                observer.unobserve(entry.target);
                entry.target.animate(
                    [
                        { opacity: .68, transform: "translateY(18px)" },
                        { opacity: 1, transform: "translateY(0)" }
                    ],
                    { duration: 650, easing: "cubic-bezier(.2,.75,.25,1)" }
                );
            });
        }, { threshold: .13 });

        document.querySelectorAll(
            ".section-header, .about-content, .project-card, .skill-row, .learning-blog-link, .latest-post, .post-card, .blog-metrics"
        ).forEach(item => observer.observe(item));
    }

    const canvas = document.getElementById("bitfield-canvas");
    if (!canvas || reduceMotion || !window.matchMedia("(min-width: 801px)").matches) return;

    const context = canvas.getContext("2d");
    if (!context) return;
    const visual = canvas.parentElement;
    const bits = Array.from({ length: 78 }, (_, index) => ({
        x: Math.random(),
        y: Math.random(),
        phase: Math.random() * Math.PI * 2,
        bit: index % 3 === 0 ? "1" : "0"
    }));
    const pointer = { x: 0, y: 0, active: false };
    let width = 0;
    let height = 0;
    let frameId = 0;
    let lastFrame = 0;
    let inView = true;

    function resizeCanvas() {
        const bounds = visual.getBoundingClientRect();
        const density = Math.min(window.devicePixelRatio || 1, 2);
        width = bounds.width;
        height = bounds.height;
        canvas.width = Math.round(width * density);
        canvas.height = Math.round(height * density);
        context.setTransform(density, 0, 0, density, 0, 0);
        pointer.x = width / 2;
        pointer.y = height / 2;
    }

    function draw(time) {
        if (!inView) {
            frameId = 0;
            return;
        }
        frameId = window.requestAnimationFrame(draw);
        if (time - lastFrame < 32) return;
        lastFrame = time;
        context.clearRect(0, 0, width, height);
        context.font = '12px Consolas, "Cascadia Code", monospace';
        context.textAlign = "center";

        bits.forEach(bit => {
            const x = bit.x * width + Math.sin(time * .00023 + bit.phase) * 9;
            const y = bit.y * height + Math.cos(time * .00018 + bit.phase) * 7;
            const distance = Math.hypot(x - pointer.x, y - pointer.y);
            const proximity = pointer.active ? Math.max(0, 1 - distance / 165) : 0;
            const shimmer = .04 * Math.sin(time * .0014 + bit.phase);
            const alpha = Math.min(.85, .18 + proximity * .58 + shimmer);
            context.fillStyle = `rgba(160, 240, 210, ${alpha})`;
            context.fillText(bit.bit, x, y);
        });

        if (pointer.active) {
            const halo = context.createRadialGradient(
                pointer.x, pointer.y, 0,
                pointer.x, pointer.y, 145
            );
            halo.addColorStop(0, "rgba(141, 232, 220, .09)");
            halo.addColorStop(1, "rgba(141, 232, 220, 0)");
            context.fillStyle = halo;
            context.fillRect(pointer.x - 145, pointer.y - 145, 290, 290);
        }
    }

    visual.addEventListener("pointermove", event => {
        const bounds = visual.getBoundingClientRect();
        pointer.x = event.clientX - bounds.left;
        pointer.y = event.clientY - bounds.top;
        pointer.active = true;
        visual.style.setProperty("--visual-x", `${pointer.x}px`);
        visual.style.setProperty("--visual-y", `${pointer.y}px`);
    }, { passive: true });
    visual.addEventListener("pointerleave", () => {
        pointer.active = false;
        visual.style.setProperty("--visual-x", "50%");
        visual.style.setProperty("--visual-y", "50%");
    });

    if ("ResizeObserver" in window) {
        new ResizeObserver(resizeCanvas).observe(visual);
    } else {
        window.addEventListener("resize", resizeCanvas);
    }
    new IntersectionObserver(entries => {
        inView = entries[0].isIntersecting;
        if (inView && !frameId) frameId = window.requestAnimationFrame(draw);
    }).observe(visual);

    resizeCanvas();
    frameId = window.requestAnimationFrame(draw);
})();

