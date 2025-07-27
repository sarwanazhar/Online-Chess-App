import { create } from 'zustand';

interface CreateGameModalStore {
  isCreateGameModalOpen: boolean;
  setIsCreateGameModalOpen: (isOpen: boolean) => void;
}

export const useCreateGameModalStore = create<CreateGameModalStore>((set) => ({
  isCreateGameModalOpen: false,
  setIsCreateGameModalOpen: (isOpen) => set({ isCreateGameModalOpen: isOpen }),
})); 