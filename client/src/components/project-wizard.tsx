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
  FormDescription,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { useLocation } from "wouter";
import { createProject } from "@/lib/api";
import { queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { 
  ArrowRight, 
  ArrowLeft, 
  Target, 
  ListChecks, 
  AlertTriangle, 
  Check,
  Asterisk
} from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

interface ProjectWizardProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

// Project wizard schema with zod validation
const formSchema = z.object({
  // Basic Project Info
  name: z.string().min(3, {
    message: "Project name must be at least 3 characters.",
  }),
  description: z.string().min(10, {
    message: "Please provide a meaningful description (at least 10 characters).",
  }),
  
  // Mission & Goals
  mission: z.string().min(10, {
    message: "Project mission should be at least 10 characters.",
  }),
  primaryGoal: z.string().min(5, {
    message: "Primary goal is required (at least 5 characters).",
  }),
  secondaryGoals: z.string().optional(),
  
  // Scope Definition
  inScope: z.string().min(10, {
    message: "Please define what's in scope for this project.",
  }),
  outOfScope: z.string().min(10, {
    message: "Please define what's out of scope for this project.",
  }),
  constraints: z.string().optional(),
});

type FormValues = z.infer<typeof formSchema>;

export function ProjectWizard({ open, onOpenChange }: ProjectWizardProps) {
  const [_, navigate] = useLocation();
  const { toast } = useToast();
  const [step, setStep] = useState<number>(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Wizard steps
  const totalSteps = 3;
  const stepTitles = [
    "Basic Information",
    "Mission & Goals",
    "Scope Definition"
  ];
  
  // Initialize form with defaults
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      description: "",
      mission: "",
      primaryGoal: "",
      secondaryGoals: "",
      inScope: "",
      outOfScope: "",
      constraints: "",
    },
    mode: "onChange"
  });
  
  // Reset form and step when dialog is opened/closed
  const handleOpenChange = (open: boolean) => {
    if (!open) {
      form.reset();
      setStep(1);
    }
    onOpenChange(open);
  };

  // Handle going to the next step
  const handleNext = async () => {
    const fieldsToValidate = step === 1 
      ? ["name", "description"] 
      : step === 2 
        ? ["mission", "primaryGoal"] 
        : ["inScope", "outOfScope"];

    const isValid = await form.trigger(fieldsToValidate as any);
    
    if (isValid) {
      setStep(current => Math.min(current + 1, totalSteps));
    }
  };

  // Handle going to the previous step
  const handlePrevious = () => {
    setStep(current => Math.max(current - 1, 1));
  };

  // Submit the full form
  const onSubmit = async (data: FormValues) => {
    setIsSubmitting(true);
    try {
      // Format the enhanced project description that combines all wizard fields
      const enhancedDescription = `
# ${data.name}

## Project Description
${data.description}

## Mission Statement
${data.mission}

## Goals
- Primary: ${data.primaryGoal}
${data.secondaryGoals ? `- Secondary Goals: ${data.secondaryGoals}` : ''}

## Project Scope
- In Scope: ${data.inScope}
- Out of Scope: ${data.outOfScope}
${data.constraints ? `- Constraints: ${data.constraints}` : ''}
`;

      // Create the project with the enhanced description
      const project = await createProject({
        name: data.name,
        description: enhancedDescription,
      });
      
      // Invalidate queries to refresh
      queryClient.invalidateQueries({ queryKey: ['/api/projects'] });
      
      toast({
        title: "Project created",
        description: "New project has been created with defined scope and goals.",
      });
      
      // Navigate to the new project
      navigate(`/projects/${project.id}`);
      
      // Close dialog and reset form
      handleOpenChange(false);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to create project.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Render the current step of the wizard
  const renderStepContent = () => {
    switch (step) {
      case 1:
        return (
          <>
            <div className="space-y-4">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Project Name <span className="text-red-500">*</span></FormLabel>
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
                    <FormLabel>Project Description <span className="text-red-500">*</span></FormLabel>
                    <FormDescription>
                      Provide a brief overview of what this project is about.
                    </FormDescription>
                    <FormControl>
                      <Textarea 
                        placeholder="Describe your project in a few sentences" 
                        className="min-h-[100px]"
                        {...field} 
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          </>
        );
      
      case 2:
        return (
          <>
            <div className="space-y-4">
              <FormField
                control={form.control}
                name="mission"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Mission Statement <span className="text-red-500">*</span></FormLabel>
                    <FormDescription>
                      Define the overarching purpose of this project.
                    </FormDescription>
                    <FormControl>
                      <Textarea 
                        placeholder="What is the mission of this project?" 
                        className="min-h-[80px]"
                        {...field} 
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="primaryGoal"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Primary Goal <span className="text-red-500">*</span></FormLabel>
                    <FormDescription>
                      What is the most important outcome you want to achieve?
                    </FormDescription>
                    <FormControl>
                      <Input placeholder="Enter the primary goal" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="secondaryGoals"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Secondary Goals</FormLabel>
                    <FormDescription>
                      Add any additional goals, one per line (optional).
                    </FormDescription>
                    <FormControl>
                      <Textarea 
                        placeholder="Enter secondary goals (optional)" 
                        className="min-h-[80px]"
                        {...field} 
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          </>
        );
      
      case 3:
        return (
          <>
            <div className="space-y-4">
              <FormField
                control={form.control}
                name="inScope"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>In Scope <span className="text-red-500">*</span></FormLabel>
                    <FormDescription>
                      Define what is included in this project's scope.
                    </FormDescription>
                    <FormControl>
                      <Textarea 
                        placeholder="What features or elements are definitely in scope?"
                        className="min-h-[80px]"
                        {...field} 
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="outOfScope"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Out of Scope <span className="text-red-500">*</span></FormLabel>
                    <FormDescription>
                      Define what is explicitly excluded from this project.
                    </FormDescription>
                    <FormControl>
                      <Textarea 
                        placeholder="What will NOT be included in this project?"
                        className="min-h-[80px]"
                        {...field} 
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="constraints"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Constraints</FormLabel>
                    <FormDescription>
                      List any limitations or constraints (time, budget, technical, etc.).
                    </FormDescription>
                    <FormControl>
                      <Textarea 
                        placeholder="Any constraints to be aware of? (optional)" 
                        className="min-h-[80px]"
                        {...field} 
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          </>
        );
      
      default:
        return null;
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-[700px]">
        <DialogHeader>
          <DialogTitle>Project Initiation Wizard</DialogTitle>
          <DialogDescription>
            Let's define the scope and goals of your new project.
          </DialogDescription>
        </DialogHeader>
        
        {/* Progress steps */}
        <div className="mb-6">
          <div className="flex items-center justify-between">
            {stepTitles.map((title, index) => (
              <div 
                key={index} 
                className={`flex-1 text-center ${index < stepTitles.length - 1 ? 'border-b-2 border-gray-200 dark:border-gray-700 pb-2 relative' : 'pb-2'}`}
              >
                <div 
                  className={`
                    inline-flex items-center justify-center w-8 h-8 rounded-full 
                    ${step > index + 1 
                      ? 'bg-green-100 text-green-600 dark:bg-green-900 dark:text-green-300' 
                      : step === index + 1 
                        ? 'bg-blue-100 text-blue-600 dark:bg-blue-900 dark:text-blue-300' 
                        : 'bg-gray-100 text-gray-400 dark:bg-gray-800 dark:text-gray-500'
                    }
                    mb-1
                  `}
                >
                  {step > index + 1 ? (
                    <Check className="w-4 h-4" />
                  ) : (
                    index + 1
                  )}
                </div>
                <div className={`
                  text-xs 
                  ${step === index + 1 
                    ? 'font-medium text-blue-600 dark:text-blue-300' 
                    : step > index + 1 
                      ? 'font-medium text-green-600 dark:text-green-300' 
                      : 'text-gray-500 dark:text-gray-400'
                  }
                `}>
                  {title}
                </div>
                {index < stepTitles.length - 1 && (
                  <div className={`absolute h-0.5 w-full top-4 left-1/2 ${
                    step > index + 1 ? 'bg-green-100 dark:bg-green-900' : 'bg-gray-100 dark:bg-gray-800'
                  }`}></div>
                )}
              </div>
            ))}
          </div>
        </div>
        
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            {renderStepContent()}
            
            <DialogFooter className="flex justify-between mt-6">
              <div>
                {step > 1 && (
                  <Button 
                    type="button" 
                    variant="outline" 
                    onClick={handlePrevious}
                    disabled={isSubmitting}
                  >
                    <ArrowLeft className="mr-2 h-4 w-4" />
                    Back
                  </Button>
                )}
              </div>
              
              <div>
                {step < totalSteps ? (
                  <Button 
                    type="button"
                    onClick={handleNext}
                  >
                    Next
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                ) : (
                  <Button 
                    type="submit"
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? "Creating..." : "Create Project"}
                  </Button>
                )}
              </div>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}