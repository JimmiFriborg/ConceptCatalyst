import { useState } from "react";
import { useLocation } from "wouter";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "@/hooks/use-toast";
import { createProject } from "@/lib/api";
import { queryClient } from "@/lib/queryClient";
import { Loader2 } from "lucide-react";

interface ImportProjectDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function ImportProjectDialog({ open, onOpenChange }: ImportProjectDialogProps) {
  const [, navigate] = useLocation();
  const [projectData, setProjectData] = useState<string>("");
  const [isImporting, setIsImporting] = useState(false);
  const [isValid, setIsValid] = useState(false);
  const [parsedProject, setParsedProject] = useState<any>(null);

  const handleProjectDataChange = (value: string) => {
    setProjectData(value);
    try {
      const parsed = JSON.parse(value);
      // Basic validation
      if (parsed && typeof parsed === 'object' && 
          parsed.name && typeof parsed.name === 'string') {
        setIsValid(true);
        setParsedProject(parsed);
      } else {
        setIsValid(false);
        setParsedProject(null);
      }
    } catch (e) {
      setIsValid(false);
      setParsedProject(null);
    }
  };

  const handleImport = async () => {
    if (!isValid || !parsedProject) {
      toast({
        title: "Invalid project data",
        description: "Please ensure the project data is valid JSON with at least a name field.",
        variant: "destructive",
      });
      return;
    }

    setIsImporting(true);

    try {
      // Make sure we have the minimal required fields
      const importData = {
        name: parsedProject.name,
        description: parsedProject.description || "",
        // Add any other fields here that your project schema requires
      };

      const project = await createProject(importData);
      
      queryClient.invalidateQueries({ queryKey: ["/api/projects"] });
      
      toast({
        title: "Project imported",
        description: `Project "${importData.name}" has been imported successfully.`,
      });
      
      onOpenChange(false);
      
      // Navigate to the new project
      setTimeout(() => navigate(`/projects/${project.id}`), 500);
    } catch (error) {
      console.error("Error importing project:", error);
      toast({
        title: "Import failed",
        description: "Failed to import project. Please check the data format and try again.",
        variant: "destructive",
      });
    } finally {
      setIsImporting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Import Project</DialogTitle>
          <DialogDescription>
            Paste a valid project JSON to import it. This should include at least a name field.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid gap-2">
            <Label htmlFor="project-data">Project Data (JSON)</Label>
            <Textarea
              id="project-data"
              placeholder='{ "name": "My Project", "description": "Project description" }'
              rows={10}
              value={projectData}
              onChange={(e) => handleProjectDataChange(e.target.value)}
              className="font-mono text-sm"
            />
          </div>
          {parsedProject && (
            <div className="p-2 border rounded bg-slate-50">
              <p className="text-sm font-medium">Project Preview:</p>
              <p className="text-sm mt-1">Name: {parsedProject.name}</p>
              {parsedProject.description && (
                <p className="text-sm mt-1">Description: {parsedProject.description}</p>
              )}
            </div>
          )}
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleImport} disabled={!isValid || isImporting}>
            {isImporting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Importing...
              </>
            ) : (
              "Import Project"
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}