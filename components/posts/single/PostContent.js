import EditorFallback from "@/components/EditorFallback";
import { sanitizeEditorData } from "@/utils/editor-sanitizer";
import { ErrorBoundary } from "next/dist/client/components/error-boundary";
import dynamic from "next/dynamic";

const EditorReadOnly = dynamic(() => import("@/components/EditorReadOnly"), {
  ssr: false,
  loading: () => (
    <div className="min-h-[200px] bg-slate-900 rounded-xl border border-slate-700 animate-pulse"></div>
  ),
});

const PostContent = ({ content }) => {
  // Sanitize data sebelum render
  const sanitizedContent = sanitizeEditorData(content);

  if (!content || !content.blocks || content.blocks.length === 0) {
    return (
      <div className="bg-slate-800/50 backdrop-blur-sm rounded-xl border border-slate-700/50 p-8 text-center">
        <div className="text-4xl mb-4">📄</div>
        <h3 className="text-xl font-bold mb-2">No Content</h3>
        <p className="text-slate-400">
          This post doesn't have any content yet.
        </p>
      </div>
    );
  }

  return (
    <div className="bg-slate-800/50 backdrop-blur-sm rounded-xl border border-slate-700/50 p-6">
      <ErrorBoundary
        fallback={
          <div>
            <div className="text-red-400 mb-4">
              Failed to render content with Editor.js. Showing fallback view.
            </div>
            <EditorFallback content={content} />
          </div>
        }
      />

      <div className="prose prose-invert max-w-none">
        <EditorReadOnly data={sanitizedContent} holder="post-content-editor" />
      </div>

      {/* Custom CSS untuk read-only editor */}
      <style jsx global>{`
        .editor-readonly .ce-block__content {
          max-width: 100% !important;
        }

        .editor-readonly .codex-editor {
          background: transparent !important;
        }

        .editor-readonly .ce-toolbar {
          display: none !important;
        }

        .editor-readonly .ce-paragraph {
          font-size: 1.125rem;
          line-height: 1.75;
          color: #cbd5e1;
          margin-bottom: 1.5rem;
        }

        .editor-readonly h1,
        .editor-readonly h2,
        .editor-readonly h3,
        .editor-readonly h4 {
          color: #ffffff;
          font-weight: bold;
          margin-top: 2rem;
          margin-bottom: 1rem;
        }

        .editor-readonly h1 {
          font-size: 2.5rem;
          border-bottom: 2px solid #475569;
          padding-bottom: 0.5rem;
        }

        .editor-readonly h2 {
          font-size: 2rem;
        }

        .editor-readonly h3 {
          font-size: 1.5rem;
        }

        .editor-readonly .ce-code {
          background: #1e293b !important;
          border: 1px solid #475569 !important;
          border-radius: 0.5rem;
          padding: 1rem !important;
          margin: 1rem 0;
        }

        .editor-readonly .ce-code__textarea {
          color: #cbd5e1 !important;
          font-family: "Monaco", "Menlo", "Ubuntu Mono", monospace !important;
        }

        .editor-readonly .cdx-quote {
          border-left: 4px solid #3b82f6 !important;
          padding-left: 1.5rem !important;
          color: #94a3b8 !important;
          font-style: italic !important;
        }

        .editor-readonly .cdx-list {
          color: #cbd5e1 !important;
        }

        .editor-readonly .cdx-checklist__item-text {
          color: #cbd5e1 !important;
        }

        .editor-readonly .tc-table {
          border: 1px solid #475569 !important;
        }

        .editor-readonly .tc-row {
          border-bottom: 1px solid #475569 !important;
        }

        .editor-readonly .tc-cell {
          border-right: 1px solid #475569 !important;
          color: #cbd5e1 !important;
        }

        .editor-readonly .image-tool__image {
          border-radius: 0.75rem;
          overflow: hidden;
          margin: 2rem 0;
        }

        .editor-readonly .image-tool__caption {
          text-align: center;
          color: #94a3b8;
          font-size: 0.875rem;
          margin-top: 0.5rem;
        }
      `}</style>
    </div>
  );
};

export default PostContent;
