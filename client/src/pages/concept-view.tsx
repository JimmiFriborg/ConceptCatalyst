import { useParams } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ArrowLeft, Sparkles, Users, Target, Lightbulb, Download } from "lucide-react";
import { Link } from "wouter";
import { PdfExport } from "@/components/pdf-export";
import { AddFeatureDialog } from "@/components/add-feature-dialog";
import { AiSuggestionsPanel } from "@/components/ai-suggestions-panel";
import { EnhancedCategoryZones } from "@/components/enhanced-category-zones";
import { useState } from "react";

export default function ConceptView() {
  const params = useParams();
  const conceptId = parseInt(params.id);
  const [isAddFeatureOpen, setIsAddFeatureOpen] = useState(false);

  const { data: concept, isLoading: conceptLoading } = useQuery({
    queryKey: [`/api/projects/${conceptId}`],
  });

  const { data: features } = useQuery({
    queryKey: [`/api/projects/${conceptId}/features`],
  });

  const { data: suggestions } = useQuery({
    queryKey: [`/api/projects/${conceptId}/ai/suggestions`],
  });

  if (conceptLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading your concept...</p>
        </div>
      </div>
    );
  }

  if (!concept) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-2">Concept not found</h2>
          <p className="text-muted-foreground mb-4">The concept you're looking for doesn't exist.</p>
          <Link href="/">
            <Button>Return to Dashboard</Button>
          </Link>
        </div>
      </div>
    );
  }

  const handleFeatureAdded = () => {
    // Refresh features after adding
    // This will be handled by React Query cache invalidation
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50/30">
      <div className="container mx-auto px-4 py-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-4">
            <Link href="/">
              <Button variant="ghost" size="sm">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back to Dashboard
              </Button>
            </Link>
            <div>
              <div className="flex items-center gap-3 mb-1">
                <h1 className="text-3xl font-bold text-gray-900">{concept.name}</h1>
                <Badge variant="secondary" className="bg-purple-100 text-purple-800">
                  <Lightbulb className="mr-1 h-3 w-3" />
                  Concept
                </Badge>
              </div>
              <p className="text-gray-600 max-w-2xl">{concept.description}</p>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            {concept && (
              <PdfExport 
                project={concept} 
                features={features || []} 
              />
            )}
            <Button onClick={() => setIsAddFeatureOpen(true)}>
              <Sparkles className="mr-2 h-4 w-4" />
              Add Feature
            </Button>
          </div>
        </div>

        <Tabs defaultValue="overview" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="features">
              Features {features?.length ? `(${features.length})` : ''}
            </TabsTrigger>
            <TabsTrigger value="ai-insights">
              AI Insights {suggestions?.length ? `(${suggestions.length})` : ''}
            </TabsTrigger>
            <TabsTrigger value="development">Development</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            <div className="grid md:grid-cols-2 gap-6">
              {/* Inspirations */}
              {(concept as any).inspirations && (concept as any).inspirations.length > 0 && (
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Target className="h-5 w-5 text-orange-500" />
                      Inspirations
                    </CardTitle>
                    <CardDescription>
                      Games and experiences that inspired this concept
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="flex flex-wrap gap-2">
                      {Array.isArray((concept as any).inspirations) 
                        ? (concept as any).inspirations.map((inspiration: string, index: number) => (
                          <Badge key={index} variant="outline" className="bg-orange-50 border-orange-200 text-orange-800">
                            {inspiration}
                          </Badge>
                        ))
                        : (concept as any).inspirations.split(',').map((inspiration: string, index: number) => (
                          <Badge key={index} variant="outline" className="bg-orange-50 border-orange-200 text-orange-800">
                            {inspiration.trim()}
                          </Badge>
                        ))
                      }
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Target Audience */}
              {(concept as any).targetAudience && (
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Users className="h-5 w-5 text-blue-500" />
                      Target Audience
                    </CardTitle>
                    <CardDescription>
                      Who is this concept designed for?
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <p className="text-gray-700">{(concept as any).targetAudience}</p>
                  </CardContent>
                </Card>
              )}

              {/* Core Features */}
              {(concept as any).potentialFeatures && (concept as any).potentialFeatures.length > 0 && (
                <Card className="md:col-span-2">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Sparkles className="h-5 w-5 text-green-500" />
                      Initial Feature Ideas
                    </CardTitle>
                    <CardDescription>
                      Early brainstorming for potential features
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      {(concept as any).potentialFeatures.map((feature: string, index: number) => (
                        <div key={index} className="flex items-start gap-2 p-3 bg-green-50 rounded-lg border border-green-200">
                          <div className="w-2 h-2 bg-green-500 rounded-full mt-2 flex-shrink-0"></div>
                          <p className="text-green-800">{feature}</p>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>
          </TabsContent>

          <TabsContent value="features">
            <EnhancedCategoryZones />
          </TabsContent>

          <TabsContent value="ai-insights">
            <AiSuggestionsPanel onFeatureAdded={handleFeatureAdded} />
          </TabsContent>

          <TabsContent value="development" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Ready to Develop?</CardTitle>
                <CardDescription>
                  Transform your concept into a development-ready project
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600 mb-4">
                  When you're ready to move from ideation to implementation, you can convert this concept 
                  into a full project with detailed specifications, technical requirements, and development roadmap.
                </p>
                <Button className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700">
                  <Target className="mr-2 h-4 w-4" />
                  Convert to Project
                </Button>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>

      {/* Add Feature Dialog */}
      <AddFeatureDialog
        open={isAddFeatureOpen}
        onOpenChange={setIsAddFeatureOpen}
      />
    </div>
  );
}