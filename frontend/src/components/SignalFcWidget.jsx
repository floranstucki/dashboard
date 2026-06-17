import { useEffect, useState } from "react";
import { CalendarDays, Newspaper } from "lucide-react";
import { apiFetch } from "../utils/api";

function SignalFcWidget() {
    const [posts, setPosts] = useState([]);
    const [manifestations, setManifestations] = useState([]);

    useEffect(() => {
        const loadSignalData = async () => {
            const [postsRes, manifestationsRes] = await Promise.allSettled([
                apiFetch("/signal-fc/posts"),
                apiFetch("/signal-fc/manifestations"),
            ]);

            if (postsRes.status === "fulfilled" && postsRes.value.ok) {
                setPosts(await postsRes.value.json());
            }

            if (
                manifestationsRes.status === "fulfilled" &&
                manifestationsRes.value.ok
            ) {
                setManifestations(await manifestationsRes.value.json());
            }
        };

        loadSignalData();
    }, []);

    return (
        <section className="dashboard-card signal-card">
            <div className="card-header">
                <h2>⚽ Signal FC</h2>
            </div>

            <div className="signal-section">
                <h3>📰 Actualités</h3>

                <div className="signal-list">
                    {posts.length > 0 ? (
                        posts.slice(0, 3).map((post) => (
                            <a
                                className="signal-item"
                                href={post.link}
                                target="_blank"
                                rel="noreferrer"
                                key={post.id}
                            >
                                <div className="signal-icon">
                                    <Newspaper size={18} />
                                </div>

                                <div>
                                    <h4
                                        dangerouslySetInnerHTML={{
                                            __html: post.title.rendered,
                                        }}
                                    />
                                    <p>
                                        {new Date(post.date).toLocaleDateString("fr-CH")}
                                    </p>
                                </div>
                            </a>
                        ))
                    ) : (
                        <p className="empty-state">Aucune actualité trouvée.</p>
                    )}
                </div>
            </div>

            <div className="signal-section">
                <h3>📅 Manifestations</h3>

                <div className="signal-list">
                    {manifestations.length > 0 ? (
                        manifestations.slice(0, 3).map((event) => (
                            <a
                                className="signal-item"
                                href={event.link}
                                target="_blank"
                                rel="noreferrer"
                                key={event.id}
                            >
                                <div className="signal-icon">
                                    <CalendarDays size={18} />
                                </div>

                                <div>
                                    <h4
                                        dangerouslySetInnerHTML={{
                                            __html: event.title.rendered,
                                        }}
                                    />
                                    <p>
                                        {new Date(event.date).toLocaleDateString("fr-CH")}
                                    </p>
                                </div>
                            </a>
                        ))
                    ) : (
                        <p className="empty-state">Aucune manifestation trouvée.</p>
                    )}
                </div>
            </div>
        </section>
    );
}

export default SignalFcWidget;