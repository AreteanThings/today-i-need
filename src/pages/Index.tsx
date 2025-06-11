
import { useState, useEffect } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Plus, List, Calendar, Info } from "lucide-react";
import TaskEntry from "@/components/TaskEntry";
import TaskList from "@/components/TaskList";
import TodayList from "@/components/TodayList";
import About from "@/components/About";
import { removeBackground, loadImage } from "@/utils/backgroundRemoval";

const Index = () => {
  const [activeTab, setActiveTab] = useState("today");
  const [showTaskEntry, setShowTaskEntry] = useState(false);
  const [editingTask, setEditingTask] = useState(null);
  const [processedLogoUrl, setProcessedLogoUrl] = useState<string | null>(null);

  useEffect(() => {
    const processLogo = async () => {
      try {
        console.log('Processing logo...');
        const response = await fetch('/lovable-uploads/e8c19c5e-e0cf-4792-969f-5a6ccd3715d5.png');
        const blob = await response.blob();
        const imageElement = await loadImage(blob);
        const processedBlob = await removeBackground(imageElement);
        const url = URL.createObjectURL(processedBlob);
        setProcessedLogoUrl(url);
        console.log('Logo processed successfully');
      } catch (error) {
        console.error('Error processing logo:', error);
        // Fallback to original logo if processing fails
        setProcessedLogoUrl('/lovable-uploads/e8c19c5e-e0cf-4792-969f-5a6ccd3715d5.png');
      }
    };

    processLogo();

    // Cleanup function to revoke object URL
    return () => {
      if (processedLogoUrl) {
        URL.revokeObjectURL(processedLogoUrl);
      }
    };
  }, []);

  const handleEditTask = (task: any) => {
    setEditingTask(task);
    setShowTaskEntry(true);
  };

  const handleCloseTaskEntry = () => {
    setShowTaskEntry(false);
    setEditingTask(null);
  };

  if (showTaskEntry) {
    return (
      <TaskEntry
        onClose={handleCloseTaskEntry}
        editingTask={editingTask}
      />
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-md mx-auto">
        {/* Header */}
        <div className="bg-primary text-primary-foreground p-4 flex justify-between items-center">
          {processedLogoUrl ? (
            <img 
              src={processedLogoUrl}
              alt="Today I Need" 
              className="h-12 object-contain"
            />
          ) : (
            <div className="h-12 flex items-center text-lg font-semibold">
              Today I Need
            </div>
          )}
          {activeTab !== "about" && (
            <Button
              size="sm"
              variant="secondary"
              onClick={() => setShowTaskEntry(true)}
            >
              <Plus className="h-4 w-4 mr-1" />
              Add Task
            </Button>
          )}
        </div>

        {/* Navigation */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid grid-cols-3 w-full">
            <TabsTrigger value="today" className="flex items-center gap-1">
              <Calendar className="h-4 w-4" />
              Today
            </TabsTrigger>
            <TabsTrigger value="tasks" className="flex items-center gap-1">
              <List className="h-4 w-4" />
              Tasks
            </TabsTrigger>
            <TabsTrigger value="about" className="flex items-center gap-1">
              <Info className="h-4 w-4" />
              About
            </TabsTrigger>
          </TabsList>

          <TabsContent value="today" className="mt-0">
            <TodayList onEditTask={handleEditTask} />
          </TabsContent>

          <TabsContent value="tasks" className="mt-0">
            <TaskList onEditTask={handleEditTask} />
          </TabsContent>

          <TabsContent value="about" className="mt-0">
            <About />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default Index;
