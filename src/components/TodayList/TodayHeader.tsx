
interface TodayHeaderProps {
  totalActiveTasks: number;
}

const TodayHeader = ({ totalActiveTasks }: TodayHeaderProps) => {
  return (
    <div className="mb-4 text-center">
      <h1 className="text-2xl font-bold text-foreground font-poppins">
        Today is {new Date().toLocaleDateString('en-US', { 
          weekday: 'long', 
          month: 'long', 
          day: 'numeric' 
        })}
      </h1>
      <p className="text-muted-foreground">
        {totalActiveTasks === 0 ? (
          <span className="font-bold text-green-600">You're All Done - Congratulations!</span>
        ) : (
          <>
            You have <span className="font-bold">{totalActiveTasks}</span> <span className="font-bold">{totalActiveTasks === 1 ? 'task' : 'tasks'}</span> for today
          </>
        )}
      </p>
    </div>
  );
};

export default TodayHeader;
