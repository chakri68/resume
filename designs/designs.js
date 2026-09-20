// ===== Alternate designs =====
// The classic page (index.html + styles.css) is the default, and its A4 print is the
// one that goes to recruiters — nothing here changes it. Every other design is a
// renderer (designs/<id>.js) plus a stylesheet (designs/<id>.css), fetched only
// when picked and mounted inside a shadow root so styles.css's global element
// selectors (section, article, h2, …) can't leak in, and the design's can't leak out.
// A design prints as itself, on one page cut to its own size (see "print" below).
(function () {
  const DESIGN_STORAGE_KEY = "design";
  const DESIGN_PARAM = "design";
  const DEFAULT_DESIGN = "classic";

  // `bg` paints <body> behind the shadow root; `swatch` is the little chip in the menu.
  const DESIGNS = [
    { id: "classic", name: "Classic", note: "the original", swatch: ["#ffffff", "#395b9c", "#181818"] },
    {
      id: "riso",
      name: "Riso poster",
      note: "two inks, overprinted",
      bg: "#F1E9D8",
      swatch: ["#F1E9D8", "#F24B2B", "#2335A8"],
      fonts: "family=Caprasimo&family=DM+Sans:wght@400;500;700",
    },
    {
      id: "magazine",
      name: "Magazine",
      note: "Bodoni and a highlighter",
      bg: "#F3F0E8",
      swatch: ["#F3F0E8", "#DDF247", "#121212"],
      fonts:
        "family=Bodoni+Moda:ital,wght@0,400;0,500;0,700;1,400;1,500&family=Newsreader:ital,wght@0,400;0,500;0,600;1,400;1,500",
    },
    {
      id: "broadsheet",
      name: "Broadsheet",
      note: "front-page news",
      bg: "#EFEBE1",
      swatch: ["#EFEBE1", "#B3261E", "#151412"],
      fonts:
        "family=Pirata+One&family=Playfair+Display:ital,wght@0,700;0,800;0,900;1,500;1,700&family=PT+Serif:ital,wght@0,400;0,700;1,400",
    },
    {
      id: "broadside",
      name: "Broadside",
      note: "wood-type letterpress",
      bg: "#EDE3CC",
      swatch: ["#EDE3CC", "#B5271C", "#1A1613"],
      fonts:
        "family=Abril+Fatface&family=Ultra&family=Stint+Ultra+Condensed&family=Old+Standard+TT:ital,wght@0,400;0,700;1,400",
    },
    {
      id: "dada",
      name: "Dada",
      note: "type, misbehaving",
      bg: "#E9E2D0",
      swatch: ["#E9E2D0", "#C2281D", "#161412"],
      fonts:
        "family=Alfa+Slab+One&family=Playfair+Display:ital,wght@1,900&family=Special+Elite&family=Crimson+Pro:ital,wght@0,400;0,600;0,700;1,400",
    },
    {
      id: "almanac",
      name: "Almanac",
      note: "printed for the author, 1726",
      bg: "#F0E6CF",
      swatch: ["#F0E6CF", "#9E2B1F", "#231A12"],
      fonts: "family=IM+Fell+Double+Pica:ital@0;1&family=IM+Fell+English:ital@0;1&family=IM+Fell+English+SC",
    },
  ];

  const byId = (id) => DESIGNS.find((d) => d.id === id);
  const renderers = {};
  const pending = {};
  let resumeData = null;
  let current = DEFAULT_DESIGN;
  let shadow = null;

  // ----- initial pick: ?design= beats localStorage beats classic -----
  function initialDesign() {
    const fromUrl = new URLSearchParams(window.location.search).get(DESIGN_PARAM);
    if (fromUrl && byId(fromUrl)) return fromUrl;
    try {
      const saved = localStorage.getItem(DESIGN_STORAGE_KEY);
      if (saved && byId(saved)) return saved;
    } catch {
      /* storage blocked — classic it is */
    }
    return DEFAULT_DESIGN;
  }

  // Runs in <head>, before first paint, so the page never flashes the wrong design.
  function markDocument(id) {
    const root = document.documentElement;
    root.setAttribute("data-design", id);
    const design = byId(id);
    if (design && design.bg) root.style.setProperty("--design-bg", design.bg);
    else root.style.removeProperty("--design-bg");
  }

  // The tab icon and the browser-chrome colour follow the design. favicon.svg draws
  // with custom properties, so re-inking it is one appended <style> block — paper for
  // the tile, the design's ink for the letters and edge, its accent for the rule.
  // Classic just gets the file back (which also restores its dark-scheme variant).
  let faviconSource = null;
  async function paintChrome(id) {
    const design = byId(id);
    const icon = document.querySelector('link[rel="icon"][type="image/svg+xml"]');
    const themed = design && design.bg;

    document.querySelectorAll('meta[name="theme-color"]').forEach((meta) => {
      if (!meta.dataset.classic) meta.dataset.classic = meta.content;
      meta.content = themed ? design.bg : meta.dataset.classic;
    });

    if (!icon) return;
    if (!icon.dataset.classic) icon.dataset.classic = icon.getAttribute("href");
    if (!themed) return icon.setAttribute("href", icon.dataset.classic);
    try {
      faviconSource = faviconSource || (await (await fetch(icon.dataset.classic)).text());
      if (current !== id) return; // switched again while fetching
      const [paper, accent, ink] = design.swatch;
      const inked = faviconSource.replace(
        "</svg>",
        `<style>:root{--tile:${paper};--edge:${ink};--ink:${ink};--accent:${accent}}</style></svg>`
      );
      icon.setAttribute("href", `data:image/svg+xml,${encodeURIComponent(inked)}`);
    } catch {
      /* no icon swap — not worth breaking anything over */
    }
  }

  current = initialDesign();
  markDocument(current);

  // ----- helpers handed to every renderer -----
  const esc = (s) =>
    String(s ?? "").replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]);

  const svg = (body, size, attrs = "") =>
    `<svg viewBox="0 0 24 24" width="${size}" height="${size}" aria-hidden="true" ${attrs}>${body}</svg>`;
  const stroke = 'fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"';

  const icons = {
    arrow: (size = 18) => svg('<line x1="7" y1="17" x2="17" y2="7"/><polyline points="7 7 17 7 17 17"/>', size, stroke),
    print: (size = 16) =>
      svg(
        '<polyline points="6 9 6 2 18 2 18 9"/><path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2"/><rect x="6" y="14" width="12" height="8"/>',
        size,
        stroke
      ),
    star: (size = 20) =>
      svg('<path d="M12 1.5l3.1 6.6 7.2.9-5.3 5 1.4 7.1L12 17.6 5.6 21.1 7 14 1.7 9l7.2-.9z"/>', size, 'fill="currentColor"'),
    spark: (size = 24) =>
      svg('<path d="M12 0 L14.5 9.5 L24 12 L14.5 14.5 L12 24 L9.5 14.5 L0 12 L9.5 9.5 Z"/>', size, 'fill="currentColor"'),
  };

  const ROMAN = [["M", 1000], ["CM", 900], ["D", 500], ["CD", 400], ["C", 100], ["XC", 90], ["L", 50], ["XL", 40], ["X", 10], ["IX", 9], ["V", 5], ["IV", 4], ["I", 1]];
  function roman(n) {
    let out = "";
    for (const [sym, val] of ROMAN) while (n >= val) (out += sym), (n -= val);
    return out;
  }

  // Greedy fill: each job goes to whichever column is currently shortest. With the
  // usual "one long multi-role job + a few short ones" this lands the long one alone.
  function splitColumns(jobs, count) {
    const cols = Array.from({ length: count }, () => ({ jobs: [], weight: 0 }));
    jobs.forEach((job) => {
      const target = cols.reduce((a, b) => (b.weight < a.weight ? b : a));
      target.jobs.push(job);
      target.weight += job.weight;
    });
    return cols.map((c) => c.jobs);
  }

  const logo = (size = "1.75rem") =>
    `<logo-animated width="${size}" height="${size}" stroke-color="currentColor" fill-color="currentColor" delay="0.1" duration="1.5" timing-function="ease" repeat="false"></logo-animated>`;

  // Shared top bar. Each design restyles it; the markup (and the behaviour wired up
  // in mount()) stays the same everywhere.
  function nav(labels = {}, printLabel = "Print / PDF") {
    const sections = [
      ["experience", "Experience"],
      ["skills", "Skills"],
      ["education", "Education"],
      ["achievements", "Achievements"],
      ["projects", "Projects"],
    ];
    return `
      <nav class="dz-nav" aria-label="Sections">
        <a class="dz-nav__logo" href="#top" aria-label="Back to top">${logo()}</a>
        <div class="dz-nav__links">
          ${sections.map(([id, label]) => `<a href="#${id}">${esc(labels[id] || label)}</a>`).join("")}
        </div>
        <div class="dz-nav__controls">
          <button class="dz-nav__btn dz-nav__print" type="button" data-action="print">${icons.print()}<span>${esc(printLabel)}</span></button>
          <span data-picker></span>
        </div>
      </nav>`;
  }

  // Seamless ticker: two identical tracks chasing each other. `items` are HTML strings.
  // Motion is CSS-only and switched off under prefers-reduced-motion (see base.css).
  function marquee(items, { separator = "", seconds = items.length * 2.4, cls = "" } = {}) {
    const track = `<div class="dz-marquee__track">${items.map((i) => `<span>${i}</span>${separator}`).join("")}</div>`;
    return `<div class="dz-marquee ${cls}" aria-hidden="true" style="--marquee-seconds: ${Math.round(seconds)}s">${track}${track}</div>`;
  }

  const bullets = (items, marker = "") =>
    `<ul class="dz-bullets">${items.map((t) => `<li>${marker}<span>${esc(t)}</span></li>`).join("")}</ul>`;

  const ext = 'target="_blank" rel="noopener noreferrer"';

  // ----- the resume JSON, massaged into the shape the designs want -----
  function model(data) {
    const dash = (s) => String(s || "").replace(/\s+-\s+/g, " – ");
    const raw = data.personal.name.trim();
    const pretty =
      raw === raw.toUpperCase() ? raw.toLowerCase().replace(/(^|[\s-])(\p{L})/gu, (m, a, b) => a + b.toUpperCase()) : raw;
    const words = pretty.split(/\s+/);
    const name = {
      full: pretty,
      first: words[0],
      middle: words.slice(1, -1).join(" "),
      last: words.length > 1 ? words[words.length - 1] : "",
    };

    const contacts = Object.entries(data.personal.contact).map(([key, c]) => ({
      key,
      text: c.text,
      url: c.url,
      handle: /^https?:/.test(c.url) ? c.url.replace(/\/+$/, "").split("/").pop() : c.text,
    }));
    const contact = Object.fromEntries(contacts.map((c) => [c.key, c]));

    const experience = (data.experience || []).map((e) => {
      const multi = Array.isArray(e.positions) && e.positions.length > 0;
      const positions = multi
        ? e.positions.map((p) => ({ title: p.title, period: dash(p.period), bullets: p.achievements || [] }))
        : [{ title: "", period: "", bullets: e.achievements || [] }];
      const chars = positions.reduce((n, p) => n + p.bullets.join("").length, 0);
      return {
        company: e.company,
        title: e.title,
        location: e.location,
        period: dash(e.period),
        headline: e.headline || "",
        deck: e.deck || "",
        single: !multi,
        current: /present/i.test(e.period),
        positions,
        weight: chars + 200 * positions.length,
      };
    });

    const achievements = (data.achievements || []).map((a) => {
      const parts = a.description.split(/\s+•\s+/);
      const year = parts.length > 1 ? parts.pop() : "";
      return { title: a.title, description: a.description, year, note: parts.join("; ") };
    });

    const tagline = (data.personal.tagline || (experience[0] && experience[0].title) || "").split(/\s+·\s+/).filter(Boolean);
    const footer = data.footer || {};
    const year = Number((`${footer.lastUpdated || ""} ${footer.copyright || ""}`.match(/\d{4}/) || [new Date().getFullYear()])[0]);

    return {
      name,
      contacts,
      contact,
      tagline,
      location: experience[0] ? experience[0].location : "",
      summary: data.summary.text,
      skills: data.skills.categories.map((c) => ({ title: c.title, items: c.items, list: c.items.split(/,\s*/) })),
      experience,
      projects: (data.projects || []).map((p, i) => ({ ...p, n: String(i + 1).padStart(2, "0"), short: p.url.replace(/^https?:\/\//, "") })),
      education: data.education && Object.keys(data.education).length ? data.education : null,
      achievements,
      highlights: data.highlights || [],
      keywords: String(data.keywords || "").split(/,\s*/).filter(Boolean),
      copyright: footer.copyright || "",
      lastUpdated: footer.lastUpdated || "",
      year,
    };
  }

  const helpers = { esc, icons, roman, splitColumns, logo, nav, bullets, marquee, ext };

  // ----- loading + mounting -----
  function ensureFonts(design) {
    if (!design.fonts || document.getElementById(`design-fonts-${design.id}`)) return;
    const link = document.createElement("link");
    link.id = `design-fonts-${design.id}`;
    link.rel = "stylesheet";
    link.href = `https://fonts.googleapis.com/css2?${design.fonts}&display=swap`;
    document.head.appendChild(link);
  }

  function loadRenderer(id) {
    if (renderers[id]) return Promise.resolve(renderers[id]);
    if (!pending[id]) {
      pending[id] = new Promise((resolve, reject) => {
        const script = document.createElement("script");
        script.src = `designs/${id}.js`;
        script.onload = () => (renderers[id] ? resolve(renderers[id]) : reject(new Error(`designs/${id}.js never registered`)));
        script.onerror = () => reject(new Error(`could not load designs/${id}.js`));
        document.head.appendChild(script);
      });
    }
    return pending[id];
  }

  // Stylesheets live inside the shadow root; wait for them so there's no unstyled flash.
  function stylesheet(href) {
    return new Promise((resolve) => {
      const link = document.createElement("link");
      link.rel = "stylesheet";
      link.href = href;
      link.onload = link.onerror = () => resolve(link);
      shadow.appendChild(link);
    });
  }

  function host() {
    let el = document.getElementById("design-root");
    if (!el) {
      el = document.createElement("div");
      el.id = "design-root";
      document.body.appendChild(el);
    }
    if (!shadow) {
      shadow = el.attachShadow({ mode: "open" });
      shadow.addEventListener("click", onShadowClick);
    }
    return el;
  }

  function onShadowClick(e) {
    const printer = e.target.closest("[data-action='print']");
    if (printer) return window.print();
    const anchor = e.target.closest("a[href^='#']");
    if (!anchor) return;
    e.preventDefault();
    const target = shadow.getElementById(anchor.getAttribute("href").slice(1));
    if (target) target.scrollIntoView({ behavior: "smooth", block: "start" });
  }

  async function mount(id) {
    const design = byId(id);
    host();
    if (id === DEFAULT_DESIGN || !resumeData) {
      if (id === DEFAULT_DESIGN) shadow.replaceChildren();
      return;
    }
    ensureFonts(design);
    try {
      const { render, options } = await loadRenderer(id);
      if (current !== id) return; // picked something else while this was loading
      shadow.replaceChildren();
      await Promise.all([stylesheet("designs/picker.css"), stylesheet("designs/base.css"), stylesheet(`designs/${id}.css`)]);
      if (current !== id) return;
      const frame = document.createElement("div");
      frame.className = "dz-frame";
      frame.innerHTML = `<div class="dz dz-${id}" id="top">${render(model(resumeData), helpers)}</div>`;
      const slot = frame.querySelector("[data-picker]");
      if (slot) slot.replaceWith(createPicker({ themed: true }));
      shadow.appendChild(frame);
      startMotion(frame.firstElementChild, options);
    } catch (error) {
      console.error(`[designs] ${error.message} — falling back to classic.`);
      select(DEFAULT_DESIGN, { persist: false });
    }
  }

  function select(id, { persist = true } = {}) {
    if (!byId(id)) id = DEFAULT_DESIGN;
    current = id;
    markDocument(id);
    if (persist) {
      try {
        localStorage.setItem(DESIGN_STORAGE_KEY, id);
      } catch {
        /* fine */
      }
      const url = new URL(window.location.href);
      if (id === DEFAULT_DESIGN) url.searchParams.delete(DESIGN_PARAM);
      else url.searchParams.set(DESIGN_PARAM, id);
      history.replaceState(null, "", url);
    }
    syncPicker();
    paintChrome(id);
    window.scrollTo(0, 0);
    return mount(id);
  }

  // ----- motion -----
  // Nothing moves until the loading screen is gone (otherwise every entrance plays
  // behind it), and nothing moves at all under prefers-reduced-motion. `dz--motion`
  // arms the hidden start states, `dz--live` fires the entrances, and `is-in` lands on
  // each `options.reveal` match as it scrolls into view.
  function startMotion(root, options = {}) {
    const calm = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (calm || !("IntersectionObserver" in window)) return;
    root.classList.add("dz--motion");

    const targets = options.reveal ? [...root.querySelectorAll(options.reveal)] : [];
    targets.forEach((el) => {
      el.setAttribute("data-reveal", "");
      // stagger siblings so a row of cards arrives as a ripple, not a slab
      const order = [...el.parentElement.children].filter((c) => targets.includes(c)).indexOf(el);
      el.style.setProperty("--reveal-delay", `${Math.min(order, 5) * 70}ms`);
    });

    const observer = new IntersectionObserver(
      (entries) =>
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          entry.target.classList.add("is-in");
          observer.unobserve(entry.target);
        }),
      { rootMargin: "0px 0px -8% 0px" }
    );

    const go = () => {
      const loader = document.querySelector(".loading-screen");
      if (loader && !loader.classList.contains("hidden")) return setTimeout(go, 100);
      if (!root.isConnected) return;
      root.classList.add("dz--live");
      targets.forEach((el) => observer.observe(el));
    };
    go();
  }

  // ----- print -----
  // A design prints on a single page, 1440px wide (the sheet it's drawn for) and as
  // tall as it runs, so nothing gets shrunk to fit A4 and nothing splits across pages.
  // That height only exists once it's laid out at sheet width, and the window may be
  // narrower, so beforeprint widens the frame to measure it, writes the @page rule, and
  // hands the width back. Motion comes off first: entrances and unrevealed blocks start
  // hidden, and paper should get the finished page. afterprint (which also fires on
  // cancel) puts all of it back. Classic is never touched.
  //
  // The measurement is a screen measurement, and screen and paper don't set text quite
  // alike: on-screen Linux Chrome snaps glyphs to whole pixels, print doesn't, and the
  // printed sheet ran 2–5px taller. A page cut 3px short prints a 3px second page. So
  // the page gets 1% headroom, the sheet fills the page area (the slack lands above the
  // footer), and anything still over is clipped rather than paginated (designs.css).
  //
  // Measuring is done a little narrower than the sheet, because Chrome's print dialog
  // keeps a small margin that page.pdf() doesn't: the printed sheet is then never wider
  // — and so never taller — than what was measured.
  const SHEET_WIDTH = 1440;
  const MEASURE_WIDTH = 1416;
  const HEADROOM = 1.01;
  let printing = null;

  function preparePrint() {
    const frame = shadow && shadow.querySelector(".dz-frame");
    if (current === DEFAULT_DESIGN || !frame || printing) return;
    const root = frame.firstElementChild;
    const motion = ["dz--motion", "dz--live"].filter((c) => root.classList.contains(c));
    root.classList.remove(...motion);
    frame.classList.add("dz-frame--print");

    // Measure at a fixed width, then hand the width back to the page: printing lays out
    // at whatever the page box gives (1440px, less any margin the dialog adds).
    frame.style.width = `${MEASURE_WIDTH}px`;
    const height = Math.ceil(root.getBoundingClientRect().height * HEADROOM);
    frame.style.width = "";
    const page = document.createElement("style");
    page.textContent = `@page { size: ${SHEET_WIDTH}px ${height}px; margin: 0; }`;
    document.head.appendChild(page);
    printing = { frame, root, motion, page };
  }

  function finishPrint() {
    if (!printing) return;
    const { frame, root, motion, page } = printing;
    page.remove();
    frame.style.removeProperty("width");
    frame.classList.remove("dz-frame--print");
    root.classList.add(...motion);
    printing = null;
  }

  window.addEventListener("beforeprint", preparePrint);
  window.addEventListener("afterprint", finishPrint);

  // ----- the picker -----
  // Lives in the top bar: beside the theme toggle on the classic page (emoji, like its
  // neighbours), and in each design's own nav, where the design's CSS dresses it.
  const pickers = new Set();
  const PICKER_ICON =
    '<svg viewBox="0 0 24 24" width="16" height="16" aria-hidden="true" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="7.5" height="7.5" rx="1.5"/><rect x="13.5" y="3" width="7.5" height="7.5" rx="1.5"/><rect x="3" y="13.5" width="7.5" height="7.5" rx="1.5"/><circle cx="17.25" cy="17.25" r="3.75"/></svg>';

  function createPicker({ themed }) {
    const picker = document.createElement("div");
    picker.className = "design-picker";
    picker.innerHTML = `
      <button type="button" class="design-toggle ${themed ? "dz-nav__btn" : ""}" aria-haspopup="menu" aria-expanded="false" aria-label="Change page design" title="Change design">
        ${themed ? `${PICKER_ICON}<span class="design-toggle__label">Design</span>` : '<div class="design-icon">🎨</div>'}
      </button>
      <div class="design-picker__menu" role="menu" aria-label="Page design" hidden>
        ${DESIGNS.map(
          (d) => `
          <button type="button" role="menuitemradio" class="design-picker__item" data-design="${d.id}">
            <span class="design-picker__swatch" style="background: linear-gradient(90deg, ${d.swatch[0]} 0 34%, ${d.swatch[1]} 34% 67%, ${d.swatch[2]} 67%)"></span>
            <span class="design-picker__name">${esc(d.name)}</span>
            <span class="design-picker__note">${esc(d.note)}</span>
          </button>`
        ).join("")}
      </div>`;

    const toggle = picker.querySelector(".design-toggle");
    const menu = picker.querySelector(".design-picker__menu");
    picker.setOpen = (open) => {
      menu.hidden = !open;
      toggle.setAttribute("aria-expanded", String(open));
      if (open) (menu.querySelector("[aria-checked='true']") || menu.firstElementChild).focus();
    };

    toggle.addEventListener("click", () => picker.setOpen(menu.hidden));
    menu.addEventListener("click", (e) => {
      const item = e.target.closest("[data-design]");
      if (!item) return;
      picker.setOpen(false);
      select(item.dataset.design);
    });
    menu.addEventListener("keydown", (e) => {
      if (e.key !== "ArrowDown" && e.key !== "ArrowUp") return;
      e.preventDefault();
      const items = [...menu.querySelectorAll("[data-design]")];
      const active = picker.getRootNode().activeElement;
      const next = items.indexOf(active) + (e.key === "ArrowDown" ? 1 : -1);
      items[(next + items.length) % items.length].focus();
    });

    pickers.add(picker);
    syncPicker();
    return picker;
  }

  function syncPicker() {
    pickers.forEach((picker) => {
      if (!picker.isConnected && picker.dataset.mounted) return pickers.delete(picker);
      picker.dataset.mounted = "1";
      picker.querySelectorAll("[data-design]").forEach((item) => {
        item.setAttribute("aria-checked", String(item.dataset.design === current));
      });
    });
  }

  // One pair of document listeners covers every picker. composedPath() because a
  // click inside the shadow root is retargeted to its host by the time it gets here.
  document.addEventListener("click", (e) => {
    const path = e.composedPath();
    pickers.forEach((picker) => !path.includes(picker) && picker.setOpen(false));
  });
  document.addEventListener("keydown", (e) => {
    if (e.key !== "Escape") return;
    pickers.forEach((picker) => {
      if (picker.querySelector(".design-picker__menu").hidden) return;
      picker.setOpen(false);
      picker.querySelector(".design-toggle").focus();
    });
  });

  // script.js fires this once the JSON is loaded (and after the ?email= override).
  document.addEventListener("resume:data", (e) => {
    resumeData = e.detail;
    mount(current);
  });

  document.addEventListener("DOMContentLoaded", () => {
    host();
    paintChrome(current);
    const controls = document.querySelector(".nav-controls");
    if (controls) controls.prepend(createPicker({ themed: false }));
  });

  window.ResumeDesigns = {
    define: (id, render, options = {}) => (renderers[id] = { render, options }),
    select,
    list: () => DESIGNS.map((d) => d.id),
  };
})();
