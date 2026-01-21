import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { Plus, Trash2, Globe, FolderOpen } from 'lucide-react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

export type ProjectStatus = 'active' | 'paused' | 'archived';

export interface ClientProject {
  id: string;
  client_id: string;
  name: string;
  domain: string | null;
  status: ProjectStatus;
  created_at: string;
}

interface Props {
  clientId: string | undefined;
  isNewClient: boolean;
  projects: ClientProject[];
  onProjectsChange: (projects: ClientProject[]) => void;
}

export function ClientProjectsSection({ clientId, isNewClient, projects, onProjectsChange }: Props) {
  const { toast } = useToast();

  const handleAddProject = () => {
    const newProject: ClientProject = {
      id: `temp-${Date.now()}`,
      client_id: clientId || '',
      name: '',
      domain: null,
      status: 'active',
      created_at: new Date().toISOString(),
    };
    onProjectsChange([...projects, newProject]);
  };

  const handleRemoveProject = (index: number) => {
    onProjectsChange(projects.filter((_, i) => i !== index));
  };

  const handleProjectChange = (index: number, field: keyof ClientProject, value: string | null) => {
    const updated = [...projects];
    updated[index] = { ...updated[index], [field]: value };
    onProjectsChange(updated);
  };

  const getStatusColor = (status: ProjectStatus) => {
    switch (status) {
      case 'active':
        return 'bg-green-500/10 text-green-600 border-green-500/20';
      case 'paused':
        return 'bg-yellow-500/10 text-yellow-600 border-yellow-500/20';
      case 'archived':
        return 'bg-muted text-muted-foreground border-muted';
    }
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <FolderOpen className="h-4 w-4 text-muted-foreground" />
          <Label>Projects / Websites</Label>
        </div>
        <Button variant="outline" size="sm" onClick={handleAddProject}>
          <Plus className="h-4 w-4 mr-1" />
          Add Project
        </Button>
      </div>

      {projects.length === 0 ? (
        <p className="text-sm text-muted-foreground">No projects yet. Add a project to track work.</p>
      ) : (
        <div className="space-y-2">
          {projects.map((project, index) => (
            <div key={project.id} className="flex items-center gap-2 p-3 rounded-lg border border-border/50 bg-muted/50">
              <div className="flex-1 space-y-2">
                <div className="flex items-center gap-2">
                  <Input
                    placeholder="Project name (e.g., Main Website)"
                    value={project.name}
                    onChange={(e) => handleProjectChange(index, 'name', e.target.value)}
                    className="flex-1"
                  />
                  <Select
                    value={project.status}
                    onValueChange={(v) => handleProjectChange(index, 'status', v as ProjectStatus)}
                  >
                    <SelectTrigger className="w-28">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="active">Active</SelectItem>
                      <SelectItem value="paused">Paused</SelectItem>
                      <SelectItem value="archived">Archived</SelectItem>
                    </SelectContent>
                  </Select>
                  <Button variant="ghost" size="icon" onClick={() => handleRemoveProject(index)}>
                    <Trash2 className="h-4 w-4 text-destructive" />
                  </Button>
                </div>
                <div className="flex items-center gap-2">
                  <Globe className="h-3.5 w-3.5 text-muted-foreground" />
                  <Input
                    placeholder="Domain (optional, e.g., example.com)"
                    value={project.domain || ''}
                    onChange={(e) => handleProjectChange(index, 'domain', e.target.value || null)}
                    className="h-8 text-sm"
                  />
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {projects.length > 0 && (
        <p className="text-xs text-muted-foreground">
          Support packages apply to specific projects. Track each website or app as a separate project.
        </p>
      )}
    </div>
  );
}
