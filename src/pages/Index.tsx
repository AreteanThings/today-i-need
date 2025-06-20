
import { useEffect, useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import Auth from '@/components/Auth';
import TodayList from '@/components/TodayList';
import TaskList from '@/components/TaskList';
import TaskEntry from '@/components/TaskEntry';
import { SharedTasksSection } from '@/components/SharedTasksSection';
import { Task } from '@/types/task';

const Index = () => {
  const { user, loading } = useAuth();
  const [mounted, setMounted] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [showTaskEntry, setShowTaskEntry] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const handleEditTask = (task: Task) => {
    setEditingTask(task);
    setShowTaskEntry(true);
  };

  const handleCloseTaskEntry = () => {
    setEditingTask(null);
    setShowTaskEntry(false);
  };

  // Show loading state while auth is initializing
  if (!mounted || loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-2 text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {user ? (
        <div className="container mx-auto px-4 py-8">
          <div className="flex flex-col lg:flex-row gap-8">
            <div className="lg:w-1/2">
              <TodayList onEditTask={handleEditTask} />
            </div>
            <div className="lg:w-1/2 space-y-8">
              <SharedTasksSection />
              {showTaskEntry ? (
                <TaskEntry 
                  onClose={handleCloseTaskEntry}
                  editingTask={editingTask}
                />
              ) : (
                <button 
                  onClick={() => setShowTaskEntry(true)}
                  className="w-full p-4 border-2 border-dashed border-gray-300 rounded-lg hover:border-gray-400 transition-colors"
                >
                  + Add New Task
                </button>
              )}
              <TaskList onEditTask={handleEditTask} />
            </div>
          </div>
        </div>
      ) : (
        <Auth />
      )}
    </div>
  );
};

export default Index;
