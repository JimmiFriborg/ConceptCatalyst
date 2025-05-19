import { useState } from "react";
import { useLocation } from "wouter";
import { CreationType, EnhancedCreationWizard } from "@/components/creation-wizard/enhanced-creation-wizard";
import { RouteComponentProps } from "wouter";

// This component will be directly used by Wouter
export default function CreationPage({ params }: RouteComponentProps) {
  const [isOpen, setIsOpen] = useState(true);
  const [_, navigate] = useLocation();
  
  // Get initialType from params if available
  const typeFromParams = params?.type as string | undefined;
  
  // Close and navigate back to home when wizard is closed
  const handleOpenChange = (open: boolean) => {
    setIsOpen(open);
    if (!open) {
      navigate("/");
    }
  };
  
  // Normalize the initialType value to ensure it's valid
  const validTypes: CreationType[] = ["concept", "project", "feature", "import"];
  const initialType = typeFromParams && validTypes.includes(typeFromParams as CreationType)
    ? typeFromParams as CreationType 
    : "concept";
  
  // Get projectId from URL if available for feature creation
  const searchParams = new URLSearchParams(window.location.search);
  const projectId = searchParams.get('projectId') ? parseInt(searchParams.get('projectId')!) : undefined;
  
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
      <EnhancedCreationWizard 
        open={isOpen} 
        onOpenChange={handleOpenChange}
        initialType={initialType}
        projectId={projectId}
      />
    </div>
  );
}