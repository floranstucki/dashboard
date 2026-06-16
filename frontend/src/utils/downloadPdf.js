export async function downloadMonthlyReport() {
    const auth = JSON.parse(localStorage.getItem("home-dashboard-auth"));
    const token = auth?.token;
    const now = new Date();

    const response = await fetch("http://localhost:7777/reports/monthly", {
        headers: {
            Authorization: `Bearer ${token}`,
        },
    });

    if (!response.ok) {
        throw new Error("Impossible de générer le rapport PDF.");
    }

    const blob = await response.blob();
    const url = window.URL.createObjectURL(blob);
    const fileName = `rapport-home-dashboard-${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}.pdf`;
    const link = document.createElement("a");
    link.href = url;
    link.download = fileName;
    link.click();

    window.URL.revokeObjectURL(url);
}