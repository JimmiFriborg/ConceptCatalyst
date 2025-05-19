import { useState } from "react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { Plus, Lightbulb, FolderKanban, Puzzle, FileUp } from "lucide-react";
import { UnifiedCreationWizard } from "@/components/creation-wizard/unified-creation-wizard";

export function UnifiedCreateMenu({ projectId }: { projectId?: number }) {
  const [isCreationWizardOpen, setIsCreationWizardOpen] = useState(false);
  const [creationType, setCreationType] = useState<"concept" | "project" | "feature" | "import">("concept");
  
  const handleOpenCreation = (type: "concept" | "project" | "feature" | "import") => {
    setCreationType(type);
    setIsCreationWizardOpen(true);
  };
  
  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            Add
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuLabel>Create New</DropdownMenuLabel>
          <DropdownMenuItem onClick={() => handleOpenCreation("concept")}>
            <Lightbulb className="mr-2 h-4 w-4 text-amber-500" />
            <span>New Concept</span>
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => handleOpenCreation("project")}>
            <FolderKanban className="mr-2 h-4 w-4 text-blue-500" />
            <span>New Project</span>
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => handleOpenCreation("feature")}>
            <Puzzle className="mr-2 h-4 w-4 text-green-500" />
            <span>New Feature</span>
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuLabel>Import</DropdownMenuLabel>
          <DropdownMenuItem onClick={() => handleOpenCreation("import")}>
            <FileUp className="mr-2 h-4 w-4 text-purple-500" />
            <span>Import</span>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <UnifiedCreationWizard
        open={isCreationWizardOpen}
        onOpenChange={setIsCreationWizardOpen}
        initialType={creationType}
        projectId={projectId}
      />
    </>
  );
}