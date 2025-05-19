import { ReactNode } from "react";
import { cn } from "@/lib/utils";
import { ScrollArea } from "@/components/ui/scroll-area";

interface NavigationItem {
  icon: React.ElementType;
  label: string;
  active?: boolean;
  onClick: () => void;
}

interface NavigationPanelProps {
  title: string;
  items: NavigationItem[];
  footer?: ReactNode;
  className?: string;
}

export function NavigationPanel({
  title,
  items,
  footer,
  className
}: NavigationPanelProps) {
  return (
    <div className={cn("h-full flex flex-col bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700", className)}>
      <div className="p-4 border-b border-gray-200 dark:border-gray-700">
        <h2 className="text-lg font-medium text-gray-900 dark:text-white">{title}</h2>
      </div>
      <ScrollArea className="flex-1">
        <nav className="space-y-1 p-2">
          {items.map((item, i) => {
            const Icon = item.icon;
            return (
              <button
                key={i}
                onClick={item.onClick}
                className={cn(
                  "flex items-center w-full px-3 py-2 text-sm font-medium rounded-md",
                  item.active
                    ? "bg-primary/10 text-primary"
                    : "text-gray-600 hover:bg-gray-100 hover:text-gray-900 dark:text-gray-300 dark:hover:bg-gray-700 dark:hover:text-white"
                )}
              >
                <Icon className="mr-3 h-5 w-5 flex-shrink-0" />
                <span className="truncate">{item.label}</span>
              </button>
            );
          })}
        </nav>
      </ScrollArea>
      {footer && <div className="p-4 border-t border-gray-200 dark:border-gray-700">{footer}</div>}
    </div>
  );
}