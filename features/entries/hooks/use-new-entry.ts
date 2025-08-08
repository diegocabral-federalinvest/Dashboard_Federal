import { create } from "zustand";

type NewEntryStore = {
  isOpen: boolean;
  onOpen: () => void;
  onClose: () => void;
};

export const useNewEntry = create<NewEntryStore>((set) => ({
  isOpen: false,
  onOpen: () => set({ isOpen: true }),
  onClose: () => set({ isOpen: false }),
})); 