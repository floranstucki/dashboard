import { useEffect, useRef, useState } from "react";
import { Mic, MicOff } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useTasks } from "../context/TasksContext";
import { useNotes } from "../context/NotesContext";
import { useIdeas } from "../context/IdeasContext";
import { useHabits } from "../context/HabitsContext";
import { useFinances } from "../context/FinancesContext";
import { useCalendar } from "../context/CalendarContext";
import { apiFetch } from "../utils/api";
import { useNotifications } from "../context/NotificationsContext";
import { parseVoiceIntent } from "../utils/voiceIntentParser";

function VoiceAssistant() {
    const navigate = useNavigate();
    const { tasks } = useTasks();
    const { habits } = useHabits();
    const { sortedEvents } = useCalendar();

    const safeTasks = Array.isArray(tasks) ? tasks : [];
    const safeHabits = Array.isArray(habits) ? habits : [];
    const safeEvents = Array.isArray(sortedEvents) ? sortedEvents : [];
    const { addNote } = useNotes();
    const { addIdea } = useIdeas();
    const { addNotification } = useNotifications();
    const { addEvent } = useCalendar();
    const [pendingAction, setPendingAction] = useState(null);
    const [listening, setListening] = useState(false);
    const [wakeMode, setWakeMode] = useState(false);
    const [lastCommand, setLastCommand] = useState("");
    const [feedback, setFeedback] = useState("");
    const { addFinanceItem } = useFinances();
    const recognitionRef = useRef(null);
    useEffect(() => {
        const handleExternalCommand = async (event) => {
            await handleCommand(event.detail);
        };

        window.addEventListener("assistant-voice-command", handleExternalCommand);

        return () => {
            window.removeEventListener("assistant-voice-command", handleExternalCommand);
        };
    }, [tasks, habits, sortedEvents]);
    const WAKE_WORDS = [
        "ok dashboard",
        "okay dashboard",
        "hey dashboard",
        "ok tableau de bord",
    ];

    const normalize = (text) =>
        text
            .toLowerCase()
            .trim()
            .replace(/[.,!?]/g, "")
            .replace(/\s+/g, " ");

    const speak = (text) => {
        window.speechSynthesis.cancel();

        const utterance = new SpeechSynthesisUtterance(text);
        utterance.lang = "fr-FR";
        window.speechSynthesis.speak(utterance);
    };

    const resetVoice = () => {
        window.speechSynthesis.cancel();

        if (recognitionRef.current) {
            recognitionRef.current.abort();
            recognitionRef.current = null;
        }

        setListening(false);
        setWakeMode(false);
        setFeedback("Assistant vocal réinitialisé.");
    };

    const isConfirmation = (command) =>
        ["oui", "confirme", "confirmer", "vas-y", "valide", "ok"].some((word) =>
            command.includes(word)
        );

    const isCancel = (command) =>
        ["non", "annule", "annuler", "stop", "laisse tomber"].some((word) =>
            command.includes(word)
        );

    const hasKeyword = (command, keywords) =>
        keywords.some((keyword) => command.includes(keyword));

    const removeWakeWord = (text) => {
        let cleaned = normalize(text);

        WAKE_WORDS.forEach((wakeWord) => {
            cleaned = cleaned.replace(wakeWord, "");
        });

        return cleaned.trim();
    };

    const containsWakeWord = (text) => {
        const command = normalize(text);
        return WAKE_WORDS.some((word) => command.includes(word));
    };

    const detectPriority = (command) => {
        if (/\burgent(e)?\b/.test(command)) return "Urgente";
        if (/\b(haute|important|importante)\b/.test(command)) return "Haute";
        if (/\b(basse|faible)\b/.test(command)) return "Basse";
        return "Moyenne";
    };

    const detectDeadline = (command) => {
        const date = new Date();

        if (command.includes("demain")) {
            date.setDate(date.getDate() + 1);
            return date.toISOString().split("T")[0];
        }

        if (command.includes("aujourd'hui") || command.includes("aujourdhui")) {
            return date.toISOString().split("T")[0];
        }

        return "Non définie";
    };

    const parseTask = (text) => {
        const command = normalize(text);

        const priority = detectPriority(command);
        const deadline = detectDeadline(command);

        const title = command
            .replace(
                /(ok dashboard|okay dashboard|hey dashboard|ok tableau de bord)/g,
                ""
            )
            .replace(
                /(ajoute une tâche|ajouter une tâche|crée une tâche|créer une tâche|nouvelle tâche|ajoute tâche|ajouter tâche|mets une tâche|mettre une tâche)/g,
                ""
            )
            .replace(
                /(urgente|urgent|haute|important|importante|basse|faible|moyenne)/g,
                ""
            )
            .replace(/(pour demain|demain|pour aujourd'hui|aujourd'hui|aujourdhui)/g, "")
            .replace(/\s+/g, " ")
            .trim();

        return { title, priority, deadline };
    };

    const parseEvent = (text) => {
        const command = normalize(text);

        const date = (() => {
            const today = new Date();

            if (command.includes("demain")) {
                today.setDate(today.getDate() + 1);
                return today.toISOString().split("T")[0];
            }

            if (command.includes("aujourd'hui") || command.includes("aujourdhui")) {
                return today.toISOString().split("T")[0];
            }

            return today.toISOString().split("T")[0];
        })();

        const timeMatch = command.match(/(\d{1,2})h/);

        const time = timeMatch
            ? `${String(timeMatch[1]).padStart(2, "0")}:00`
            : "Toute la journée";

        const title = command
            .replace(/ajoute|ajouter|crée|créer|un|une|événement|evenement|calendrier|rendez-vous|rdv/g, "")
            .replace(/demain|aujourd'hui|aujourdhui/g, "")
            .replace(/\d{1,2}h/g, "")
            .replace(/\s+/g, " ")
            .trim();

        return {
            title: title || "Événement vocal",
            category: "Vocal",
            date,
            time,
        };
    };

    const parseFinance = (text) => {
        const command = normalize(text);

        const amountMatch = command.match(/(\d+([.,]\d+)?)/);
        const amount = amountMatch
            ? Number(amountMatch[1].replace(",", "."))
            : 0;

        let type = "Dépense";

        if (command.includes("revenu") || command.includes("salaire")) {
            type = "Revenu";
        }

        if (command.includes("épargne") || command.includes("epargne")) {
            type = "Épargne";
        }

        const description = command
            .replace(/ajoute|ajouter|une|un|dépense|depense|revenu|épargne|epargne|francs|franc|chf/g, "")
            .replace(/(\d+([.,]\d+)?)/g, "")
            .replace(/\s+/g, " ")
            .trim();

        return {
            description: description || "Transaction vocale",
            amount,
            type,
            category: "Vocal",
        };
    };

    const extractAfterKeywords = (text, keywords) => {
        const command = normalize(text);

        for (const keyword of keywords) {
            const index = command.indexOf(keyword);

            if (index !== -1) {
                return command.slice(index + keyword.length).trim();
            }
        }

        return "";
    };

    const answerAndSave = async (
        command,
        message,
        intent = "QUESTION"
    ) => {
        setFeedback(message);
        speak(message);

        await saveAssistantHistory(
            command,
            message,
            intent
        );
    };
    const handleNavigation = (command) => {
        const navigationCommands = [
            { keywords: ["ouvre les tâches", "ouvre tâches", "va aux tâches"], path: "/tasks", answer: "J'ouvre les tâches." },
            { keywords: ["ouvre les finances", "ouvre finances", "va aux finances"], path: "/finances", answer: "J'ouvre les finances." },
            { keywords: ["ouvre les projets", "ouvre projets", "va aux projets"], path: "/projects", answer: "J'ouvre les projets." },
            { keywords: ["ouvre le dashboard", "ouvre dashboard", "accueil"], path: "/dashboard", answer: "J'ouvre le dashboard." },
            { keywords: ["ouvre les notes", "ouvre notes"], path: "/notes", answer: "J'ouvre les notes." },
            { keywords: ["ouvre les idées", "ouvre idées"], path: "/ideas", answer: "J'ouvre les idées." },
            { keywords: ["ouvre les objectifs", "ouvre objectifs"], path: "/goals", answer: "J'ouvre les objectifs." },
            { keywords: ["ouvre les habitudes", "ouvre habitudes"], path: "/habits", answer: "J'ouvre les habitudes." },
            { keywords: ["ouvre les intégrations", "ouvre intégrations"], path: "/integrations", answer: "J'ouvre les intégrations." },
            { keywords: ["ouvre les paramètres", "ouvre paramètres"], path: "/settings", answer: "J'ouvre les paramètres." },
        ];

        const match = navigationCommands.find((item) =>
            hasKeyword(command, item.keywords)
        );

        if (!match) return false;

        navigate(match.path);
        setFeedback(match.answer);
        speak(match.answer);
        return true;
    };

    const answerQuestion = async (command) => {
        console.log("QUESTION VOCALE :", command);
        if (
            command.includes("score") ||
            command.includes("note du jour")
        ) {
            const doneTasks = safeTasks.filter((task) => task.status === "Terminé").length;
            const doneHabits = safeHabits.filter((habit) => habit.doneToday).length;

            const score = Math.min(100, doneTasks * 10 + doneHabits * 10);

            const message = `Ton score estimé du jour est de ${score} sur 100.`;
            await answerAndSave(command, message, "DAY_SCORE");
            return true;
        }

        if (
            command.includes("serveur") ||
            command.includes("état système") ||
            command.includes("etat systeme")
        ) {
            const response = await apiFetch("/server-status");

            if (!response.ok) {
                const message = "Je n'arrive pas à récupérer l'état du serveur.";
                setFeedback(message);
                speak(message);
                return true;
            }

            const status = await response.json();

            const message = status.online
                ? `Ton serveur est en ligne. CPU ${status.cpu} pour cent, RAM ${status.ram} pour cent, disque ${status.disk} pour cent.`
                : "Ton serveur semble hors ligne.";

            await answerAndSave(command, message, "SERVER_STATUS");
            return true;
        }

        if (
            command.includes("tâches urgentes") ||
            command.includes("taches urgentes") ||
            command.includes("priorités") ||
            command.includes("priorites") ||
            (command.includes("tâches") && command.includes("urgent")) ||
            (command.includes("taches") && command.includes("urgent"))
        ) {
            const urgentTasks = safeTasks.filter(
                (task) =>
                    task.status !== "Terminé" &&
                    (task.priority === "Haute" || task.priority === "Urgente")
            );

            const message = urgentTasks.length
                ? `Tu as ${urgentTasks.length} tâche importante. La première est ${urgentTasks[0].title}.`
                : "Tu n'as aucune tâche urgente.";

            await answerAndSave(command, message, "URGENT_TASKS");
            return true;
        }

        if (
            command.includes("résume") ||
            command.includes("resume") ||
            command.includes("journée") ||
            command.includes("journee") ||
            command.includes("briefing")
        ) {
            const today = new Date().toISOString().split("T")[0];

            const urgentTasks = safeTasks.filter(
                (task) =>
                    task.status !== "Terminé" &&
                    (task.priority === "Haute" || task.priority === "Urgente")
            ).length;

            const eventsToday = safeEvents.filter((event) => event.date === today).length;
            const habitsLeft = safeHabits.filter((habit) => !habit.doneToday).length;

            const message = `Aujourd'hui, tu as ${urgentTasks} tâche prioritaire, ${eventsToday} événement prévu et ${habitsLeft} habitude restante.`;

            await answerAndSave(command, message, "MORNING_BRIEFING");
            return true;
        }

        if (
            command.includes("objectif sport") ||
            command.includes("sport cette semaine") ||
            command.includes("kilomètres") ||
            command.includes("kilometres") ||
            command.includes("strava")
        ) {
            const response = await apiFetch("/strava/activities");

            if (!response.ok) {
                const message = "Je n'arrive pas à récupérer tes activités Strava.";
                setFeedback(message);
                speak(message);
                return true;
            }

            const activities = await response.json();

            const now = new Date();
            const sevenDaysAgo = new Date();
            sevenDaysAgo.setDate(now.getDate() - 7);

            const weeklyKm =
                activities
                    .filter((activity) => new Date(activity.start_date) >= sevenDaysAgo)
                    .reduce((sum, activity) => sum + Number(activity.distance || 0), 0) /
                1000;

            const message = `Tu as fait ${weeklyKm.toFixed(1)} kilomètres cette semaine.`;
            await answerAndSave(command, message, "SPORT_SUMMARY");
            return true;
        }

        if (
            command.includes("bonjour") ||
            command.includes("morning briefing") ||
            command.includes("briefing du matin")
        ) {
            const urgentTasks = safeTasks.filter(
                (task) =>
                    task.status !== "Terminé" &&
                    (task.priority === "Haute" || task.priority === "Urgente")
            );

            const eventsToday = safeEvents.filter((event) => {
                const today = new Date().toISOString().split("T")[0];
                return event.date === today;
            });

            const habitsLeft = safeHabits.filter(
                (habit) => !habit.doneToday
            );

            const message =
                `Bonjour Flo. ` +
                `Tu as ${urgentTasks.length} tâche importante. ` +
                `${eventsToday.length} événement aujourd'hui. ` +
                `${habitsLeft.length} habitude à compléter.`;

            await answerAndSave(command, message, "MORNING_BRIEFING");

            return true;
        }

        if (
            command.includes("que dois-je faire") ||
            command.includes("quoi faire aujourd'hui") ||
            command.includes("priorités du jour") ||
            command.includes("mes priorités")
        ) {
            const urgentTasks = safeTasks.filter(
                (task) =>
                    task.status !== "Terminé" &&
                    (task.priority === "Haute" || task.priority === "Urgente")
            );

            const habitsLeft = safeHabits.filter((habit) => !habit.doneToday);

            const today = new Date().toISOString().split("T")[0];
            const eventsToday = safeEvents.filter((event) => event.date === today);

            let message = "Aujourd'hui, je te conseille de ";

            if (urgentTasks.length > 0) {
                message += `commencer par ${urgentTasks[0].title}. `;
            } else {
                message += "commencer par une petite tâche simple. ";
            }

            if (eventsToday.length > 0) {
                message += `Tu as aussi ${eventsToday.length} événement prévu. `;
            }

            if (habitsLeft.length > 0) {
                message += `Il te reste ${habitsLeft.length} habitude à valider. `;
            }

            await answerAndSave(command, message, "TODAY_FOCUS");

            return true;
        }
        return false;
    };

    const parseMemory = (text) => {
        const command = normalize(text);

        let cleaned = command
            .replace(/retiens que/g, "")
            .replace(/souviens-toi que/g, "")
            .replace(/souviens toi que/g, "")
            .replace(/mémorise que/g, "")
            .replace(/memorise que/g, "")
            .trim();

        if (cleaned.includes("s'appelle")) {
            const [key, value] = cleaned.split("s'appelle");

            return {
                memoryKey: key.trim(),
                memoryValue: value.trim(),
            };
        }

        if (cleaned.includes("est")) {
            const [key, value] = cleaned.split("est");

            return {
                memoryKey: key.trim(),
                memoryValue: value.trim(),
            };
        }

        return {
            memoryKey: "information",
            memoryValue: cleaned,
        };
    };

    const saveAssistantHistory = async (commandText, responseText, intent = "UNKNOWN") => {
        await apiFetch("/assistant/history", {
            method: "POST",
            body: JSON.stringify({
                commandText,
                responseText,
                intent,
            }),
        });
    };
    const findMemoryAnswer = async (command) => {
        const response = await apiFetch("/assistant/memory");

        if (!response.ok) return null;

        const memories = await response.json();

        const found = memories.find((memory) =>
            command.includes(memory.memoryKey.toLowerCase())
        );

        if (!found) return null;

        return `${found.memoryKey} : ${found.memoryValue}.`;
    };

    const handleCommand = async (text) => {
        const command = normalize(text);
        if (pendingAction) {
            if (isConfirmation(command)) {
                await pendingAction.execute();

                const message = pendingAction.successMessage;
                setPendingAction(null);
                setFeedback(message);
                speak(message);
                await saveAssistantHistory(text, message, finalIntent.intent);
                return;
            }

            if (isCancel(command)) {
                setPendingAction(null);

                const message = "Action annulée.";
                setFeedback(message);
                speak(message);
                return;
            }

            speak("Dis oui pour confirmer ou non pour annuler.");
            return;
        }
        setLastCommand(text);
        setFeedback("");

        if (handleNavigation(command)) return;

        if (
            command.includes("retiens que") ||
            command.includes("souviens-toi que") ||
            command.includes("souviens toi que") ||
            command.includes("mémorise que") ||
            command.includes("memorise que")
        ) {
            const memory = parseMemory(text);

            await apiFetch("/assistant/memory", {
                method: "POST",
                body: JSON.stringify(memory),
            });

            const message = "C'est noté.";
            setFeedback(message);
            speak(message);
            return;
        }

        if (
            command.includes("comment s'appelle") ||
            command.includes("quel est") ||
            command.includes("quelle est")
        ) {
            const answer = await findMemoryAnswer(command);

            if (answer) {
                setFeedback(answer);
                speak(answer);
                return;
            }
        }
        const parsed = parseVoiceIntent(text);
        let finalIntent = parsed;

        if (parsed.intent === "UNKNOWN") {
            const response = await apiFetch("/assistant/ai-intent", {
                method: "POST",
                body: JSON.stringify({ text }),
            });

            if (response.ok) {
                finalIntent = await response.json();
            }
        }

        switch (finalIntent.intent) {
            case "CREATE_TASK": {
                const task =
                    finalIntent.title
                        ? {
                            title: finalIntent.title,
                            priority: finalIntent.priority || "Moyenne",
                            deadline: finalIntent.deadline || "Non définie",
                        }
                        : parseTask(text);

                if (!task.title) {
                    const message = "Je n'ai pas compris le nom de la tâche.";
                    setFeedback(message);
                    speak(message);
                    return;
                }

                if (finalIntent.source === "AI") {
                    const confirmMessage =
                        task.deadline !== "Non définie"
                            ? `Je vais ajouter la tâche ${task.title}, priorité ${task.priority}, pour ${task.deadline}. Confirmer ?`
                            : `Je vais ajouter la tâche ${task.title}, priorité ${task.priority}. Confirmer ?`;

                    setPendingAction({
                        successMessage: `Tâche ajoutée : ${task.title}.`,
                        execute: async () => {
                            await addTask({
                                title: task.title,
                                project: "Perso",
                                priority: task.priority,
                                deadline: task.deadline,
                                recurrence: "Aucune",
                            });

                            await addNotification({
                                title: "Tâche ajoutée par la voix",
                                message: `${task.title} · ${task.priority} · ${task.deadline}`,
                            });
                        },
                    });

                    setFeedback(confirmMessage);
                    speak(confirmMessage);
                    return;
                }

                // Tâches classiques
                await addTask({
                    title: task.title,
                    project: "Perso",
                    priority: task.priority,
                    deadline: task.deadline,
                    recurrence: "Aucune",
                });

                await addNotification({
                    title: "Tâche ajoutée par la voix",
                    message: `${task.title} · ${task.priority} · ${task.deadline}`,
                });

                const message =
                    task.deadline !== "Non définie"
                        ? `Tâche ajoutée : ${task.title}, priorité ${task.priority}, pour ${task.deadline}.`
                        : `Tâche ajoutée : ${task.title}, priorité ${task.priority}.`;

                setFeedback(message);
                speak(message);
                await saveAssistantHistory(text, message, "CREATE_TASK");
                return;
            }

            case "CREATE_NOTE": {
                const title = extractAfterKeywords(command, [
                    "ajoute une note",
                    "ajouter une note",
                    "crée une note",
                    "créer une note",
                    "nouvelle note",
                    "ajoute note",
                ]);

                if (!title) {
                    const message = "Je n'ai pas compris la note.";
                    setFeedback(message);
                    speak(message);
                    return;
                }

                await addNote({
                    title,
                    tag: "Vocal",
                    content: "Note ajoutée par assistant vocal.",
                });

                const message = `Note ajoutée : ${title}`;
                setFeedback(message);
                speak(message);
                return;
            }

            case "CREATE_IDEA": {
                const title = extractAfterKeywords(command, [
                    "ajoute une idée",
                    "ajouter une idée",
                    "crée une idée",
                    "créer une idée",
                    "nouvelle idée",
                    "ajoute idée",
                ]);

                if (!title) {
                    const message = "Je n'ai pas compris l'idée.";
                    setFeedback(message);
                    speak(message);
                    return;
                }

                await addIdea({
                    title,
                    category: "Vocal",
                    content: "Idée ajoutée par assistant vocal.",
                });

                const message = `Idée ajoutée : ${title}`;
                setFeedback(message);
                speak(message);
                return;
            }
            case "CREATE_FINANCE": {
                const finance = parseFinance(text);

                if (!finance.amount || finance.amount <= 0) {
                    const message = "Je n'ai pas compris le montant.";
                    setFeedback(message);
                    speak(message);
                    return;
                }

                const confirmMessage = `Je vais ajouter une ${finance.type.toLowerCase()} de ${finance.amount} francs pour ${finance.description}. Confirmer ?`;

                setPendingAction({
                    successMessage: `${finance.type} ajoutée : ${finance.amount} francs pour ${finance.description}.`,
                    execute: async () => {
                        await addFinanceItem({
                            description: finance.description,
                            amount: finance.amount,
                            type: finance.type,
                            category: finance.category,
                        });
                    },
                });

                setFeedback(confirmMessage);
                speak(confirmMessage);
                await saveAssistantHistory(text, message, "CREATE_FINANCE");
                return;
            }
            case "CREATE_EVENT": {
                const event = parseEvent(text);

                const confirmMessage =
                    event.time !== "Toute la journée"
                        ? `Je vais ajouter l'événement ${event.title}, le ${event.date} à ${event.time}. Confirmer ?`
                        : `Je vais ajouter l'événement ${event.title}, le ${event.date}. Confirmer ?`;

                setPendingAction({
                    successMessage: `Événement ajouté : ${event.title}.`,
                    execute: async () => {
                        await addEvent({
                            title: event.title,
                            category: event.category,
                            date: event.date,
                            time: event.time,
                        });
                    },
                });

                setFeedback(confirmMessage);
                speak(confirmMessage);
                await saveAssistantHistory(text, message, "CREATE_EVENT");
                return;
            }

            case "MORNING_BRIEFING": {
                if (await answerQuestion(command)) return;
                break;
            }

            case "PRIORITIES_OF_THE_DAY": {
                const urgentTasks = safeTasks.filter(
                    (task) =>
                        task.status !== "Terminé" &&
                        (task.priority === "Haute" || task.priority === "Urgente")
                );

                const eventsToday = safeEvents.filter((event) => {
                    const today = new Date().toISOString().split("T")[0];
                    return event.date === today;
                });

                const habitsLeft = safeHabits.filter(
                    (habit) => !habit.doneToday
                );

                const message =
                    `Bonjour Flo. ` +
                    `Tu as ${urgentTasks.length} tâche importante. ` +
                    `${eventsToday.length} événement aujourd'hui. ` +
                    `${habitsLeft.length} habitude à compléter.`;

                setFeedback(message);
                speak(message);

                return true;
            }

            case "MEMORY": {
                const memory = parseMemory(text);

                await apiFetch("/assistant/memory", {
                    method: "POST",
                    body: JSON.stringify(memory),
                });

                const message = "C'est noté.";
                setFeedback(message);
                speak(message);
                return;
            }

            case "SERVER_STATUS":
            case "DAY_SCORE":
            case "SPORT_SUMMARY": {
                if (await answerQuestion(command)) return;
                break;
            }

            default:
                break;
        }

        const message = "Commande non reconnue.";
        setFeedback(message);
        speak(message);
    };

    const createRecognition = () => {
        const SpeechRecognition =
            window.SpeechRecognition || window.webkitSpeechRecognition;

        if (!SpeechRecognition) {
            alert(
                "La reconnaissance vocale n'est pas supportée sur ce navigateur. Utilise Chrome ou Edge."
            );
            return null;
        }

        return new SpeechRecognition();
    };

    const startListening = () => {
        resetVoice();

        const recognition = createRecognition();
        if (!recognition) return;

        recognition.lang = "fr-CH";
        recognition.continuous = false;
        recognition.interimResults = false;
        recognition.maxAlternatives = 3;

        recognition.onstart = () => {
            setListening(true);
            setFeedback("J'écoute...");
        };

        recognition.onresult = async (event) => {
            const text = event.results[0][0].transcript;
            console.log("Commande micro :", text);
            await handleCommand(text);
        };

        recognition.onerror = (event) => {
            console.error("Erreur reconnaissance vocale :", event.error);
            setListening(false);

            const message =
                event.error === "no-speech"
                    ? "Je n'ai rien entendu."
                    : "Erreur de reconnaissance vocale.";

            setFeedback(message);
        };

        recognition.onend = () => {
            setListening(false);
            recognitionRef.current = null;
        };

        recognitionRef.current = recognition;
        recognition.start();
    };

    const startWakeMode = () => {
        resetVoice();

        const recognition = createRecognition();
        if (!recognition) return;

        recognition.lang = "fr-CH";
        recognition.continuous = false;
        recognition.interimResults = false;
        recognition.maxAlternatives = 3;

        recognition.onstart = () => {
            setWakeMode(true);
            setFeedback("Dis : Ok Dashboard puis ta commande.");
        };

        recognition.onresult = async (event) => {
            const text = event.results[0][0].transcript;
            console.log("Wake mode entendu :", text);

            if (!containsWakeWord(text)) {
                const message = "Dis d'abord : Ok Dashboard.";
                setFeedback(message);
                speak(message);
                return;
            }

            const cleanedCommand = removeWakeWord(text);

            if (!cleanedCommand) {
                const message = "Commande attendue après Ok Dashboard.";
                setFeedback(message);
                speak("Je t'écoute.");
                return;
            }

            await handleCommand(cleanedCommand);
        };

        recognition.onerror = (event) => {
            console.error("Erreur wake mode :", event.error);
            setWakeMode(false);
            setFeedback("Erreur du mode Ok Dashboard.");
        };

        recognition.onend = () => {
            setWakeMode(false);
            recognitionRef.current = null;
        };

        recognitionRef.current = recognition;
        recognition.start();
    };

    const stopWakeMode = () => {
        if (recognitionRef.current) {
            recognitionRef.current.abort();
            recognitionRef.current = null;
        }

        setWakeMode(false);
        setFeedback("Mode Ok Dashboard désactivé.");
    };

    return (
        <div className="voice-assistant">
            {(lastCommand || feedback) && (
                <div className="voice-assistant-bubble">
                    {lastCommand && <div>“{lastCommand}”</div>}
                    {feedback && <strong>{feedback}</strong>}
                </div>
            )}

            <button
                className={listening ? "voice-button listening" : "voice-button"}
                onClick={startListening}
                title="Assistant vocal"
            >
                {listening ? <MicOff size={22} /> : <Mic size={22} />}
            </button>

            <button
                className={wakeMode ? "wake-button active" : "wake-button"}
                onClick={wakeMode ? stopWakeMode : startWakeMode}
                title="Mode Ok Dashboard"
            >
                Ok
            </button>

            <button
                className="wake-button"
                onClick={resetVoice}
                title="Réinitialiser vocal"
            >
                ↻
            </button>
        </div>
    );
}

export default VoiceAssistant;