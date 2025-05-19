import { Project } from "@shared/schema";
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardFooter, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Code, Github, GitMerge, ExternalLink } from "lucide-react";
import { useState } from "react";

interface RepositoryTabProps {
  project?: Project;
  projectId: number;
  isLoading?: boolean;
}

export function RepositoryTab({ 
  project, 
  projectId,
  isLoading = false 
}: RepositoryTabProps) {
  const [repoUrl, setRepoUrl] = useState("");
  
  // This is a placeholder for future Git repository integration
  const hasLinkedRepo = false;
  
  return (
    <div className="space-y-6">
      <div className="flex items-center">
        <Code className="mr-2 h-5 w-5" />
        <h2 className="text-xl font-semibold">Repository Integration</h2>
      </div>

      {!hasLinkedRepo ? (
        <Card>
          <CardHeader>
            <CardTitle>Connect Repository</CardTitle>
            <CardDescription>
              Link this concept to a code repository to track implementation progress
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="text-sm font-medium mb-1 block">Repository URL</label>
              <div className="flex gap-2">
                <Input
                  placeholder="https://github.com/username/repository"
                  value={repoUrl}
                  onChange={(e) => setRepoUrl(e.target.value)}
                />
                <Button disabled={!repoUrl}>
                  <Github className="mr-2 h-4 w-4" />
                  Link
                </Button>
              </div>
            </div>
            
            <div className="pt-4 border-t">
              <h4 className="font-medium mb-2">No repository connected</h4>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Connect a repository to enable tracking of feature implementation and synchronize project metadata.
              </p>
            </div>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardHeader>
            <div className="flex justify-between">
              <CardTitle>Connected Repository</CardTitle>
              <Button variant="outline" size="sm">
                <ExternalLink className="h-4 w-4" />
              </Button>
            </div>
            <CardDescription>
              github.com/username/repository
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <div>
                  <h4 className="font-medium">Synchronization Status</h4>
                  <p className="text-sm text-gray-500">Last synced: Never</p>
                </div>
                <Button size="sm">
                  <GitMerge className="mr-2 h-4 w-4" />
                  Sync Now
                </Button>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4 border-t">
                <div>
                  <h4 className="font-medium mb-2">Implementation Progress</h4>
                  <div className="flex items-center mb-1">
                    <div className="w-full bg-gray-200 rounded-full h-2.5 dark:bg-gray-700">
                      <div className="bg-green-600 h-2.5 rounded-full w-0"></div>
                    </div>
                    <span className="ml-2 text-sm">0%</span>
                  </div>
                  <p className="text-xs text-gray-500">
                    0 out of 0 features implemented
                  </p>
                </div>
                
                <div>
                  <h4 className="font-medium mb-2">Activity</h4>
                  <p className="text-sm text-gray-500">
                    No recent activity
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
          <CardFooter className="border-t pt-4 flex justify-between">
            <Button variant="outline" size="sm">
              Disconnect
            </Button>
            <Button size="sm">
              Configure Sync
            </Button>
          </CardFooter>
        </Card>
      )}
    </div>
  );
}