
import { useState, useEffect } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Plus, List, Calendar, Info, LogOut } from "lucide-react";
import TaskEntry from "@/components/TaskEntry";
import TaskList from "@/components/TaskList";
import TodayList from "@/components/TodayList";
import About from "@/components/About";
import Auth from "@/components/Auth";
import { useAuth } from "@/hooks/useAuth";

const Index = () => {
  const [activeTab, setActiveTab] = useState("today");
  const [showTaskEntry, setShowTaskEntry] = useState(false);
  const [editingTask, setEditingTask] = useState(null);
  const { user, loading, signOut } = useAuth();

  const handleEditTask = (task: any) => {
    setEditingTask(task);
    setShowTaskEntry(true);
  };

  const handleCloseTaskEntry = () => {
    setShowTaskEntry(false);
    setEditingTask(null);
  };

  const handleLogout = () => {
    signOut();
  };

  // Show loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  // Show auth screen if not authenticated - completely separate render
  if (!user) {
    return <Auth />;
  }

  // Only render the main app when authenticated - Auth component is completely unmounted
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
        <div className="header-gradient text-white p-4 flex justify-between items-center h-16">
          <h1 className="text-2xl font-bold">Today I Need</h1>
          {activeTab !== "about" && activeTab !== "logout" && (
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
          <TabsList className="grid grid-cols-4 w-full">
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
            <TabsTrigger value="logout" className="flex items-center gap-1" onClick={handleLogout}>
              <LogOut className="h-4 w-4" />
              Logout
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

          <TabsContent value="logout" className="mt-0">
            {/* This content won't be shown as logout triggers immediately */}
            <div></div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default Index;
