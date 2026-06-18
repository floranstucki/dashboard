import { useEffect, useMemo, useState } from "react";
import { GitCommitHorizontal, GitFork, Lock, Star } from "lucide-react";
import { apiFetch } from "../utils/api";

function GitHubWidget() {
    const [repos, setRepos] = useState([]);
    const [connected, setConnected] = useState(true);
    const [issues, setIssues] = useState([]);
    const [pullRequests, setPullRequests] = useState([]);
    const [events, setEvents] = useState([]);
    const safeJsonParse = (value, fallback) => {
        try {
            return typeof value === "string" ? JSON.parse(value) : fallback;
        } catch {
            return fallback;
        }
    };
    useEffect(() => {
        const loadRepos = async () => {
            const response = await apiFetch("/github/repos");

            if (response.status === 404) {
                setConnected(false);
                return;
            }

            if (!response.ok) return;

            const data = await response.json();
            setRepos(Array.isArray(data) ? data : []);
            const activityResponse = await apiFetch("/github/activity");

            if (activityResponse.ok) {
                const activity = await activityResponse.json();

                const parsedIssues = safeJsonParse(activity.issues, []);
                const parsedPrs = safeJsonParse(activity.pullRequests, { items: [] });

                setIssues(Array.isArray(parsedIssues) ? parsedIssues : []);
                setPullRequests(Array.isArray(parsedPrs.items) ? parsedPrs.items : []);
            }

            const eventsResponse = await apiFetch("/github/events");

            if (eventsResponse.ok) {
                const data = await eventsResponse.json();
                setEvents(Array.isArray(data) ? data : []);
            }
        };
        loadRepos();
    }, []);

    const stats = useMemo(() => {
        const privateRepos = repos.filter((repo) => repo.private).length;

        const languages = repos
            .map((repo) => repo.language)
            .filter(Boolean);

        const mainLanguage =
            languages.length > 0
                ? languages.sort(
                    (a, b) =>
                        languages.filter((item) => item === b).length -
                        languages.filter((item) => item === a).length
                )[0]
                : "N/A";

        const lastUpdated = repos[0];

        return {
            total: repos.length,
            privateRepos,
            publicRepos: repos.length - privateRepos,
            mainLanguage,
            lastUpdated,
        };
    }, [repos]);

    if (!connected) {
        return (
            <section className="dashboard-card github-card">
                <div className="card-header">
                    <h2>💻 GitHub</h2>
                </div>

                <p className="empty-state">
                    GitHub n’est pas encore connecté.
                </p>
            </section>
        );
    }

    return (
        <section className="dashboard-card github-card">
            <div className="card-header">
                <h2>💻 GitHub</h2>
            </div>

            <div className="github-summary">
                <div>
                    <span>Repos</span>
                    <strong>{stats.total}</strong>
                </div>

                <div>
                    <span>Privés</span>
                    <strong>{stats.privateRepos}</strong>
                </div>

                <div>
                    <span>Langage</span>
                    <strong>{stats.mainLanguage}</strong>
                </div>
            </div>

            {stats.lastUpdated && (
                <div className="github-latest">
                    <span>Dernier repo modifié</span>
                    <strong>{stats.lastUpdated.name}</strong>
                    <p>
                        Mis à jour le{" "}
                        {new Date(stats.lastUpdated.updated_at).toLocaleDateString("fr-CH")}
                    </p>
                </div>


            )}
            <div className="github-events">
                <span>Dernière activité</span>

                {events.slice(0, 3).map((event) => (
                    <p key={event.id}>
                        {event.type} · {event.repo?.name}
                    </p>
                ))}
            </div>
            <div className="github-activity-summary">
                <div>
                    <span>Issues</span>
                    <strong>{issues.length}</strong>
                </div>

                <div>
                    <span>Pull Requests</span>
                    <strong>{pullRequests.length}</strong>
                </div>
            </div>
            {repos.length > 0 ? (
                <div className="github-list">
                    {repos.slice(0, 6).map((repo) => (
                        <a
                            href={repo.html_url}
                            target="_blank"
                            rel="noreferrer"
                            className="github-item"
                            key={repo.id}
                        >
                            <div className="github-icon">
                                {repo.private ? <Lock size={18} /> : <GitCommitHorizontal size={18} />}
                            </div>

                            <div>
                                <h3>{repo.name}</h3>
                                <p>
                                    {repo.language || "Autre"} ·{" "}
                                    <Star size={12} /> {repo.stargazers_count} ·{" "}
                                    <GitFork size={12} /> {repo.forks_count}
                                </p>
                            </div>
                        </a>
                    ))}
                </div>
            ) : (
                <p className="empty-state">Aucun dépôt GitHub trouvé.</p>
            )}
        </section>
    );
}

export default GitHubWidget;