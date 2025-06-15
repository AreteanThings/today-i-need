
interface TodayHeaderProps {
  totalActiveTasks: number;
}

const TodayHeader = ({ totalActiveTasks }: TodayHeaderProps) => {
  return (
    <div className="mb-4">
      <h1 className="text-2xl font-bold text-foreground font-poppins">
        Today is {new Date().toLocaleDateString('en-US', { 
          weekday: 'long', 
          month: 'long', 
          day: 'numeric' 
        })}
      </h1>
      <p className="text-muted-foreground">
        {totalActiveTasks} active {totalActiveTasks === 1 ? 'task' : 'tasks'}
      </p>
    </div>
  );
};

export default TodayHeader;
