import { useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { useLocation } from "wouter";
import { createProject } from "@/lib/api";
import { queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Loader2 } from "lucide-react";

interface ImportProjectDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const formSchema = z.object({
  projectText: z.string().min(10, {
    message: "Project text must be at least 10 characters.",
  }),
});

type FormValues = z.infer<typeof formSchema>;

// Helper function to extract sections from the formatted text
const extractProjectData = (text: string) => {
  const sectionMap: { [key: string]: string[] } = {
    "Project Name": [],
    "Project Description": [],
    "Mission Statement": [],
    "Primary Goal": [],
    "Secondary Goals": [],
    "In-Scope Functionality": [],
    "Out-of-Scope Functionality": [],
    "Constraints": [],
    "Relevant Features & Functionalities": [],
  };
  
  // Split by section markers (⸻ or other common separators)
  const sections = text.split(/⸻|---|\n\n/);
  
  for (const section of sections) {
    const trimmed = section.trim();
    if (!trimmed) continue;
    
    // Look for section headings followed by bullet points
    for (const heading of Object.keys(sectionMap)) {
      if (trimmed.includes(heading + ":") || trimmed.includes(heading + "\n")) {
        // Extract bullet points that follow this heading
        const points = trimmed
          .replace(heading + ":", "")
          .replace(heading, "")
          .split(/•|\*|-/)
          .map(item => item.trim())
          .filter(item => item.length > 0);
        
        sectionMap[heading] = points;
        break;
      }
    }
  }
  
  // Convert to the project format needed for the API
  return {
    name: sectionMap["Project Name"][0] || "Imported Project",
    description: sectionMap["Project Description"].join("\n"),
    mission: sectionMap["Mission Statement"].join("\n"),
    goals: sectionMap["Primary Goal"].concat(sectionMap["Secondary Goals"]),
    inScope: sectionMap["In-Scope Functionality"],
    outOfScope: sectionMap["Out-of-Scope Functionality"],
    constraints: sectionMap["Constraints"],
  };
};

export function ImportProjectDialog({ open, onOpenChange }: ImportProjectDialogProps) {
  const [_, navigate] = useLocation();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [parseError, setParseError] = useState<string | null>(null);
  
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      projectText: "",
    },
  });
  
  const onSubmit = async (data: FormValues) => {
    setIsLoading(true);
    setParseError(null);
    
    try {
      // Parse the project text using our helper function
      const projectData = extractProjectData(data.projectText);
      
      // Create the project via the API
      const project = await createProject({
        name: projectData.name,
        description: projectData.description,
        mission: projectData.mission,
        goals: projectData.goals,
        inScope: projectData.inScope,
        outOfScope: projectData.outOfScope,
        constraints: projectData.constraints,
      });
      
      // Invalidate cache to refresh project list
      queryClient.invalidateQueries({
        queryKey: ['/api/projects']
      });
      
      // Success message
      toast({
        title: "Project imported successfully",
        description: `Created project '${project.name}'`,
      });
      
      // Navigate to the new project
      navigate(`/project/${project.id}`);
      
      // Close the dialog
      onOpenChange(false);
    } catch (error) {
      console.error("Error importing project:", error);
      setParseError("Failed to parse project data. Please check the format and try again.");
      toast({
        title: "Import failed",
        description: "There was an error importing the project. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };
  
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>Import Project</DialogTitle>
          <DialogDescription>
            Paste the formatted project text to import a new project.
          </DialogDescription>
        </DialogHeader>
        
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <FormField
              control={form.control}
              name="projectText"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Project Text</FormLabel>
                  <FormControl>
                    <Textarea rows={15} placeholder="Paste the formatted project text here..." {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            {parseError && (
              <div className="text-red-500 text-sm">{parseError}</div>
            )}
            
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={isLoading}>
                {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Import Project
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}