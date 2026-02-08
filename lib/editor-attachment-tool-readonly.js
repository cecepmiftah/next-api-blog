import { API } from "@editorjs/editorjs";

export default class EditorAttachmentToolReadOnly {
  data;

  static get toolbox() {
    return {
      title: "Attachment",
      icon: '<svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor"><path d="M21.44 11.05l-9.19 9.19a6 6 0 0 1-8.49-8.49l9.19-9.19a4 4 0 0 1 5.66 5.66l-9.2 9.19a2 2 0 0 1-2.83-2.83l8.49-8.48"/></svg>',
    };
  }

  static get isReadOnlySupported() {
    return true; // Penting: return true untuk support read-only
  }

  constructor({ data }) {
    this.data = data;
  }

  render() {
    const wrapper = document.createElement("div");
    wrapper.className = "editor-attachment-tool-readonly";

    if (this.data.file?.url) {
      this.renderFileDisplay(wrapper);
    } else {
      this.renderEmptyState(wrapper);
    }

    return wrapper;
  }

  renderFileDisplay(wrapper) {
    const file = this.data.file;

    const container = document.createElement("div");
    container.className = "attachment-container";

    const fileCard = document.createElement("div");
    fileCard.className = "file-card";

    const fileIcon = document.createElement("div");
    fileIcon.className = "file-icon";
    fileIcon.innerHTML = this.getFileIcon(file.name);

    const fileInfo = document.createElement("div");
    fileInfo.className = "file-info";

    const fileName = document.createElement("div");
    fileName.className = "file-name";
    fileName.textContent = this.data.title || file.name || "Download";

    const fileDetails = document.createElement("div");
    fileDetails.className = "file-details";

    if (file.name) {
      const nameSpan = document.createElement("span");
      nameSpan.className = "file-original-name";
      nameSpan.textContent = file.name;
      fileDetails.appendChild(nameSpan);
    }

    if (file.size) {
      const sizeSpan = document.createElement("span");
      sizeSpan.className = "file-size";
      sizeSpan.textContent = this.formatFileSize(file.size);
      fileDetails.appendChild(sizeSpan);
    }

    fileInfo.appendChild(fileName);
    fileInfo.appendChild(fileDetails);

    const downloadLink = document.createElement("a");
    downloadLink.href = file.url;
    downloadLink.target = "_blank";
    downloadLink.rel = "noopener noreferrer";
    downloadLink.className = "download-button";
    downloadLink.textContent = "Download";
    downloadLink.onclick = (e) => {
      e.stopPropagation();
    };

    fileCard.appendChild(fileIcon);
    fileCard.appendChild(fileInfo);
    fileCard.appendChild(downloadLink);

    container.appendChild(fileCard);
    wrapper.appendChild(container);
  }

  renderEmptyState(wrapper) {
    const emptyState = document.createElement("div");
    emptyState.className = "attachment-empty";
    emptyState.innerHTML = `
      <div class="empty-icon">📎</div>
      <div class="empty-text">Attachment not available</div>
    `;
    wrapper.appendChild(emptyState);
  }

  getFileIcon(filename) {
    const ext = filename.split(".").pop()?.toLowerCase();

    const icons = {
      pdf: '<svg viewBox="0 0 24 24"><path fill="currentColor" d="M14,9H18.5L13,3.5V8A1,1 0 0,0 14,9M13,18.06V19.05C12.67,19.05 12.34,19 12,19C11.66,19 11.33,19.05 11,19.05V18.06C8,17.83 6,15.24 6,12.05C6,8.86 8,6.27 11,6.04V5.05C11.33,5.05 11.66,5 12,5C12.34,5 12.67,5.05 13,5.05V6.04C16,6.27 18,8.86 18,12.05C18,15.24 16,17.83 13,18.06M20,4H13L7,10V20A2,2 0 0,0 9,22H20A2,2 0 0,0 22,20V6A2,2 0 0,0 20,4Z"/></svg>',
      doc: '<svg viewBox="0 0 24 24"><path fill="currentColor" d="M14,2H6A2,2 0 0,0 4,4V20A2,2 0 0,0 6,22H18A2,2 0 0,0 20,20V8L14,2M18,20H6V4H13V9H18V20Z"/></svg>',
      docx: '<svg viewBox="0 0 24 24"><path fill="currentColor" d="M14,2H6A2,2 0 0,0 4,4V20A2,2 0 0,0 6,22H18A2,2 0 0,0 20,20V8L14,2M18,20H6V4H13V9H18V20Z"/></svg>',
      xls: '<svg viewBox="0 0 24 24"><path fill="currentColor" d="M14,2H6A2,2 0 0,0 4,4V20A2,2 0 0,0 6,22H18A2,2 0 0,0 20,20V8L14,2M14,20H6V4H13V9H18V20M10,12L12,14L14,12L16,14L18,12L17,11L18,10L16,12L14,10L12,12L10,10L8,12L9,13L8,14L10,12Z"/></svg>',
      xlsx: '<svg viewBox="0 0 24 24"><path fill="currentColor" d="M14,2H6A2,2 0 0,0 4,4V20A2,2 0 0,0 6,22H18A2,2 0 0,0 20,20V8L14,2M14,20H6V4H13V9H18V20M10,12L12,14L14,12L16,14L18,12L17,11L18,10L16,12L14,10L12,12L10,10L8,12L9,13L8,14L10,12Z"/></svg>',
      zip: '<svg viewBox="0 0 24 24"><path fill="currentColor" d="M14,17H12V15H10V13H12V15H14M14,9H12V11H14V13H12V11H10V9H12V7H10V5H12V7H14M19,3H5C3.89,3 3,3.89 3,5V19A2,2 0 0,0 5,21H19A2,2 0 0,0 21,19V5C21,3.89 20.1,3 19,3Z"/></svg>',
      rar: '<svg viewBox="0 0 24 24"><path fill="currentColor" d="M14,17H12V15H10V13H12V15H14M14,9H12V11H14V13H12V11H10V9H12V7H10V5H12V7H14M19,3H5C3.89,3 3,3.89 3,5V19A2,2 0 0,0 5,21H19A2,2 0 0,0 21,19V5C21,3.89 20.1,3 19,3Z"/></svg>',
      txt: '<svg viewBox="0 0 24 24"><path fill="currentColor" d="M14,17H7V15H14M17,13H7V11H17M17,9H7V7H17M19,3H5C3.89,3 3,3.89 3,5V19C3,20.1 3.9,21 5,21H19C20.1,21 21,20.1 21,19V5C21,3.89 20.1,3 19,3Z"/></svg>',
    };

    return (
      icons[ext || ""] ||
      '<svg viewBox="0 0 24 24"><path fill="currentColor" d="M14,2H6A2,2 0 0,0 4,4V20A2,2 0 0,0 6,22H18A2,2 0 0,0 20,20V8L14,2M18,20H6V4H13V9H18V20Z"/></svg>'
    );
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
}
