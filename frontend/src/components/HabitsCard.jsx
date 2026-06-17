import { CheckCircle2, Flame } from "lucide-react";
import { useHabits } from "../context/HabitsContext";

function HabitsCard() {
    const { habits, toggleHabitToday } = useHabits();
    const completedToday = habits.filter((habit) => habit.doneToday).length;

    const bestStreak = habits.length
        ? Math.max(...habits.map((habit) => Number(habit.bestStreak || habit.streak || 0)))
        : 0;

    const completionRate = habits.length
        ? Math.round((completedToday / habits.length) * 100)
        : 0;
    return (
        <section className="dashboard-card habits-card">
            <div className="card-header">
                <h2>🔥 Habitudes</h2>
            </div>
            <div className="habits-summary">
                <div>
                    <span>Aujourd’hui</span>
                    <strong>{completedToday}/{habits.length}</strong>
                </div>

                <div>
                    <span>Réussite</span>
                    <strong>{completionRate}%</strong>
                </div>

                <div>
                    <span>Record</span>
                    <strong>{bestStreak}j</strong>
                </div>
            </div>
            <div className="habits-list">
                {habits.map((habit) => (
                    <article
                        className={`habit-item ${habit.doneToday ? "habit-done" : ""}`}
                        key={habit.id}
                    >
                        <button onClick={() => toggleHabitToday(habit.id)}>
                            <CheckCircle2 size={18} />
                        </button>

                        <div>
                            <h3>{habit.title}</h3>
                            <p>{habit.frequency}</p>
                        </div>

                        <span>
                            <Flame size={15} />
                            {habit.streak}
                        </span>
                    </article>
                ))}
            </div>
        </section>
    );
}

export default HabitsCard;