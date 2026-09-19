// Riso poster — two inks (vermilion + ultramarine) on cream, overprinted where they meet.
ResumeDesigns.define("riso", (d, h) => {
  const { esc, icons, ext } = h;
  const words = [d.name.first, d.name.middle, d.name.last].filter(Boolean);
  const dot = '<i class="dot"></i>';

  const job = (j, i) => `
    ${i ? '<hr class="rule" />' : ""}
    <article class="job">
      <div class="job__when">
        <span class="pill">${esc(j.period)}</span>
        <span class="job__where">${esc(j.location)}</span>
      </div>
      <div class="job__body">
        <h3>${esc(j.company)}</h3>
        ${j.single ? `<p class="kicker">${esc(j.title)}</p>` : ""}
        ${j.positions
          .map(
            (p) => `
          ${p.title ? `<div class="role"><span class="kicker">${esc(p.title)}</span><span>${esc(p.period)}</span></div>` : ""}
          ${h.bullets(p.bullets, dot)}`
          )
          .join("")}
      </div>
    </article>`;

  return `
    ${h.nav()}

    <header class="hero">
      <div class="hero__name">
        <h1>${words.map((w) => `<span>${esc(w)}</span>`).join("")}</h1>
        <i class="shape shape--circle"></i>
        <i class="shape shape--half"></i>
        <p class="kicker">${esc([...d.tagline, d.location].filter(Boolean).join(" · "))}</p>
      </div>
      <div class="hero__side">
        <div class="block block--blue">
          <h2>In short</h2>
          <p>${esc(d.summary)}</p>
        </div>
        <div class="contacts">
          ${d.contacts
            .map((c) =>
              /^https?:/.test(c.url)
                ? `<a href="${esc(c.url)}" ${ext}>${esc(c.text)}${icons.arrow(15)}</a>`
                : `<a class="wide" href="${esc(c.url)}">${esc(c.text)}</a>`
            )
            .join("")}
        </div>
      </div>
    </header>

    ${h.marquee(d.keywords.map(esc), { separator: icons.spark(26), cls: "ticker dz-bleed" })}

    <main class="main">
      <section id="experience" class="panel">
        <h2>Experience</h2>
        ${d.experience.map(job).join("")}
      </section>

      <div class="side">
        <section id="skills" class="block block--blue">
          <h2>Skills</h2>
          ${d.skills.map((s) => `<div><p class="kicker">${esc(s.title)}</p><p>${esc(s.items)}</p></div>`).join("")}
        </section>

        ${
          d.education
            ? `<section id="education" class="block block--accent">
          <h2>Education</h2>
          <p class="school">${esc(d.education.institution)}</p>
          <div class="grade">
            <p>${esc(d.education.degree)}<br />${esc(d.education.period.replace(" - ", " – "))} · ${esc(d.education.location)}</p>
            <p class="gpa"><b>${esc(d.education.gpa.split("/")[0])}</b><span class="kicker">/${esc(d.education.gpa.split("/")[1] || "")} GPA</span></p>
          </div>
        </section>`
            : ""
        }

        <section id="achievements" class="panel">
          <h2>Achievements</h2>
          ${d.achievements.map((a) => `<div><p class="strong">${esc(a.title)}</p><p>${esc(a.description)}</p></div>`).join("")}
        </section>

        <div class="ornament" aria-hidden="true"><i></i><i></i><i></i></div>
      </div>
    </main>

    <section id="projects" class="projects">
      <h2>Projects</h2>
      <div class="tiles">
        ${d.projects
          .map(
            (p) => `
          <a class="tile" href="${esc(p.url)}" ${ext}>
            <span class="tile__top"><b>${p.n}</b>${icons.arrow(22)}</span>
            <span class="tile__name">${esc(p.name)}</span>
            <span>${esc(p.description)}</span>
          </a>`
          )
          .join("")}
      </div>
    </section>

    <footer class="foot dz-bleed">
      <span>${esc(d.copyright)}</span>
      <i aria-hidden="true"></i>
      <span>Last updated ${esc(d.lastUpdated)}</span>
    </footer>`;
}, { reveal: ".hero__side > *, .job, .side > *, .tile" });
