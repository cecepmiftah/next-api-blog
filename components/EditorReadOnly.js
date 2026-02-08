"use client";

import { useEffect, useRef } from "react";
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
import EditorImageToolReadOnly from "@/lib/editor-image-tool-readonly";
import EditorAttachmentToolReadOnly from "@/lib/editor-attachment-tool-readonly";

const EditorReadOnly = ({ data, holder = "editor-readonly" }) => {
  const editorRef = useRef(null);

  useEffect(() => {
    if (!data) return;

    if (!editorRef.current) {
      const editor = new EditorJS({
        holder,
        data,
        readOnly: true,
        tools: {
          paragraph: Paragraph,
          header: Header,
          list: List,
          checklist: Checklist,
          code: Code,
          inlineCode: InlineCode,
          embed: Embed,
          table: Table,
          linkTool: LinkTool,
          delimiter: Delimiter,
          warning: Warning,
          quote: Quote,
          marker: Marker,
          raw: Raw,
          // Gunakan tools read-only khusus
          image: EditorImageToolReadOnly,
          attaches: EditorAttachmentToolReadOnly,
        },
        minHeight: 0,
        onReady: () => {
          console.log("Editor.js is ready in read-only mode");
        },
        onChange: () => {
          // No changes in read-only mode
        },
      });

      editorRef.current = editor;
    }

    return () => {
      if (editorRef.current && editorRef.current.destroy) {
        editorRef.current.destroy();
        editorRef.current = null;
      }
    };
  }, [data, holder]);

  return <div id={holder} className="editor-readonly" />;
};

export default EditorReadOnly;
