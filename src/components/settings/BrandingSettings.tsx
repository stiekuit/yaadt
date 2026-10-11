
import React, { useState } from 'react';
import { Building, Loader2, Layout, Monitor } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useBranding } from '@/contexts/BrandingContext';

const BrandingSettings = () => {
  const { 
    siteName, 
    showSiteNameOnLanding,
    landingBackgroundColor,
    yaadtFooterEnabled,
    updateSiteName, 
    updateShowSiteNameOnLanding,
    updateLandingBackgroundColor,
    updateYaadtFooterEnabled,
    loading 
  } = useBranding();
  
  const [newSiteName, setNewSiteName] = useState(siteName);
  const [saving, setSaving] = useState(false);

  // Sync local state with context when values change
  React.useEffect(() => {
    setNewSiteName(siteName);
  }, [siteName]);

  const handleSaveSiteName = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newSiteName === siteName) return;

    setSaving(true);
    const success = await updateSiteName(newSiteName);
    if (!success) {
      setNewSiteName(siteName); // Reset on failure
    }
    setSaving(false);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <Loader2 className="w-6 h-6 animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold">Site Branding</h3>
        <p className="text-sm text-muted-foreground">Customize your site's logo, layout, and appearance</p>
      </div>

      <Tabs defaultValue="text" className="space-y-6">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="text">Text Branding</TabsTrigger>
          <TabsTrigger value="layout">Layout</TabsTrigger>
          <TabsTrigger value="footer">Footer</TabsTrigger>
        </TabsList>

        <TabsContent value="text" className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Building className="w-5 h-5" />
              Site Name
            </CardTitle>
            <CardDescription>Customize your site's name and text branding</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSaveSiteName} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="siteName">Site Name</Label>
                <Input
                  id="siteName"
                  value={newSiteName}
                  onChange={(e) => setNewSiteName(e.target.value)}
                  placeholder="Enter site name"
                />
              </div>
              <Button 
                type="submit" 
                disabled={saving || newSiteName === siteName}
              >
                {saving ? (
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                ) : (
                  <Building className="w-4 h-4 mr-2" />
                )}
                {saving ? 'Saving...' : 'Save Changes'}
              </Button>
            </form>
          </CardContent>
        </Card>
        </TabsContent>

        <TabsContent value="layout" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Layout className="w-5 h-5" />
                Landing Page Layout
              </CardTitle>
              <CardDescription>Choose how your landing page is structured</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="showSiteName">Show Site Name</Label>
                  <p className="text-sm text-muted-foreground">Display site name on landing page</p>
                </div>
                <Switch
                  id="showSiteName"
                  checked={showSiteNameOnLanding}
                  onCheckedChange={updateShowSiteNameOnLanding}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="backgroundColor">Background Color</Label>
                <div className="flex items-center gap-2">
                  <Input
                    id="backgroundColor"
                    type="color"
                    value={landingBackgroundColor}
                    onChange={(e) => updateLandingBackgroundColor(e.target.value)}
                    className="w-16 h-10"
                  />
                  <Input
                    value={landingBackgroundColor}
                    onChange={(e) => updateLandingBackgroundColor(e.target.value)}
                    placeholder="#f9fafb"
                    className="flex-1"
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>


        <TabsContent value="footer" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Monitor className="w-5 h-5" />
                YAADT Branding
              </CardTitle>
              <CardDescription>Control YAADT footer visibility</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="yaadtFooter">Show YAADT Footer</Label>
                  <p className="text-sm text-muted-foreground">Display "Powered by yaadt.com" in footer</p>
                </div>
                <Switch
                  id="yaadtFooter"
                  checked={yaadtFooterEnabled}
                  onCheckedChange={updateYaadtFooterEnabled}
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default BrandingSettings;
