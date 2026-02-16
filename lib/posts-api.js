// Fetch posts dengan berbagai filter
export const fetchPosts = async (queryParams = "") => {
  try {
    const response = await fetch(`/api/posts?${queryParams}`, {
      cache: "no-store",
      credentials: "include",
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error("Failed to fetch posts:", error);
    return {
      success: false,
      error: error.message || "Failed to fetch posts",
      data: [],
    };
  }
};

// Fetch single post
export const fetchPostBySlug = async (slug) => {
  try {
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL}/api/posts/${slug}`,
      {
        credentials: "include",
      },
    );

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error("Failed to fetch post:", error);
    return {
      success: false,
      error: error.message || "Failed to fetch post",
    };
  }
};

// Bulk operations
export const bulkPostAction = async (ids, action) => {
  try {
    const response = await fetch("/api/posts/bulk", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ ids, action }),
      credentials: "include",
    });

    const data = await response.json();
    return data;
  } catch (error) {
    console.error("Bulk operation failed:", error);
    return {
      success: false,
      error: error.message || "Bulk operation failed",
    };
  }
};

// Get post statistics
export const fetchPostStats = async (timeframe = "all") => {
  try {
    const response = await fetch(`/api/posts/bulk?timeframe=${timeframe}`, {
      credentials: "include",
    });

    const data = await response.json();
    return data;
  } catch (error) {
    console.error("Failed to fetch stats:", error);
    return {
      success: false,
      error: error.message || "Failed to fetch stats",
    };
  }
};

// Get categories
export const fetchCategories = async () => {
  try {
    const response = await fetch("/api/posts/categories");

    const data = await response.json();
    return data;
  } catch (error) {
    console.error("Failed to fetch categories:", error);
    return {
      success: false,
      error: error.message || "Failed to fetch categories",
    };
  }
};
