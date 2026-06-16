import { useLocation } from "react-router-dom";
import { AuthProvider } from "./AuthContext";
import { ProjectsProvider } from "./ProjectsContext";
import { TasksProvider } from "./TasksContext";
import { GoalsProvider } from "./GoalsContext";
import { FinancesProvider } from "./FinancesContext";
import { NotesProvider } from "./NotesContext";
import { IdeasProvider } from "./IdeasContext";
import { CalendarProvider } from "./CalendarContext";
import { NotificationsProvider } from "./NotificationsContext";
import { HabitsProvider } from "./HabitsContext";
function DataProviders({ children }) {
    const location = useLocation();

    const publicRoutes = ["/login", "/signup"];

    if (publicRoutes.includes(location.pathname)) {
        return children;
    }

    return (
        <NotificationsProvider>
            <ProjectsProvider>
                <TasksProvider>
                    <GoalsProvider>
                        <FinancesProvider>
                            <NotesProvider>
                                <IdeasProvider>
                                    <CalendarProvider>
                                        <HabitsProvider>
                                            {children}
                                        </HabitsProvider>
                                    </CalendarProvider>
                                </IdeasProvider>
                            </NotesProvider>
                        </FinancesProvider>
                    </GoalsProvider>
                </TasksProvider>
            </ProjectsProvider>
        </NotificationsProvider>
    );
}

function AppProviders({ children }) {
    return (
        <AuthProvider>
            <DataProviders>{children}</DataProviders>
        </AuthProvider>
    );
}

export default AppProviders;