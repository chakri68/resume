// Broadside — a wood-type letterpress show poster. Every line a different face,
// jobs billed as acts.
ResumeDesigns.define("broadside", (d, h) => {
  const { esc, icons, ext } = h;
  const star = icons.star(11);
  const cols = h.splitColumns(d.experience, 3);
  const act = new Map(d.experience.map((j, i) => [j, i]));
  const now = d.experience[0];
  const billing = now ? `${now.current ? "Now appearing at" : "Lately of"} ${now.company}, ${now.location}` : "";

  const job = (j) => `
    <article class="act act--${act.get(j) % 4}">
      <div class="act__head">
        <p class="cond red">Act ${h.roman(act.get(j) + 1)} · ${esc(j.period)}</p>
        <h3>${esc(j.company)}</h3>
        <p class="ital">${esc(j.single ? `${j.title} — ${j.location}` : j.location)}</p>
      </div>
      ${j.positions
        .map(
          (p) => `
        ${p.title ? `<p class="role"><b>${esc(p.title)}</b><span class="ital">${esc(p.period)}</span></p>` : ""}
        ${h.bullets(p.bullets, star)}`
        )
        .join("")}
    </article>`;

  const education = d.education
    ? `<section id="education" class="ticket"><div>
        <p class="cond red">Schooled at</p>
        <p class="ticket__school">${esc(d.education.institution)}</p>
        <p>${esc(d.education.degree)} · <b>GPA ${esc(d.education.gpa)}</b></p>
        <p class="ital">${esc(d.education.period.replace(" - ", " – "))} · ${esc(d.education.location)}</p>
      </div></section>`
    : "";

  const honours = `
    <section id="achievements" class="honours">
      <h2>Honours</h2>
      ${d.achievements.map((a) => `<div><p><b>${esc(a.title)}</b></p><p class="ital">${esc(a.description)}</p></div>`).join("")}
    </section>`;

  const rules = '<i class="rules" aria-hidden="true"></i>';
  const line = '<i class="line" aria-hidden="true"></i>';

  return `
    <div class="frame"><div class="frame__inner">
      ${h.nav({ experience: "The programme", achievements: "Honours", projects: "Also on the bill" }, "Pull a print")}

      <header class="bill">
        <p class="cond bill__top">${icons.star(22)}<span>${esc(billing)}</span>${icons.star(22)}</p>
        <h1>
          <span class="bill__first">${esc(d.name.first)}</span>
          ${d.name.middle ? `<span class="bill__middle">${rules}<span>${esc(d.name.middle)}</span>${rules}</span>` : ""}
          <span class="bill__last">${esc(d.name.last)}</span>
        </h1>
      </header>

      ${h.marquee([...d.tagline, ...d.tagline, ...d.tagline].map(esc), { separator: icons.star(20), cls: "band cond", seconds: 36 })}

      <p class="summary">${esc(d.summary)}</p>

      <div class="contacts">
        ${d.contacts.map((c) => `<a href="${esc(c.url)}" ${/^https?:/.test(c.url) ? ext : ""}>${esc(c.text)}</a>`).join("")}
      </div>

      <h2 id="experience" class="title">${line}<span>The programme</span>${line}</h2>

      <div class="acts">
        <div class="acts__col">${cols[0].map(job).join("")}${education}</div>
        <div class="acts__col">${cols[1].map(job).join("")}</div>
        <div class="acts__col">${cols[2].map(job).join("")}${honours}</div>
      </div>

      <section id="skills" class="company">
        <h2 class="cond">With the full company of</h2>
        <div class="company__grid">
          ${d.skills.map((s) => `<div><p class="company__name">${esc(s.title)}</p><p>${esc(s.items)}</p></div>`).join("")}
        </div>
      </section>

      <section id="projects">
        <h2 class="title title--slab">${line}<span>Also on the bill</span>${line}</h2>
        <div class="bills">
          ${d.projects
            .map(
              (p) => `
            <a class="bills__item" href="${esc(p.url)}" ${ext}>
              <span class="cond red">No. ${p.n}</span>
              <span class="bills__name">${esc(p.name)}</span>
              <span>${esc(p.description)}</span>
            </a>`
            )
            .join("")}
        </div>
      </section>

      <footer class="foot">
        <span>${esc(d.copyright)}</span>
        ${icons.star(22)}
        <span>Printed ${esc(d.lastUpdated)}</span>
      </footer>
    </div></div>`;
}, { reveal: ".summary, .act, .ticket, .honours, .company__grid > div, .bills__item" });
