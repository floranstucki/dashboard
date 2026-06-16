import { useState } from "react";
import AppLayout from "../components/AppLayout";
import { PiggyBank, Trash2, Wallet } from "lucide-react";
import { useFinances } from "../context/FinancesContext";
import PageHeader from "../components/PageHeader";
function Finances() {
    const {
        items,
        totals,
        soldeNet,
        financesLoading,
        financesError,
        addFinanceItem,
        deleteFinanceItem,
        formatCHF,
    } = useFinances();

    const [description, setDescription] = useState("");
    const [type, setType] = useState("Dépense");
    const [category, setCategory] = useState("Perso");
    const [amount, setAmount] = useState("");

    const handleAddItem = () => {
        if (!description.trim() || !amount) return;

        addFinanceItem({
            description: description.trim(),
            type,
            category,
            amount: Number(amount),
        });

        setDescription("");
        setType("Dépense");
        setCategory("Perso");
        setAmount("");
    };

    return (
        <AppLayout>
            <PageHeader
                title="Finances"
                subtitle="Vue rapide de ton budget personnel du mois."
            />

            <section className="finance-summary-grid">
                <article className="dashboard-card finance-summary-card">
                    <Wallet size={22} />
                    <span>Revenus</span>
                    <strong>{formatCHF(totals.revenus)}</strong>
                </article>

                <article className="dashboard-card finance-summary-card">
                    <Wallet size={22} />
                    <span>Dépenses</span>
                    <strong>{formatCHF(totals.depenses + totals.abonnements)}</strong>
                </article>

                <article className="dashboard-card finance-summary-card">
                    <PiggyBank size={22} />
                    <span>Épargne</span>
                    <strong>{formatCHF(totals.epargne)}</strong>
                </article>

                <article className="dashboard-card finance-summary-card">
                    <Wallet size={22} />
                    <span>Solde net</span>
                    <strong>{formatCHF(soldeNet)}</strong>
                </article>
            </section>

            <section className="dashboard-card finance-form-card">
                <div className="card-header">
                    <h2>💰 Nouvelle ligne</h2>
                    <button onClick={handleAddItem}>+ Ajouter</button>
                </div>

                <div className="finance-form">
                    <input
                        type="text"
                        placeholder="Description..."
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                        onKeyDown={(e) => {
                            if (e.key === "Enter") handleAddItem();
                        }}
                    />

                    <select value={type} onChange={(e) => setType(e.target.value)}>
                        <option>Dépense</option>
                        <option>Revenu</option>
                        <option>Épargne</option>
                        <option>Abonnement</option>
                    </select>

                    <select
                        value={category}
                        onChange={(e) => setCategory(e.target.value)}
                    >
                        <option>Perso</option>
                        <option>Travail</option>
                        <option>Objectif</option>
                        <option>Digital</option>
                        <option>Sport</option>
                        <option>Transport</option>
                        <option>Nourriture</option>
                        <option>Autre</option>
                    </select>

                    <input
                        type="number"
                        min="0"
                        step="0.05"
                        placeholder="Montant CHF"
                        value={amount}
                        onChange={(e) => setAmount(e.target.value)}
                        onKeyDown={(e) => {
                            if (e.key === "Enter") handleAddItem();
                        }}
                    />
                </div>
            </section>

            <section className="dashboard-card finance-list-card">
                <div className="card-header">
                    <h2>📋 Lignes financières</h2>
                </div>

                <div className="finance-list">
                    {financesLoading ? (
                        <p className="loading-text">Chargement des finances…</p>
                    ) : financesError ? (
                        <p className="error-text">Erreur : {financesError}</p>
                    ) : (
                        items.length > 0 ? (
                            items.map((item) => (
                                <article className="finance-item" key={item.id}>
                                    <div>
                                        <h3>{item.description}</h3>

                                        <div className="finance-meta">
                                            <span>{item.type}</span>
                                            <span>{item.category}</span>
                                        </div>
                                    </div>

                                    <strong>{formatCHF(item.amount)}</strong>

                                    <button onClick={() => deleteFinanceItem(item.id)}>
                                        <Trash2 size={17} />
                                    </button>
                                </article>
                            ))
                        ) : (
                            <p>Aucune ligne financière trouvée.</p>
                        )
                    )}
                </div>
            </section>
        </AppLayout>
    );
}

export default Finances;