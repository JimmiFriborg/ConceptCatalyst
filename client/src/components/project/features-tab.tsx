import { useState } from "react";
import { Feature } from "@shared/schema";
import { FeatureCard } from "@/components/feature-card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from "@/components/ui/select";
import { Search, Plus, Filter } from "lucide-react";
import { perspectiveEnum, categoryEnum } from "@shared/schema";

interface FeaturesTabProps {
  features: Feature[];
  onAddFeature: () => void;
  isLoading?: boolean;
}

export function FeaturesTab({ 
  features, 
  onAddFeature, 
  isLoading = false 
}: FeaturesTabProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [perspectiveFilter, setPerspectiveFilter] = useState<string>("all");
  const [categoryFilter, setCategoryFilter] = useState<string>("all");

  const filteredFeatures = features.filter(feature => {
    const matchesSearch = 
      feature.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      feature.description.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesPerspective = 
      perspectiveFilter === "all" || 
      feature.perspective === perspectiveFilter;
    
    const matchesCategory = 
      categoryFilter === "all" || 
      feature.category === categoryFilter;
    
    return matchesSearch && matchesPerspective && matchesCategory;
  });

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold">Features</h2>
        <Button onClick={onAddFeature}>
          <Plus className="mr-2 h-4 w-4" />
          Add Feature
        </Button>
      </div>

      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500" />
          <Input
            type="text"
            placeholder="Search features..."
            className="pl-9"
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
          />
        </div>

        <div className="flex gap-2">
          <div className="w-40">
            <Select
              value={perspectiveFilter}
              onValueChange={setPerspectiveFilter}
            >
              <SelectTrigger>
                <Filter className="mr-2 h-4 w-4" />
                <SelectValue placeholder="Perspective" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Perspectives</SelectItem>
                {perspectiveEnum.options.map(perspective => (
                  <SelectItem key={perspective} value={perspective}>{
                    perspective.charAt(0).toUpperCase() + perspective.slice(1)
                  }</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="w-40">
            <Select
              value={categoryFilter}
              onValueChange={setCategoryFilter}
            >
              <SelectTrigger>
                <Filter className="mr-2 h-4 w-4" />
                <SelectValue placeholder="Category" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                {categoryEnum.options.map(category => (
                  <SelectItem key={category} value={category}>{
                    category.toUpperCase()
                  }</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>

      <ScrollArea className="h-[calc(100vh-16rem)]">
        {isLoading ? (
          <div className="space-y-4 p-2">
            {Array(3).fill(0).map((_, i) => (
              <div 
                key={i} 
                className="bg-gray-100 dark:bg-gray-800 h-32 rounded-lg animate-pulse"
              />
            ))}
          </div>
        ) : filteredFeatures.length === 0 ? (
          <div className="text-center p-8 text-gray-500">
            {searchTerm || perspectiveFilter !== "all" || categoryFilter !== "all" ? 
              "No features match your filters." : 
              "No features yet. Add your first feature to get started."}
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4 p-2">
            {filteredFeatures.map(feature => (
              <FeatureCard 
                key={feature.id} 
                feature={feature} 
                showActions
              />
            ))}
          </div>
        )}
      </ScrollArea>
    </div>
  );
}