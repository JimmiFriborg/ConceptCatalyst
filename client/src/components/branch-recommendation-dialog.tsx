import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useQueryClient } from "@tanstack/react-query";
// Mock function for branch project functionality
const branchProject = async (parentId: number, projectData: any) => {
  console.log("Branching project:", parentId, projectData);
  return { id: Date.now(), ...projectData };
};
import { useToast } from "@/hooks/use-toast";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { AlertCircle, GitBranch } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

const formSchema = z.object({
  name: z.string().min(1, "Project name is required"),
  description: z.string().optional(),
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
  branchRecommendation,
}: BranchRecommendationDialogProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: branchRecommendation?.suggestedName || "",
      description: "",
    },
  });

  const onSubmit = async (data: FormValues) => {
    try {
      setIsSubmitting(true);
      await branchProject(parentProjectId, data);
      
      // Invalidate relevant queries
      queryClient.invalidateQueries({ queryKey: ["/api/projects"] });
      
      toast({
        title: "Success",
        description: "Branch project created successfully",
      });
      
      onOpenChange(false);
    } catch (error) {
      console.error("Error creating branch project:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to create branch project",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <GitBranch className="h-5 w-5" />
            Branch Project Recommendation
          </DialogTitle>
          <DialogDescription>
            Create a new branch project to explore a different direction.
          </DialogDescription>
        </DialogHeader>

        {branchRecommendation && (
          <Alert className="mb-4">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>AI Recommendation</AlertTitle>
            <AlertDescription className="mt-2">
              {branchRecommendation.reason}
            </AlertDescription>
          </Alert>
        )}

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Branch Project Name</FormLabel>
                  <FormControl>
                    <Input placeholder="Enter project name" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Description</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Enter project description"
                      {...field}
                      value={field.value || ""}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <DialogFooter>
              <Button 
                variant="outline" 
                onClick={() => onOpenChange(false)}
                type="button"
              >
                Cancel
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? "Creating..." : "Create Branch Project"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}