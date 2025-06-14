
const EmptyState = () => {
  return (
    <div className="text-center py-12">
      <p className="text-muted-foreground">No tasks for today!</p>
      <p className="text-sm text-muted-foreground mt-1">
        Add a task to get started.
      </p>
    </div>
  );
};

export default EmptyState;
