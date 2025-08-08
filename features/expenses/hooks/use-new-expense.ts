import { create } from "zustand";

type NewExpenseStore = {
  isOpen: boolean;
  onOpen: () => void;
  onClose: () => void;
};

export const useNewExpense = create<NewExpenseStore>((set) => ({
  isOpen: false,
  onOpen: () => set({ isOpen: true }),
  onClose: () => set({ isOpen: false }),
})); 