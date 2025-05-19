import { useEffect, useState } from "react";
import { useLocation } from "wouter";
import { UnifiedCreationWizard } from "@/components/creation-wizard/unified-creation-wizard";

export default function CreationPage() {
  const [isOpen, setIsOpen] = useState(true);
  const [_, navigate] = useLocation();
  
  // Close and navigate back to home when wizard is closed
  const handleOpenChange = (open: boolean) => {
    setIsOpen(open);
    if (!open) {
      navigate("/");
    }
  };
  
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
      <UnifiedCreationWizard 
        open={isOpen} 
        onOpenChange={handleOpenChange}
        initialType="concept"
      />
    </div>
  );
}