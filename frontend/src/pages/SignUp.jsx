import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

function Signup() {
    const navigate = useNavigate();
    const { register } = useAuth();

    const [username, setUsername] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");

    const [error, setError] = useState("");

    const handleSignup = async (e) => {
        e.preventDefault();

        try {
            setError("");

            await register({
                username,
                email,
                password,
            });

            navigate("/login");
        } catch (err) {
            setError(err.message);
        }
    };

    return (
        <main className="auth-page">
            <section className="auth-card">
                <h1>Créer un compte</h1>
                <p>Prépare ton espace personnel.</p>

                <form onSubmit={handleSignup} className="auth-form">
                    <input
                        type="text"
                        placeholder="Nom d’utilisateur"
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                    />

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

                    <button type="submit">Créer le compte</button>
                </form>

                <span>
                    Déjà un compte ? <Link to="/login">Se connecter</Link>
                </span>
            </section>
        </main>
    );
}

export default Signup;