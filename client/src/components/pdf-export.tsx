import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Download } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import jsPDF from "jspdf";
import { Project, Feature } from "@shared/schema";

interface PdfExportProps {
  project: Project;
  features: Feature[];
}

interface ExportOptions {
  includeDescription: boolean;
  includeInspirations: boolean;
  includeTargetAudience: boolean;
  includeFeatures: boolean;
  includeAiFeatures: boolean;
  includeProjectInfo: boolean;
}

export function PdfExport({ project, features }: PdfExportProps) {
  const [isExporting, setIsExporting] = useState(false);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const { toast } = useToast();
  
  const [exportOptions, setExportOptions] = useState<ExportOptions>({
    includeDescription: true,
    includeInspirations: true,
    includeTargetAudience: true,
    includeFeatures: true,
    includeAiFeatures: true,
    includeProjectInfo: false,
  });

  const generatePDF = async () => {
    setIsExporting(true);
    
    try {
      const pdf = new jsPDF();
      let yPosition = 20;
      const pageHeight = pdf.internal.pageSize.height;
      const margin = 20;
      const lineHeight = 6;
      
      // Helper function to add text with wrapping
      const addWrappedText = (text: string, x: number, y: number, maxWidth: number, fontSize: number = 12) => {
        pdf.setFontSize(fontSize);
        const lines = pdf.splitTextToSize(text, maxWidth);
        
        for (let i = 0; i < lines.length; i++) {
          if (y > pageHeight - 30) {
            pdf.addPage();
            y = 20;
          }
          pdf.text(lines[i], x, y);
          y += lineHeight;
        }
        return y;
      };

      // Title
      pdf.setFontSize(20);
      pdf.setFont("helvetica", "bold");
      pdf.text(project.name || "Untitled Project", margin, yPosition);
      yPosition += 15;

      // Project type badge
      pdf.setFontSize(10);
      pdf.setFont("helvetica", "normal");
      const projectType = project.isConcept ? "CONCEPT" : "PROJECT";
      pdf.text(`[${projectType}]`, margin, yPosition);
      yPosition += 15;

      // Description
      if (exportOptions.includeDescription && project.description) {
        pdf.setFontSize(14);
        pdf.setFont("helvetica", "bold");
        pdf.text("Description", margin, yPosition);
        yPosition += 10;
        
        pdf.setFont("helvetica", "normal");
        yPosition = addWrappedText(project.description, margin, yPosition, 170, 11);
        yPosition += 10;
      }

      // Inspirations (for concepts)
      if (exportOptions.includeInspirations && project.inspirations && project.inspirations.length > 0) {
        pdf.setFontSize(14);
        pdf.setFont("helvetica", "bold");
        pdf.text("Inspirations", margin, yPosition);
        yPosition += 10;
        
        pdf.setFont("helvetica", "normal");
        const inspirationsText = Array.isArray(project.inspirations) 
          ? project.inspirations.join(", ")
          : project.inspirations;
        yPosition = addWrappedText(inspirationsText, margin, yPosition, 170, 11);
        yPosition += 10;
      }

      // Target Audience
      if (exportOptions.includeTargetAudience && project.targetAudience) {
        pdf.setFontSize(14);
        pdf.setFont("helvetica", "bold");
        pdf.text("Target Audience", margin, yPosition);
        yPosition += 10;
        
        pdf.setFont("helvetica", "normal");
        yPosition = addWrappedText(project.targetAudience, margin, yPosition, 170, 11);
        yPosition += 10;
      }

      // Project Info (mission, goals, scope)
      if (exportOptions.includeProjectInfo) {
        if (project.mission) {
          pdf.setFontSize(14);
          pdf.setFont("helvetica", "bold");
          pdf.text("Mission", margin, yPosition);
          yPosition += 10;
          
          pdf.setFont("helvetica", "normal");
          yPosition = addWrappedText(project.mission, margin, yPosition, 170, 11);
          yPosition += 10;
        }

        if (project.goals && project.goals.length > 0) {
          pdf.setFontSize(14);
          pdf.setFont("helvetica", "bold");
          pdf.text("Goals", margin, yPosition);
          yPosition += 10;
          
          pdf.setFont("helvetica", "normal");
          project.goals.forEach((goal: string) => {
            yPosition = addWrappedText(`• ${goal}`, margin, yPosition, 170, 11);
          });
          yPosition += 5;
        }

        if (project.inScope && project.inScope.length > 0) {
          pdf.setFontSize(14);
          pdf.setFont("helvetica", "bold");
          pdf.text("In Scope", margin, yPosition);
          yPosition += 10;
          
          pdf.setFont("helvetica", "normal");
          project.inScope.forEach((item: string) => {
            yPosition = addWrappedText(`• ${item}`, margin, yPosition, 170, 11);
          });
          yPosition += 5;
        }

        if (project.outOfScope && project.outOfScope.length > 0) {
          pdf.setFontSize(14);
          pdf.setFont("helvetica", "bold");
          pdf.text("Out of Scope", margin, yPosition);
          yPosition += 10;
          
          pdf.setFont("helvetica", "normal");
          project.outOfScope.forEach((item: string) => {
            yPosition = addWrappedText(`• ${item}`, margin, yPosition, 170, 11);
          });
          yPosition += 5;
        }
      }

      // Features
      if ((exportOptions.includeFeatures || exportOptions.includeAiFeatures) && features.length > 0) {
        // Add new page for features if needed
        if (yPosition > pageHeight - 50) {
          pdf.addPage();
          yPosition = 20;
        }

        pdf.setFontSize(16);
        pdf.setFont("helvetica", "bold");
        pdf.text("Features", margin, yPosition);
        yPosition += 15;

        // Group features by category
        const categorizedFeatures = features.reduce((acc, feature) => {
          const category = feature.category || "uncategorized";
          if (!acc[category]) acc[category] = [];
          acc[category].push(feature);
          return acc;
        }, {} as Record<string, Feature[]>);

        // Display features by category
        Object.entries(categorizedFeatures).forEach(([category, categoryFeatures]) => {
          if (yPosition > pageHeight - 30) {
            pdf.addPage();
            yPosition = 20;
          }

          // Category header
          pdf.setFontSize(14);
          pdf.setFont("helvetica", "bold");
          const categoryName = category.charAt(0).toUpperCase() + category.slice(1);
          pdf.text(categoryName, margin, yPosition);
          yPosition += 10;

          categoryFeatures.forEach((feature, index) => {
            if (yPosition > pageHeight - 40) {
              pdf.addPage();
              yPosition = 20;
            }

            // Feature name
            pdf.setFontSize(12);
            pdf.setFont("helvetica", "bold");
            yPosition = addWrappedText(`${index + 1}. ${feature.name}`, margin, yPosition, 170, 12);
            
            // Feature description
            pdf.setFont("helvetica", "normal");
            yPosition = addWrappedText(feature.description, margin + 10, yPosition, 160, 10);
            
            // Perspective badge
            pdf.setFontSize(8);
            pdf.text(`[${feature.perspective}]`, margin + 10, yPosition);
            yPosition += 8;
          });

          yPosition += 5;
        });
      }

      // Generate filename
      const filename = `${project.name?.replace(/[^a-z0-9]/gi, '_').toLowerCase() || 'project'}_export.pdf`;
      
      // Save the PDF
      pdf.save(filename);
      
      toast({
        title: "Export successful",
        description: `PDF exported as ${filename}`,
      });
      
      setIsDialogOpen(false);
    } catch (error) {
      console.error("Error generating PDF:", error);
      toast({
        title: "Export failed",
        description: "Failed to generate PDF. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm">
          <Download className="mr-2 h-4 w-4" />
          Export PDF
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Export to PDF</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4">
          <p className="text-sm text-muted-foreground">
            Choose what to include in your PDF export:
          </p>
          
          <div className="space-y-3">
            <div className="flex items-center space-x-2">
              <Checkbox
                id="description"
                checked={exportOptions.includeDescription}
                onCheckedChange={(checked) =>
                  setExportOptions(prev => ({ ...prev, includeDescription: !!checked }))
                }
              />
              <Label htmlFor="description">Project/Concept Description</Label>
            </div>
            
            {project.inspirations && (
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="inspirations"
                  checked={exportOptions.includeInspirations}
                  onCheckedChange={(checked) =>
                    setExportOptions(prev => ({ ...prev, includeInspirations: !!checked }))
                  }
                />
                <Label htmlFor="inspirations">Inspirations</Label>
              </div>
            )}
            
            {project.targetAudience && (
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="targetAudience"
                  checked={exportOptions.includeTargetAudience}
                  onCheckedChange={(checked) =>
                    setExportOptions(prev => ({ ...prev, includeTargetAudience: !!checked }))
                  }
                />
                <Label htmlFor="targetAudience">Target Audience</Label>
              </div>
            )}
            
            <div className="flex items-center space-x-2">
              <Checkbox
                id="features"
                checked={exportOptions.includeFeatures}
                onCheckedChange={(checked) =>
                  setExportOptions(prev => ({ ...prev, includeFeatures: !!checked }))
                }
              />
              <Label htmlFor="features">Manual Features</Label>
            </div>
            
            <div className="flex items-center space-x-2">
              <Checkbox
                id="aiFeatures"
                checked={exportOptions.includeAiFeatures}
                onCheckedChange={(checked) =>
                  setExportOptions(prev => ({ ...prev, includeAiFeatures: !!checked }))
                }
              />
              <Label htmlFor="aiFeatures">AI Generated Features</Label>
            </div>
            
            <div className="flex items-center space-x-2">
              <Checkbox
                id="projectInfo"
                checked={exportOptions.includeProjectInfo}
                onCheckedChange={(checked) =>
                  setExportOptions(prev => ({ ...prev, includeProjectInfo: !!checked }))
                }
              />
              <Label htmlFor="projectInfo">Project Info (Mission, Goals, Scope)</Label>
            </div>
          </div>
          
          <div className="flex justify-end space-x-2 pt-4">
            <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={generatePDF} disabled={isExporting}>
              {isExporting ? "Exporting..." : "Export PDF"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}