(() => {
    const lab = document.querySelector(".bit-lab");
    if (!lab) return;

    const buttons = [...lab.querySelectorAll(".lab-bit")];
    const binary = document.getElementById("lab-binary");
    const decimal = document.getElementById("lab-decimal");
    const hex = document.getElementById("lab-hex");
    const count = document.getElementById("lab-count");
    const lowbit = document.getElementById("lab-lowbit");
    const initial = Number(lab.dataset.value) & 255;
    let value = initial;

    // The lowbit marker identifies the rightmost 1, as in the first public note.
    function render() {
        const bits = value.toString(2).padStart(8, "0");
        const lowest = value === 0 ? 0 : value & -value;
        buttons.forEach(button => {
            const bit = 1 << Number(button.dataset.bit);
            const on = Boolean(value & bit);
            button.textContent = on ? "1" : "0";
            button.classList.toggle("is-on", on);
            button.classList.toggle("is-lowbit", on && bit === lowest);
            button.setAttribute("aria-pressed", String(on));
            button.setAttribute("aria-label", `第 ${button.dataset.bit} 位，当前为 ${on ? 1 : 0}`);
        });
        binary.textContent = `${bits.slice(0, 4)} ${bits.slice(4)}`;
        decimal.textContent = String(value);
        hex.textContent = `0x${value.toString(16).toUpperCase().padStart(2, "0")}`;
        count.textContent = String(bits.replaceAll("0", "").length);
        lowbit.textContent = String(lowest);
    }

    buttons.forEach(button => button.addEventListener("click", () => {
        value ^= 1 << Number(button.dataset.bit);
        render();
    }));

    document.getElementById("lab-shuffle")?.addEventListener("click", () => {
        value = Math.floor(Math.random() * 256);
        render();
    });
    document.getElementById("lab-reset")?.addEventListener("click", () => {
        value = initial;
        render();
    });

    render();
})();

(() => {
    const scene = document.querySelector(".unveil-section");
    if (!scene || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const percent = document.getElementById("unveil-percent");
    scene.classList.add("is-ready");
    let pending = false;

    function update() {
        const distance = Math.max(1, scene.offsetHeight - window.innerHeight);
        const phase = Math.min(1, Math.max(0, -scene.getBoundingClientRect().top / distance));
        scene.style.setProperty("--unveil-left", `${-102 * phase}%`);
        scene.style.setProperty("--unveil-right", `${102 * phase}%`);
        scene.style.setProperty("--unveil-seam-opacity", String(Math.max(0, 1 - phase * 2.2)));
        scene.style.setProperty("--unveil-trace", String(1 - phase));
        if (percent) percent.textContent = String(Math.round(phase * 100)).padStart(2, "0");
        pending = false;
    }

    function schedule() {
        if (pending) return;
        pending = true;
        window.requestAnimationFrame(update);
    }

    window.addEventListener("scroll", schedule, { passive: true });
    window.addEventListener("resize", schedule);
    update();
})();
