import React, { useState } from "react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { PlusCircle, Lightbulb, FolderKanban, FileUp, FileCode } from "lucide-react";
import { SimpleProjectWizard } from "@/components/simple-project-wizard";
import { ImportProjectDialog } from "@/components/import-project-dialog";

export function UnifiedCreateMenu() {
  const [isAddProjectOpen, setIsAddProjectOpen] = useState(false);
  const [isAddConceptOpen, setIsAddConceptOpen] = useState(false);
  const [isImportProjectOpen, setIsImportProjectOpen] = useState(false);
  
  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button>
            <PlusCircle className="mr-2 h-4 w-4" />
            Create New
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuLabel>Create New</DropdownMenuLabel>
          <DropdownMenuItem onClick={() => setIsAddConceptOpen(true)}>
            <Lightbulb className="mr-2 h-4 w-4" />
            <span>New Concept</span>
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => setIsAddProjectOpen(true)}>
            <FolderKanban className="mr-2 h-4 w-4" />
            <span>New Project</span>
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuLabel>Import</DropdownMenuLabel>
          <DropdownMenuItem onClick={() => setIsImportProjectOpen(true)}>
            <FileUp className="mr-2 h-4 w-4" />
            <span>Import Project</span>
          </DropdownMenuItem>
          <DropdownMenuItem disabled>
            <FileCode className="mr-2 h-4 w-4" />
            <span>Import Features</span>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      {/* Dialogs */}
      <SimpleProjectWizard
        open={isAddProjectOpen || isAddConceptOpen}
        onOpenChange={(open) => {
          if (isAddProjectOpen) setIsAddProjectOpen(open);
          if (isAddConceptOpen) setIsAddConceptOpen(open);
        }}
        type={isAddConceptOpen ? "concept" : "project"}
      />
      
      <ImportProjectDialog
        open={isImportProjectOpen}
        onOpenChange={setIsImportProjectOpen}
      />
    </>
  );
}