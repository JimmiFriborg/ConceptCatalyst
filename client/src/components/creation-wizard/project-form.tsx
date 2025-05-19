import { z } from "zod";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { useState } from "react";
import { TagInput } from "@/components/ui/tag-input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";

// Form schema for projects
const projectSchema = z.object({
  name: z.string().min(3, "Name must be at least 3 characters"),
  description: z.string().min(10, "Description must be at least 10 characters"),
  mission: z.string().optional(),
  deadline: z.string().optional(),
  status: z.enum(["planning", "in-progress", "on-hold", "completed"]).default("planning"),
  goals: z.array(z.string()).default([]),
  inScope: z.array(z.string()).default([]),
  outOfScope: z.array(z.string()).default([]),
  constraints: z.array(z.string()).default([]),
  technicalRequirements: z.string().optional(),
  aiOptimized: z.boolean().default(false),
  aiModelRequirements: z.string().optional(),
  aiEthicalConsiderations: z.array(z.string()).default([]),
  enhanceWithAi: z.boolean().default(true),
});

export type ProjectFormData = z.infer<typeof projectSchema>;

interface ProjectFormProps {
  defaultValues?: Partial<ProjectFormData>;
  onSubmit: (data: ProjectFormData) => void;
  onBack?: () => void;
}

export function ProjectForm({ defaultValues, onSubmit, onBack }: ProjectFormProps) {
  const [currentSection, setCurrentSection] = useState<'basic' | 'scope' | 'technical' | 'ai'>('basic');
  
  const form = useForm<ProjectFormData>({
    resolver: zodResolver(projectSchema),
    defaultValues: {
      name: "",
      description: "",
      mission: "",
      deadline: "",
      status: "planning",
      goals: [],
      inScope: [],
      outOfScope: [],
      constraints: [],
      technicalRequirements: "",
      aiOptimized: false,
      aiModelRequirements: "",
      aiEthicalConsiderations: [],
      enhanceWithAi: true,
      ...defaultValues
    },
  });

  const handleSubmit = form.handleSubmit(onSubmit);

  return (
    <Form {...form}>
      <form className="space-y-6" onSubmit={handleSubmit}>
        {currentSection === 'basic' && (
          <div className="space-y-5">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Project Name</FormLabel>
                  <FormControl>
                    <Input 
                      placeholder="Enter project name" 
                      {...field} 
                    />
                  </FormControl>
                  <FormDescription>
                    A clear, concise name for your implementation project.
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
                  <FormLabel>Description</FormLabel>
                  <FormControl>
                    <Textarea 
                      placeholder="Describe the project's purpose and goals" 
                      className="min-h-[100px]"
                      {...field} 
                    />
                  </FormControl>
                  <FormDescription>
                    Provide a comprehensive overview of the project.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="mission"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Mission Statement</FormLabel>
                  <FormControl>
                    <Textarea 
                      placeholder="What is the core mission of this project?" 
                      className="min-h-[70px]"
                      {...field} 
                    />
                  </FormControl>
                  <FormDescription>
                    Define the fundamental purpose this project aims to fulfill.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <div className="flex gap-4">
              <FormField
                control={form.control}
                name="deadline"
                render={({ field }) => (
                  <FormItem className="flex-1">
                    <FormLabel>Deadline</FormLabel>
                    <FormControl>
                      <Input 
                        type="date" 
                        {...field} 
                      />
                    </FormControl>
                    <FormDescription>
                      Target completion date
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="status"
                render={({ field }) => (
                  <FormItem className="flex-1">
                    <FormLabel>Status</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select status" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="planning">Planning</SelectItem>
                        <SelectItem value="in-progress">In Progress</SelectItem>
                        <SelectItem value="on-hold">On Hold</SelectItem>
                        <SelectItem value="completed">Completed</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormDescription>
                      Current project status
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            
            <div className="flex justify-between pt-2">
              {onBack && (
                <Button
                  type="button"
                  variant="outline"
                  onClick={onBack}
                >
                  Back
                </Button>
              )}
              <Button
                type="button"
                onClick={() => setCurrentSection('scope')}
              >
                Next
              </Button>
            </div>
          </div>
        )}
        
        {currentSection === 'scope' && (
          <div className="space-y-5">
            <FormField
              control={form.control}
              name="goals"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Project Goals</FormLabel>
                  <FormControl>
                    <TagInput
                      placeholder="Add a goal and press Enter"
                      tags={field.value}
                      setTags={(tags) => field.onChange(tags)}
                    />
                  </FormControl>
                  <FormDescription>
                    Specific, measurable objectives you plan to achieve.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="inScope"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>In Scope</FormLabel>
                  <FormControl>
                    <TagInput
                      placeholder="Add in-scope item and press Enter"
                      tags={field.value}
                      setTags={(tags) => field.onChange(tags)}
                    />
                  </FormControl>
                  <FormDescription>
                    Features and work that are included in this project.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="outOfScope"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Out of Scope</FormLabel>
                  <FormControl>
                    <TagInput
                      placeholder="Add out-of-scope item and press Enter"
                      tags={field.value}
                      setTags={(tags) => field.onChange(tags)}
                    />
                  </FormControl>
                  <FormDescription>
                    Features and work explicitly excluded from this project.
                  </FormDescription>
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
                  <FormControl>
                    <TagInput
                      placeholder="Add constraint and press Enter"
                      tags={field.value}
                      setTags={(tags) => field.onChange(tags)}
                    />
                  </FormControl>
                  <FormDescription>
                    Limitations or restrictions affecting the project (time, budget, resources).
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <div className="flex justify-between pt-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => setCurrentSection('basic')}
              >
                Back
              </Button>
              <Button
                type="button"
                onClick={() => setCurrentSection('technical')}
              >
                Next
              </Button>
            </div>
          </div>
        )}
        
        {currentSection === 'technical' && (
          <div className="space-y-5">
            <FormField
              control={form.control}
              name="technicalRequirements"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Technical Requirements</FormLabel>
                  <FormControl>
                    <Textarea 
                      placeholder="List key technical requirements and specifications" 
                      className="min-h-[120px]"
                      {...field} 
                    />
                  </FormControl>
                  <FormDescription>
                    Technical specifications, dependencies, or platform requirements.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="aiOptimized"
              render={({ field }) => (
                <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3 shadow-sm">
                  <div className="space-y-0.5">
                    <FormLabel>AI-Optimized Project</FormLabel>
                    <FormDescription>
                      This project involves AI development or integration.
                    </FormDescription>
                  </div>
                  <FormControl>
                    <Switch
                      checked={field.value}
                      onCheckedChange={(checked) => {
                        field.onChange(checked);
                        if (checked) {
                          setCurrentSection('ai');
                        }
                      }}
                    />
                  </FormControl>
                </FormItem>
              )}
            />
            
            <div className="flex justify-between pt-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => setCurrentSection('scope')}
              >
                Back
              </Button>
              {form.watch('aiOptimized') ? (
                <Button
                  type="button"
                  onClick={() => setCurrentSection('ai')}
                >
                  Next
                </Button>
              ) : (
                <Button type="submit">
                  Create Project
                </Button>
              )}
            </div>
          </div>
        )}
        
        {currentSection === 'ai' && (
          <div className="space-y-5">
            <FormField
              control={form.control}
              name="aiModelRequirements"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>AI Model Requirements</FormLabel>
                  <FormControl>
                    <Textarea 
                      placeholder="Specify required AI models, tokens, context sizes, etc." 
                      className="min-h-[100px]"
                      {...field} 
                    />
                  </FormControl>
                  <FormDescription>
                    Details about specific AI models, performance requirements, or API integrations.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="aiEthicalConsiderations"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Ethical Considerations</FormLabel>
                  <FormControl>
                    <TagInput
                      placeholder="Add ethical consideration and press Enter"
                      tags={field.value}
                      setTags={(tags) => field.onChange(tags)}
                    />
                  </FormControl>
                  <FormDescription>
                    Ethical guidelines, safety measures, and responsible AI principles.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <Separator className="my-4" />
            
            <FormField
              control={form.control}
              name="enhanceWithAi"
              render={({ field }) => (
                <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3 shadow-sm">
                  <div className="space-y-0.5">
                    <FormLabel>AI Enhancement</FormLabel>
                    <FormDescription>
                      Allow AI to enhance this project with suggestions and improvements.
                    </FormDescription>
                  </div>
                  <FormControl>
                    <Switch
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                  </FormControl>
                </FormItem>
              )}
            />
            
            <div className="flex justify-between pt-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => setCurrentSection('technical')}
              >
                Back
              </Button>
              <Button type="submit">
                Create Project
              </Button>
            </div>
          </div>
        )}
      </form>
    </Form>
  );
}