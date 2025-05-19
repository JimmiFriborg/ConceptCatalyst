import { z } from "zod";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { TagInput } from "@/components/ui/tag-input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

// Form schema for features
const featureSchema = z.object({
  name: z.string().min(3, "Name must be at least 3 characters"),
  description: z.string().min(10, "Description must be at least 10 characters"),
  perspective: z.enum(["technical", "business", "security", "ux"]),
  userBenefit: z.string().optional(),
  implementationComplexity: z.enum(["low", "medium", "high"]).default("medium"),
  priority: z.enum(["low", "medium", "high"]).default("medium"),
  dependencies: z.array(z.string()).default([]),
  tags: z.array(z.string()).default([]),
  enhanceWithAi: z.boolean().default(true),
});

export type FeatureFormData = z.infer<typeof featureSchema>;

interface FeatureFormProps {
  defaultValues?: Partial<FeatureFormData>;
  onSubmit: (data: FeatureFormData) => void;
  onBack?: () => void;
  projectId?: number;
}

export function FeatureForm({ 
  defaultValues, 
  onSubmit, 
  onBack,
  projectId 
}: FeatureFormProps) {
  const form = useForm<FeatureFormData>({
    resolver: zodResolver(featureSchema),
    defaultValues: {
      name: "",
      description: "",
      perspective: "technical",
      userBenefit: "",
      implementationComplexity: "medium",
      priority: "medium",
      dependencies: [],
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
                <FormLabel>Feature Name</FormLabel>
                <FormControl>
                  <Input 
                    placeholder="Enter a clear feature name" 
                    {...field} 
                  />
                </FormControl>
                <FormDescription>
                  A concise name that describes this specific feature.
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
                    placeholder="Describe what this feature does and why it's needed" 
                    className="min-h-[100px]"
                    {...field} 
                  />
                </FormControl>
                <FormDescription>
                  Provide a detailed description of the feature's functionality.
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
          
          <FormField
            control={form.control}
            name="perspective"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Perspective</FormLabel>
                <FormControl>
                  <RadioGroup
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                    className="flex flex-wrap gap-4"
                  >
                    <FormItem className="flex items-center space-x-2 space-y-0">
                      <FormControl>
                        <RadioGroupItem value="technical" />
                      </FormControl>
                      <FormLabel className="cursor-pointer font-normal">Technical</FormLabel>
                    </FormItem>
                    <FormItem className="flex items-center space-x-2 space-y-0">
                      <FormControl>
                        <RadioGroupItem value="business" />
                      </FormControl>
                      <FormLabel className="cursor-pointer font-normal">Business</FormLabel>
                    </FormItem>
                    <FormItem className="flex items-center space-x-2 space-y-0">
                      <FormControl>
                        <RadioGroupItem value="security" />
                      </FormControl>
                      <FormLabel className="cursor-pointer font-normal">Security</FormLabel>
                    </FormItem>
                    <FormItem className="flex items-center space-x-2 space-y-0">
                      <FormControl>
                        <RadioGroupItem value="ux" />
                      </FormControl>
                      <FormLabel className="cursor-pointer font-normal">User Experience</FormLabel>
                    </FormItem>
                  </RadioGroup>
                </FormControl>
                <FormDescription>
                  The primary perspective this feature addresses.
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
          
          <FormField
            control={form.control}
            name="userBenefit"
            render={({ field }) => (
              <FormItem>
                <FormLabel>User Benefit</FormLabel>
                <FormControl>
                  <Textarea 
                    placeholder="How does this feature benefit the user?" 
                    className="min-h-[80px]"
                    {...field} 
                  />
                </FormControl>
                <FormDescription>
                  Explain how users or stakeholders will benefit from this feature.
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormField
              control={form.control}
              name="implementationComplexity"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Implementation Complexity</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select complexity" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="low">Low</SelectItem>
                      <SelectItem value="medium">Medium</SelectItem>
                      <SelectItem value="high">High</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormDescription>
                    How complex this feature is to implement.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="priority"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Priority</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select priority" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="low">Low</SelectItem>
                      <SelectItem value="medium">Medium</SelectItem>
                      <SelectItem value="high">High</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormDescription>
                    The importance of this feature.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
          
          <FormField
            control={form.control}
            name="dependencies"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Dependencies</FormLabel>
                <FormControl>
                  <TagInput
                    placeholder="Add a dependency and press Enter"
                    tags={field.value}
                    setTags={(tags) => field.onChange(tags)}
                  />
                </FormControl>
                <FormDescription>
                  Other features or components this feature depends on.
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
          
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
                  Categorization tags to group related features.
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
                    Allow AI to enhance this feature with suggestions and improvements.
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
              Create Feature
            </Button>
          </div>
        </div>
      </form>
    </Form>
  );
}