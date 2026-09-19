// Almanac — an 18th-century title page. Jobs are chapters, projects an appendix,
// and the copy keeps a straight face throughout.
ResumeDesigns.define("almanac", (d, h) => {
  const { esc, ext } = h;
  const [colA, colB] = h.splitColumns(d.experience, 2);
  const chapter = new Map(d.experience.map((j, i) => [j, h.roman(i + 1)]));
  const leader = '<i class="leader" aria-hidden="true"></i>';
  const sc = (s) => `<span class="sc">${esc(s)}</span>`;
  const { email, phone } = d.contact;
  const links = d.contacts.filter((c) => /^https?:/.test(c.url));

  const job = (j) => `
    <article class="chapter">
      <div class="chapter__head">
        <h3><span class="red">${chapter.get(j)}.</span> ${esc(j.company)}</h3>${leader}<span class="ital">${esc(j.period)}</span>
      </div>
      <p class="sc">${esc(j.single ? `${j.title} — ${j.location}` : j.location)}</p>
      ${j.positions
        .map(
          (p) => `
        ${p.title ? `<p class="role"><em>${esc(p.title)}</em><span class="ital">${esc(p.period)}</span></p>` : ""}
        ${h.bullets(p.bullets, '<span class="red">¶</span>')}`
        )
        .join("")}
    </article>`;

  const education = d.education
    ? `<section id="education" class="plate">
        <p class="sc red">Of his Education</p>
        <p class="plate__school">${esc(d.education.institution)}</p>
        <p>${esc(d.education.degree)}, <em>with a Grade of</em> ${esc(d.education.gpa.replace("/", " in "))}</p>
        <p class="ital">${esc(d.education.period.replace(" - ", " – "))} · ${esc(d.education.location)}</p>
      </section>`
    : "";

  return `
    <div class="frame">
      ${h.nav({ experience: "Employments", achievements: "Honours", projects: "Appendix" }, "To the Press")}

      <header class="title-page">
        <section id="skills" class="wing">
          <h2><em>A</em> TABLE <em>of Skills</em></h2>
          ${d.skills.map((s) => `<div><p class="sc red">${esc(s.title)}</p><p>${esc(s.items)}</p></div>`).join("")}
        </section>

        <div class="title">
          <p class="sc title__the">The</p>
          <p class="title__cv">Curriculum Vitæ</p>
          <p class="ital">of</p>
          <h1>
            <span class="title__first">${esc(d.name.first)}</span>
            ${d.name.middle ? `<span class="title__middle">${esc(d.name.middle)}</span>` : ""}
            <span class="title__last">${esc(d.name.last)},</span>
          </h1>
          ${d.tagline[0] ? `<p class="sc title__role">${esc(d.tagline[0])};</p>` : ""}
          <p class="title__sub">Being a True and Faithful Account of the Author’s several Employments, Works, and sundry Honours; with Particulars of Labours abolished and Systems kept standing.</p>
          <svg class="title__ornament" viewBox="0 0 320 24" width="320" height="24" aria-hidden="true"><g fill="none" stroke="currentColor" stroke-width="1.5"><line x1="0" y1="12" x2="128" y2="12"/><line x1="192" y1="12" x2="320" y2="12"/><path d="M160 2 L172 12 L160 22 L148 12 Z"/></g><circle class="fill-red" cx="138" cy="12" r="3"/><circle class="fill-red" cx="182" cy="12" r="3"/><circle cx="160" cy="12" r="3.5" fill="currentColor"/></svg>
          <p class="title__imprint">${sc(`${d.location}:`)} <em>Printed for the Author, and to be had</em>${
            email ? ` <em>by Post at</em> <a href="${esc(email.url)}">${esc(email.text)}</a>` : ""
          }${phone ? `${email ? "," : ""} <em>or by Telephone at</em> <a href="${esc(phone.url)}">${esc(phone.text)}</a>` : ""}. ${sc(`${h.roman(d.year)}.`)}</p>
          <p class="title__links sc">${links.map((c) => `<a href="${esc(c.url)}" ${ext}>${esc(c.text)}</a>`).join("")}</p>
        </div>

        <section id="achievements" class="wing">
          <h2><em>Sundry</em> HONOURS</h2>
          ${d.achievements
            .map(
              (a) => `<div>
              <p class="wing__row"><span>${esc(a.title)}</span>${leader}<span class="sc red">${esc(a.year)}</span></p>
              <p class="ital small">${esc(a.note)}</p>
            </div>`
            )
            .join("")}
        </section>
      </header>

      <p class="reader"><span class="sc red">To the Reader.</span> ${esc(d.summary)}</p>

      <h2 id="experience" class="heading"><em>Of the several</em> EMPLOYMENTS <em>of the Author</em></h2>

      <div class="chapters">
        <div class="chapters__col">${colA.map(job).join("")}</div>
        <div class="chapters__col">${colB.map(job).join("")}${education}</div>
      </div>

      <section id="projects" class="appendix">
        <h2 class="heading"><em>An</em> APPENDIX <em>of Works, undertaken for Amusement</em></h2>
        <div class="appendix__grid">
          ${d.projects
            .map(
              (p, i) => `
            <a href="${esc(p.url)}" ${ext}>
              <span class="appendix__head"><span class="appendix__name"><span class="red">${h.roman(i + 1)}.</span> ${esc(p.name)}</span>${leader}<span class="ital">${esc(p.short)}</span></span>
              <span>${esc(p.description)}</span>
            </a>`
            )
            .join("")}
        </div>
      </section>

      <footer class="foot sc">
        <span>${esc(d.copyright)}</span>
        <span class="foot__finis">FINIS.</span>
        <span>Last corrected ${esc(d.lastUpdated)}</span>
      </footer>
    </div>`;
}, { reveal: ".wing > div, .reader, .heading, .chapter, .plate, .appendix__grid a" });
