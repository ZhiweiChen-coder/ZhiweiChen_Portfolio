const header = document.querySelector(".site-header");
const menuToggle = document.querySelector(".menu-toggle");
const nav = document.querySelector("#site-nav");
const mobile = window.matchMedia("(max-width: 760px)");
const sectionLinks = Array.from(nav.querySelectorAll('a[href^="#"]'), (link) => ({
  link,
  section: document.getElementById(link.hash.slice(1)),
})).reverse();

let activeLink = null;
let scrollFrame = 0;

function setMenu(open) {
  menuToggle.setAttribute("aria-expanded", String(open));
  scheduleCurrentLocation();
}

menuToggle.addEventListener("click", () => {
  setMenu(menuToggle.getAttribute("aria-expanded") !== "true");
});

header.addEventListener("keydown", (event) => {
  if (event.key === "Escape" && menuToggle.getAttribute("aria-expanded") === "true") {
    setMenu(false);
    menuToggle.focus();
  }
});

header.addEventListener("focusout", (event) => {
  if (event.relatedTarget && !header.contains(event.relatedTarget)) setMenu(false);
});

mobile.addEventListener("change", () => {
  const focused = document.activeElement;
  setMenu(false);
  if (mobile.matches && nav.contains(focused)) menuToggle.focus();
  if (!mobile.matches && focused === menuToggle) nav.querySelector("a").focus();
});

header.classList.add("has-disclosure");
menuToggle.hidden = false;

document.querySelectorAll('a[href^="#"]').forEach((link) => {
  link.addEventListener("click", (event) => {
    if (event.defaultPrevented || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;

    const hash = link.hash;
    const target = document.getElementById(hash.slice(1));
    if (!target) return;

    event.preventDefault();
    setMenu(false);
    if (location.hash !== hash) history.pushState(null, "", hash);
    const destination = target.matches("[tabindex]") ? target : target.querySelector("[tabindex]");
    destination?.focus({ preventScroll: true });
    target.scrollIntoView();
    updateCurrentLocation();
  });
});

function updateCurrentLocation() {
  const headerBottom = header.getBoundingClientRect().bottom;
  const readingLine = Math.min(window.innerHeight * 0.65, headerBottom + 72);
  const atPageEnd = window.scrollY > 0 && window.scrollY + window.innerHeight >= document.documentElement.scrollHeight - 2;
  const current = atPageEnd
    ? sectionLinks.find(({ link, section }) =>
      link.hash === location.hash && section.getBoundingClientRect().top >= headerBottom
    ) ?? sectionLinks[0]
    : sectionLinks.find(({ section }) => section.getBoundingClientRect().top <= readingLine);
  const nextLink = current?.link ?? null;

  header.classList.toggle("is-scrolled", window.scrollY > 8);
  if (nextLink === activeLink) return;
  activeLink?.removeAttribute("aria-current");
  nextLink?.setAttribute("aria-current", "location");
  activeLink = nextLink;
}

function scheduleCurrentLocation() {
  if (scrollFrame) return;
  scrollFrame = window.requestAnimationFrame(() => {
    scrollFrame = 0;
    updateCurrentLocation();
  });
}

window.addEventListener("scroll", scheduleCurrentLocation, { passive: true });
window.addEventListener("resize", scheduleCurrentLocation);
window.addEventListener("hashchange", scheduleCurrentLocation);
updateCurrentLocation();

if ("IntersectionObserver" in window) {
  const entrances = new IntersectionObserver((entries) => {
    entries.forEach(({ target, isIntersecting }) => {
      if (!isIntersecting) return;
      target.classList.add("has-entered");
      entrances.unobserve(target);
    });
  }, { threshold: 0.15 });

  document.querySelectorAll(".section-title, [data-settle]").forEach((element) => entrances.observe(element));
}
