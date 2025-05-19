import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useToast } from "@/hooks/use-toast";
import { GitBranchPlus, Loader2 } from "lucide-react";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";

const formSchema = z.object({
  name: z.string().min(3, "Name must be at least 3 characters"),
  description: z.string().min(10, "Description must be at least 10 characters"),
});

type FormValues = z.infer<typeof formSchema>;

interface BranchRecommendationDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  parentProjectId: number;
  branchRecommendation: {
    shouldBranch: boolean;
    reason: string;
    suggestedName?: string;
  } | null;
}

export function BranchRecommendationDialog({
  open,
  onOpenChange,
  parentProjectId,
  branchRecommendation
}: BranchRecommendationDialogProps) {
  const [isCreating, setIsCreating] = useState(false);
  const { toast } = useToast();

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: branchRecommendation?.suggestedName || "",
      description: "",
    },
  });

  const onSubmit = async (data: FormValues) => {
    setIsCreating(true);
    
    try {
      // In a real implementation, make a server request to create the branch
      const response = await fetch(`/api/projects/${parentProjectId}/branch`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: data.name,
          description: data.description,
        }),
      });
      
      if (!response.ok) {
        throw new Error("Failed to create project branch");
      }
      
      toast({
        title: "Branch created!",
        description: `Your new project branch "${data.name}" has been created successfully.`,
      });
      
      onOpenChange(false);
    } catch (error) {
      console.error("Error creating branch:", error);
      toast({
        title: "Branch creation failed",
        description: "There was an error creating your project branch. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsCreating(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-2xl font-bold">
            <GitBranchPlus className="h-6 w-6 text-primary" />
            AI Branch Recommendation
          </DialogTitle>
          <DialogDescription>
            Based on feature drift analysis, the AI suggests creating a new project branch.
          </DialogDescription>
        </DialogHeader>
        
        <div className="mt-4 mb-6 space-y-5">
          <div className={cn(
            "p-4 rounded-lg border",
            branchRecommendation?.shouldBranch 
              ? "bg-green-50 border-green-200" 
              : "bg-yellow-50 border-yellow-200"
          )}>
            <div className="font-medium mb-2">
              {branchRecommendation?.shouldBranch 
                ? "Project drift detected - Branch recommended" 
                : "Minor drift detected - Branch optional"}
            </div>
            <p className="text-sm text-muted-foreground">
              {branchRecommendation?.reason || 
                "Recent feature additions suggest the project scope is expanding in a new direction."}
            </p>
          </div>
          
          <Separator />
          
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Branch Name</FormLabel>
                    <FormControl>
                      <Input placeholder="Enter branch name" {...field} />
                    </FormControl>
                    <FormDescription>
                      A descriptive name for the new project direction
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Branch Description</FormLabel>
                    <FormControl>
                      <Textarea 
                        placeholder="Describe the new direction of this branch..."
                        className="min-h-[100px]"
                        {...field}
                      />
                    </FormControl>
                    <FormDescription>
                      Explain how this branch differs from the parent project
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <div className="flex justify-end gap-2 pt-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => onOpenChange(false)}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={isCreating}
                >
                  {isCreating ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Creating...
                    </>
                  ) : (
                    <>
                      <GitBranchPlus className="mr-2 h-4 w-4" />
                      Create Branch
                    </>
                  )}
                </Button>
              </div>
            </form>
          </Form>
        </div>
      </DialogContent>
    </Dialog>
  );
}