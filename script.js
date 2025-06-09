// Load resume data based on the query param
const resumeToLoad = new URLSearchParams(window.location.search).get("resume");

function getResumeJson(name) {
  if (["fullstack", "frontend"].includes(resumeToLoad)) return resumeToLoad;
  return "fullstack";
}

async function loadResumeData() {
  try {
    const response = await fetch(`${getResumeJson(resumeToLoad)}.json`);
    const data = await response.json();
    populateResume(data);
  } catch (error) {
    console.error("Error loading resume data:", error);
  }
}

function populateResume(data) {
  // Personal Info
  document.querySelector(".name").textContent = data.personal.name;

  // Contact Info
  const contactDiv = document.querySelector(".contact");
  Object.values(data.personal.contact).forEach((contact) => {
    const link = document.createElement("a");
    link.href = contact.url;
    link.target = "_blank";
    link.rel = "noopener noreferrer";
    link.textContent = contact.text;
    contactDiv.appendChild(link);
  });

  // Summary
  document.querySelector("#professional-summary p").textContent =
    data.summary.text;

  // Skills
  const skillsGrid = document.querySelector(".skills-grid");
  data.skills.categories.forEach((category) => {
    const skillItem = document.createElement("div");
    skillItem.className = "skills-item";
    skillItem.innerHTML = `<strong>${category.title}:</strong> ${category.items}`;
    skillsGrid.appendChild(skillItem);
  });

  // Experience
  const experienceContainer = document.querySelector(".experience-container");
  data.experience.forEach((exp) => {
    const article = document.createElement("article");
    article.innerHTML = `
            <h3>${exp.company}</h3>
            <div class="job-header">
              <p class="job-title">${exp.title} — ${exp.location}</p>
              <p class="job-date">${exp.period}</p>
            </div>
            <ul>
              ${exp.achievements
                .map((achievement) => `<li>${achievement}</li>`)
                .join("")}
            </ul>
          `;
    experienceContainer.appendChild(article);
  });

  // Projects
  const projectsList = document.querySelector(".projects-list");
  data.projects.forEach((project) => {
    const li = document.createElement("li");
    li.innerHTML = `
            <strong>${project.name}</strong> — ${project.description}
            <a href="${project.url}" target="_blank" rel="noopener noreferrer">GitHub</a>
          `;
    projectsList.appendChild(li);
  });

  // Education
  const education = data.education;
  document.querySelector("#education p").innerHTML = `
          <strong>${education.institution}</strong> —
          <em>${education.degree}</em> (CGPA ${education.gpa})<br />
          ${education.period} • ${education.location}
        `;

  // Achievements
  const achievementsList = document.querySelector(".achievements-list");
  data.achievements.forEach((achievement) => {
    const li = document.createElement("li");
    li.innerHTML = `
            <strong>${achievement.title}</strong> — ${achievement.description}
          `;
    achievementsList.appendChild(li);
  });

  // Keywords
  document.querySelector(
    "#keywords em"
  ).textContent = `Keywords: ${data.keywords}`;

  // Footer
  document.querySelector(
    "footer p"
  ).textContent = `${data.footer.copyright} • Last Updated: ${data.footer.lastUpdated}`;
}

// Load resume data when the page loads
document.addEventListener("DOMContentLoaded", loadResumeData);

// Dark mode toggle
const themeToggle = document.querySelector(".theme-toggle");
const themeIcon = document.querySelector(".theme-icon");

// Check for saved theme preference or prefer-color-scheme
const prefersDark =
  window.matchMedia &&
  window.matchMedia("(prefers-color-scheme: dark)").matches;
const savedTheme = localStorage.getItem("theme");

// Set initial theme
if (savedTheme === "dark" || (!savedTheme && prefersDark)) {
  document.documentElement.setAttribute("data-theme", "dark");
  themeIcon.textContent = "☀️";
}

// Theme toggle functionality
themeToggle.addEventListener("click", () => {
  const currentTheme = document.documentElement.getAttribute("data-theme");
  const newTheme = currentTheme === "dark" ? "light" : "dark";

  document.documentElement.setAttribute("data-theme", newTheme);
  localStorage.setItem("theme", newTheme);

  // Update icon
  themeIcon.textContent = newTheme === "dark" ? "☀️" : "🌙";
});

// Print button functionality
const printButton = document.querySelector(".print-button");
printButton.addEventListener("click", () => {
  window.print();
});

// Mobile menu toggle
const mobileMenuToggle = document.querySelector(".mobile-menu-toggle");
const navMenu = document.querySelector(".nav-menu");

mobileMenuToggle.addEventListener("click", () => {
  navMenu.classList.toggle("active");
  mobileMenuToggle.textContent = navMenu.classList.contains("active")
    ? "✕"
    : "☰";
});

// Close mobile menu when clicking on a nav item
document.querySelectorAll(".nav-item a").forEach((item) => {
  item.addEventListener("click", () => {
    navMenu.classList.remove("active");
    mobileMenuToggle.textContent = "☰";
  });
});

// Back to top button visibility
const backToTopButton = document.querySelector(".back-to-top");

window.addEventListener("scroll", () => {
  if (window.scrollY > 300) {
    backToTopButton.classList.add("visible");
  } else {
    backToTopButton.classList.remove("visible");
  }
});

// Section reveal on scroll
const revealSections = () => {
  const sections = document.querySelectorAll("section");
  const windowHeight = window.innerHeight;

  sections.forEach((section) => {
    const sectionTop = section.getBoundingClientRect().top;
    if (sectionTop < windowHeight - 100) {
      section.classList.add("visible");
    }
  });
};

// Run on load
revealSections();

// Run on scroll
window.addEventListener("scroll", revealSections);

// Smooth scrolling for navigation links
document.querySelectorAll('a[href^="#"]').forEach((anchor) => {
  anchor.addEventListener("click", function (e) {
    e.preventDefault();

    const targetId = this.getAttribute("href");
    const targetElement = document.querySelector(targetId);

    if (targetElement) {
      // Offset for fixed header
      const headerOffset = 70;
      const elementPosition = targetElement.getBoundingClientRect().top;
      const offsetPosition =
        elementPosition + window.pageYOffset - headerOffset;

      window.scrollTo({
        top: offsetPosition,
        behavior: "smooth",
      });
    }
  });
});

// Nav logo SVG animation
function animateLogo(delay, duration, timingFunction, repeat) {
  document.querySelectorAll(".nav-logo-svg path").forEach((path, i) => {
    const L = path.getTotalLength();
    path.style.strokeDasharray = L;
    path.style.strokeDashoffset = L;
    path.getBoundingClientRect(); // force layout

    path.animate([{ strokeDashoffset: L }, { strokeDashoffset: 0 }], {
      duration: duration * 1000,
      delay: i * delay * 1000,
      easing: timingFunction,
      iterations: repeat ? Infinity : 1,
      fill: "forwards",
    });
  });
}

document.addEventListener("DOMContentLoaded", () => {
  animateLogo(0.1, 2.2, "ease", false);
});
