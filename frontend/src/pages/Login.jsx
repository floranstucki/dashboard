import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

function Login() {
    const navigate = useNavigate();
    const { login } = useAuth();

    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");

    const handleLogin = async (e) => {
        e.preventDefault();

        try {
            setError("");

            await login({
                email,
                password,
            });

            window.location.href = "/dashboard";
        } catch (error) {
            console.error("Erreur lors du chargement des tâches :", error);
            setTasksError(error.message);
        }
    };
    return (
        <main className="auth-page">
            <section className="auth-card">
                <h1>Connexion</h1>
                <p>Connecte-toi à ton dashboard personnel.</p>

                <form onSubmit={handleLogin} className="auth-form">
                    <input
                        type="email"
                        placeholder="Adresse email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                    />

                    <input
                        type="password"
                        placeholder="Mot de passe"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                    />

                    {error && <p className="auth-error">{error}</p>}

                    <button type="submit">Se connecter</button>
                </form>

                <span>
                    Pas encore de compte ? <Link to="/signup">Créer un compte</Link>
                </span>
            </section>
        </main>
    );
}

export default Login;