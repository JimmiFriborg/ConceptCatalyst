import { ReactNode } from "react";
import { Link, useLocation } from "wouter";
import { cn } from "@/lib/utils";
import { 
  Home, 
  Lightbulb, 
  FolderKanban, 
  Settings,
  PlusCircle,
  Database,
  Sparkles
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { SimpleProjectWizard } from "@/components/simple-project-wizard";
import { useState } from "react";

interface MainLayoutProps {
  children: ReactNode;
}

export function MainLayout({ children }: MainLayoutProps) {
  const [location] = useLocation();
  const [isAddProjectOpen, setIsAddProjectOpen] = useState(false);

  const navigation = [
    { name: "Dashboard", href: "/", icon: Home },
    { name: "Concepts", href: "/concepts", icon: Lightbulb },
    { name: "Projects", href: "/projects", icon: FolderKanban },
    { name: "Feature Bank", href: "/feature-bank", icon: Database },
    { name: "AI Tools", href: "/ai-tools", icon: Sparkles },
    { name: "Settings", href: "/settings", icon: Settings },
  ];

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex flex-col">
      {/* Top navigation */}
      <header className="bg-white dark:bg-gray-800 shadow z-10">
        <div className="mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            {/* Logo */}
            <div className="flex-shrink-0">
              <h1 className="text-xl font-bold text-gray-900 dark:text-white">
                <span className="text-primary">Feature</span>Priority AI
              </h1>
            </div>
            
            {/* Desktop Navigation */}
            <div className="hidden md:flex md:items-center md:space-x-4">
              {navigation.map((item) => {
                const Icon = item.icon;
                const isActive = 
                  item.href === "/" 
                    ? location === "/" 
                    : location.startsWith(item.href);
                
                return (
                  <Link 
                    key={item.name} 
                    href={item.href}
                    className={cn(
                      "flex items-center px-3 py-2 text-sm font-medium rounded-md",
                      isActive
                        ? "text-primary bg-primary/10"
                        : "text-gray-600 hover:text-gray-900 dark:text-gray-300 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-700"
                    )}
                  >
                    <Icon className="mr-2 h-4 w-4" />
                    {item.name}
                  </Link>
                );
              })}
            </div>
            
            {/* Mobile Navigation */}
            <div className="flex md:hidden justify-center flex-1 overflow-x-auto py-2">
              <div className="flex space-x-3">
                {navigation.map((item) => {
                  const Icon = item.icon;
                  const isActive = 
                    item.href === "/" 
                      ? location === "/" 
                      : location.startsWith(item.href);
                  
                  return (
                    <Link 
                      key={item.name} 
                      href={item.href}
                      className={cn(
                        "flex flex-col items-center justify-center px-2 py-1 text-xs font-medium rounded-md",
                        isActive
                          ? "text-primary bg-primary/10"
                          : "text-gray-600 hover:text-gray-900 dark:text-gray-300 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-700"
                      )}
                    >
                      <Icon className="h-4 w-4 mb-1" />
                      <span className="sr-only md:not-sr-only">{item.name}</span>
                    </Link>
                  );
                })}
              </div>
            </div>
            
            {/* Add Button */}
            <div className="flex-shrink-0">
              <Link href="/new">
                <Button size="sm" className="md:ml-4">
                  <PlusCircle className="h-4 w-4 md:mr-2" />
                  <span className="hidden md:inline">Add</span>
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </header>

      {/* Main content */}
      <main className="flex-1">
        {children}
      </main>

      <SimpleProjectWizard
        open={isAddProjectOpen}
        onOpenChange={setIsAddProjectOpen}
      />
    </div>
  );
}