import Sidebar from "./Sidebar";
import VoiceAssistant from "./VoiceAssistant";
function AppLayout({ children }) {
    return (
        <div className="app-layout">
            <Sidebar />
            <VoiceAssistant />
            <main className="dashboard-main">{children}</main>
        </div>
    );
}

export default AppLayout;