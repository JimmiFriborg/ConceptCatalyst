import { Feature } from "@shared/schema";
import { EnhancedCategoryZones } from "@/components/enhanced-category-zones";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Grid3x3, ZoomIn, ZoomOut } from "lucide-react";
import { useState } from "react";

interface CategoriesTabProps {
  features: Feature[];
  projectId: number;
  isLoading?: boolean;
}

export function CategoriesTab({ 
  features, 
  projectId,
  isLoading = false 
}: CategoriesTabProps) {
  const [zoomLevel, setZoomLevel] = useState(1); // 1 = normal, <1 = zoomed out, >1 = zoomed in
  
  const handleZoomIn = () => {
    setZoomLevel(prev => Math.min(prev + 0.1, 1.5));
  };
  
  const handleZoomOut = () => {
    setZoomLevel(prev => Math.max(prev - 0.1, 0.7));
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold flex items-center">
          <Grid3x3 className="mr-2 h-5 w-5" />
          Feature Categories
        </h2>
        <div className="flex items-center space-x-2">
          <Button 
            variant="outline" 
            size="sm" 
            onClick={handleZoomOut}
            disabled={zoomLevel <= 0.7}
          >
            <ZoomOut className="h-4 w-4" />
          </Button>
          <Button 
            variant="outline" 
            size="sm" 
            onClick={handleZoomIn}
            disabled={zoomLevel >= 1.5}
          >
            <ZoomIn className="h-4 w-4" />
          </Button>
        </div>
      </div>

      <ScrollArea className="h-[calc(100vh-12rem)]">
        <div 
          className="transition-transform duration-200 ease-out p-2"
          style={{ transform: `scale(${zoomLevel})`, transformOrigin: "top left" }}
        >
          <EnhancedCategoryZones key={`zones-${zoomLevel}`} />
        </div>
      </ScrollArea>
    </div>
  );
}