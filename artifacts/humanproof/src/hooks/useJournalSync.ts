// PHASE-1: Sync Hook
// File: artifacts/humanproof/src/hooks/useJournalSync.ts
// Human Edge Journal - Automatic background sync

import { useEffect, useCallback, useRef } from "react";
import { journalService } from "../services/journalService";
import type { JournalEntry } from "../components/HumanEdgeJournal";

interface UseJournalSyncOptions {
  userId?: string | null;
  syncInterval?: number; // milliseconds, default 60000
  onSyncComplete?: (result: { success: boolean; synced: number }) => void;
}

export function useJournalSync(
  entries: JournalEntry[],
  options: UseJournalSyncOptions = {},
) {
  const { userId, syncInterval = 60000, onSyncComplete } = options;
  const lastSyncRef = useRef<string | null>(null);
  const isSyncingRef = useRef(false);

  // Set user ID when available
  useEffect(() => {
    if (userId) {
      journalService.setUserId(userId);
    }
  }, [userId]);

  // Sync function
  const syncNow = useCallback(async () => {
    if (!userId || isSyncingRef.current) {
      return;
    }

    // Check if entries changed
    const currentHash = JSON.stringify(entries.map((e) => e.id).sort());
    if (currentHash === lastSyncRef.current) {
      return;
    }

    isSyncingRef.current = true;

    try {
      const result = await journalService.syncFromLocal(entries);
      lastSyncRef.current = currentHash;
      onSyncComplete?.(result);
    } catch (error) {
      console.error("[useJournalSync] Sync failed:", error);
      onSyncComplete?.({ success: false, synced: 0 });
    } finally {
      isSyncingRef.current = false;
    }
  }, [userId, entries, onSyncComplete]);

  // Auto-sync on interval
  useEffect(() => {
    if (!userId || !journalService.isConfigured()) {
      return;
    }

    const interval = setInterval(syncNow, syncInterval);

    // Also try to sync on mount
    syncNow();

    return () => clearInterval(interval);
  }, [userId, syncInterval, syncNow]);

  // Sync on significant changes (new entry, delete)
  useEffect(() => {
    if (!userId || !journalService.isConfigured()) {
      return;
    }

    // Debounce sync on changes
    const timeout = setTimeout(syncNow, 2000);
    return () => clearTimeout(timeout);
  }, [entries.length, entries.map((e) => e.id).join(",")]);

  return {
    syncNow,
    isConfigured: journalService.isConfigured(),
  };
}

// Hook for checking cloud status
export function useJournalCloudStatus() {
  return {
    isConfigured: journalService.isConfigured(),
    loadFromCloud: () => journalService.loadEntries(),
  };
}
