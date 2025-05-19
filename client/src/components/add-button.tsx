import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { UnifiedCreationWizard } from "@/components/creation-wizard/unified-creation-wizard";

export function AddButton({ projectId }: { projectId?: number }) {
  const [isWizardOpen, setIsWizardOpen] = useState(false);
  
  return (
    <>
      <Button onClick={() => setIsWizardOpen(true)}>
        <Plus className="mr-2 h-4 w-4" />
        Add
      </Button>
      
      <UnifiedCreationWizard
        open={isWizardOpen}
        onOpenChange={setIsWizardOpen}
        projectId={projectId}
      />
    </>
  );
}