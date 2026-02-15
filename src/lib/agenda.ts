import { Session } from './types';
import { dedupedSessions } from '@/data/sessions';

const STORAGE_KEY = 'summit-my-agenda';

export function getSavedSessionIds(): string[] {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    return stored ? JSON.parse(stored) : [];
  } catch {
    return [];
  }
}

export function saveSessionId(id: string): void {
  const ids = getSavedSessionIds();
  if (!ids.includes(id)) {
    ids.push(id);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(ids));
  }
}

export function removeSessionId(id: string): void {
  const ids = getSavedSessionIds().filter(i => i !== id);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(ids));
}

export function isSessionSaved(id: string): boolean {
  return getSavedSessionIds().includes(id);
}

export function getSavedSessions(): Session[] {
  const ids = new Set(getSavedSessionIds());
  return dedupedSessions.filter(s => ids.has(s.id));
}

export function exportAgendaAsText(): string {
  const sessions = getSavedSessions();
  if (sessions.length === 0) return 'No sessions saved.';

  const grouped = new Map<string, Session[]>();
  sessions.forEach(s => {
    const arr = grouped.get(s.dateLabel) || [];
    arr.push(s);
    grouped.set(s.dateLabel, arr);
  });

  let text = '🇮🇳 My India AI Impact Summit 2026 Agenda\n\n';
  grouped.forEach((sess, day) => {
    text += `📅 ${day}\n`;
    sess.sort((a, b) => a.startTime.localeCompare(b.startTime));
    sess.forEach(s => {
      text += `  ${s.startTime} - ${s.endTime} | ${s.title}\n`;
      text += `  📍 ${s.room}\n`;
      if (s.speakers.length) text += `  🎤 ${s.speakers.join(', ')}\n`;
      text += '\n';
    });
  });

  return text;
}
