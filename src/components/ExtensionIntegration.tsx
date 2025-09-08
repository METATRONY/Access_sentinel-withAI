import React, { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

interface ExtensionStats {
  scanned: number;
  blocked: number;
  blurred: number;
  enabled: boolean;
}

const ExtensionIntegration: React.FC = () => {
  const [stats, setStats] = useState<ExtensionStats>({
    scanned: 0,
    blocked: 0,
    blurred: 0,
    enabled: false
  });
  const [session, setSession] = useState<any>(null);

  useEffect(() => {
    // Get current session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      if (session) {
        // Send session to extension
        if (typeof chrome !== 'undefined' && chrome.runtime) {
          chrome.runtime.sendMessage({
            type: 'SET_SESSION',
            session: session
          });
        }
      }
    });

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        setSession(session);
        if (session && typeof chrome !== 'undefined' && chrome.runtime) {
          chrome.runtime.sendMessage({
            type: 'SET_SESSION',
            session: session
          });
        }
      }
    );

    return () => subscription.unsubscribe();
  }, []);

  const handleInstallExtension = () => {
    // This would typically redirect to Chrome Web Store
    alert('Extension installation would redirect to Chrome Web Store');
  };

  const handleTestConnection = async () => {
    if (!session) {
      alert('Please sign in first');
      return;
    }

    try {
      const { data, error } = await supabase.functions.invoke('moderate-content', {
        body: {
          mediaUrl: 'https://via.placeholder.com/300x200',
          mediaType: 'image',
          contextUrl: window.location.href
        }
      });

      if (error) throw error;
      alert(`Connection successful! Decision: ${data.decision}`);
    } catch (error) {
      alert(`Connection failed: ${error.message}`);
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <span className="text-2xl">🔌</span>
            Extension Integration
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <span>Extension Status</span>
            <Badge variant={stats.enabled ? "default" : "secondary"}>
              {stats.enabled ? "Active" : "Inactive"}
            </Badge>
          </div>
          
          <div className="grid grid-cols-3 gap-4 text-center">
            <div>
              <div className="text-2xl font-bold text-blue-600">{stats.scanned}</div>
              <div className="text-sm text-gray-600">Scanned</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-red-600">{stats.blocked}</div>
              <div className="text-sm text-gray-600">Blocked</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-yellow-600">{stats.blurred}</div>
              <div className="text-sm text-gray-600">Blurred</div>
            </div>
          </div>

          <div className="flex gap-2">
            <Button onClick={handleInstallExtension} className="flex-1">
              Install Extension
            </Button>
            <Button 
              onClick={handleTestConnection} 
              variant="outline"
              disabled={!session}
            >
              Test Connection
            </Button>
          </div>

          {!session && (
            <div className="text-sm text-amber-600 bg-amber-50 p-3 rounded-lg">
              Sign in to enable extension integration
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default ExtensionIntegration;