import type { StateCreator } from 'zustand';

import type {
  SessionActions,
  SessionsData,
  SessionState,
  Session
} from '../types';

type SessionSlice = SessionState & SessionActions;

export const createSessionSlice: StateCreator<
  SessionSlice,
  [],
  [],
  SessionSlice
> = set => ({
  // Initial state
  sessions: [],
  sessionsData: null,

  // Actions
  setSessions: (sessions: Session[]) => {
    set({ sessions });
  },

  setSessionsData: (sessionsData: SessionsData) => {
    set({
      sessionsData,
      sessions: sessionsData.sessions
    });
  },

  addSession: (session: Session) => {
    set(state => ({
      sessions: [session, ...state.sessions]
    }));
  }
});
