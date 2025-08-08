"use client";


import { useMountedState } from "react-use";


// Import from features/expenses
import NewExpenseSheet from "@/features/expenses/components/new-expense-sheet";
import EditExpenseSheet from "@/features/expenses/components/edit-expense-sheet";

const SheetProvider = () => {
  const isMounted = useMountedState();

  if (!isMounted) return null;
  
  return (
    <>
   
      <NewExpenseSheet />
      <EditExpenseSheet />
    </>
  );
};

export default SheetProvider;