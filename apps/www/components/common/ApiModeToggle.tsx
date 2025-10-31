'use client';

import { Cloud, Database, Loader2 } from 'lucide-react';
import { useEffect, useState } from 'react';
import { Badge } from '@recurse/ui/components/badge';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { type ApiMode, apiConfig } from '@/services/apiConfig';

export function ApiModeToggle() {
  const [mode, setMode] = useState<ApiMode>(apiConfig.getMode());
  const [isChanging, setIsChanging] = useState(false);

  useEffect(() => {
    // Initialize from saved config
    setMode(apiConfig.getMode());
  }, []);

  const handleModeChange = async (checked: boolean) => {
    const newMode: ApiMode = checked ? 'real' : 'mock';
    setIsChanging(true);

    try {
      // Update configuration
      apiConfig.setMode(newMode);
      setMode(newMode);

      // Reload the page to apply changes
      // In a production app, you might want to handle this more gracefully
      setTimeout(() => {
        window.location.reload();
      }, 500);
    } catch {
      setIsChanging(false);
    }
  };

  return (
    <div className="flex items-center gap-3">
      <div className="flex items-center gap-2">
        <Database
          className={`h-4 w-4 ${mode === 'mock' ? 'text-primary' : 'text-muted-foreground'}`}
        />
        <Label className="font-medium text-sm" htmlFor="api-mode">
          Mock
        </Label>
      </div>

      <Switch
        checked={mode === 'real'}
        disabled={isChanging}
        id="api-mode"
        onCheckedChange={handleModeChange}
      />

      <div className="flex items-center gap-2">
        <Cloud
          className={`h-4 w-4 ${mode === 'real' ? 'text-primary' : 'text-muted-foreground'}`}
        />
        <Label className="font-medium text-sm" htmlFor="api-mode">
          Real API
        </Label>
      </div>

      {isChanging && (
        <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
      )}

      <Badge
        className="ml-2"
        variant={mode === 'real' ? 'default' : 'secondary'}
      >
        {mode === 'real' ? 'Live' : 'Demo'}
      </Badge>
    </div>
  );
}
