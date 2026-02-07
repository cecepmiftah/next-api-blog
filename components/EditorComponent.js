"use client";

import { useEffect, useRef, useState } from "react";
import EditorJS from "@editorjs/editorjs";
import Header from "@editorjs/header";
import List from "@editorjs/list";
import Code from "@editorjs/code";
import InlineCode from "@editorjs/inline-code";
import Embed from "@editorjs/embed";
import Table from "@editorjs/table";
import LinkTool from "@editorjs/link";
import Delimiter from "@editorjs/delimiter";
import Warning from "@editorjs/warning";
import Paragraph from "@editorjs/paragraph";
import Quote from "@editorjs/quote";
import Marker from "@editorjs/marker";
import Checklist from "@editorjs/checklist";
import Raw from "@editorjs/raw";
import EditorImageTool from "@/lib/editor-image-tool";
import EditorAttachmentTool from "@/lib/editor-attachment-tool";

const EditorComponent = ({
  data,
  onChange,
  onSave,
  holder = "editorjs",
  readOnly = false,
}) => {
  const editorRef = useRef(null);
  const [isMounted, setIsMounted] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  // Upload handler untuk Cloudinary
  const uploadImage = async (file) => {
    try {
      const formData = new FormData();
      formData.append("file", file);

      const response = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });

      const result = await response.json();

      if (result.success) {
        return {
          success: 1,
          file: {
            url: result.data.url,
          },
        };
      } else {
        throw new Error(result.error);
      }
    } catch (error) {
      console.error("Upload failed:", error);
      return {
        success: 0,
        error: "Upload failed",
      };
    }
  };

  const uploadFile = async (file) => {
    try {
      const formData = new FormData();
      formData.append("file", file);

      const response = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });

      const result = await response.json();

      if (result.success) {
        return {
          success: 1,
          file: {
            url: result.data.url,
            name: file.name,
            size: file.size,
          },
        };
      } else {
        throw new Error(result.error);
      }
    } catch (error) {
      console.error("Upload failed:", error);
      return {
        success: 0,
        error: "Upload failed",
      };
    }
  };

  useEffect(() => {
    if (typeof window !== "undefined") {
      setIsMounted(true);
    }
  }, []);

  useEffect(() => {
    if (!isMounted) return;

    if (!editorRef.current) {
      const editor = new EditorJS({
        holder,
        data,
        readOnly,
        tools: {
          paragraph: {
            class: Paragraph,
            inlineToolbar: true,
          },
          header: {
            class: Header,
            config: {
              placeholder: "Enter a header",
              levels: [1, 2, 3, 4, 5, 6],
              defaultLevel: 3,
            },
            inlineToolbar: true,
          },
          list: {
            class: List,
            inlineToolbar: true,
            config: {
              defaultStyle: "unordered",
            },
          },
          checklist: {
            class: Checklist,
            inlineToolbar: true,
          },
          code: Code,
          inlineCode: InlineCode,
          embed: {
            class: Embed,
            config: {
              services: {
                youtube: true,
                coub: true,
                codepen: true,
                vimeo: true,
                gfycat: true,
                imgur: true,
                twitch: true,
                twitter: true,
                instagram: true,
                facebook: true,
                pinterest: true,
              },
            },
          },
          table: {
            class: Table,
            inlineToolbar: true,
            config: {
              rows: 2,
              cols: 3,
            },
          },
          linkTool: {
            class: LinkTool,
            config: {
              endpoint: "/api/link-preview", // You need to create this API route
            },
          },
          image: {
            class: EditorImageTool,
            config: {
              uploader: uploadImage,
            },
          },
          attaches: {
            class: EditorAttachmentTool,
            config: {
              uploader: uploadFile,
            },
          },
          delimiter: Delimiter,
          warning: Warning,
          quote: {
            class: Quote,
            inlineToolbar: true,
            config: {
              quotePlaceholder: "Enter a quote",
              captionPlaceholder: "Quote author",
            },
          },
          marker: Marker,
          raw: Raw,
        },
        onChange: async (api) => {
          if (onChange) {
            const content = await api.saver.save();
            onChange(content);
          }
        },
        placeholder: "Start writing your content here...",
        minHeight: 100,
        autofocus: true,
      });

      editorRef.current = editor;
    }

    return () => {
      if (editorRef.current && editorRef.current.destroy) {
        editorRef.current.destroy();
        editorRef.current = null;
      }
    };
  }, [isMounted, readOnly]);

  const handleSave = async () => {
    if (!editorRef.current || !onSave) return;

    setIsSaving(true);
    try {
      const savedData = await editorRef.current.save();
      onSave(savedData);
    } catch (error) {
      console.error("Error saving content:", error);
    } finally {
      setIsSaving(false);
    }
  };

  const handleClear = () => {
    if (
      editorRef.current &&
      window.confirm("Are you sure you want to clear all content?")
    ) {
      editorRef.current.clear();
    }
  };

  if (!isMounted) {
    return (
      <div className="min-h-[400px] bg-slate-900 rounded-xl border border-slate-700 animate-pulse flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-slate-700 border-t-blue-500 rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-slate-400">Loading Editor...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-slate-900 rounded-xl border border-slate-700 shadow-2xl overflow-hidden">
      {/* Editor Toolbar */}
      <div className="bg-slate-800 border-b border-slate-700 p-4 flex flex-wrap items-center gap-3">
        <div className="text-lg font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
          Editor.js
        </div>

        <div className="flex-1" />

        <button
          onClick={handleClear}
          className="px-4 py-2 bg-slate-700 hover:bg-slate-600 text-white rounded-lg font-medium transition-colors flex items-center gap-2"
          disabled={isSaving}
        >
          <span>🗑️</span>
          Clear
        </button>

        <button
          onClick={handleSave}
          disabled={isSaving}
          className="px-6 py-2 bg-gradient-to-r from-green-600 to-teal-600 hover:opacity-90 text-white rounded-lg font-medium transition-all flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isSaving ? (
            <>
              <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              Saving...
            </>
          ) : (
            <>
              <span>💾</span>
              Save Content
            </>
          )}
        </button>
      </div>

      {/* Editor Container */}
      <div id={holder} className="min-h-[500px] bg-slate-900 p-6" />

      {/* Editor Stats */}
      <div className="bg-slate-800 border-t border-slate-700 p-4 flex flex-wrap items-center justify-between text-sm text-slate-400">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
            Auto-save enabled
          </div>
          <div>
            Powered by <span className="text-blue-400">Editor.js</span>
          </div>
        </div>

        <div className="flex items-center gap-6">
          <div className="flex items-center gap-2">
            <span className="text-blue-400">📁</span>
            <span>Cloudinary Storage</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-green-400">🔒</span>
            <span>Secure Uploads</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EditorComponent;
