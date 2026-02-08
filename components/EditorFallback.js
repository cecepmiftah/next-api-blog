// components/EditorFallback.js
const EditorFallback = ({ content }) => {
  if (!content?.blocks) return null;

  const renderBlock = (block) => {
    switch (block.type) {
      case "paragraph":
        return (
          <p className="mb-4 text-slate-300 text-lg leading-relaxed">
            {block.data.text}
          </p>
        );

      case "header":
        const HeadingTag = `h${block.data.level}`;
        return (
          <HeadingTag className="mt-8 mb-4 font-bold text-white">
            {block.data.text}
          </HeadingTag>
        );

      case "image":
        return (
          <div className="my-6">
            <img
              src={block.data.url || "/placeholder-image.jpg"}
              alt={block.data.caption || "Image"}
              className="max-w-full h-auto rounded-lg"
              onError={(e) => {
                e.target.onerror = null;
                e.target.src = "/placeholder-image.jpg";
              }}
            />
            {block.data.caption && (
              <p className="text-center text-slate-500 text-sm mt-2 italic">
                {block.data.caption}
              </p>
            )}
          </div>
        );

      case "attaches":
        const file = block.data.file;
        return (
          <div className="my-4 p-4 bg-slate-800 rounded-lg">
            <a
              href={file?.url || "#"}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-3 text-blue-400 hover:text-blue-300"
            >
              <span className="text-2xl">📎</span>
              <div>
                <div className="font-medium">
                  {block.data.title || file?.name || "Download"}
                </div>
                {file?.size && (
                  <div className="text-sm text-slate-500">
                    {formatFileSize(file.size)}
                  </div>
                )}
              </div>
            </a>
          </div>
        );

      case "list":
        const ListTag = block.data.style === "ordered" ? "ol" : "ul";
        return (
          <ListTag className="mb-4 ml-6 text-slate-300">
            {block.data.items.map((item, index) => (
              <li key={index} className="mb-2">
                {item}
              </li>
            ))}
          </ListTag>
        );

      case "quote":
        return (
          <blockquote className="border-l-4 border-blue-500 pl-4 my-6 italic text-slate-400">
            {block.data.text}
            {block.data.caption && (
              <footer className="text-sm mt-2">— {block.data.caption}</footer>
            )}
          </blockquote>
        );

      case "code":
        return (
          <pre className="bg-slate-900 p-4 rounded-lg overflow-x-auto my-4">
            <code className="text-slate-300">{block.data.code}</code>
          </pre>
        );

      default:
        return null;
    }
  };

  const formatFileSize = (bytes) => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
  };

  return (
    <div className="editor-fallback">
      {content.blocks.map((block, index) => (
        <div key={index}>{renderBlock(block)}</div>
      ))}
    </div>
  );
};

export default EditorFallback;
