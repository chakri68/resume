class LogoAnimated extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: "open" });
  }

  static get observedAttributes() {
    return [
      "width",
      "height",
      "stroke-color",
      "fill-color",
      "delay",
      "duration",
      "timing-function",
      "repeat",
      "alternate",
    ];
  }

  connectedCallback() {
    this.render();
    this.animateLogo();
    this.setupHoverAnimation();
  }

  attributeChangedCallback(name, oldValue, newValue) {
    if (oldValue !== newValue) {
      this.render();
      this.animateLogo();
      this.setupHoverAnimation();
    }
  }

  get width() {
    return this.getAttribute("width") || "109.351";
  }

  get height() {
    return this.getAttribute("height") || "108.002";
  }

  get strokeColor() {
    return this.getAttribute("stroke-color") || "currentColor";
  }

  get fillColor() {
    return this.getAttribute("fill-color") || "transparent";
  }

  get delay() {
    return parseFloat(this.getAttribute("delay")) || 0.1;
  }

  get duration() {
    return parseFloat(this.getAttribute("duration")) || 2.2;
  }

  get timingFunction() {
    return this.getAttribute("timing-function") || "ease";
  }

  get repeat() {
    return this.getAttribute("repeat") === "true";
  }

  get alternate() {
    return this.getAttribute("alternate") === "true";
  }

  render() {
    const style = document.createElement("style");
    style.textContent = `
      :host {
        display: inline-block;
      }
      svg {
        width: 100%;
        height: 100%;
        overflow: visible;
      }
      path {
        fill: ${this.fillColor};
        stroke: ${this.strokeColor};
        stroke-width: 0.6;
        stroke-opacity: 0.6;
        stroke-linecap: round;
        stroke-linejoin: round;
        shape-rendering: geometricPrecision;
        vector-effect: non-scaling-stroke;
        transition: fill 0.3s ease;
      }
      :host(:hover) path {
        fill: var(--clr-accent);
      }
    `;

    const svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
    svg.setAttribute("width", this.width);
    svg.setAttribute("height", this.height);
    svg.setAttribute("viewBox", "0 0 109.351 108.002");
    svg.setAttribute("xmlns", "http://www.w3.org/2000/svg");
    svg.classList.add("nav-logo-svg");

    const g = document.createElementNS("http://www.w3.org/2000/svg", "g");
    g.setAttribute("id", "svgGroup");
    g.setAttribute("stroke-linecap", "round");
    g.setAttribute("fill-rule", "evenodd");
    g.setAttribute("font-size", "9pt");
    g.setAttribute("stroke", this.strokeColor);
    g.setAttribute("stroke-width", "0.25mm");
    g.setAttribute("fill", this.fillColor);

    const path1 = document.createElementNS(
      "http://www.w3.org/2000/svg",
      "path"
    );
    path1.setAttribute(
      "d",
      "M 0.001 82.201 L 0.001 25.801 A 39.099 39.099 0 0 1 0.671 18.327 Q 1.526 13.94 3.472 10.526 A 20.573 20.573 0 0 1 6.226 6.751 A 20.005 20.005 0 0 1 15.901 1.031 Q 19.142 0.146 23.016 0.021 A 40.016 40.016 0 0 1 24.301 0.001 Q 36.151 0.001 42.376 6.751 Q 47.884 12.723 48.518 23.04 A 44.977 44.977 0 0 1 48.601 25.801 L 48.601 36.901 L 33.001 36.901 L 33.001 24.751 Q 33.001 16.208 26.668 15.151 A 11.64 11.64 0 0 0 24.751 15.001 A 9.91 9.91 0 0 0 21.239 15.573 Q 16.881 17.219 16.531 23.6 A 21.026 21.026 0 0 0 16.501 24.751 L 16.501 83.401 Q 16.501 93.001 24.751 93.001 A 10.063 10.063 0 0 0 28.251 92.442 Q 32.688 90.801 32.98 84.337 A 20.722 20.722 0 0 0 33.001 83.401 L 33.001 67.351 L 48.601 67.351 L 48.601 82.201 A 39.099 39.099 0 0 1 47.931 89.675 Q 47.076 94.062 45.13 97.476 A 20.573 20.573 0 0 1 42.376 101.251 A 20.005 20.005 0 0 1 32.7 106.971 Q 29.46 107.856 25.586 107.981 A 40.016 40.016 0 0 1 24.301 108.001 Q 12.451 108.001 6.226 101.251 Q 0.718 95.279 0.084 84.962 A 44.977 44.977 0 0 1 0.001 82.201 Z"
    );
    path1.setAttribute("id", "0");
    path1.setAttribute("vector-effect", "non-scaling-stroke");

    const path2 = document.createElementNS(
      "http://www.w3.org/2000/svg",
      "path"
    );
    path2.setAttribute(
      "d",
      "M 58.501 106.501 L 58.501 1.501 L 82.951 1.501 A 54.532 54.532 0 0 1 83.15 1.501 Q 90.919 1.53 96.104 3.777 A 17.108 17.108 0 0 1 101.551 7.426 A 18.267 18.267 0 0 1 105.725 14.312 Q 106.72 17.136 107.124 20.604 A 43.662 43.662 0 0 1 107.401 25.651 L 107.401 32.101 A 37.889 37.889 0 0 1 106.767 39.317 Q 105.995 43.286 104.281 46.21 A 15.264 15.264 0 0 1 96.601 52.801 L 96.601 53.101 A 13.838 13.838 0 0 1 101.451 55.612 A 12.946 12.946 0 0 1 105.076 60.451 A 24.647 24.647 0 0 1 106.584 65.141 Q 107.551 69.489 107.551 75.301 L 107.551 93.751 A 112.078 112.078 0 0 0 107.58 96.395 Q 107.645 99.118 107.851 101.026 A 18.2 18.2 0 0 0 109.277 106.332 A 20.379 20.379 0 0 0 109.351 106.501 L 92.551 106.501 A 27.228 27.228 0 0 1 91.764 103.876 A 20.917 20.917 0 0 1 91.351 101.701 Q 91.051 99.451 91.051 93.601 L 91.051 74.401 A 35.299 35.299 0 0 0 90.906 71.073 Q 90.47 66.489 88.726 64.351 A 6.834 6.834 0 0 0 85.926 62.353 Q 84.773 61.887 83.319 61.676 A 18.261 18.261 0 0 0 80.701 61.501 L 75.001 61.501 L 75.001 106.501 L 58.501 106.501 Z M 75.001 46.501 L 81.001 46.501 A 15.284 15.284 0 0 0 83.82 46.258 Q 86.715 45.714 88.426 43.951 A 7.352 7.352 0 0 0 89.958 41.493 Q 90.901 39.104 90.901 35.401 L 90.901 27.301 A 25.437 25.437 0 0 0 90.749 24.419 Q 90.408 21.432 89.294 19.646 A 6.39 6.39 0 0 0 88.876 19.051 A 6.358 6.358 0 0 0 85.652 16.922 Q 84.571 16.593 83.256 16.521 A 13.824 13.824 0 0 0 82.501 16.501 L 75.001 16.501 L 75.001 46.501 Z"
    );
    path2.setAttribute("id", "1");
    path2.setAttribute("vector-effect", "non-scaling-stroke");

    g.appendChild(path1);
    g.appendChild(path2);
    svg.appendChild(g);

    this.shadowRoot.innerHTML = "";
    this.shadowRoot.appendChild(style);
    this.shadowRoot.appendChild(svg);
  }

  animateLogo() {
    this.shadowRoot
      .querySelectorAll(".nav-logo-svg path")
      .forEach((path, i) => {
        const L = path.getTotalLength();
        path.style.strokeDasharray = L;
        path.style.strokeDashoffset = L;
        path.getBoundingClientRect(); // force layout

        const keyframes = this.alternate
          ? [
              { strokeDashoffset: L },
              { strokeDashoffset: 0 },
              { strokeDashoffset: L },
            ]
          : [{ strokeDashoffset: L }, { strokeDashoffset: 0 }];

        path.animate(keyframes, {
          duration: this.duration * 1000,
          delay: i * this.delay * 1000,
          easing: this.timingFunction,
          iterations: this.repeat ? Infinity : 1,
          direction: this.alternate ? "alternate" : "normal",
          fill: "forwards",
        });
      });
  }

  setupHoverAnimation() {
    const paths = this.shadowRoot.querySelectorAll(".nav-logo-svg path");
    paths.forEach((path) => {
      path.style.transition = "fill 0.3s ease";
    });
  }
}

customElements.define("logo-animated", LogoAnimated);
