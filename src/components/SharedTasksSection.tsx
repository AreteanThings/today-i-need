
import { useAssignedTasks } from '@/hooks/useAssignedTasks';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Users, UserCheck } from 'lucide-react';
import { CategoryBadge } from './CategoryBadge';
import { format } from 'date-fns';

export const SharedTasksSection = () => {
  const { assignedTasks, loading } = useAssignedTasks();

  if (loading) {
    return (
      <div className="animate-pulse">
        <div className="h-6 bg-gray-200 rounded mb-4 w-48"></div>
        <div className="space-y-3">
          <div className="h-20 bg-gray-200 rounded"></div>
          <div className="h-20 bg-gray-200 rounded"></div>
        </div>
      </div>
    );
  }

  if (assignedTasks.length === 0) {
    return null;
  }

  return (
    <div className="mb-8">
      <div className="flex items-center gap-2 mb-4">
        <Users className="h-5 w-5 text-blue-600" />
        <h2 className="text-xl font-semibold">Shared & Assigned Tasks</h2>
        <Badge variant="secondary">{assignedTasks.length}</Badge>
      </div>
      
      <div className="space-y-3">
        {assignedTasks.map((task) => (
          <Card key={task.id} className="border-l-4 border-l-blue-500">
            <CardHeader className="pb-3">
              <div className="flex items-start justify-between">
                <div>
                  <CardTitle className="text-lg">{task.title}</CardTitle>
                  {task.subtitle && (
                    <CardDescription className="mt-1">{task.subtitle}</CardDescription>
                  )}
                </div>
                <div className="flex items-center gap-2">
                  <CategoryBadge category={task.category} />
                  <Badge variant={task.assignmentType === 'shared' ? 'default' : 'secondary'}>
                    {task.assignmentType === 'shared' ? (
                      <><Users className="h-3 w-3 mr-1" /> Shared</>
                    ) : (
                      <><UserCheck className="h-3 w-3 mr-1" /> Assigned</>
                    )}
                  </Badge>
                </div>
              </div>
            </CardHeader>
            <CardContent className="pt-0">
              <div className="flex items-center justify-between text-sm text-gray-600">
                <div>
                  <p>Start: {format(new Date(task.startDate), 'MMM dd, yyyy')}</p>
                  {task.endDate && (
                    <p>End: {format(new Date(task.endDate), 'MMM dd, yyyy')}</p>
                  )}
                </div>
                <div className="text-right">
                  <p>Repeat: {task.repeatValue}</p>
                  <p>Completed: {task.completedDates.length} times</p>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};
