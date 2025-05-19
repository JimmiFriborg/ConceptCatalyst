import { ReactNode } from "react";
import { Link, useLocation } from "wouter";
import { cn } from "@/lib/utils";
import { 
  Home, 
  Lightbulb, 
  FolderKanban, 
  Settings,
  PlusCircle,
  Database
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
    { name: "Settings", href: "/settings", icon: Settings },
  ];

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex flex-col">
      {/* Top navigation */}
      <header className="bg-white dark:bg-gray-800 shadow z-10">
        <div className="mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <h1 className="text-xl font-bold text-gray-900 dark:text-white">
                <span className="text-primary">Feature</span>Priority AI
              </h1>
              <nav className="ml-10 flex space-x-8">
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
              </nav>
            </div>
            <div>
              <Link href="/new">
                <Button>
                  <PlusCircle className="mr-2 h-4 w-4" />
                  Add
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