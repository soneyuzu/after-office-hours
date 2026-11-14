/**
 * Cast for the orbital archive.
 * Image path: assets/images/{name}.webp (lowercase RGBA cutout).
 * Omit description/note (or leave "") to hide those dossier sections.
 */
const characters = [
  {
    name: "YEFIM",
    role: "CHARACTER",
    age: "—",
    height: "—",
    status: "ACTIVE",
    birthday: "—",
    description: "",
    background: "",
  },
  {
    name: "YUMIN",
    role: "CHARACTER",
    age: "—",
    height: "—",
    status: "ACTIVE",
    birthday: "—",
    description: "",
    background: "",
  },
  {
    name: "ELAT",
    role: "CHARACTER",
    age: "—",
    height: "—",
    status: "ACTIVE",
    birthday: "—",
    description: "",
    background: "",
  },
  {
    name: "EVREN",
    role: "CHARACTER",
    age: "—",
    height: "—",
    status: "ACTIVE",
    birthday: "—",
    description: "",
    background: "",
  },
  {
    name: "ISARN",
    role: "CHARACTER",
    age: "—",
    height: "—",
    status: "ACTIVE",
    birthday: "—",
    description: "",
    background: "",
  },
];

function characterImage(character) {
  return `assets/images/${character.name.toLowerCase()}.webp`;
}


const ARCHIVE_URL = "archive.html";

function initIntro(root) {
  let leaving = false;
  const reduced = window.matchMedia("(prefers-reduced-motion: reduce)");

  const countEl = root.querySelector(".micro-four");
  if (countEl) {
    const n = Array.isArray(characters) ? characters.length : 0;
    countEl.textContent = `01 / ${String(n).padStart(2, "0")}`;
  }

  function leaveDelayMs() {
    if (reduced.matches) return 0;
    const raw = getComputedStyle(document.documentElement)
      .getPropertyValue("--duration-leave")
      .trim();
    const value = Number.parseFloat(raw);
    return Number.isFinite(value) ? value : 640;
  }

  // Subtle depth: poster and wall lettering drift apart with the pointer.
  const finePointer = window.matchMedia("(pointer: fine)");
  let parallaxFrame = 0;
  root.addEventListener("pointermove", (event) => {
    if (reduced.matches || !finePointer.matches || leaving) return;
    if (parallaxFrame) return;
    parallaxFrame = requestAnimationFrame(() => {
      parallaxFrame = 0;
      const x = event.clientX / window.innerWidth - 0.5;
      const y = event.clientY / window.innerHeight - 0.5;
      root.style.setProperty("--mx", x.toFixed(3));
      root.style.setProperty("--my", y.toFixed(3));
    });
  });

  function enter() {
    if (leaving) return;
    leaving = true;
    root.classList.add("is-leaving");

    window.setTimeout(() => {
      window.location.href = ARCHIVE_URL;
    }, leaveDelayMs());
  }

  root.addEventListener("click", enter);
  window.addEventListener("keydown", (event) => {
    // Keys pressed on a real control (e.g. a lift button) belong to that control.
    if (event.target instanceof Element && event.target.closest("a, button")) return;
    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      enter();
    }
  });

  // Back/forward cache can restore a mid-leave intro; reset so it stays usable.
  window.addEventListener("pageshow", (event) => {
    if (!event.persisted && !leaving) return;
    leaving = false;
    root.classList.remove("is-leaving");
  });
}
