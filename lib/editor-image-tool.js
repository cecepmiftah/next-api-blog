import { API, FileTool } from "@editorjs/editorjs";

export default class EditorImageTool {
  api;
  config;
  data;
  wrapper = null;

  static get toolbox() {
    return {
      title: "Image",
      icon: '<svg width="17" height="15" viewBox="0 0 336 276" xmlns="http://www.w3.org/2000/svg"><path d="M291 150V79c0-19-15-34-34-34H79c-19 0-34 15-34 34v42l67-44 81 72 56-29 42 30zm0 52l-43-30-56 30-81-67-66 39v23c0 19 15 34 34 34h178c19 0 34-15 34-34v-5zM79 0h178c44 0 79 35 79 79v118c0 44-35 79-79 79H79c-44 0-79-35-79-79V79C0 35 35 0 79 0z"/></svg>',
    };
  }

  constructor({ data, config, api }) {
    this.api = api;
    this.config = config;
    this.data = {
      url: data.url || "",
      caption: data.caption || "",
      withBorder: data.withBorder || false,
      withBackground: data.withBackground || false,
      stretched: data.stretched || false,
    };
  }

  render() {
    this.wrapper = document.createElement("div");
    this.wrapper.className = "editor-image-tool";

    // Create image preview or upload button
    if (this.data.url) {
      this.createImagePreview();
    } else {
      this.createUploadButton();
    }

    return this.wrapper;
  }

  createImagePreview() {
    if (!this.wrapper) return;

    const imageContainer = document.createElement("div");
    imageContainer.className = "relative group";

    const img = document.createElement("img");
    img.src = this.data.url;
    img.className = "max-w-full h-auto rounded-lg";
    imageContainer.appendChild(img);

    // Image controls
    const controls = document.createElement("div");
    controls.className =
      "absolute top-2 right-2 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity";

    // Replace button
    const replaceBtn = document.createElement("button");
    replaceBtn.type = "button";
    replaceBtn.className =
      "bg-slate-800/80 text-white p-2 rounded-md hover:bg-slate-700";
    replaceBtn.innerHTML = "🔄";
    replaceBtn.title = "Replace image";
    replaceBtn.onclick = () => this.createUploadButton();
    controls.appendChild(replaceBtn);

    // Remove button
    const removeBtn = document.createElement("button");
    removeBtn.type = "button";
    removeBtn.className =
      "bg-red-600/80 text-white p-2 rounded-md hover:bg-red-700";
    removeBtn.innerHTML = "🗑️";
    removeBtn.title = "Remove image";
    removeBtn.onclick = () => {
      this.data.url = "";
      if (this.wrapper) {
        this.wrapper.innerHTML = "";
        this.createUploadButton();
      }
    };
    controls.appendChild(removeBtn);

    imageContainer.appendChild(controls);

    // Caption input
    const captionInput = document.createElement("input");
    captionInput.type = "text";
    captionInput.className =
      "w-full mt-3 p-2 bg-slate-800 border border-slate-700 rounded text-white";
    captionInput.placeholder = "Add caption...";
    captionInput.value = this.data.caption || "";
    captionInput.oninput = (e) => {
      this.data.caption = e.target.value;
    };

    // Style controls
    const styleControls = document.createElement("div");
    styleControls.className = "flex flex-wrap gap-3 mt-3";

    const styleOptions = [
      { key: "withBorder", label: "Border", icon: "🖼️" },
      { key: "withBackground", label: "Background", icon: "🎨" },
      { key: "stretched", label: "Stretch", icon: "↔️" },
    ];

    styleOptions.forEach(({ key, label, icon }) => {
      const button = document.createElement("button");
      button.type = "button";
      button.className = `flex items-center gap-2 px-3 py-2 rounded-md ${this.data[key] ? "bg-blue-600 text-white" : "bg-slate-800 text-slate-300"}`;
      button.innerHTML = `${icon} ${label}`;
      button.onclick = () => {
        this.data[key] = !this.data[key];
        button.className = `flex items-center gap-2 px-3 py-2 rounded-md ${this.data[key] ? "bg-blue-600 text-white" : "bg-slate-800 text-slate-300"}`;
      };
      styleControls.appendChild(button);
    });

    this.wrapper.innerHTML = "";
    this.wrapper.appendChild(imageContainer);
    this.wrapper.appendChild(captionInput);
    this.wrapper.appendChild(styleControls);
  }

  createUploadButton() {
    if (!this.wrapper) return;

    const container = document.createElement("div");
    container.className =
      "border-2 border-dashed border-slate-700 rounded-lg p-8 text-center hover:border-slate-600 transition-colors";

    const icon = document.createElement("div");
    icon.className = "text-4xl mb-4 text-slate-500";
    icon.innerHTML = "📁";

    const title = document.createElement("div");
    title.className = "text-xl font-semibold mb-2 text-white";
    title.textContent = "Upload Image";

    const subtitle = document.createElement("div");
    subtitle.className = "text-slate-400 mb-6";
    subtitle.textContent = "Click to upload or drag and drop";

    const input = document.createElement("input");
    input.type = "file";
    input.accept = "image/*,.png,.jpg,.jpeg,.gif,.webp";
    input.className = "hidden";
    input.multiple = false;

    const uploadButton = document.createElement("button");
    uploadButton.type = "button";
    uploadButton.className =
      "bg-gradient-to-r from-blue-600 to-purple-600 text-white px-6 py-3 rounded-lg font-medium hover:opacity-90 transition-opacity";
    uploadButton.textContent = "Select Image";
    uploadButton.onclick = () => input.click();

    const supportedFormats = document.createElement("div");
    supportedFormats.className = "text-xs text-slate-500 mt-4";
    supportedFormats.textContent = "Supports: PNG, JPG, JPEG, GIF, WebP";

    input.onchange = async (e) => {
      const file = e.target.files?.[0];
      if (file && this.config.uploader) {
        // Show loading state
        uploadButton.disabled = true;
        uploadButton.textContent = "Uploading...";
        uploadButton.className =
          "bg-slate-700 text-white px-6 py-3 rounded-lg font-medium";

        try {
          const response = await this.config.uploader(file);
          if (response.success === 1) {
            this.data.url = response.file.url;
            this.createImagePreview();
          } else {
            throw new Error("Upload failed");
          }
        } catch (error) {
          alert("Failed to upload image. Please try again.");
        } finally {
          uploadButton.disabled = false;
          uploadButton.textContent = "Select Image";
          uploadButton.className =
            "bg-gradient-to-r from-blue-600 to-purple-600 text-white px-6 py-3 rounded-lg font-medium hover:opacity-90 transition-opacity";
        }
      }
    };

    // Drag and drop support
    container.addEventListener("dragover", (e) => {
      e.preventDefault();
      container.classList.add("border-blue-500", "bg-slate-900/50");
    });

    container.addEventListener("dragleave", () => {
      container.classList.remove("border-blue-500", "bg-slate-900/50");
    });

    container.addEventListener("drop", async (e) => {
      e.preventDefault();
      container.classList.remove("border-blue-500", "bg-slate-900/50");

      const file = e.dataTransfer?.files[0];
      if (file && file.type.startsWith("image/")) {
        input.files = e.dataTransfer?.files;
        const event = new Event("change", { bubbles: true });
        input.dispatchEvent(event);
      } else {
        alert("Please drop an image file");
      }
    });

    container.appendChild(icon);
    container.appendChild(title);
    container.appendChild(subtitle);
    container.appendChild(uploadButton);
    container.appendChild(supportedFormats);
    container.appendChild(input);

    this.wrapper.innerHTML = "";
    this.wrapper.appendChild(container);
  }

  save() {
    return this.data;
  }

  static get isReadOnlySupported() {
    return true;
  }
}
