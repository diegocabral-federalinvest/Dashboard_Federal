"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { ReactNode } from "react";
import { Button } from "@/components/ui/button";
import { ArrowUpRight } from "lucide-react";
import Link from "next/link";

interface TableCardProps {
  title: string;
  description?: string;
  children: ReactNode;
  className?: string;
  viewAllUrl?: string;
  viewAllLabel?: string;
  filter?: ReactNode;
}

export function TableCard({
  title,
  description,
  children,
  className,
  viewAllUrl,
  viewAllLabel = "Ver todos",
  filter,
}: TableCardProps) {
  return (
    <Card className={cn("overflow-hidden", className)}>
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <div className="space-y-1">
          <CardTitle className="text-base font-medium">{title}</CardTitle>
          {description && (
            <CardDescription>{description}</CardDescription>
          )}
        </div>
        <div className="flex items-center gap-2">
          {filter}
          {viewAllUrl && (
            <Button variant="ghost" size="sm" className="gap-1" asChild>
              <Link href={viewAllUrl}>
                {viewAllLabel}
                <ArrowUpRight className="h-4 w-4" />
              </Link>
            </Button>
          )}
        </div>
      </CardHeader>
      <CardContent>
        {children}
      </CardContent>
    </Card>
  );
} 