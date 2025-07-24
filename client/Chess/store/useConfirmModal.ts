import { create } from "zustand";

interface ConfirmModalStore {
    isConfirmModalOpen: boolean;
    setIsConfirmModalOpen: (isConfirmModalOpen: boolean) => void;
}

export const useConfirmModalStore = create<ConfirmModalStore>((set) => ({
    isConfirmModalOpen: false,
    setIsConfirmModalOpen: (isConfirmModalOpen) => set({ isConfirmModalOpen }),
}))