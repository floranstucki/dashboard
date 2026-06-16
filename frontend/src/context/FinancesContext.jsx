import { createContext, useContext, useEffect, useMemo, useState } from "react";
import { apiFetch } from "../utils/api";
import { useAuth } from "./AuthContext";
import { resetSmartNotifications } from "../utils/smartNotifications";
const FinancesContext = createContext(null);

export function FinancesProvider({ children }) {
    const { isAuthenticated } = useAuth();
    const [items, setItems] = useState([]);
    const [financesLoading, setFinancesLoading] = useState(true);
    const [financesError, setFinancesError] = useState("");

    const fetchFinanceItems = async () => {
        try {
            setFinancesLoading(true);
            setFinancesError("");

            const response = await apiFetch(`/finances`);

            if (!response.ok) {
                throw new Error("Impossible de charger les finances.");
            }

            const data = await response.json();
            setItems(data);
        } catch (error) {
            setFinancesError(error.message);
        } finally {
            setFinancesLoading(false);
        }
    };

    useEffect(() => {
        if (isAuthenticated) {
            fetchFinanceItems();
        } else {
            setFinancesLoading(false);
        }
    }, [isAuthenticated]);

    const totals = useMemo(() => {
        return items.reduce(
            (acc, item) => {
                if (item.type === "Revenu") acc.revenus += Number(item.amount);
                if (item.type === "Dépense") acc.depenses += Number(item.amount);
                if (item.type === "Épargne") acc.epargne += Number(item.amount);
                if (item.type === "Abonnement") acc.abonnements += Number(item.amount);

                return acc;
            },
            {
                revenus: 0,
                depenses: 0,
                epargne: 0,
                abonnements: 0,
            }
        );
    }, [items]);

    const soldeNet =
        totals.revenus - totals.depenses - totals.epargne - totals.abonnements;

    const addFinanceItem = async (item) => {
        const response = await apiFetch(`/finances`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify(item),
        });

        if (!response.ok) {
            throw new Error("Impossible d’ajouter la ligne financière.");
        }

        const createdItem = await response.json();
        resetSmartNotifications();
        setItems([createdItem, ...items]);
    };

    const deleteFinanceItem = async (id) => {
        const response = await apiFetch(`/finances/${id}`, {
            method: "DELETE",
        });

        if (!response.ok) {
            throw new Error("Impossible de supprimer la ligne financière.");
        }
        resetSmartNotifications();
        setItems(items.filter((item) => item.id !== id));
    };

    const formatCHF = (value) => {
        return new Intl.NumberFormat("fr-CH", {
            style: "currency",
            currency: "CHF",
        }).format(value);
    };

    return (
        <FinancesContext.Provider
            value={{
                items,
                totals,
                soldeNet,
                financesLoading,
                financesError,
                fetchFinanceItems,
                addFinanceItem,
                deleteFinanceItem,
                formatCHF,
            }}
        >
            {children}
        </FinancesContext.Provider>
    );
}

export function useFinances() {
    const context = useContext(FinancesContext);

    if (!context) {
        throw new Error("useFinances doit être utilisé dans FinancesProvider");
    }

    return context;
}