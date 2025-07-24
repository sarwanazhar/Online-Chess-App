import { create } from 'zustand'

interface PlayWithAIStore {
  isPlayWithAI: boolean;
  setIsPlayWithAI: (isPlayWithAI: boolean) => void;
}

export const usePlayWithAIStore = create<PlayWithAIStore>((set) => ({
  isPlayWithAI: false,
  setIsPlayWithAI: (isPlayWithAI) => set({ isPlayWithAI }),
})) 