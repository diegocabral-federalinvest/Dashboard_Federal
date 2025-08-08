
"use client";

import { useGetInvestors } from "@/features/investments/api/use-get-investors";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";

type Props = {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  disabled?: boolean;
};

export const InvestorMultiSelect = ({
  value,
  onChange,
  placeholder,
  disabled,
}: Props) => {
  const { data: investors, isLoading } = useGetInvestors();

  const handleChange = (newValue: string) => {
    onChange(newValue);
  };

  if (isLoading) {
    return (
      <div className="flex items-center gap-x-2">
        <Skeleton className="h-8 w-full" />
      </div>
    );
  }

  return (
    <Select
      value={value}
      onValueChange={handleChange}
      disabled={disabled || isLoading}
    >
      <SelectTrigger className="w-full">
        <SelectValue placeholder={placeholder} />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="all">Todos os investidores</SelectItem>
        {investors?.map((investor) => (
          <SelectItem key={investor.id} value={investor.id}>
            {investor.name}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
};
