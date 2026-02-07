import { API, FileTool } from "@editorjs/editorjs";

export default class EditorAttachmentTool {
  api;
  config;
  data;

  static get toolbox() {
    return {
      title: "Attachment",
      icon: '<svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor"><path d="M21.44 11.05l-9.19 9.19a6 6 0 0 1-8.49-8.49l9.19-9.19a4 4 0 0 1 5.66 5.66l-9.2 9.19a2 2 0 0 1-2.83-2.83l8.49-8.48"/></svg>',
    };
  }

  constructor({ data, config, api }) {
    this.api = api;
    this.config = config;
    this.data = data || {};
  }

  render() {
    const wrapper = document.createElement("div");
    wrapper.className = "editor-attachment-tool";

    if (this.data.file?.url) {
      this.renderFilePreview(wrapper);
    } else {
      this.renderUploadButton(wrapper);
    }

    return wrapper;
  }

  renderFilePreview(wrapper) {
    const file = this.data.file;

    const preview = document.createElement("div");
    preview.className = "bg-slate-800 rounded-lg p-4 border border-slate-700";

    const fileInfo = document.createElement("div");
    fileInfo.className = "flex items-center gap-3";

    const icon = document.createElement("div");
    icon.className = "text-2xl";
    icon.innerHTML = this.getFileIcon(file.name);

    const details = document.createElement("div");
    details.className = "flex-1";

    const fileName = document.createElement("div");
    fileName.className = "font-medium text-white truncate";
    fileName.textContent = file.name || "Download";

    const fileSize = document.createElement("div");
    fileSize.className = "text-sm text-slate-400";
    fileSize.textContent = this.formatFileSize(file.size);

    details.appendChild(fileName);
    details.appendChild(fileSize);

    const downloadBtn = document.createElement("a");
    downloadBtn.href = file.url;
    downloadBtn.target = "_blank";
    downloadBtn.className =
      "bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded text-sm font-medium";
    downloadBtn.textContent = "Download";

    const removeBtn = document.createElement("button");
    removeBtn.type = "button";
    removeBtn.className = "text-slate-400 hover:text-red-400 ml-2";
    removeBtn.innerHTML = "🗑️";
    removeBtn.title = "Remove attachment";
    removeBtn.onclick = () => {
      this.data = {};
      wrapper.innerHTML = "";
      this.renderUploadButton(wrapper);
    };

    fileInfo.appendChild(icon);
    fileInfo.appendChild(details);
    fileInfo.appendChild(downloadBtn);
    fileInfo.appendChild(removeBtn);

    // Title input
    const titleInput = document.createElement("input");
    titleInput.type = "text";
    titleInput.className =
      "w-full mt-3 p-2 bg-slate-900 border border-slate-700 rounded text-white";
    titleInput.placeholder = "Add attachment title (optional)";
    titleInput.value = this.data.title || "";
    titleInput.oninput = (e) => {
      this.data.title = e.target.value;
    };

    preview.appendChild(fileInfo);
    preview.appendChild(titleInput);
    wrapper.appendChild(preview);
  }

  renderUploadButton(wrapper) {
    const container = document.createElement("div");
    container.className =
      "border-2 border-dashed border-slate-700 rounded-lg p-6 text-center hover:border-slate-600 transition-colors";

    const icon = document.createElement("div");
    icon.className = "text-3xl mb-3 text-slate-500";
    icon.innerHTML = "📎";

    const title = document.createElement("div");
    title.className = "text-lg font-semibold mb-2 text-white";
    title.textContent = "Upload File";

    const subtitle = document.createElement("div");
    subtitle.className = "text-slate-400 mb-4";
    subtitle.textContent = "Click to upload any file";

    const input = document.createElement("input");
    input.type = "file";
    input.className = "hidden";
    input.multiple = false;

    const uploadButton = document.createElement("button");
    uploadButton.type = "button";
    uploadButton.className =
      "bg-gradient-to-r from-green-600 to-teal-600 text-white px-5 py-2.5 rounded-lg font-medium hover:opacity-90 transition-opacity";
    uploadButton.textContent = "Select File";
    uploadButton.onclick = () => input.click();

    const formats = document.createElement("div");
    formats.className = "text-xs text-slate-500 mt-3";
    formats.textContent = "Supports: PDF, DOC, XLS, ZIP, etc.";

    input.onchange = async (e) => {
      const file = e.target.files?.[0];
      if (file && this.config.uploader) {
        uploadButton.disabled = true;
        uploadButton.textContent = "Uploading...";

        try {
          const response = await this.config.uploader(file);
          if (response.success === 1) {
            this.data.file = response.file;
            wrapper.innerHTML = "";
            this.renderFilePreview(wrapper);
          }
        } catch (error) {
          alert("Failed to upload file");
        } finally {
          uploadButton.disabled = false;
          uploadButton.textContent = "Select File";
        }
      }
    };

    container.appendChild(icon);
    container.appendChild(title);
    container.appendChild(subtitle);
    container.appendChild(uploadButton);
    container.appendChild(formats);
    container.appendChild(input);

    wrapper.appendChild(container);
  }

  getFileIcon(filename) {
    const ext = filename.split(".").pop()?.toLowerCase();

    const icons = {
      pdf: "📕",
      doc: "📘",
      docx: "📘",
      xls: "📊",
      xlsx: "📊",
      ppt: "📽️",
      pptx: "📽️",
      zip: "📦",
      rar: "📦",
      txt: "📝",
      mp3: "🎵",
      mp4: "🎬",
      jpg: "🖼️",
      jpeg: "🖼️",
      png: "🖼️",
      gif: "🖼️",
    };

    return icons[ext || ""] || "📎";
  }

  formatFileSize(bytes) {
    if (bytes === 0) return "0 Bytes";

    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));

    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
  }

  save() {
    return this.data;
  }

  static get isReadOnlySupported() {
    return true;
  }
}
