// @ts-nocheck
import { create } from "zustand";
interface AppState { sidebarOpen: boolean; toggleSidebar: () => void; }
export const useAppStore = create<AppState>((set) => ({
  sidebarOpen: false,
  toggleSidebar: () => set((s) => ({ sidebarOpen: !s.sidebarOpen })),
}));
