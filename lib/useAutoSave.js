"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import {
  saveDraftToLocalStorage,
  loadDraftFromLocalStorage,
  clearDraftFromLocalStorage,
  formatLastSavedTime,
} from "@/lib/autoSave";

export const useAutoSave = (userId, initialData = null) => {
  const [lastSaved, setLastSaved] = useState(null);
  const [isAutoSaving, setIsAutoSaving] = useState(false);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [draftExists, setDraftExists] = useState(false);

  // Ref untuk data post (mencegah closure issues)
  const postDataRef = useRef(initialData);
  const userIdRef = useRef(userId);

  // Update ref ketika data berubah
  useEffect(() => {
    postDataRef.current = initialData;
    userIdRef.current = userId;
  }, [initialData, userId]);

  // Load draft yang tersimpan saat component mount
  useEffect(() => {
    if (userId) {
      const loadSavedDraft = async () => {
        const result = await loadDraftFromLocalStorage(userId);
        if (result.success && result.data) {
          setDraftExists(true);
          setLastSaved(result.timestamp);
          return result.data;
        }
        return null;
      };

      loadSavedDraft();
    }
  }, [userId]);

  // Auto-save function
  const autoSave = useCallback(async () => {
    if (!userIdRef.current || !postDataRef.current) return;

    // Cek jika ada data yang valid untuk disimpan
    const { title, content } = postDataRef.current;
    if (!title?.trim() && (!content?.blocks || content.blocks.length === 0)) {
      return;
    }

    setIsAutoSaving(true);

    try {
      const result = await saveDraftToLocalStorage(
        userIdRef.current,
        postDataRef.current,
      );

      if (result.success) {
        setLastSaved(result.timestamp);
        setHasUnsavedChanges(false);
        setDraftExists(true);
      }
    } catch (error) {
      console.error("Auto-save failed:", error);
    } finally {
      setIsAutoSaving(false);
    }
  }, []);

  // Setup auto-save interval
  useEffect(() => {
    if (!userId) return;

    // Auto-save setiap 30 detik
    const interval = setInterval(() => {
      if (hasUnsavedChanges) {
        autoSave();
      }
    }, 30000); // 30 detik

    return () => clearInterval(interval);
  }, [userId, hasUnsavedChanges, autoSave]);

  // Track changes untuk trigger auto-save
  const trackChanges = useCallback(() => {
    setHasUnsavedChanges(true);
  }, []);

  // Debounced auto-save setelah user berhenti mengetik
  const debouncedAutoSave = useCallback(() => {
    if (!hasUnsavedChanges) return;

    // Debounce 2 detik
    const timeout = setTimeout(() => {
      autoSave();
    }, 2000);

    return () => clearTimeout(timeout);
  }, [hasUnsavedChanges, autoSave]);

  // Clear draft setelah berhasil save ke database
  const clearDraft = useCallback(async () => {
    if (!userId) return;

    try {
      await clearDraftFromLocalStorage(userId);
      setDraftExists(false);
      setLastSaved(null);
      setHasUnsavedChanges(false);
      return { success: true };
    } catch (error) {
      console.error("Failed to clear draft:", error);
      return { success: false, error: error.message };
    }
  }, [userId]);

  // Restore draft dari localStorage
  const restoreDraft = useCallback(async () => {
    if (!userId) return null;

    try {
      const result = await loadDraftFromLocalStorage(userId);
      if (result.success && result.data) {
        setDraftExists(true);
        setLastSaved(result.timestamp);
        return result.data;
      }
      return null;
    } catch (error) {
      console.error("Failed to restore draft:", error);
      return null;
    }
  }, [userId]);

  // Format last saved time untuk display
  const formattedLastSaved = lastSaved
    ? formatLastSavedTime(lastSaved)
    : "Never saved";

  return {
    autoSave,
    clearDraft,
    restoreDraft,
    trackChanges,
    debouncedAutoSave,
    lastSaved: formattedLastSaved,
    isAutoSaving,
    hasUnsavedChanges,
    draftExists,
    hasDraft: draftExists,
  };
};
