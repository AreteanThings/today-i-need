
import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import ForgotPasswordModal from "./Auth/ForgotPasswordModal";
import SignInForm from "./Auth/SignInForm";
import SignUpForm from "./Auth/SignUpForm";

const Auth = () => {
  const [showForgotModal, setShowForgotModal] = useState(false);

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-blue-700 bg-clip-text text-transparent">
            Today I Need
          </CardTitle>
          <CardDescription>
            Sign in to sync your tasks across devices
          </CardDescription>
        </CardHeader>
        
        <CardContent>
          {/* Social SSO section is commented out */}
        </CardContent>

        <Tabs defaultValue="signin" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="signin">Sign In</TabsTrigger>
            <TabsTrigger value="signup">Sign Up</TabsTrigger>
          </TabsList>
          
          <TabsContent value="signin">
            <SignInForm onForgotPassword={() => setShowForgotModal(true)} />
          </TabsContent>
          
          <TabsContent value="signup">
            <SignUpForm />
          </TabsContent>
        </Tabs>
      </Card>
      
      <ForgotPasswordModal
        open={showForgotModal}
        onClose={() => setShowForgotModal(false)}
      />
    </div>
  );
};

export default Auth;
