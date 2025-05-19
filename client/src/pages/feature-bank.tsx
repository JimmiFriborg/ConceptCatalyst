import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Database, Search, Filter, Tag, Plus } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { FeatureCard } from "@/components/feature-card";
import { Feature, perspectiveEnum, categoryEnum } from "@shared/schema";

export default function FeatureBank() {
  const [searchTerm, setSearchTerm] = useState("");
  const [perspective, setPerspective] = useState("all");
  const [category, setCategory] = useState("all");
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  
  // This would come from context/API in a real implementation
  // For now, we'll fetch all features from all projects to create a "bank"
  const { data: features = [], isLoading } = useQuery<Feature[]>({
    queryKey: ["/api/features"],
    queryFn: async () => {
      // This is a placeholder - we'll need to implement an API endpoint for all features
      const res = await fetch("/api/features");
      if (!res.ok) return [];
      return res.json();
    },
  });
  
  // Get unique tags from all features
  const allTags = new Set<string>();
  features.forEach(feature => {
    if (feature.tags && Array.isArray(feature.tags)) {
      (feature.tags as string[]).forEach(tag => allTags.add(tag));
    }
  });
  
  const filteredFeatures = features.filter(feature => {
    // Filter by search term
    const matchesSearch = 
      searchTerm === "" || 
      feature.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      feature.description.toLowerCase().includes(searchTerm.toLowerCase());
    
    // Filter by perspective
    const matchesPerspective = 
      perspective === "all" || 
      feature.perspective === perspective;
    
    // Filter by category
    const matchesCategory = 
      category === "all" || 
      feature.category === category;
    
    // Filter by tags
    const matchesTags = 
      selectedTags.length === 0 || 
      (feature.tags && 
       Array.isArray(feature.tags) && 
       selectedTags.every(tag => (feature.tags as string[]).includes(tag)));
    
    return matchesSearch && matchesPerspective && matchesCategory && matchesTags;
  });

  const handleTagToggle = (tag: string) => {
    setSelectedTags(prev => 
      prev.includes(tag) 
        ? prev.filter(t => t !== tag) 
        : [...prev, tag]
    );
  };

  return (
    <div className="container mx-auto px-4 py-6">
      <div className="flex justify-between items-center mb-6">
        <div className="flex items-center">
          <Database className="mr-3 h-6 w-6 text-primary" />
          <h1 className="text-2xl font-bold">Feature Bank</h1>
        </div>
        
        <Button disabled>
          <Plus className="mr-2 h-4 w-4" />
          Add to Bank
        </Button>
      </div>
      
      <Card className="mb-6">
        <CardHeader className="pb-3">
          <CardTitle>Feature Library</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col md:flex-row gap-4 mb-6">
            <div className="flex-1 relative">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500" />
              <Input
                type="text"
                placeholder="Search features..."
                className="pl-9"
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
              />
            </div>
            
            <div className="flex gap-2 md:w-auto w-full">
              <Select
                value={perspective}
                onValueChange={setPerspective}
              >
                <SelectTrigger className="w-[140px]">
                  <Filter className="mr-2 h-4 w-4" />
                  <SelectValue placeholder="Perspective" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Perspectives</SelectItem>
                  {perspectiveEnum.options.map(p => (
                    <SelectItem key={p} value={p}>
                      {p.charAt(0).toUpperCase() + p.slice(1)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              
              <Select
                value={category}
                onValueChange={setCategory}
              >
                <SelectTrigger className="w-[140px]">
                  <Filter className="mr-2 h-4 w-4" />
                  <SelectValue placeholder="Category" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Categories</SelectItem>
                  {categoryEnum.options.map(c => (
                    <SelectItem key={c} value={c}>
                      {c.toUpperCase()}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          
          {allTags.size > 0 && (
            <div className="mb-6">
              <div className="flex items-center mb-2">
                <Tag className="mr-2 h-4 w-4 text-gray-500" />
                <h3 className="text-sm font-medium">Tags</h3>
              </div>
              <div className="flex flex-wrap gap-2">
                {Array.from(allTags).map(tag => (
                  <Badge
                    key={tag}
                    variant={selectedTags.includes(tag) ? "default" : "outline"}
                    className="cursor-pointer"
                    onClick={() => handleTagToggle(tag)}
                  >
                    {tag}
                  </Badge>
                ))}
              </div>
            </div>
          )}
          
          <Separator className="my-4" />
          
          <Tabs defaultValue="grid" className="w-full">
            <div className="flex justify-between items-center mb-4">
              <div className="text-sm text-gray-500">
                {filteredFeatures.length} features found
              </div>
              <TabsList>
                <TabsTrigger value="grid">Grid</TabsTrigger>
                <TabsTrigger value="list">List</TabsTrigger>
              </TabsList>
            </div>
            
            <TabsContent value="grid" className="mt-0">
              {isLoading ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {[1, 2, 3, 4, 5, 6].map(i => (
                    <Card key={i} className="h-[180px] animate-pulse bg-gray-100 dark:bg-gray-800" />
                  ))}
                </div>
              ) : filteredFeatures.length === 0 ? (
                <div className="text-center py-12 text-gray-500">
                  <Database className="mx-auto h-12 w-12 mb-4 text-gray-400" />
                  <h3 className="text-lg font-medium mb-2">No features found</h3>
                  <p>Try adjusting your filters or search terms</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {filteredFeatures.map(feature => (
                    <FeatureCard 
                      key={feature.id} 
                      feature={feature} 
                      draggable={false}
                      showActions 
                    />
                  ))}
                </div>
              )}
            </TabsContent>
            
            <TabsContent value="list" className="mt-0">
              {isLoading ? (
                <div className="space-y-4">
                  {[1, 2, 3, 4, 5].map(i => (
                    <div key={i} className="h-16 animate-pulse bg-gray-100 dark:bg-gray-800 rounded-md" />
                  ))}
                </div>
              ) : filteredFeatures.length === 0 ? (
                <div className="text-center py-12 text-gray-500">
                  <Database className="mx-auto h-12 w-12 mb-4 text-gray-400" />
                  <h3 className="text-lg font-medium mb-2">No features found</h3>
                  <p>Try adjusting your filters or search terms</p>
                </div>
              ) : (
                <div className="space-y-2">
                  {filteredFeatures.map(feature => (
                    <div 
                      key={feature.id}
                      className="flex items-center justify-between p-3 border rounded-md hover:bg-gray-50 dark:hover:bg-gray-800"
                    >
                      <div>
                        <h4 className="font-medium">{feature.name}</h4>
                        <p className="text-sm text-gray-500 truncate max-w-md">
                          {feature.description}
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge>{feature.perspective}</Badge>
                        <Badge variant="outline">{feature.category}</Badge>
                        <Button size="sm" variant="ghost">
                          Add to concept
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}