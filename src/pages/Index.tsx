
import { useEffect, useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import Auth from '@/components/Auth';
import TodayList from '@/components/TodayList';
import TaskList from '@/components/TaskList';
import TaskEntry from '@/components/TaskEntry';
import { SharedTasksSection } from '@/components/SharedTasksSection';

const Index = () => {
  const { user } = useAuth();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {user ? (
        <div className="container mx-auto px-4 py-8">
          <div className="flex flex-col lg:flex-row gap-8">
            <div className="lg:w-1/2">
              <TodayList />
            </div>
            <div className="lg:w-1/2 space-y-8">
              <SharedTasksSection />
              <TaskEntry />
              <TaskList />
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
