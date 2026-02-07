export function validatePostData(data) {
  const errors = [];

  if (!data.title?.trim()) {
    errors.push("Title is required");
  }

  if (!data.slug?.trim()) {
    errors.push("Slug is required");
  }

  if (!data.content?.blocks || data.content.blocks.length === 0) {
    errors.push("Content is required");
  }

  // Validate slug format
  const slugRegex = /^[a-z0-9\-]+$/;
  if (data.slug && !slugRegex.test(data.slug)) {
    errors.push(
      "Slug can only contain lowercase letters, numbers, and hyphens",
    );
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
}

export function generateSlug(title) {
  return title
    .toLowerCase()
    .replace(/[^\w\s]/gi, "")
    .replace(/\s+/g, "-")
    .substring(0, 60);
}

export function generateExcerpt(content, length = 150) {
  if (!content?.blocks) return "";

  const textBlocks = content.blocks
    .filter((block) => block.type === "paragraph")
    .map((block) => block.data.text)
    .join(" ")
    .replace(/<[^>]*>/g, "")
    .substring(0, length)
    .trim();

  return textBlocks + (textBlocks.length >= length ? "..." : "");
}

// API call wrapper
export async function apiRequest(endpoint, method = "GET", data = null) {
  const options = {
    method,
    headers: {
      "Content-Type": "application/json",
    },
    credentials: "include",
  };

  if (data && (method === "POST" || method === "PUT")) {
    options.body = JSON.stringify(data);
  }

  try {
    const response = await fetch(endpoint, options);
    const result = await response.json();

    if (!response.ok) {
      throw new Error(result.error || "API request failed");
    }

    return result;
  } catch (error) {
    console.error("API request error:", error);
    throw error;
  }
}
