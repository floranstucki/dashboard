import { CheckCircle2, Flame } from "lucide-react";
import { useHabits } from "../context/HabitsContext";

function HabitsCard() {
    const { habits, toggleHabitToday } = useHabits();

    return (
        <section className="dashboard-card habits-card">
            <div className="card-header">
                <h2>🔥 Habitudes</h2>
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