
import { useState, useEffect } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Plus, List, Calendar, Info } from "lucide-react";
import TaskEntry from "@/components/TaskEntry";
import TaskList from "@/components/TaskList";
import TodayList from "@/components/TodayList";
import About from "@/components/About";

const Index = () => {
  const [activeTab, setActiveTab] = useState("today");
  const [showTaskEntry, setShowTaskEntry] = useState(false);
  const [editingTask, setEditingTask] = useState(null);

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
          <img 
            src="/lovable-uploads/2479f755-5efa-474f-b6f7-1c4d6feaa479.png"
            alt="Today I Need" 
            className="h-48 object-contain"
          />
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
