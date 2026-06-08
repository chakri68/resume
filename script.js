const logoAnimatedComponent = document.querySelector("logo-animated");

// CONSTANTS
const ANIMATION_DURATION = parseFloat(
  logoAnimatedComponent.getAttribute("duration")
); // Duration in seconds

// Load resume data based on the query param
const resumeToLoad = new URLSearchParams(window.location.search).get("resume");
const emailToUse = new URLSearchParams(window.location.search).get("email");

const DEFAULT_RESUME = "backend";

// Debug tool: type this password anywhere on the page to open the JSON editor.
// Change this to whatever you like.
const DEBUG_PASSWORD = "jsondebug";
// Key under which debug-injected JSON is stashed for the current tab session.
const DEBUG_STORAGE_KEY = "debugResumeData";

async function getResumeJson(name) {
  try {
    const response = await fetch("manifest.json");
    const manifest = await response.json();
    if (manifest.resumes && manifest.resumes.includes(name)) {
      return name;
    }
    return DEFAULT_RESUME;
  } catch (error) {
    console.error("Error fetching manifest.json:", error);
    return DEFAULT_RESUME;
  }
}

async function loadResumeData() {
  const startTime = Date.now();

  try {
    let data;
    const debugData = sessionStorage.getItem(DEBUG_STORAGE_KEY);
    if (debugData) {
      // Debug tool override: render the JSON the user pasted in instead of fetching.
      data = JSON.parse(debugData);
    } else {
      const jsonPath = await getResumeJson(resumeToLoad);
      const response = await fetch(`resumes/${jsonPath}.json`);
      data = await response.json();
    }
    populateResume(data);

    // Calculate remaining time to ensure minimum display duration
    const elapsedTime = (Date.now() - startTime) / 1000; // Convert to seconds
    const remainingTime = Math.max(
      0,
      (ANIMATION_DURATION - elapsedTime) * 1000
    ); // Convert to milliseconds

    // Wait for remaining time before hiding
    setTimeout(() => {
      hideLoadingScreen();
    }, remainingTime);
  } catch (error) {
    console.error("Error loading resume data:", error);
    // Even on error, ensure minimum display time
    const elapsedTime = (Date.now() - startTime) / 1000;
    const remainingTime = Math.max(
      0,
      (ANIMATION_DURATION - elapsedTime) * 1000
    );

    setTimeout(() => {
      hideLoadingScreen();
    }, remainingTime);
  }
}

function populateResume(data) {
  // Personal Info
  document.querySelector(".name").textContent = data.personal.name;

  // Contact Info
  const contactDiv = document.querySelector(".contact");
  Object.entries(data.personal.contact).forEach(([contactType, contact]) => {
    if (contactType === "email" && emailToUse !== null) {
      contact.url = `mailto:${emailToUse}`;
      contact.text = emailToUse;
    }
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
  if (!data.experience || data.experience.length === 0) {
    // Delete experience section
    document.querySelector("#experience").remove();
    // Also remove from nav
    document
      .querySelector('.nav-item a[href="#experience"]')
      .parentElement.remove();
    // Remove separator if exists
    const navItems = document.querySelectorAll(".nav-item");
    if (navItems.length > 0) {
      navItems[navItems.length - 1].classList.remove("with-separator");
    }
    // Exit the function as there's no experience to display
  } else {
    const experienceContainer = document.querySelector(".experience-container");
    data.experience.forEach((exp) => {
      const containsPositions = exp.positions && exp.positions.length > 0;
      const article = document.createElement("article");

      // Create the main company section
      let experienceHTML;
      if (containsPositions) {
        article.classList.add("has-positions");
        experienceHTML = `<h3 class="screen-only">${exp.company}</h3>`;
      } else {
        experienceHTML = `
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
      }

      // Add positions if they exist
      if (exp.positions && exp.positions.length > 0) {
        experienceHTML += `<div class="positions-timeline">`;
        exp.positions.forEach((position, index) => {
          experienceHTML += `
          <div class="position-item">
            <div class="position-marker screen-only">
              <div class="position-circle"></div>
            </div>
            <div class="position-content">
              <h3 class="print-only">${exp.company}</h3>
              <div class="job-header">
                <p class="job-title">${position.title}</p>
                <p class="job-date">${position.period}</p>
              </div>
              <ul>
                ${position.achievements
              .map((achievement) => `<li>${achievement}</li>`)
              .join("")}
              </ul>
            </div>
          </div>
        `;
        });
        experienceHTML += `</div>`;
      }

      article.innerHTML = experienceHTML;
      experienceContainer.appendChild(article);
    });
  }

  // Projects
  const projectsList = document.querySelector(".projects-list");
  if (data.projects && data.projects.length && data.projects.length === 0) {
    // Delete projects section
    projectsList.parentElement.parentElement.remove();
  } else {
    data.projects.forEach((project) => {
      const li = document.createElement("li");
      li.innerHTML = `
            <strong>${project.name}</strong> — ${project.description}
            <a href="${project.url}" target="_blank" rel="noopener noreferrer">GitHub</a>
          `;
      projectsList.appendChild(li);
    });
  }

  // Education
  const education = data.education;
  if (!education || Object.keys(education).length === 0) {
    // Delete education section
    document.querySelector("#education").remove();
  } else {
    document.querySelector("#education p").innerHTML = `
          <strong>${education.institution}</strong> —
          <em>${education.degree}</em> (CGPA ${education.gpa})<br />
          ${education.period} • ${education.location}
        `;
  }

  // Achievements
  const achievementsList = document.querySelector(".achievements-list");
  if (!data.achievements || data.achievements.length === 0) {
    // Delete achievements section
    achievementsList.parentElement.parentElement.remove();
  } else {
    data.achievements.forEach((achievement) => {
      const li = document.createElement("li");
      li.innerHTML = `
            <strong>${achievement.title}</strong> — ${achievement.description}
          `;
      achievementsList.appendChild(li);
    });
  }

  // Keywords
  document.querySelector(
    "#keywords em"
  ).textContent = `Keywords: ${data.keywords}`;

  // Footer
  document.querySelector(
    "footer p"
  ).textContent = `${data.footer.copyright} • Last Updated: ${data.footer.lastUpdated}`;
}

function hideLoadingScreen() {
  const loadingScreen = document.querySelector(".loading-screen");
  if (loadingScreen) {
    loadingScreen.classList.add("hidden");
    // Remove the loading screen from DOM after transition
    setTimeout(() => {
      loadingScreen.remove();
    }, 500);
  }
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

// ===== Debug tool =====
// Type DEBUG_PASSWORD anywhere on the page to open a panel where you can paste
// resume JSON. The JSON is stashed in sessionStorage and the page reloads so it
// renders through the normal populateResume() path (cleared when the tab closes).
(function setupDebugTool() {
  const overlay = document.querySelector(".debug-overlay");
  if (!overlay) return;

  const textarea = overlay.querySelector(".debug-textarea");
  const errorBox = overlay.querySelector(".debug-error");
  const renderBtn = overlay.querySelector(".debug-render");
  const clearBtn = overlay.querySelector(".debug-clear");
  const closeBtn = overlay.querySelector(".debug-close");

  const openPanel = () => {
    // Pre-fill with whatever is currently being rendered, if anything.
    const current = sessionStorage.getItem(DEBUG_STORAGE_KEY);
    if (current && !textarea.value) {
      try {
        textarea.value = JSON.stringify(JSON.parse(current), null, 2);
      } catch {
        textarea.value = current;
      }
    }
    errorBox.textContent = "";
    overlay.classList.add("visible");
    textarea.focus();
  };

  const closePanel = () => overlay.classList.remove("visible");

  // Listen for the secret password being typed (ignored while typing in a field).
  let typed = "";
  document.addEventListener("keydown", (e) => {
    const tag = (e.target.tagName || "").toLowerCase();
    const isField =
      tag === "input" || tag === "textarea" || e.target.isContentEditable;
    if (overlay.classList.contains("visible") || isField) {
      if (e.key === "Escape") closePanel();
      return;
    }
    if (e.key.length === 1) {
      typed = (typed + e.key).slice(-DEBUG_PASSWORD.length);
      if (typed.toLowerCase() === DEBUG_PASSWORD.toLowerCase()) {
        typed = "";
        openPanel();
      }
    }
  });

  renderBtn.addEventListener("click", () => {
    const raw = textarea.value.trim();
    if (!raw) {
      errorBox.textContent = "Paste some JSON first.";
      return;
    }
    try {
      JSON.parse(raw); // validate before storing
    } catch (err) {
      errorBox.textContent = `Invalid JSON: ${err.message}`;
      return;
    }
    sessionStorage.setItem(DEBUG_STORAGE_KEY, raw);
    window.location.reload();
  });

  clearBtn.addEventListener("click", () => {
    sessionStorage.removeItem(DEBUG_STORAGE_KEY);
    window.location.reload();
  });

  closeBtn.addEventListener("click", closePanel);
  overlay.addEventListener("click", (e) => {
    if (e.target === overlay) closePanel();
  });

  // Surface that an override is active so it isn't a mystery later.
  if (sessionStorage.getItem(DEBUG_STORAGE_KEY)) {
    console.info(
      `[debug] Rendering custom JSON from sessionStorage. Type "${DEBUG_PASSWORD}" to edit/clear.`
    );
  }
})();
