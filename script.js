// Load resume data based on the query param
const urlSearchParams = new URLSearchParams(window.location.search);
const selectedResume = urlSearchParams.get("resume");
const emailToUse = urlSearchParams.get("email");
const selectedStyle = urlSearchParams.get("style");

async function getManifest() {
  const response = await fetch("manifest.json");
  return await response.json();
}

function getStylesFileName(style, manifest) {
  if (
    manifest &&
    manifest.styles &&
    Object.keys(manifest.styles).includes(style)
  ) {
    return style;
  }
  return "classic";
}

function setStyles(filePath) {
  const link = document.createElement("link");
  link.rel = "stylesheet";
  link.href = filePath;
  document.head.appendChild(link);
}

function getResumePath(name, manifest) {
  if (manifest && manifest.resumes && manifest.resumes.includes(name)) {
    return name;
  }
  return "fullstack";
}

function setupStyleFeatures(styleName, manifest) {
  const themeToggle = document.querySelector(".theme-toggle");
  const printButton = document.querySelector(".print-button");

  // Style-specific feature configuration
  const styleConfig = manifest.styles;

  const config = styleConfig[styleName] || styleConfig.classic;

  // Handle theme toggle visibility and functionality
  if (!config.supportsThemeToggle) {
    if (themeToggle) {
      themeToggle.style.display = "none";
    }
    // Force the default theme for this style
    if (config.defaultTheme) {
      document.documentElement.setAttribute("data-theme", config.defaultTheme);
    }
  }

  // Handle print button visibility
  if (!config.supportsPrint) {
    if (printButton) {
      printButton.style.display = "none";
    }
  }
}

async function loadResumeData() {
  const ANIMATION_DURATION = 4.2; // Duration in seconds
  const startTime = Date.now();

  try {
    const manifest = await getManifest();
    const resumeJsonPath = getResumePath(selectedResume, manifest);
    const stylesFileName = getStylesFileName(selectedStyle, manifest);
    setStyles(`styles/${stylesFileName}.css`);

    // Setup style-specific features
    setupStyleFeatures(stylesFileName, manifest);

    const response = await fetch(`resumes/${resumeJsonPath}.json`);
    const data = await response.json();
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
  const experienceContainer = document.querySelector(".experience-container");
  data.experience.forEach((exp) => {
    const containsPositions = exp.positions && exp.positions.length > 0;
    const article = document.createElement("article");

    // Create the main company section
    let experienceHTML;
    if (containsPositions) {
      article.classList.add("has-positions");
      experienceHTML = `<h3>${exp.company}</h3>`;
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

// Dark mode toggle - will be configured based on style
const themeToggle = document.querySelector(".theme-toggle");
const themeIcon = document.querySelector(".theme-icon");

function setupThemeToggle() {
  // Only setup theme toggle if it's visible and supported
  if (!themeToggle || themeToggle.style.display === "none") {
    return;
  }

  // Check for saved theme preference or prefer-color-scheme
  const prefersDark =
    window.matchMedia &&
    window.matchMedia("(prefers-color-scheme: dark)").matches;
  const savedTheme = localStorage.getItem("theme");

  // Set initial theme
  if (savedTheme === "dark" || (!savedTheme && prefersDark)) {
    document.documentElement.setAttribute("data-theme", "dark");
    if (themeIcon) themeIcon.textContent = "☀️";
  }

  // Theme toggle functionality
  themeToggle.addEventListener("click", () => {
    const currentTheme = document.documentElement.getAttribute("data-theme");
    const newTheme = currentTheme === "dark" ? "light" : "dark";

    document.documentElement.setAttribute("data-theme", newTheme);
    localStorage.setItem("theme", newTheme);

    // Update icon
    if (themeIcon) {
      themeIcon.textContent = newTheme === "dark" ? "☀️" : "🌙";
    }
  });
}

// Setup theme toggle after DOM is loaded and style is configured
document.addEventListener("DOMContentLoaded", () => {
  // Small delay to ensure style setup is complete
  setTimeout(setupThemeToggle, 100);
});

// Print button functionality - setup conditionally
function setupPrintButton() {
  const printButton = document.querySelector(".print-button");
  if (printButton && printButton.style.display !== "none") {
    printButton.addEventListener("click", () => {
      window.print();
    });
  }
}

// Setup print button after DOM is loaded
document.addEventListener("DOMContentLoaded", () => {
  setTimeout(setupPrintButton, 100);
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
