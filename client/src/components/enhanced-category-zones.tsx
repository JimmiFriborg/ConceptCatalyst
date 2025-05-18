import { useState, useEffect } from "react";
import { Rocket, Flag, Target, Sparkles, XCircle, PlusCircle } from "lucide-react";
import { useProject } from "@/context/project-context";
import { updateFeatureCategory } from "@/lib/api";
import { queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Category, Feature } from "@shared/schema";
import { CustomCategoryCreator } from "./custom-category-creator";
import { Button } from "@/components/ui/button";

// Default categories configuration
const DEFAULT_CATEGORIES = [
  {
    id: "mvp",
    name: "MVP (Must Have)",
    description: "Core features required for initial launch",
    icon: <Rocket className="h-7 w-7 text-blue-300 dark:text-blue-500" />,
    color: "#3B82F6", // blue
    colorClass: "category-zone-mvp"
  },
  {
    id: "launch",
    name: "Launch",
    description: "Important features for initial public release",
    icon: <Flag className="h-7 w-7 text-green-300 dark:text-green-500" />,
    color: "#22C55E", // green
    colorClass: "category-zone-launch"
  },
  {
    id: "v1.5",
    name: "Version 1.5",
    description: "Enhancement features for mid-term update",
    icon: <Target className="h-7 w-7 text-purple-300 dark:text-purple-500" />,
    color: "#A855F7", // purple
    colorClass: "category-zone-v1.5"
  },
  {
    id: "v2.0",
    name: "Version 2.0",
    description: "Future features for major update",
    icon: <Sparkles className="h-7 w-7 text-orange-300 dark:text-orange-500" />,
    color: "#F97316", // orange
    colorClass: "category-zone-v2.0"
  },
  {
    id: "rejected",
    name: "Rejected",
    description: "Features that were considered but decided against",
    icon: <XCircle className="h-7 w-7 text-red-300 dark:text-red-500" />,
    color: "#EF4444", // red
    colorClass: "category-zone-rejected"
  }
];

// Custom category type
interface CustomCategory {
  id: string;
  name: string;
  description: string;
  color: string;
  icon?: React.ReactNode;
  colorClass?: string;
}

export function EnhancedCategoryZones() {
  const { features } = useProject();
  const { toast } = useToast();
  const [categories, setCategories] = useState<CustomCategory[]>([...DEFAULT_CATEGORIES]);
  const [showAddCategory, setShowAddCategory] = useState(false);

  // Setup drag and drop handlers
  useEffect(() => {
    const setupDragHandlers = () => {
      // Find all category zones after the component has rendered fully
      const categoryZones = document.querySelectorAll<HTMLDivElement>(".category-zone");
      
      // Drag handlers for category zones
      const handleDragOver = (e: DragEvent) => {
        e.preventDefault();
        const target = e.currentTarget as HTMLElement;
        target.classList.add("drag-over");
      };
      
      const handleDragLeave = (e: DragEvent) => {
        const target = e.currentTarget as HTMLElement;
        target.classList.remove("drag-over");
      };
      
      const handleDrop = async (e: DragEvent) => {
        e.preventDefault();
        
        const target = e.currentTarget as HTMLElement;
        target.classList.remove("drag-over");
        
        try {
          // Get the feature data
          const dataJson = e.dataTransfer?.getData("application/json");
          if (!dataJson) return;
          
          const data = JSON.parse(dataJson);
          const featureId = data.featureId;
          const featureName = data.featureName;
          
          // Get the category from the target element
          const category = target.dataset.category as Category;
          if (!category) return;
          
          // Update the feature category via API
          await updateFeatureCategory(featureId, category);
          
          // Invalidate queries to refresh data
          queryClient.invalidateQueries({
            queryKey: ['/api/projects']
          });
          
          // Show success toast
          const categoryObj = categories.find(c => c.id === category);
          toast({
            title: "Feature categorized",
            description: `"${featureName}" has been moved to ${categoryObj?.name || category}.`,
          });
        } catch (error) {
          toast({
            title: "Error",
            description: "Failed to update feature category.",
            variant: "destructive"
          });
        }
      };
      
      // Add event listeners to all category zones
      categoryZones.forEach(zone => {
        zone.addEventListener("dragover", handleDragOver);
        zone.addEventListener("dragleave", handleDragLeave);
        zone.addEventListener("drop", handleDrop);
      });
      
      // Cleanup
      return () => {
        categoryZones.forEach(zone => {
          zone.removeEventListener("dragover", handleDragOver);
          zone.removeEventListener("dragleave", handleDragLeave);
          zone.removeEventListener("drop", handleDrop);
        });
      };
    };
    
    // Initial setup
    const timerId = setTimeout(setupDragHandlers, 500);
    
    // Cleanup
    return () => clearTimeout(timerId);
  }, [features, categories, toast]);
  
  // Load custom categories from local storage on mount
  useEffect(() => {
    try {
      const savedCategories = localStorage.getItem('custom_categories');
      if (savedCategories) {
        const parsedCategories = JSON.parse(savedCategories);
        setCategories([...DEFAULT_CATEGORIES, ...parsedCategories]);
      }
    } catch (error) {
      console.error("Failed to load custom categories:", error);
    }
  }, []);

  // Count features in each category
  const getCategoryCount = (categoryId: string): number => {
    if (!features) return 0;
    return features.filter(feature => feature.category === categoryId).length;
  };

  // Handle creating a new category
  const handleCategoryCreated = (newCategory: CustomCategory) => {
    // Add the new category to the list
    const updatedCategories = [...categories, newCategory];
    setCategories(updatedCategories);
    
    // Save custom categories to local storage
    try {
      const customCategories = updatedCategories.filter(
        cat => !DEFAULT_CATEGORIES.some(defCat => defCat.id === cat.id)
      );
      localStorage.setItem('custom_categories', JSON.stringify(customCategories));
    } catch (error) {
      console.error("Failed to save custom categories:", error);
    }
  };

  return (
    <div className="flex-1 bg-gray-100 dark:bg-gray-900 p-4 overflow-auto">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Feature Categories</h2>
          <Button 
            onClick={() => setShowAddCategory(!showAddCategory)}
            size="sm"
            variant="outline"
          >
            <PlusCircle className="mr-2 h-4 w-4" />
            Add Custom Category
          </Button>
        </div>
        
        {showAddCategory && (
          <div className="mb-6">
            <CustomCategoryCreator onCategoryCreated={handleCategoryCreated} />
          </div>
        )}
        
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {categories.map((category) => (
            <div 
              key={category.id}
              className={`category-zone border-2 border-dashed rounded-lg p-4 min-h-48 flex flex-col ${
                category.colorClass || ''
              }`}
              data-category={category.id}
              style={
                !category.colorClass ? {
                  borderColor: category.color,
                  backgroundColor: `${category.color}10` // Very light version of the color
                } : {}
              }
            >
              <div className="flex items-center justify-between mb-3">
                <h4 
                  className="font-semibold truncate" 
                  style={!category.colorClass ? { color: category.color } : {}}
                >
                  {category.name}
                </h4>
                <span 
                  className="inline-flex items-center justify-center w-6 h-6 rounded-full text-xs font-medium"
                  style={{ 
                    backgroundColor: `${category.color}20`,
                    color: category.color
                  }}
                >
                  {getCategoryCount(category.id)}
                </span>
              </div>
              
              <p 
                className="text-xs mb-4"
                style={!category.colorClass ? { color: category.color } : {}}
              >
                {category.description}
              </p>
              
              <div className="flex-1 flex items-center justify-center">
                <div className="text-center">
                  {category.icon || (
                    <div 
                      className="w-8 h-8 rounded-full mx-auto"
                      style={{ backgroundColor: category.color }}
                    />
                  )}
                  <p 
                    className="mt-2 text-sm"
                    style={{ color: category.color }}
                  >
                    Drop feature here
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}