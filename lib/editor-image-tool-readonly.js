import { API } from "@editorjs/editorjs";

export default class EditorImageToolReadOnly {
  data;
  wrapper;

  static get toolbox() {
    return {
      title: "Image",
      icon: '<svg width="17" height="15" viewBox="0 0 336 276" xmlns="http://www.w3.org/2000/svg"><path d="M291 150V79c0-19-15-34-34-34H79c-19 0-34 15-34 34v42l67-44 81 72 56-29 42 30zm0 52l-43-30-56 30-81-67-66 39v23c0 19 15 34 34 34h178c19 0 34-15 34-34v-5zM79 0h178c44 0 79 35 79 79v118c0 44-35 79-79 79H79c-44 0-79-35-79-79V79C0 35 35 0 79 0z"/></svg>',
    };
  }

  static get isReadOnlySupported() {
    return true; // Penting: return true untuk support read-only
  }

  constructor({ data }) {
    this.data = data;
  }

  render() {
    this.wrapper = document.createElement("div");
    this.wrapper.className = "editor-image-tool-readonly";

    this.createImageDisplay();

    return this.wrapper;
  }

  createImageDisplay() {
    if (!this.data.url) {
      const emptyDiv = document.createElement("div");
      emptyDiv.className = "image-empty";
      emptyDiv.textContent = "[Image not available]";
      this.wrapper.appendChild(emptyDiv);
      return;
    }

    const container = document.createElement("div");
    container.className = "image-container";

    // Apply styles based on image configuration
    const containerClasses = [];
    if (this.data.withBorder) containerClasses.push("with-border");
    if (this.data.withBackground) containerClasses.push("with-background");
    if (this.data.stretched) containerClasses.push("stretched");

    if (containerClasses.length > 0) {
      container.classList.add(...containerClasses);
    }

    const img = document.createElement("img");
    img.src = this.data.url;
    img.alt = this.data.caption || "Image";
    img.className = "image-content";
    img.loading = "lazy";

    // Handle image load error
    img.onerror = () => {
      img.style.display = "none";
      const errorDiv = document.createElement("div");
      errorDiv.className = "image-error";
      errorDiv.innerHTML = `
        <div class="error-icon">🖼️</div>
        <div class="error-text">Failed to load image</div>
      `;
      container.appendChild(errorDiv);
    };

    container.appendChild(img);

    // Add caption if exists
    if (this.data.caption) {
      const caption = document.createElement("div");
      caption.className = "image-caption";
      caption.textContent = this.data.caption;
      container.appendChild(caption);
    }

    this.wrapper.appendChild(container);
  }

  save() {
    return this.data;
  }
}
