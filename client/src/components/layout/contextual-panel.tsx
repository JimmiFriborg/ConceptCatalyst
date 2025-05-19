import { ReactNode } from "react";
import { X } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";

interface ContextualPanelProps {
  children: ReactNode;
  title: string;
  isOpen: boolean;
  onClose: () => void;
  className?: string;
}

export function ContextualPanel({
  children,
  title,
  isOpen,
  onClose,
  className
}: ContextualPanelProps) {
  return (
    <div
      className={cn(
        "fixed top-16 right-0 w-80 md:w-96 h-[calc(100vh-4rem)] bg-white dark:bg-gray-800 shadow-lg border-l border-gray-200 dark:border-gray-700 transition-transform duration-300 ease-in-out z-10",
        isOpen ? "translate-x-0" : "translate-x-full",
        className
      )}
    >
      <div className="flex justify-between items-center px-4 py-3 border-b border-gray-200 dark:border-gray-700">
        <h3 className="font-medium text-gray-900 dark:text-white">{title}</h3>
        <Button
          variant="ghost"
          size="sm"
          onClick={onClose}
          className="h-8 w-8 p-0"
        >
          <X className="h-4 w-4" />
          <span className="sr-only">Close panel</span>
        </Button>
      </div>
      <ScrollArea className="h-[calc(100%-3.5rem)]">
        <div className="p-4">{children}</div>
      </ScrollArea>
    </div>
  );
}