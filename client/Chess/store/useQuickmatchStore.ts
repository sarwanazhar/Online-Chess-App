import { create } from "zustand";

interface QuickmatchStore {
    isQuickmatch: boolean;
    setIsQuickmatch: (isQuickmatch: boolean) => void;
}

export const useQuickmatchStore = create<QuickmatchStore>((set) => ({
    isQuickmatch: false,
    setIsQuickmatch: (isQuickmatch) => set({ isQuickmatch }),
}))