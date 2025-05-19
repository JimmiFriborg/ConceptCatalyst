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

// Form schema for concepts
const conceptSchema = z.object({
  name: z.string().min(3, "Name must be at least 3 characters"),
  description: z.string().min(10, "Description must be at least 10 characters"),
  targetAudience: z.string().optional(),
  problemSolved: z.string().optional(),
  goals: z.array(z.string()).default([]),
  inScope: z.array(z.string()).default([]),
  outOfScope: z.array(z.string()).default([]),
  enhanceWithAi: z.boolean().default(true),
});

export type ConceptFormData = z.infer<typeof conceptSchema>;

interface ConceptFormProps {
  defaultValues?: Partial<ConceptFormData>;
  onSubmit: (data: ConceptFormData) => void;
  onBack?: () => void;
}

export function ConceptForm({ defaultValues, onSubmit, onBack }: ConceptFormProps) {
  const [currentSection, setCurrentSection] = useState<'basic' | 'details'>('basic');
  
  const form = useForm<ConceptFormData>({
    resolver: zodResolver(conceptSchema),
    defaultValues: {
      name: "",
      description: "",
      targetAudience: "",
      problemSolved: "",
      goals: [],
      inScope: [],
      outOfScope: [],
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
                  <FormLabel>Concept Name</FormLabel>
                  <FormControl>
                    <Input 
                      placeholder="Enter a memorable name for your concept" 
                      {...field} 
                    />
                  </FormControl>
                  <FormDescription>
                    A clear, concise name that captures the essence of your idea.
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
                      placeholder="Describe your concept in detail" 
                      className="min-h-[100px]"
                      {...field} 
                    />
                  </FormControl>
                  <FormDescription>
                    Provide a detailed overview of your concept.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            
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
                onClick={() => setCurrentSection('details')}
              >
                Next
              </Button>
            </div>
          </div>
        )}
        
        {currentSection === 'details' && (
          <div className="space-y-5">
            <FormField
              control={form.control}
              name="targetAudience"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Target Audience</FormLabel>
                  <FormControl>
                    <Textarea 
                      placeholder="Who is this concept designed for?" 
                      className="min-h-[70px]"
                      {...field} 
                    />
                  </FormControl>
                  <FormDescription>
                    Describe the users or customers who would benefit from this concept.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="problemSolved"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Problem Solved</FormLabel>
                  <FormControl>
                    <Textarea 
                      placeholder="What problem does this concept solve?" 
                      className="min-h-[70px]"
                      {...field} 
                    />
                  </FormControl>
                  <FormDescription>
                    Explain the challenge or pain point this concept addresses.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="goals"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Goals</FormLabel>
                  <FormControl>
                    <TagInput
                      placeholder="Add a goal and press Enter"
                      tags={field.value}
                      setTags={(tags) => field.onChange(tags)}
                    />
                  </FormControl>
                  <FormDescription>
                    Key objectives you aim to achieve with this concept.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="enhanceWithAi"
              render={({ field }) => (
                <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3 shadow-sm">
                  <div className="space-y-0.5">
                    <FormLabel>AI Enhancement</FormLabel>
                    <FormDescription>
                      Allow AI to enhance this concept with suggestions and improvements.
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
                onClick={() => setCurrentSection('basic')}
              >
                Back
              </Button>
              <Button type="submit">
                Create Concept
              </Button>
            </div>
          </div>
        )}
      </form>
    </Form>
  );
}