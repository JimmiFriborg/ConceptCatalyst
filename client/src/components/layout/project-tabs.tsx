import { ReactNode, useState } from "react";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { cn } from "@/lib/utils";
import {
  LayoutDashboard,
  ListChecks,
  Grid3x3,
  LineChart,
  GitFork,
  Code
} from "lucide-react";

export type ProjectTabKey = 
  | "overview" 
  | "features" 
  | "categories" 
  | "evaluation" 
  | "branches" 
  | "repository";

interface ProjectTab {
  key: ProjectTabKey;
  label: string;
  icon: React.ElementType;
  content: ReactNode;
}

interface ProjectTabsProps {
  tabs: ProjectTab[];
  defaultTab?: ProjectTabKey;
  className?: string;
  onTabChange?: (tab: ProjectTabKey) => void;
}

export function ProjectTabs({ 
  tabs, 
  defaultTab = "overview", 
  className,
  onTabChange 
}: ProjectTabsProps) {
  const [activeTab, setActiveTab] = useState<ProjectTabKey>(defaultTab);

  const handleTabChange = (tab: string) => {
    const newTab = tab as ProjectTabKey;
    setActiveTab(newTab);
    if (onTabChange) {
      onTabChange(newTab);
    }
  };

  return (
    <Tabs
      defaultValue={defaultTab}
      value={activeTab}
      onValueChange={handleTabChange}
      className={cn("w-full", className)}
    >
      <TabsList className="grid grid-cols-6 mb-4 w-full max-w-3xl">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          return (
            <TabsTrigger
              key={tab.key}
              value={tab.key}
              className="flex items-center gap-2"
            >
              <Icon className="h-4 w-4" />
              <span className="hidden sm:inline">{tab.label}</span>
            </TabsTrigger>
          );
        })}
      </TabsList>
      {tabs.map((tab) => (
        <TabsContent
          key={tab.key}
          value={tab.key}
          className="mt-0 border-0 p-0"
        >
          {tab.content}
        </TabsContent>
      ))}
    </Tabs>
  );
}

export const defaultProjectTabs: Omit<ProjectTab, "content">[] = [
  {
    key: "overview",
    label: "Overview",
    icon: LayoutDashboard
  },
  {
    key: "features",
    label: "Features",
    icon: ListChecks
  },
  {
    key: "categories",
    label: "Categories",
    icon: Grid3x3
  },
  {
    key: "evaluation",
    label: "Evaluation",
    icon: LineChart
  },
  {
    key: "branches",
    label: "Branches",
    icon: GitFork
  },
  {
    key: "repository",
    label: "Repository",
    icon: Code
  }
];