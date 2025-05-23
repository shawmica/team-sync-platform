
import { Layout } from "@/components/Layout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/context/AuthContext";
import { toast } from "@/components/ui/sonner";
import { UserSettings } from "@/types";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Loader2 } from "lucide-react";

export default function Settings() {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  
  // Profile form state
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [position, setPosition] = useState("");
  const [department, setDepartment] = useState("");
  
  // Password form state
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  
  // Check if settings are being saved
  const [isSavingProfile, setIsSavingProfile] = useState(false);
  const [isSavingPassword, setIsSavingPassword] = useState(false);
  
  // Fetch user settings
  const { data: userSettings, isLoading: isLoadingSettings } = useQuery({
    queryKey: ["userSettings", user?.id],
    queryFn: async () => {
      if (!user?.id) return null;
      
      // Check if settings exist for this user
      const { data, error } = await supabase
        .from("user_settings")
        .select("*")
        .eq("user_id", user.id)
        .single();
      
      if (error) {
        if (error.code === "PGRST116") {
          // No settings found for this user, create default settings
          const defaultSettings: UserSettings = {
            user_id: user.id,
            email_notifications: true,
            push_notifications: true,
            dark_mode: false,
            compact_view: false
          };
          
          await supabase.from("user_settings").insert(defaultSettings);
          return defaultSettings;
        }
        
        toast.error("Failed to load settings");
        console.error("Error fetching settings:", error);
        return null;
      }
      
      return data as UserSettings;
    },
    enabled: !!user?.id,
  });
  
  // Fetch user profile
  const { data: userProfile } = useQuery({
    queryKey: ["userProfile", user?.id],
    queryFn: async () => {
      if (!user?.id) return null;
      
      const { data, error } = await supabase
        .from("employees")
        .select("*")
        .eq("user_id", user.id)
        .single();
      
      if (error) {
        console.error("Error fetching user profile:", error);
        return null;
      }
      
      return data;
    },
    enabled: !!user?.id,
  });
  
  // Update settings mutation
  const updateSettingsMutation = useMutation({
    mutationFn: async (settings: Partial<UserSettings>) => {
      if (!user?.id) throw new Error("User not authenticated");
      
      const { error } = await supabase
        .from("user_settings")
        .update(settings)
        .eq("user_id", user.id);
      
      if (error) throw error;
      
      return settings;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["userSettings"] });
      toast.success("Settings updated successfully");
    },
    onError: (error) => {
      toast.error("Failed to update settings");
      console.error("Error updating settings:", error);
    },
  });
  
  // Update profile mutation
  const updateProfileMutation = useMutation({
    mutationFn: async (profileData: { name: string; position: string; department: string }) => {
      if (!user?.id) throw new Error("User not authenticated");
      
      const { error } = await supabase
        .from("employees")
        .update(profileData)
        .eq("user_id", user.id);
      
      if (error) throw error;
      
      return profileData;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["userProfile"] });
      setIsSavingProfile(false);
      toast.success("Profile updated successfully");
    },
    onError: (error) => {
      setIsSavingProfile(false);
      toast.error("Failed to update profile");
      console.error("Error updating profile:", error);
    },
  });
  
  // Update password mutation
  const updatePasswordMutation = useMutation({
    mutationFn: async ({ newPassword }: { newPassword: string }) => {
      const { error } = await supabase.auth.updateUser({
        password: newPassword,
      });
      
      if (error) throw error;
      
      return true;
    },
    onSuccess: () => {
      setIsSavingPassword(false);
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
      toast.success("Password updated successfully");
    },
    onError: (error) => {
      setIsSavingPassword(false);
      toast.error("Failed to update password");
      console.error("Error updating password:", error);
    },
  });
  
  // Initialize form values
  useEffect(() => {
    if (userProfile) {
      setName(userProfile.name || "");
      setEmail(userProfile.email || "");
      setPosition(userProfile.position || "");
      setDepartment(userProfile.department || "");
    }
  }, [userProfile]);
  
  // Handle notification toggle
  const handleNotificationToggle = (type: "email" | "push", checked: boolean) => {
    if (!userSettings) return;
    
    if (type === "email") {
      updateSettingsMutation.mutate({ email_notifications: checked });
    } else {
      updateSettingsMutation.mutate({ push_notifications: checked });
    }
  };
  
  // Handle appearance toggle
  const handleAppearanceToggle = (type: "darkMode" | "compactView", checked: boolean) => {
    if (!userSettings) return;
    
    if (type === "darkMode") {
      updateSettingsMutation.mutate({ dark_mode: checked });
      // Here you would also implement actual dark mode switching
    } else {
      updateSettingsMutation.mutate({ compact_view: checked });
      // Here you would implement actual compact view
    }
  };
  
  // Handle profile save
  const handleProfileSave = () => {
    if (!name) {
      toast.error("Name is required");
      return;
    }
    
    setIsSavingProfile(true);
    updateProfileMutation.mutate({
      name,
      position,
      department,
    });
  };
  
  // Handle password save
  const handlePasswordSave = () => {
    if (!currentPassword || !newPassword || !confirmPassword) {
      toast.error("All password fields are required");
      return;
    }
    
    if (newPassword !== confirmPassword) {
      toast.error("New password and confirmation do not match");
      return;
    }
    
    if (newPassword.length < 6) {
      toast.error("Password must be at least 6 characters");
      return;
    }
    
    setIsSavingPassword(true);
    updatePasswordMutation.mutate({ newPassword });
  };
  
  return (
    <Layout>
      <div className="mb-8">
        <h1 className="text-3xl font-bold">Settings</h1>
        <p className="text-muted-foreground">Manage your application preferences</p>
      </div>
      
      <Tabs defaultValue="account" className="space-y-4">
        <TabsList>
          <TabsTrigger value="account">Account</TabsTrigger>
          <TabsTrigger value="notifications">Notifications</TabsTrigger>
          <TabsTrigger value="appearance">Appearance</TabsTrigger>
          <TabsTrigger value="security">Security</TabsTrigger>
        </TabsList>
        
        <TabsContent value="account" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Profile Information</CardTitle>
              <CardDescription>Update your personal information</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Full Name</Label>
                  <Input 
                    id="name" 
                    value={name} 
                    onChange={(e) => setName(e.target.value)} 
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input 
                    id="email" 
                    type="email" 
                    value={email} 
                    disabled 
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="position">Position</Label>
                  <Input 
                    id="position" 
                    value={position} 
                    onChange={(e) => setPosition(e.target.value)} 
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="department">Department</Label>
                  <Input 
                    id="department" 
                    value={department} 
                    onChange={(e) => setDepartment(e.target.value)} 
                  />
                </div>
              </div>
              <div className="flex justify-end">
                <Button onClick={handleProfileSave} disabled={isSavingProfile}>
                  {isSavingProfile ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Saving...
                    </>
                  ) : (
                    "Save Changes"
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="notifications" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Notification Settings</CardTitle>
              <CardDescription>Configure how you receive notifications</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {isLoadingSettings ? (
                <div className="flex items-center justify-center p-4">
                  <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                </div>
              ) : (
                <>
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">Email Notifications</p>
                      <p className="text-sm text-muted-foreground">Receive notifications via email</p>
                    </div>
                    <Switch 
                      checked={userSettings?.email_notifications || false} 
                      onCheckedChange={(checked) => handleNotificationToggle("email", checked)} 
                    />
                  </div>
                  <Separator />
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">Push Notifications</p>
                      <p className="text-sm text-muted-foreground">Receive notifications in browser</p>
                    </div>
                    <Switch 
                      checked={userSettings?.push_notifications || false} 
                      onCheckedChange={(checked) => handleNotificationToggle("push", checked)} 
                    />
                  </div>
                  <Separator />
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">Task Assignment Alerts</p>
                      <p className="text-sm text-muted-foreground">Get notified when you're assigned a new task</p>
                    </div>
                    <Switch defaultChecked disabled />
                  </div>
                  <Separator />
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">Project Updates</p>
                      <p className="text-sm text-muted-foreground">Get notified about changes to your projects</p>
                    </div>
                    <Switch defaultChecked disabled />
                  </div>
                </>
              )}
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="appearance" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Appearance Settings</CardTitle>
              <CardDescription>Customize the look and feel of the application</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {isLoadingSettings ? (
                <div className="flex items-center justify-center p-4">
                  <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                </div>
              ) : (
                <>
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">Dark Mode</p>
                      <p className="text-sm text-muted-foreground">Switch between light and dark theme</p>
                    </div>
                    <Switch 
                      checked={userSettings?.dark_mode || false} 
                      onCheckedChange={(checked) => handleAppearanceToggle("darkMode", checked)} 
                    />
                  </div>
                  <Separator />
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">Compact View</p>
                      <p className="text-sm text-muted-foreground">Display more content with reduced spacing</p>
                    </div>
                    <Switch 
                      checked={userSettings?.compact_view || false} 
                      onCheckedChange={(checked) => handleAppearanceToggle("compactView", checked)} 
                    />
                  </div>
                </>
              )}
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="security" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Security Settings</CardTitle>
              <CardDescription>Manage your account security</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="currentPassword">Current Password</Label>
                <Input 
                  id="currentPassword" 
                  type="password"
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="newPassword">New Password</Label>
                <Input 
                  id="newPassword" 
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="confirmPassword">Confirm Password</Label>
                <Input 
                  id="confirmPassword" 
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                />
              </div>
              <div className="flex justify-end">
                <Button onClick={handlePasswordSave} disabled={isSavingPassword}>
                  {isSavingPassword ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Changing...
                    </>
                  ) : (
                    "Change Password"
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </Layout>
  );
}
