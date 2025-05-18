import { useState } from "react";
import { Plus, ArrowRight, Save } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";

interface CustomCategoryCreatorProps {
  onCategoryCreated: (category: {
    id: string;
    name: string;
    description: string;
    color: string;
  }) => void;
}

export function CustomCategoryCreator({ onCategoryCreated }: CustomCategoryCreatorProps) {
  const [showDialog, setShowDialog] = useState(false);
  const [categoryName, setCategoryName] = useState("");
  const [categoryDescription, setCategoryDescription] = useState("");
  const [categoryColor, setCategoryColor] = useState("#3B82F6"); // Default to blue
  const { toast } = useToast();

  const handleCreateCategory = () => {
    if (!categoryName.trim()) {
      toast({
        title: "Error",
        description: "Category name is required",
        variant: "destructive"
      });
      return;
    }

    // Generate a unique ID based on the name
    const categoryId = categoryName.toLowerCase().replace(/[^a-z0-9]/g, "-");
    
    // Create the new category
    onCategoryCreated({
      id: categoryId,
      name: categoryName,
      description: categoryDescription,
      color: categoryColor
    });
    
    // Close dialog and reset
    setShowDialog(false);
    setCategoryName("");
    setCategoryDescription("");
    setCategoryColor("#3B82F6");
    
    toast({
      title: "Category created",
      description: `New category "${categoryName}" has been added.`,
    });
  };

  return (
    <>
      <Button 
        onClick={() => setShowDialog(true)}
        variant="outline" 
        className="flex items-center w-full border-dashed border-2 p-3 h-auto"
      >
        <Plus className="mr-2 h-5 w-5" />
        <span>Add Custom Category</span>
      </Button>
      
      <Dialog open={showDialog} onOpenChange={setShowDialog}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Create New Category</DialogTitle>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Category Name</label>
              <Input
                value={categoryName}
                onChange={(e) => setCategoryName(e.target.value)}
                placeholder="e.g., Technical Debt, QA, Post-Launch"
              />
            </div>
            
            <div className="space-y-2">
              <label className="text-sm font-medium">Description</label>
              <Textarea
                value={categoryDescription}
                onChange={(e) => setCategoryDescription(e.target.value)}
                placeholder="Describe what this category represents..."
                rows={3}
              />
            </div>
            
            <div className="space-y-2">
              <label className="text-sm font-medium">Category Color</label>
              <div className="flex items-center space-x-3">
                <input
                  type="color"
                  value={categoryColor}
                  onChange={(e) => setCategoryColor(e.target.value)}
                  className="w-10 h-10 rounded cursor-pointer"
                />
                <div 
                  className="flex-1 h-8 rounded" 
                  style={{ backgroundColor: categoryColor }}
                />
              </div>
            </div>
          </div>
          
          <DialogFooter>
            <Button 
              variant="outline" 
              onClick={() => setShowDialog(false)}
            >
              Cancel
            </Button>
            <Button onClick={handleCreateCategory}>
              <Save className="mr-2 h-4 w-4" />
              Create Category
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}