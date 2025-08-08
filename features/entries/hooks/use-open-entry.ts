import { create } from "zustand";

type OpenEntryStore = {
  isOpen: boolean;
  id: string;
  onOpen: (id: string) => void;
  onClose: () => void;
};

  export const useOpenEntry = create<OpenEntryStore>((set) => ({
    isOpen: false,
  id: "",
  onOpen: (id: string) => set({ isOpen: true, id }),
  onClose: () => set({ isOpen: false, id: "" }),
})); 