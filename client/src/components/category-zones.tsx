import { useEffect } from "react";
import { Rocket, Flag, Target, Sparkles, XCircle } from "lucide-react";
import { useProject } from "@/context/project-context";
import { updateFeatureCategory } from "@/lib/api";
import { queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Category, Feature } from "@shared/schema";

export function CategoryZones() {
  const { features } = useProject();
  const { toast } = useToast();

  // Setup drag and drop handlers
  useEffect(() => {
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
        toast({
          title: "Feature categorized",
          description: `"${featureName}" has been moved to ${getCategoryName(category)}.`,
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
  }, [features, toast]);

  // Helper function to get readable category name
  const getCategoryName = (category: Category): string => {
    switch (category) {
      case "mvp": return "MVP (Must Have)";
      case "launch": return "Launch";
      case "v1.5": return "Version 1.5";
      case "v2.0": return "Version 2.0";
      case "rejected": return "Rejected";
      default: return category;
    }
  };

  // Count features in each category
  const getCategoryCount = (category: Category): number => {
    if (!features) return 0;
    return features.filter(feature => feature.category === category).length;
  };

  // Get category descriptions
  const getCategoryDescription = (category: Category): string => {
    switch (category) {
      case "mvp":
        return "Core features required for initial launch";
      case "launch":
        return "Important features for initial public release";
      case "v1.5":
        return "Enhancement features for mid-term update";
      case "v2.0":
        return "Future features for major update";
      case "rejected":
        return "Features that were considered but decided against";
      default:
        return "";
    }
  };

  // Get category icons
  const getCategoryIcon = (category: Category) => {
    switch (category) {
      case "mvp":
        return <Rocket className="h-7 w-7 text-blue-300 dark:text-blue-500" />;
      case "launch":
        return <Flag className="h-7 w-7 text-green-300 dark:text-green-500" />;
      case "v1.5":
        return <Target className="h-7 w-7 text-purple-300 dark:text-purple-500" />;
      case "v2.0":
        return <Sparkles className="h-7 w-7 text-orange-300 dark:text-orange-500" />;
      case "rejected":
        return <XCircle className="h-7 w-7 text-red-300 dark:text-red-500" />;
      default:
        return null;
    }
  };

  return (
    <div className="flex-1 bg-gray-100 dark:bg-gray-900 overflow-auto">
      <div className="py-6 px-4 sm:px-6 lg:px-8">
        <div className="max-w-6xl mx-auto">
          <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-4">
            Drag feature to prioritize
          </h3>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-5 gap-4">
            {/* MVP Zone */}
            <div 
              className="category-zone category-zone-mvp border-2 border-dashed rounded-lg p-4 h-64 flex flex-col"
              data-category="mvp"
            >
              <div className="flex items-center justify-between mb-3">
                <h4 className="font-semibold text-blue-800 dark:text-blue-300">
                  MVP (Must Have)
                </h4>
                <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-blue-200 dark:bg-blue-800 text-blue-800 dark:text-blue-200 text-xs font-medium">
                  {getCategoryCount("mvp")}
                </span>
              </div>
              <p className="text-xs text-blue-600 dark:text-blue-400 mb-4">
                {getCategoryDescription("mvp")}
              </p>
              
              <div className="flex-1 flex items-center justify-center">
                <div className="text-center">
                  {getCategoryIcon("mvp")}
                  <p className="mt-2 text-sm text-blue-400 dark:text-blue-500">
                    Drop feature here
                  </p>
                </div>
              </div>
            </div>
            
            {/* Launch Zone */}
            <div 
              className="category-zone category-zone-launch border-2 border-dashed rounded-lg p-4 h-64 flex flex-col"
              data-category="launch"
            >
              <div className="flex items-center justify-between mb-3">
                <h4 className="font-semibold text-green-800 dark:text-green-300">
                  Launch
                </h4>
                <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-green-200 dark:bg-green-800 text-green-800 dark:text-green-200 text-xs font-medium">
                  {getCategoryCount("launch")}
                </span>
              </div>
              <p className="text-xs text-green-600 dark:text-green-400 mb-4">
                {getCategoryDescription("launch")}
              </p>
              
              <div className="flex-1 flex items-center justify-center">
                <div className="text-center">
                  {getCategoryIcon("launch")}
                  <p className="mt-2 text-sm text-green-400 dark:text-green-500">
                    Drop feature here
                  </p>
                </div>
              </div>
            </div>
            
            {/* Version 1.5 Zone */}
            <div 
              className="category-zone category-zone-v1.5 border-2 border-dashed rounded-lg p-4 h-64 flex flex-col"
              data-category="v1.5"
            >
              <div className="flex items-center justify-between mb-3">
                <h4 className="font-semibold text-purple-800 dark:text-purple-300">
                  Version 1.5
                </h4>
                <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-purple-200 dark:bg-purple-800 text-purple-800 dark:text-purple-200 text-xs font-medium">
                  {getCategoryCount("v1.5")}
                </span>
              </div>
              <p className="text-xs text-purple-600 dark:text-purple-400 mb-4">
                {getCategoryDescription("v1.5")}
              </p>
              
              <div className="flex-1 flex items-center justify-center">
                <div className="text-center">
                  {getCategoryIcon("v1.5")}
                  <p className="mt-2 text-sm text-purple-400 dark:text-purple-500">
                    Drop feature here
                  </p>
                </div>
              </div>
            </div>
            
            {/* Version 2.0 Zone */}
            <div 
              className="category-zone category-zone-v2.0 border-2 border-dashed rounded-lg p-4 h-64 flex flex-col"
              data-category="v2.0"
            >
              <div className="flex items-center justify-between mb-3">
                <h4 className="font-semibold text-orange-800 dark:text-orange-300">
                  Version 2.0
                </h4>
                <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-orange-200 dark:bg-orange-800 text-orange-800 dark:text-orange-200 text-xs font-medium">
                  {getCategoryCount("v2.0")}
                </span>
              </div>
              <p className="text-xs text-orange-600 dark:text-orange-400 mb-4">
                {getCategoryDescription("v2.0")}
              </p>
              
              <div className="flex-1 flex items-center justify-center">
                <div className="text-center">
                  {getCategoryIcon("v2.0")}
                  <p className="mt-2 text-sm text-orange-400 dark:text-orange-500">
                    Drop feature here
                  </p>
                </div>
              </div>
            </div>
            
            {/* Rejected Zone */}
            <div 
              className="category-zone category-zone-rejected border-2 border-dashed rounded-lg p-4 h-64 flex flex-col"
              data-category="rejected"
            >
              <div className="flex items-center justify-between mb-3">
                <h4 className="font-semibold text-red-800 dark:text-red-300">
                  Rejected
                </h4>
                <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-red-200 dark:bg-red-800 text-red-800 dark:text-red-200 text-xs font-medium">
                  {getCategoryCount("rejected")}
                </span>
              </div>
              <p className="text-xs text-red-600 dark:text-red-400 mb-4">
                {getCategoryDescription("rejected")}
              </p>
              
              <div className="flex-1 flex items-center justify-center">
                <div className="text-center">
                  {getCategoryIcon("rejected")}
                  <p className="mt-2 text-sm text-red-400 dark:text-red-500">
                    Drop feature here
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
