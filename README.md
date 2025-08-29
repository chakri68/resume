# Modern Resume Template

A clean, responsive, and modern resume template built with HTML, CSS, and JavaScript. This template is designed to be easily customizable and maintainable, perfect for developers and technical professionals.

## Features

- 🎨 Multiple style themes (Classic & Terminal)
- 📱 Fully responsive layout
- 🌓 Dark/Light mode toggle (Classic style only)
- 🖨️ Print-friendly (Classic style only)
- 📝 Easy to customize with JSON
- 🚀 Fast loading and performance optimized
- 🔍 SEO friendly
- ♿ Accessibility features

## Available Styles

### Classic Style (`?style=classic`)
- **Theme Support**: Light and Dark modes
- **Print Support**: Yes, optimized for PDF generation
- **Font**: Elegant serif fonts (Palatino, EB Garamond)
- **Design**: Professional glassmorphism effect
- **Best For**: Traditional resumes, professional applications

### Terminal Style (`?style=terminal`) 
- **Theme Support**: Dark mode only (retro green phosphor)
- **Print Support**: No
- **Font**: Monospace fonts (Fira Code, SF Mono, Monaco)
- **Design**: Retro CRT terminal with scan lines, screen curvature, and phosphor glow effects
- **Best For**: Tech portfolios, developer resumes, creative applications in gaming/tech industry

## Quick Start

### Using Different Styles

You can switch between styles using URL parameters:

```
# Classic style (default)
index.html?style=classic

# Terminal/CRT style
index.html?style=terminal

# Default (falls back to classic)
index.html
```

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
