# Modern Resume Template

A clean, responsive, and modern resume template built with HTML, CSS, and JavaScript. This template is designed to be easily customizable and maintainable, perfect for developers and technical professionals.

## Features

- 🎨 Clean and professional design
- 📱 Fully responsive layout
- 🌓 Dark/Light mode toggle
- 🖨️ Print-friendly
- 📝 Easy to customize with JSON
- 🚀 Fast loading and performance optimized
- 🔍 SEO friendly
- ♿ Accessibility features

## Quick Start

1. Clone this repository:

```bash
git clone https://github.com/yourusername/resume.git
cd resume
```

2. Choose your resume data file:

   - Use `frontend.json` for frontend-focused roles
   - Use `fullstack.json` for full-stack roles
   - Or create your own JSON file following the same structure

3. Open `index.html` in your browser to preview your resume

## Customization

### 1. Personal Information

Edit the JSON file to update your personal information:

```json
{
  "personal": {
    "name": "YOUR NAME",
    "contact": {
      "github": {
        "text": "GitHub",
        "url": "your-github-url"
      },
      "linkedin": {
        "text": "LinkedIn",
        "url": "your-linkedin-url"
      },
      "email": {
        "text": "your-email@example.com",
        "url": "mailto:your-email@example.com"
      },
      "phone": {
        "text": "your-phone",
        "url": "tel:your-phone"
      }
    }
  }
}
```

### 2. Sections

The template includes the following sections:

- Professional Summary
- Technical Skills
- Professional Experience
- Projects
- Education
- Achievements

Each section can be customized in the JSON file. Refer to the example JSON files for the structure.

### 3. Styling

- Edit `styles.css` to customize colors, fonts, and layout
- The template uses Source Sans Pro font by default
- Dark/Light mode colors can be customized in the CSS variables

## Printing

1. Click the print button (🖨️) in the navigation bar
2. Or use your browser's print function (Ctrl/Cmd + P)
3. The template is optimized for A4 paper size

## Generating a PDF from the CLI

There's a Node CLI in [`cli/`](cli/README.md) that turns a resume JSON file into
a PDF without opening a browser yourself. It drives headless Chrome, injects your
JSON the same way the in-page `jsondebug` tool does (via `sessionStorage`, see
`script.js`), and prints the page using the site's A4 print styles.

```bash
npm install                                # installs puppeteer (bundles Chromium)

# Run it locally
node cli/resume-to-pdf.js resumes/backend.json -o backend.pdf
npm run pdf -- resumes/backend.json        # same thing, via the npm script
cat resumes/google.json | node cli/resume-to-pdf.js -   # or from stdin
```

By default it drives the live site (`https://resume.chakri.me`). Point it at a
local server with `--url http://localhost:<port>` to render unpushed changes.

### Install it globally

To get a system-wide `resume-to-pdf` command you can run from any directory:

```bash
npm link            # symlinks this checkout (picks up your edits) …
npm install -g .    # … or installs a copy globally
```

Then:

```bash
resume-to-pdf ./my-resume.json -o my-resume.pdf
```

See [`cli/README.md`](cli/README.md) for all options and details.

## Development

### Project Structure

```
resume/
├── index.html          # Main HTML file
├── styles.css          # Styles
├── script.js           # JavaScript functionality
├── frontend.json       # Frontend-focused resume data
└── fullstack.json      # Full-stack resume data
```

### Adding New Features

1. Edit `index.html` to add new sections
2. Update `styles.css` for styling
3. Modify `script.js` for new functionality

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Acknowledgments

- Fonts: [Source Sans Pro](https://fonts.google.com/specimen/Source+Sans+Pro)
- Icons: Custom SVG and emoji-based icons
