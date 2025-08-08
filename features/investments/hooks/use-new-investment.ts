import { create } from "zustand";

interface NewInvestmentStore {
  isOpen: boolean;
  onOpen: () => void;
  onClose: () => void;
}

export const useNewInvestment = create<NewInvestmentStore>((set) => ({
  isOpen: false,
  onOpen: () => set({ isOpen: true }),
  onClose: () => set({ isOpen: false }),
})); 