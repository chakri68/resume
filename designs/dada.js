// Dada — type, misbehaving. The name is broken across three treatments, shapes
// overprint it, and blocks sit a degree or two off true.
ResumeDesigns.define("dada", (d, h) => {
  const { esc, icons, ext } = h;
  const [lead, second, ...rest] = d.experience;
  const diamond = '<i class="diamond"></i>';
  const big = (lead && d.highlights.find((x) => x.source === lead.company && x.value.length <= 6)) || null;

  const head = (j, size) => `
    <div class="job__head">
      <p class="type">${esc(j.period)} / ${esc(j.location)}</p>
      <h3 class="${size}">${esc(j.company)}</h3>
      ${j.single ? `<p class="type red">${esc(j.title)}</p>` : ""}
    </div>`;

  const roles = (j, asParas) =>
    j.positions
      .map(
        (p) => `
      <div class="role">
        ${p.title ? `<p class="role__title"><b>${esc(p.title)}</b><span class="type red">${esc(p.period)}</span></p>` : ""}
        ${asParas ? p.bullets.map((t) => `<p>${esc(t)}</p>`).join("") : h.bullets(p.bullets, diamond)}
      </div>`
      )
      .join("");

  return `
    ${h.nav()}

    <header class="hero">
      <p class="type hero__label">${esc([...d.tagline.slice(0, 2), d.location].filter(Boolean).join(" / "))}</p>
      <i class="hero__rule" aria-hidden="true"></i>
      <h1>
        <span class="hero__first">${esc(d.name.first)}</span>
        ${d.name.middle ? `<span class="hero__middle">${esc(d.name.middle)}</span>` : ""}
        <span class="hero__last">${esc(d.name.last)}</span>
      </h1>
      <i class="hero__circle" aria-hidden="true"></i>
      <i class="hero__triangle" aria-hidden="true"></i>
      <i class="hero__bar" aria-hidden="true"></i>
      <p class="hero__side" aria-hidden="true">Résumé ${d.year}</p>
    </header>

    <div class="intro">
      <p class="intro__summary">${esc(d.summary)}</p>
      <div class="intro__contacts type">
        ${d.contacts
          .map((c) => `<a href="${esc(c.url)}" ${/^https?:/.test(c.url) ? ext : ""}><span>${esc(c.key)}</span><span>${esc(c.handle)}</span></a>`)
          .join("")}
      </div>
    </div>

    ${h.marquee(d.keywords.map(esc), { separator: '<i class="diamond"></i>', cls: "tape dz-bleed dz-marquee--reverse", seconds: d.keywords.length * 2 })}

    <section id="experience" class="exp">
      <h2 class="exp__label">Experience</h2>
      ${
        lead
          ? `<article class="job">
        ${head(lead, "ital")}
        ${roles(lead, false)}
        ${big ? `<p class="shout" aria-hidden="true"><b>${esc(big.value)}</b><span class="type">${esc(big.label)}</span></p>` : ""}
      </article>`
          : ""
      }
      ${
        second
          ? `<article class="job job--boxed">
        <div class="job__head job__head--wide">
          <h3 class="slab">${esc(second.company)}</h3>
          <p class="type">${esc(second.period)}<br />${esc(second.location)}</p>
        </div>
        ${second.single ? `<p class="type red">${esc(second.title)}</p>` : ""}
        <div class="job__roles">${roles(second, true)}</div>
      </article>`
          : ""
      }
    </section>

    <div class="lower">
      ${rest.map((j) => `<article class="job job--small">${head(j, "ital ital--small")}${roles(j, true)}</article>`).join("")}

      <section id="skills" class="skills">
        <h2>Skills</h2>
        ${d.skills.map((s) => `<div><p class="type">${esc(s.title)}</p><p>${esc(s.items)}</p></div>`).join("")}
      </section>

      ${
        d.education
          ? `<section id="education" class="edu">
        <h2>Edu—<br />cation</h2>
        <div>
          <p class="edu__school">${esc(d.education.institution)}</p>
          <p>${esc(d.education.degree)}</p>
          <p class="type">${esc(d.education.period.replace(" - ", " – "))} / ${esc(d.education.location)}</p>
        </div>
        <p class="edu__gpa"><b>${esc(d.education.gpa.split("/")[0])}</b><span class="type">GPA, of ${esc(d.education.gpa.split("/")[1] || "")}</span></p>
      </section>`
          : ""
      }
    </div>

    <section id="achievements" class="ach">
      <h2 class="ital">Achievements</h2>
      <div class="ach__grid">
        ${d.achievements.map((a) => `<div><p><b>${esc(a.title)}</b></p><p class="type">${esc(a.description)}</p></div>`).join("")}
      </div>
    </section>

    <section id="projects" class="projects">
      <h2><span>Projects</span><i aria-hidden="true"></i></h2>
      <div class="projects__grid">
        ${d.projects
          .map(
            (p) => `
          <a href="${esc(p.url)}" ${ext}>
            <span class="type projects__top"><span>No. ${p.n}</span>${icons.arrow(18)}</span>
            <span class="projects__name">${esc(p.name)}</span>
            <span>${esc(p.description)}</span>
          </a>`
          )
          .join("")}
      </div>
    </section>

    <footer class="foot type">
      <span>${esc(d.copyright)}</span>
      <span>Last updated ${esc(d.lastUpdated)}</span>
    </footer>`;
}, { reveal: ".intro > *, .job, .shout, .skills, .edu, .ach__grid > div, .projects__grid a" });
