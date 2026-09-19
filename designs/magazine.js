// Magazine — Bodoni masthead, three ruled columns, one highlighter.
ResumeDesigns.define("magazine", (d, h) => {
  const { esc, icons, ext } = h;
  const [colA, colB] = h.splitColumns(d.experience, 2);
  const mark = (s) => `<span class="mark">${esc(s)}</span>`;

  const job = (j) => `
    <article class="job">
      <p class="kicker">${esc(j.period)} · ${esc(j.location)}</p>
      <h3>${esc(j.company)}</h3>
      ${j.single ? `<p class="role">${esc(j.title)}</p>` : ""}
      ${j.positions
        .map(
          (p) => `
        ${p.title ? `<div class="role role--split"><span>${esc(p.title)}</span><span class="kicker">${esc(p.period)}</span></div>` : ""}
        ${h.bullets(p.bullets, "<span>—</span>")}`
        )
        .join("")}
    </article>`;

  const pull = (x, big) =>
    x
      ? `<figure class="pull ${big ? "pull--big" : ""}">
          <div class="pull__value">${mark(x.value)}</div>
          <figcaption>${esc(x.label)}${x.source ? ` — ${esc(x.source)}` : ""}</figcaption>
        </figure>`
      : "";

  // Pull quotes close out the experience columns; the long column gets the small one.
  const [h0, h1] = d.highlights;

  return `
    <div class="topbar">
      ${h.nav()}
    </div>

    <header class="masthead">
      <h1><span>${esc([d.name.first, d.name.middle].filter(Boolean).join(" "))}</span><em>${esc(d.name.last)}</em></h1>
      <p class="standfirst">${esc(d.summary)}</p>
    </header>

    <div class="strip">
      <span class="kicker">${esc([...d.tagline.slice(0, 2), d.location].filter(Boolean).join(" — "))}</span>
      <div class="strip__links">
        ${d.contacts.map((c) => `<a href="${esc(c.url)}" ${/^https?:/.test(c.url) ? ext : ""}>${esc(c.text)}</a>`).join("")}
      </div>
    </div>

    <main class="spread">
      <div class="rail">
        <section id="skills">
          <h2>${mark("Skills")}</h2>
          ${d.skills.map((s) => `<div><p class="kicker">${esc(s.title)}</p><p>${esc(s.items)}</p></div>`).join("")}
        </section>
        ${
          d.education
            ? `<section id="education">
          <h2>${mark("Education")}</h2>
          <p class="school">${esc(d.education.institution)}</p>
          <p>${esc(d.education.degree)}<br />GPA ${esc(d.education.gpa)}</p>
          <p class="kicker">${esc(d.education.period.replace(" - ", " – "))} · ${esc(d.education.location)}</p>
        </section>`
            : ""
        }
        <section id="achievements">
          <h2>${mark("Achievements")}</h2>
          ${d.achievements.map((a) => `<div><p class="strong">${esc(a.title)}</p><p class="aside">${esc(a.description)}</p></div>`).join("")}
        </section>
      </div>

      <section id="experience" class="col">
        <h2>${mark("Experience")}</h2>
        ${colA.map(job).join("")}
        ${pull(h1, false)}
      </section>

      <section class="col col--cont" aria-label="Experience, continued">
        ${colB.map(job).join("")}
        ${pull(h0, true)}
      </section>
    </main>

    <section id="projects" class="projects">
      <h2>${mark("Projects")}</h2>
      <div class="projects__grid">
        ${d.projects
          .map(
            (p) => `
          <a href="${esc(p.url)}" ${ext}>
            <span class="projects__top"><em>${p.n}</em>${icons.arrow(18)}</span>
            <span class="projects__name">${esc(p.name)}</span>
            <span>${esc(p.description)}</span>
          </a>`
          )
          .join("")}
      </div>
    </section>

    ${h.marquee(d.keywords.map(esc), { separator: h.icons.spark(14), cls: "wire dz-bleed", seconds: d.keywords.length * 3 })}

    <footer class="foot dz-bleed">
      <span>${esc(d.copyright)}</span>
      ${h.logo("2.2rem")}
      <span>Last updated ${esc(d.lastUpdated)}</span>
    </footer>`;
}, { reveal: "h2, .rail section > div, .rail section > p, .job, .pull, .projects__grid a" });
