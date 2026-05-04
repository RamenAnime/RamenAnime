import { create } from "zustand";

interface AppState {
  sidebarOpen: boolean;
  setSidebarOpen: (open: boolean) => void;
  theme: "light" | "dark";
  setTheme: (theme: "light" | "dark") => void;
  notifications: number;
  setNotifications: (count: number) => void;
  cartCount: number;
  setCartCount: (count: number) => void;
}

export const useAppStore = create<AppState>((set) => ({
  sidebarOpen: false,
  setSidebarOpen: (open) => set({ sidebarOpen: open }),
  theme: "dark",
  setTheme: (theme) => set({ theme }),
  notifications: 0,
  setNotifications: (count) => set({ notifications: count }),
  cartCount: 0,
  setCartCount: (count) => set({ cartCount: count }),
}));
