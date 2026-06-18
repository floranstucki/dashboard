export function parseVoiceIntent(text) {
    const command = text.toLowerCase().trim();

    if (
        command.includes("tâche") ||
        command.includes("tache")
    ) {
        return {
            intent: "CREATE_TASK",
            text,
        };
    }

    if (
        command.includes("note")
    ) {
        return {
            intent: "CREATE_NOTE",
            text,
        };
    }

    if (
        command.includes("idée") ||
        command.includes("idee")
    ) {
        return {
            intent: "CREATE_IDEA",
            text,
        };
    }

    if (
        command.includes("serveur")
    ) {
        return {
            intent: "SERVER_STATUS",
            text,
        };
    }

    if (
        command.includes("score")
    ) {
        return {
            intent: "DAY_SCORE",
            text,
        };
    }

    if (
        command.includes("strava") ||
        command.includes("sport")
    ) {
        return {
            intent: "SPORT_SUMMARY",
            text,
        };
    }
    if (
        command.includes("bonjour") ||
        command.includes("morning briefing") ||
        command.includes("briefing")
    ) {
        return {
            intent: "MORNING_BRIEFING",
            text,
        };
    }

    if (
        command.includes("que dois-je faire") ||
        command.includes("quoi faire aujourd'hui") ||
        command.includes("priorités du jour") ||
        command.includes("mes priorités")
    ) {
        return {
            intent: "PRIORITIES_OF_THE_DAY",
            text,
        };
    }

    if (
        command.includes("retiens que") ||
        command.includes("souviens-toi que") ||
        command.includes("souviens toi que") ||
        command.includes("mémorise que") ||
        command.includes("memorise que") ||
        command.includes("comment s'appelle") ||
        command.includes("quel est") ||
        command.includes("quelle est")
    ) {
        return {
            intent: "MEMORY",
            text,
        };
    }


    return {
        intent: "UNKNOWN",
        text,
    };


}