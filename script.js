const header = document.querySelector(".site-header");
const menuButton = document.querySelector(".menu-toggle");
const navLinks = document.querySelectorAll(".site-nav a");
const revealItems = document.querySelectorAll(".reveal");
const parallaxItems = document.querySelectorAll("[data-parallax]");
const tiltItems = document.querySelectorAll("[data-tilt]");
const hero = document.querySelector(".hero");
const root = document.documentElement;
let scrollFrame = null;
const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

const setHeaderState = () => {
  header.dataset.elevated = window.scrollY > 8 ? "true" : "false";
};

setHeaderState();
window.addEventListener("scroll", setHeaderState, { passive: true });

const setScrollEffects = () => {
  const maxScroll = document.documentElement.scrollHeight - window.innerHeight;
  const progress = maxScroll > 0 ? window.scrollY / maxScroll : 0;
  root.style.setProperty("--scroll-progress", progress.toFixed(4));

  parallaxItems.forEach((item) => {
    const rect = item.getBoundingClientRect();
    const distance = window.innerHeight / 2 - (rect.top + rect.height / 2);
    const intensity = Number(item.dataset.parallax) || 0;
    const offset = Math.max(-22, Math.min(22, distance * intensity));
    item.style.setProperty("--parallax-y", `${offset.toFixed(2)}px`);
  });

  scrollFrame = null;
};

const requestScrollEffects = () => {
  if (scrollFrame === null) {
    scrollFrame = window.requestAnimationFrame(setScrollEffects);
  }
};

requestScrollEffects();
window.addEventListener("scroll", requestScrollEffects, { passive: true });
window.addEventListener("resize", requestScrollEffects);

if (!reduceMotion && window.matchMedia("(pointer: fine)").matches) {
  tiltItems.forEach((item) => {
    let tiltFrame = null;
    let pointerX = 0;
    let pointerY = 0;

    const updateTilt = () => {
      const rect = item.getBoundingClientRect();
      const x = (pointerX - rect.left) / rect.width - 0.5;
      const y = (pointerY - rect.top) / rect.height - 0.5;
      item.style.setProperty("--tilt-rotate-x", `${(-y * 4).toFixed(2)}deg`);
      item.style.setProperty("--tilt-rotate-y", `${(x * 5).toFixed(2)}deg`);
      item.style.setProperty("--shine-x", `${(x * 80).toFixed(2)}%`);
      tiltFrame = null;
    };

    item.addEventListener("pointerenter", () => item.classList.add("is-tilting"));
    item.addEventListener("pointermove", (event) => {
      pointerX = event.clientX;
      pointerY = event.clientY;
      if (tiltFrame === null) {
        tiltFrame = window.requestAnimationFrame(updateTilt);
      }
    });
    item.addEventListener("pointerleave", () => {
      item.classList.remove("is-tilting");
      item.style.setProperty("--tilt-rotate-x", "0deg");
      item.style.setProperty("--tilt-rotate-y", "0deg");
      item.style.setProperty("--shine-x", "-70%");
    });
  });
}

if (menuButton) {
  menuButton.addEventListener("click", () => {
    const isOpen = menuButton.getAttribute("aria-expanded") === "true";
    menuButton.setAttribute("aria-expanded", String(!isOpen));
    document.body.classList.toggle("nav-open", !isOpen);
  });
}

navLinks.forEach((link) => {
  link.addEventListener("click", () => {
    menuButton?.setAttribute("aria-expanded", "false");
    document.body.classList.remove("nav-open");
  });
});

const observer = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add("is-visible");
        if (entry.target.classList.contains("hero-copy")) {
          hero?.classList.add("is-animated");
        }
        observer.unobserve(entry.target);
      }
    });
  },
  { threshold: 0.12 }
);

revealItems.forEach((item, index) => {
  item.style.setProperty("--reveal-delay", `${Math.min(index % 4, 3) * 70}ms`);
  observer.observe(item);
});

const navByTarget = new Map(
  Array.from(navLinks).map((link) => [link.getAttribute("href")?.slice(1), link])
);
const trackedSections = Array.from(document.querySelectorAll("main section[id]")).filter((section) =>
  navByTarget.has(section.id)
);

const navObserver = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        navLinks.forEach((link) => link.classList.remove("is-active"));
        navByTarget.get(entry.target.id)?.classList.add("is-active");
      }
    });
  },
  { rootMargin: "-35% 0px -55% 0px", threshold: 0 }
);

trackedSections.forEach((section) => navObserver.observe(section));

const revealVisibleItems = () => {
  revealItems.forEach((item) => {
    const rect = item.getBoundingClientRect();
    if (rect.top < window.innerHeight * 0.92) {
      item.classList.add("is-visible");
      if (item.classList.contains("hero-copy")) {
        hero?.classList.add("is-animated");
      }
    }
  });
};

requestAnimationFrame(revealVisibleItems);
window.addEventListener("load", revealVisibleItems);
window.addEventListener("scroll", revealVisibleItems, { passive: true });
