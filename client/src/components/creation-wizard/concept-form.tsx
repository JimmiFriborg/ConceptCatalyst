import { z } from "zod";
import { useState } from "react";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { TagInput } from "@/components/ui/tag-input";
import { Separator } from "@/components/ui/separator";

// Form schema for concepts - streamlined for quick creation
const conceptSchema = z.object({
  name: z.string().min(3, "Name must be at least 3 characters"),
  description: z.string().min(10, "Description must be at least 10 characters"),
  inspirations: z.array(z.string()).default([]),
  targetAudience: z.string().optional(),
  potentialFeatures: z.array(z.string()).default([]),
  isAiConcept: z.boolean().default(false),
  aiPotential: z.string().optional(),
  tags: z.array(z.string()).default([]),
  enhanceWithAi: z.boolean().default(true),
});

export type ConceptFormData = z.infer<typeof conceptSchema>;

interface ConceptFormProps {
  defaultValues?: Partial<ConceptFormData>;
  onSubmit: (data: ConceptFormData) => void;
  onBack?: () => void;
}

export function ConceptForm({ defaultValues, onSubmit, onBack }: ConceptFormProps) {
  const [showAiSection, setShowAiSection] = useState(false);
  
  const form = useForm<ConceptFormData>({
    resolver: zodResolver(conceptSchema),
    defaultValues: {
      name: "",
      description: "",
      inspirations: [],
      targetAudience: "",
      potentialFeatures: [],
      isAiConcept: false,
      aiPotential: "",
      tags: [],
      enhanceWithAi: true,
      ...defaultValues
    },
  });

  const handleSubmit = form.handleSubmit(onSubmit);

  return (
    <Form {...form}>
      <form className="space-y-6" onSubmit={handleSubmit}>
        <div className="space-y-5">
          <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Concept Name</FormLabel>
                <FormControl>
                  <Input 
                    placeholder="Enter a concise, memorable name" 
                    {...field} 
                  />
                </FormControl>
                <FormDescription>
                  A short, descriptive name for your concept.
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
                <FormLabel>Concept Description</FormLabel>
                <FormControl>
                  <Textarea 
                    placeholder="Briefly describe your concept idea" 
                    className="min-h-[100px]"
                    {...field} 
                  />
                </FormControl>
                <FormDescription>
                  A simple explanation of your concept - what problem does it solve?
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
          
          <FormField
            control={form.control}
            name="inspirations"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Inspirations</FormLabel>
                <FormControl>
                  <TagInput
                    placeholder="Add inspiration and press Enter"
                    tags={field.value}
                    setTags={(tags) => field.onChange(tags)}
                  />
                </FormControl>
                <FormDescription>
                  Sources of inspiration or similar existing products.
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
          
          <FormField
            control={form.control}
            name="targetAudience"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Target Audience</FormLabel>
                <FormControl>
                  <Input 
                    placeholder="Who is this concept for?" 
                    {...field} 
                  />
                </FormControl>
                <FormDescription>
                  The primary users or beneficiaries of this concept.
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
          
          <FormField
            control={form.control}
            name="potentialFeatures"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Potential Features</FormLabel>
                <FormControl>
                  <TagInput
                    placeholder="Add feature idea and press Enter"
                    tags={field.value}
                    setTags={(tags) => field.onChange(tags)}
                  />
                </FormControl>
                <FormDescription>
                  Quick list of possible features - you can refine these later.
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
          
          <FormField
            control={form.control}
            name="isAiConcept"
            render={({ field }) => (
              <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3 shadow-sm">
                <div className="space-y-0.5">
                  <FormLabel>AI-Based Concept</FormLabel>
                  <FormDescription>
                    This concept involves AI technology or capabilities.
                  </FormDescription>
                </div>
                <FormControl>
                  <Switch
                    checked={field.value}
                    onCheckedChange={(checked) => {
                      field.onChange(checked);
                      setShowAiSection(checked);
                    }}
                  />
                </FormControl>
              </FormItem>
            )}
          />
          
          {showAiSection && (
            <>
              <Separator className="my-3" />
              <FormField
                control={form.control}
                name="aiPotential"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>AI Potential</FormLabel>
                    <FormControl>
                      <Textarea 
                        placeholder="How could AI enhance or enable this concept?" 
                        className="min-h-[80px]"
                        {...field} 
                      />
                    </FormControl>
                    <FormDescription>
                      Brief overview of how AI could be leveraged in this concept.
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <Separator className="my-3" />
            </>
          )}
          
          <FormField
            control={form.control}
            name="tags"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Tags</FormLabel>
                <FormControl>
                  <TagInput
                    placeholder="Add a tag and press Enter"
                    tags={field.value}
                    setTags={(tags) => field.onChange(tags)}
                  />
                </FormControl>
                <FormDescription>
                  Keywords to help organize and find this concept later.
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
            {onBack && (
              <Button
                type="button"
                variant="outline"
                onClick={onBack}
              >
                Back
              </Button>
            )}
            <Button type="submit">
              Create Concept
            </Button>
          </div>
        </div>
      </form>
    </Form>
  );
}