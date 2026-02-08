// utils/editor-sanitizer.js
export const sanitizeEditorData = (data) => {
  if (!data || !data.blocks) return data;

  const sanitizedBlocks = data.blocks.map((block) => {
    // Handle image blocks
    if (block.type === "image") {
      if (!block.data.url) {
        return {
          ...block,
          data: {
            ...block.data,
            url: block.data.file?.url || "/placeholder-image.jpg",
            caption: block.data.caption || "Image not available",
          },
        };
      }

      // Ensure Cloudinary URLs are secure
      if (block.data.url && block.data.url.includes("cloudinary")) {
        return {
          ...block,
          data: {
            ...block.data,
            url: block.data.url.replace("http://", "https://"),
          },
        };
      }
    }

    // Handle attachment blocks
    if (block.type === "attaches") {
      if (!block.data.file?.url) {
        return {
          ...block,
          data: {
            ...block.data,
            file: {
              url: "#",
              name: "File not available",
              size: 0,
            },
          },
        };
      }
    }

    return block;
  });

  return {
    ...data,
    blocks: sanitizedBlocks,
  };
};
