// Key untuk localStorage berdasarkan user ID
const getStorageKey = (userId) => `draft_${userId}`;

// Simpan draft ke localStorage
export const saveDraftToLocalStorage = (userId, postData) => {
  try {
    const storageKey = getStorageKey(userId);
    const draftData = {
      ...postData,
      lastSaved: new Date().toISOString(),
      version: "1.0",
    };

    localStorage.setItem(storageKey, JSON.stringify(draftData));
    return { success: true, timestamp: draftData.lastSaved };
  } catch (error) {
    console.error("Failed to save draft to localStorage:", error);
    return { success: false, error: error.message };
  }
};

// Load draft dari localStorage
export const loadDraftFromLocalStorage = (userId) => {
  try {
    const storageKey = getStorageKey(userId);
    const draftData = localStorage.getItem(storageKey);

    if (!draftData) {
      return { success: true, data: null };
    }

    const parsedData = JSON.parse(draftData);

    // Validasi data
    if (!parsedData.title || !parsedData.content) {
      clearDraftFromLocalStorage(userId);
      return { success: true, data: null };
    }

    return {
      success: true,
      data: parsedData,
      timestamp: parsedData.lastSaved,
    };
  } catch (error) {
    console.error("Failed to load draft from localStorage:", error);
    clearDraftFromLocalStorage(userId);
    return { success: false, error: error.message, data: null };
  }
};

// Hapus draft dari localStorage
export const clearDraftFromLocalStorage = (userId) => {
  try {
    const storageKey = getStorageKey(userId);
    localStorage.removeItem(storageKey);
    return { success: true };
  } catch (error) {
    console.error("Failed to clear draft from localStorage:", error);
    return { success: false, error: error.message };
  }
};

// Cek jika ada draft yang tersimpan
export const hasDraftInLocalStorage = (userId) => {
  try {
    const storageKey = getStorageKey(userId);
    const draftData = localStorage.getItem(storageKey);
    return !!draftData;
  } catch (error) {
    return false;
  }
};

// Dapatkan timestamp terakhir draft disimpan
export const getLastSavedTime = (userId) => {
  try {
    const storageKey = getStorageKey(userId);
    const draftData = localStorage.getItem(storageKey);

    if (!draftData) return null;

    const parsedData = JSON.parse(draftData);
    return parsedData.lastSaved ? new Date(parsedData.lastSaved) : null;
  } catch (error) {
    return null;
  }
};

// Format waktu untuk display
export const formatLastSavedTime = (timestamp) => {
  if (!timestamp) return "Never saved";

  const now = new Date();
  const savedTime = new Date(timestamp);
  const diffMs = now - savedTime;
  const diffMins = Math.floor(diffMs / 60000);

  if (diffMins < 1) return "Just now";
  if (diffMins === 1) return "1 minute ago";
  if (diffMins < 60) return `${diffMins} minutes ago`;

  const diffHours = Math.floor(diffMins / 60);
  if (diffHours === 1) return "1 hour ago";
  if (diffHours < 24) return `${diffHours} hours ago`;

  return savedTime.toLocaleString();
};
