import { create } from "zustand";

type OpenExpenseStore = {
  isOpen: boolean;
  id: string;
  onOpen: (id: string) => void;
  onClose: () => void;
};

export const useOpenExpense = create<OpenExpenseStore>((set) => ({
  isOpen: false,
  id: "",
  onOpen: (id: string) => set({ isOpen: true, id }),
  onClose: () => set({ isOpen: false, id: "" }),
})); 