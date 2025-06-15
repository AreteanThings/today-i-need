
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { LogOut } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";

const About = () => {
  const { signOut } = useAuth();

  const handleLogout = () => {
    signOut();
  };

  return (
    <div className="p-4 pb-20">
      <div className="mb-4">
        <h1 className="text-2xl font-bold text-foreground">About</h1>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Today I Need</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex justify-center mb-6">
            <img 
              src="/lovable-uploads/bae64307-21c6-471a-abe3-0199417df977.png" 
              alt="Aretean Things Logo" 
              className="max-w-full h-auto w-3/4"
            />
          </div>
          
          <p className="text-muted-foreground">
            Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod 
            tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, 
            quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.
          </p>
          
          <p className="text-muted-foreground">
            Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore 
            eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, 
            sunt in culpa qui officia deserunt mollit anim id est laborum.
          </p>
          
          <p className="text-muted-foreground">
            Sed ut perspiciatis unde omnis iste natus error sit voluptatem accusantium 
            doloremque laudantium, totam rem aperiam, eaque ipsa quae ab illo inventore 
            veritatis et quasi architecto beatae vitae dicta sunt explicabo.
          </p>
          
          <p className="text-muted-foreground">
            Nemo enim ipsam voluptatem quia voluptas sit aspernatur aut odit aut fugit, 
            sed quia consequuntur magni dolores eos qui ratione voluptatem sequi nesciunt.
          </p>

          <div className="pt-4 border-t">
            <Button 
              onClick={handleLogout}
              variant="outline"
              className="w-full flex items-center gap-2"
            >
              <LogOut className="h-4 w-4" />
              Logout
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default About;
