/**
 * INTRO FX — the interactive layer of the intro. Purely additive:
 * the enter mechanic stays in intro.bundle.js and is untouched.
 *
 *  1. Cast      — the five characters stand at the poster's foot as
 *                 silhouettes; hovering one lights it and shows its name.
 *  2. Pen       — the pointer leaves crimson ink on the wall that fades.
 *  3. Tilt      — the poster leans toward the hand, with a moving sheen.
 *  4. Lights    — a switch turns the room to night; remembered per visitor.
 */
(function () {
  const root = document.getElementById("intro");
  if (!root) return;

  const reduced = window.matchMedia("(prefers-reduced-motion: reduce)");
  const finePointer = window.matchMedia("(pointer: fine)");

  // ---------- 1. Cast ----------
  // Uses the site's own character data (defined in intro.bundle.js).
  const castEl = root.querySelector("[data-cast]");
  const phone = window.matchMedia("(max-width: 900px)");
  // Desktop: two figures left of the poster, three right, at varied scale
  // (as if standing at different distances). Phone: one row under it.
  const DESKTOP = [
    { x: 10, s: 1.0 },
    { x: 25, s: 0.84 },
    { x: 73, s: 0.9 },
    { x: 86, s: 1.06 },
    { x: 61, s: 0.74 },
  ];

  function placeCast() {
    if (!castEl) return;
    castEl.querySelectorAll(".figure").forEach((fig, i) => {
      if (phone.matches) {
        const n = castEl.children.length;
        fig.style.setProperty("--x", `${((i + 0.5) / n) * 100}vw`);
        fig.style.setProperty("--h", "var(--cast-h)");
      } else {
        const slot = DESKTOP[i % DESKTOP.length];
        fig.style.setProperty("--x", `${slot.x}vw`);
        fig.style.setProperty("--h", `calc(var(--cast-h) * ${slot.s})`);
      }
    });
  }

  const cast =
    typeof characters !== "undefined" && Array.isArray(characters) ? characters : [];
  if (castEl && cast.length && typeof characterImage === "function") {
    cast.forEach((character, i) => {
      const fig = document.createElement("div");
      fig.className = "figure";
      fig.style.setProperty("--i", String(i));
      const img = document.createElement("img");
      img.src = characterImage(character);
      img.alt = "";
      img.draggable = false;
      img.decoding = "async";
      const name = document.createElement("span");
      name.className = "figure-name";
      name.textContent = character.name;
      fig.append(img, name);
      castEl.appendChild(fig);
    });
    placeCast();
    phone.addEventListener?.("change", placeCast);
  }

  // ---------- 2. Pen ----------
  const canvas = root.querySelector("[data-ink]");
  const ctx = canvas ? canvas.getContext("2d") : null;
  let last = null;
  let fadeFrame = 0;
  let lastInk = 0;

  function sizeCanvas() {
    if (!canvas) return;
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    canvas.width = Math.round(root.clientWidth * dpr);
    canvas.height = Math.round(root.clientHeight * dpr);
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  }

  function inkColour() {
    return getComputedStyle(root).getPropertyValue("--crimson").trim() || "#8a1430";
  }

  function fade() {
    // Erase a little every frame so the trail dissolves into the plaster.
    ctx.save();
    ctx.globalCompositeOperation = "destination-out";
    ctx.fillStyle = "rgba(0, 0, 0, 0.045)";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.restore();
    if (performance.now() - lastInk < 2600) {
      fadeFrame = requestAnimationFrame(fade);
    } else {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      fadeFrame = 0;
    }
  }

  function drawTo(x, y) {
    if (!ctx || reduced.matches || root.classList.contains("is-leaving")) return;
    const point = { x, y };
    if (last) {
      const dx = x - last.x;
      const dy = y - last.y;
      const speed = Math.min(1, Math.hypot(dx, dy) / 40);
      ctx.strokeStyle = inkColour();
      ctx.lineCap = "round";
      ctx.lineJoin = "round";
      // a pen: thinner when fast, like a nib dragged across plaster
      ctx.lineWidth = 2.6 - speed * 1.6;
      ctx.beginPath();
      ctx.moveTo(last.x, last.y);
      ctx.quadraticCurveTo(last.x, last.y, (last.x + x) / 2, (last.y + y) / 2);
      ctx.lineTo(x, y);
      ctx.stroke();
    }
    last = point;
    lastInk = performance.now();
    if (!fadeFrame) fadeFrame = requestAnimationFrame(fade);
  }

  if (canvas) {
    sizeCanvas();
    window.addEventListener("resize", sizeCanvas);

    root.addEventListener("pointermove", (event) => {
      if (event.pointerType === "touch" && event.buttons === 0) return;
      const rect = root.getBoundingClientRect();
      drawTo(event.clientX - rect.left, event.clientY - rect.top);
    });

    root.addEventListener("pointerleave", () => {
      last = null;
    });

    root.addEventListener("pointerup", (event) => {
      if (event.pointerType === "touch") last = null;
    });
  }

  // ---------- 3. Tilt ----------
  const poster = root.querySelector("[data-tilt]");

  // Cheap enough to run per event (two custom properties); the CSS
  // transition does the smoothing, so no frame loop is needed.
  root.addEventListener("pointermove", (event) => {
    if (!poster || reduced.matches || !finePointer.matches) return;
    {
      const rect = poster.getBoundingClientRect();
      const px = (event.clientX - (rect.left + rect.width / 2)) / window.innerWidth;
      const py = (event.clientY - (rect.top + rect.height / 2)) / window.innerHeight;
      const clamp = (v) => Math.max(-1, Math.min(1, v));
      root.style.setProperty("--tilt-y", `${(clamp(px * 2) * 7).toFixed(2)}deg`);
      root.style.setProperty("--tilt-x", `${(clamp(-py * 2) * 5).toFixed(2)}deg`);
      const gx = ((event.clientX - rect.left) / rect.width) * 100;
      const gy = ((event.clientY - rect.top) / rect.height) * 100;
      root.style.setProperty("--glare-x", `${Math.max(-20, Math.min(120, gx)).toFixed(1)}%`);
      root.style.setProperty("--glare-y", `${Math.max(-20, Math.min(120, gy)).toFixed(1)}%`);
      root.classList.add("is-tilting");
    }
  });

  root.addEventListener("pointerleave", () => {
    root.classList.remove("is-tilting");
    root.style.setProperty("--tilt-x", "0deg");
    root.style.setProperty("--tilt-y", "0deg");
  });

  // ---------- 4. Lights ----------
  const lights = root.querySelector("[data-lights]");
  const label = lights ? lights.querySelector(".lights-label") : null;
  const doc = document.documentElement;

  function syncLights() {
    const off = doc.classList.contains("lights-off");
    if (!lights) return;
    lights.setAttribute("aria-pressed", String(off));
    if (label) label.textContent = off ? "LIGHTS ON" : "LIGHTS OFF";
  }

  if (lights) {
    syncLights();
    lights.addEventListener("click", (event) => {
      // the switch must never trigger "click anywhere to enter"
      event.stopPropagation();
      const off = !doc.classList.contains("lights-off");
      doc.classList.toggle("lights-off", off);
      try {
        localStorage.setItem("aoh-lights", off ? "off" : "on");
      } catch {
        /* storage blocked: the choice simply isn't remembered */
      }
      syncLights();
    });
    // keyboard on the switch is the switch's own business
    lights.addEventListener("keydown", (event) => event.stopPropagation());
  }
})();
