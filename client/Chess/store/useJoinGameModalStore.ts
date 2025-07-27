import { create } from 'zustand'

interface JoinGameModalStore {
  isJoinGameModalOpen: boolean;
  setIsJoinGameModalOpen: (isOpen: boolean) => void;
}

export const useJoinGameModalStore = create<JoinGameModalStore>((set) => ({
  isJoinGameModalOpen: false,
  setIsJoinGameModalOpen: (isOpen) => set({ isJoinGameModalOpen: isOpen }),
})) 