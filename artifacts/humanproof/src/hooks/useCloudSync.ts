// Unified Sync Hook - Coordinates cloud sync for all features
import { useEffect, useRef } from "react";
import { journalService } from "../services/journalService";
import { scoreSyncService } from "../services/scoreSyncService";
import type { JournalEntry } from "../components/HumanEdgeJournal";

interface SyncOptions {
  userId?: string;
  journalEntries?: JournalEntry[];
  scoreEntries?: any[];
  syncInterval?: number;
  enabled?: boolean;
}

export function useCloudSync(options: SyncOptions = {}) {
  const {
    userId,
    journalEntries = [],
    scoreEntries = [],
    syncInterval = 60000,
    enabled = true,
  } = options;
  const lastJournalHash = useRef<string | null>(null);
  const lastScoreHash = useRef<string | null>(null);

  useEffect(() => {
    if (!enabled || !userId) return;

    journalService.setUserId(userId);
    scoreSyncService.setUserId(userId);
  }, [userId, enabled]);

  useEffect(() => {
    if (!enabled || !userId || !journalService.isConfigured()) return;

    const hash = JSON.stringify(journalEntries.map((e) => e.id).sort());
    if (hash === lastJournalHash.current) return;

    lastJournalHash.current = hash;
    journalService.syncFromLocal(journalEntries).catch(console.error);
  }, [journalEntries, enabled, userId]);

  useEffect(() => {
    if (!enabled || !userId || !scoreSyncService.isConfigured()) return;

    const hash = JSON.stringify(scoreEntries.map((e) => e.id).sort());
    if (hash === lastScoreHash.current) return;

    lastScoreHash.current = hash;
    scoreSyncService.syncFromLocal(scoreEntries).catch(console.error);
  }, [scoreEntries, enabled, userId]);

  return {
    isJournalConfigured: journalService.isConfigured(),
    isScoreConfigured: scoreSyncService.isConfigured(),
  };
}

export function useSyncStatus() {
  return {
    journal: journalService.isConfigured(),
    scores: scoreSyncService.isConfigured(),
  };
}
