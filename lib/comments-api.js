export const fetchComments = async (queryParams = "") => {
  try {
    const response = await fetch(`/api/comments?${queryParams}`, {
      cache: "no-store",
      credentials: "include",
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error("Failed to fetch comments:", error);
    return {
      success: false,
      error: error.message || "Failed to fetch comments",
      data: [],
    };
  }
};

export const postComment = async (commentData) => {
  try {
    const response = await fetch("/api/comments", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(commentData),
      credentials: "include",
    });

    const data = await response.json();
    return data;
  } catch (error) {
    console.error("Failed to post comment:", error);
    return {
      success: false,
      error: error.message || "Failed to post comment",
    };
  }
};

export const updateComment = async (commentId, updateData) => {
  try {
    const response = await fetch(`/api/comments/${commentId}`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(updateData),
      credentials: "include",
    });

    const data = await response.json();
    return data;
  } catch (error) {
    console.error("Failed to update comment:", error);
    return {
      success: false,
      error: error.message || "Failed to update comment",
    };
  }
};

export const deleteComment = async (commentId) => {
  try {
    const response = await fetch(`/api/comments/${commentId}`, {
      method: "DELETE",
      credentials: "include",
    });

    const data = await response.json();
    return data;
  } catch (error) {
    console.error("Failed to delete comment:", error);
    return {
      success: false,
      error: error.message || "Failed to delete comment",
    };
  }
};

export const likeComment = async (commentId, action = "like") => {
  try {
    const response = await fetch(`/api/comments/${commentId}/like`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ action }),
      credentials: "include",
    });

    const data = await response.json();
    return data;
  } catch (error) {
    console.error("Failed to like comment:", error);
    return {
      success: false,
      error: error.message || "Failed to like comment",
    };
  }
};
