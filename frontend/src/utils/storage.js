export function getStorageData(key, fallback) {
    try {
        const savedData = localStorage.getItem(key);

        if (!savedData) {
            return fallback;
        }

        return JSON.parse(savedData);
    } catch (error) {
        console.error("Erreur lecture localStorage:", error);
        return fallback;
    }
}

export function setStorageData(key, value) {
    try {
        localStorage.setItem(key, JSON.stringify(value));
    } catch (error) {
        console.error("Erreur sauvegarde localStorage:", error);
    }
}

export function removeStorageData(key) {
    try {
        localStorage.removeItem(key);
    } catch (error) {
        console.error("Erreur suppression localStorage:", error);
    }
}