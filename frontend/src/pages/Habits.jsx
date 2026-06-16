import { useState } from "react";
import { CheckCircle2, Flame, Trash2 } from "lucide-react";
import AppLayout from "../components/AppLayout";
import PageHeader from "../components/PageHeader";
import { useHabits } from "../context/HabitsContext";

function Habits() {
    const { habits, addHabit, toggleHabitToday, deleteHabit } = useHabits();

    const [title, setTitle] = useState("");
    const [frequency, setFrequency] = useState("Quotidien");

    const handleAddHabit = () => {
        if (!title.trim()) return;

        addHabit({
            title: title.trim(),
            frequency,
        });

        setTitle("");
        setFrequency("Quotidien");
    };

    return (
        <AppLayout>
            <PageHeader
                title="Habitudes"
                subtitle="Suis tes routines et garde tes bonnes habitudes visibles."
            />

            <section className="dashboard-card habits-form-card">
                <div className="card-header">
                    <h2>🔥 Nouvelle habitude</h2>
                    <button onClick={handleAddHabit}>+ Ajouter</button>
                </div>

                <div className="habits-form">
                    <input
                        type="text"
                        placeholder="Nom de l’habitude..."
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                    />

                    <select
                        value={frequency}
                        onChange={(e) => setFrequency(e.target.value)}
                    >
                        <option>Quotidien</option>
                        <option>3x / semaine</option>
                        <option>Hebdomadaire</option>
                        <option>Mensuel</option>
                    </select>
                </div>
            </section>

            <section className="dashboard-card habits-page-card">
                <div className="card-header">
                    <h2>📋 Mes habitudes</h2>
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

                            <button onClick={() => deleteHabit(habit.id)}>
                                <Trash2 size={16} />
                            </button>
                        </article>
                    ))}
                </div>
            </section>
        </AppLayout>
    );
}

export default Habits;