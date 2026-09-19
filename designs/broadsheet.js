// Broadsheet — the résumé as a newspaper front page. Jobs are stories: the current
// one leads, the next gets the second slot, the rest run as briefs.
ResumeDesigns.define("broadsheet", (d, h) => {
  const { esc, ext } = h;
  const [lead, second, ...briefs] = d.experience;
  const headline = (j) => esc(j.headline || `${j.title}, ${j.company}`);
  const dateline = (j) => `<p class="kicker">${esc([j.company, j.location, j.period].join(" · "))}</p>`;
  const paras = (items) => items.map((t) => `<p>${esc(t)}</p>`).join("");
  const quote = d.highlights.find((x) => x.quote) || d.highlights[0];

  // Single-role jobs run as two balanced text columns; multi-role jobs give each role a column.
  const story = (j, cls) =>
    j
      ? `<article class="story ${cls}">
          ${dateline(j)}
          <h2>${headline(j)}</h2>
          <p class="byline">${j.deck ? esc(j.deck) : `By ${esc(d.name.full)}, ${esc(j.title)}`}</p>
          ${
            j.single
              ? `<div class="story__flow">${paras(j.positions[0].bullets)}</div>`
              : `<div class="story__roles">${j.positions
                  .map((p) => `<div><p class="role"><b>${esc(p.title)}</b><span class="kicker">${esc(p.period)}</span></p>${paras(p.bullets)}</div>`)
                  .join("")}</div>`
          }
          ${
            cls === "story--lead" && quote
              ? `<blockquote>${quote.quote ? `“${esc(quote.quote)}”` : `${esc(quote.value)} — ${esc(quote.label)}`}</blockquote>`
              : ""
          }
        </article>`
      : "";

  return `
    <div class="topbar">
      ${h.nav({ skills: "The stack", achievements: "Honours", projects: "Classifieds" }, "Print edition")}
    </div>

    <header class="masthead"><h1>${esc(d.name.full)}</h1></header>

    <div class="dateline">
      <span class="kicker">${esc([d.location, d.lastUpdated].filter(Boolean).join(" · "))}</span>
      <div class="dateline__links">
        ${d.contacts.map((c) => `<a href="${esc(c.url)}" ${/^https?:/.test(c.url) ? ext : ""}>${esc(c.text)}</a>`).join("")}
      </div>
      <span class="kicker">Late edition · <span class="red">Price: one interview</span></span>
    </div>

    <div class="wire">
      <span class="wire__tag">Stop press</span>
      ${h.marquee(
        [
          ...d.highlights.map((x) => `<b>${esc(x.value)}</b> ${esc(x.label)}`),
          ...d.achievements.map((a) => `<b>${esc(a.title)}</b> ${esc(a.description)}`),
        ],
        { separator: "<i></i>", seconds: 60 }
      )}
    </div>

    <div id="experience" class="row row--lead">
      ${story(lead, "story--lead")}
      <div class="sidebar">
        <section>
          <h3 class="label">In brief</h3>
          <p>${esc(d.summary)}</p>
        </section>
        <section id="skills" class="box">
          <h3 class="box__title">The stack</h3>
          ${d.skills.map((s) => `<div><p class="kicker red">${esc(s.title)}</p><p>${esc(s.items)}</p></div>`).join("")}
        </section>
      </div>
    </div>

    <div class="row row--second">
      ${story(second, "story--second")}
      <div class="briefs">
        ${briefs
          .map(
            (j) => `
          <article class="brief">
            ${dateline(j)}
            <h3>${headline(j)}</h3>
            <p class="byline">${esc(j.title)}</p>
            ${j.positions.map((p) => paras(p.bullets)).join("")}
          </article>`
          )
          .join("")}
      </div>
      <div class="notices">
        <section id="achievements">
          <h3 class="label">Honours</h3>
          ${d.achievements.map((a) => `<div><p><b>${esc(a.title)}</b></p><p class="byline">${esc(a.description)}</p></div>`).join("")}
        </section>
        ${
          d.education
            ? `<section id="education" class="box box--notice">
          <p class="kicker red">Education notice</p>
          <p class="box__school">${esc(d.education.institution)}</p>
          <p>${esc(d.education.degree)} · GPA ${esc(d.education.gpa)}<br />${esc(d.education.period.replace(" - ", " – "))}</p>
        </section>`
            : ""
        }
      </div>
    </div>

    <section id="projects" class="classifieds">
      <h2 class="classifieds__title">Classifieds <span>side projects, enquire within</span></h2>
      <div class="classifieds__grid">
        ${d.projects
          .map(
            (p) => `
          <a class="ad" href="${esc(p.url)}" ${ext}>
            <span class="kicker">No. ${p.n}</span>
            <span class="ad__name">${esc(p.name)}</span>
            <span>${esc(p.description)}</span>
            <span class="ad__link">${esc(p.short)} →</span>
          </a>`
          )
          .join("")}
      </div>
    </section>

    <footer class="foot">
      <span>${esc(d.copyright)}</span>
      <span class="foot__end">— 30 —</span>
      <span>Last updated ${esc(d.lastUpdated)}</span>
    </footer>`;
}, { reveal: ".story, .sidebar > section, .brief, .notices > section, .ad" });
