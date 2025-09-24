import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider, useAuth } from "@/contexts/AuthContext";
import { NotificationProvider } from "@/contexts/NotificationContext";
import AuthPage from "./pages/AuthPage";
import { StudentDashboard } from "@/components/dashboard/StudentDashboard";
import { TeacherDashboard } from "@/components/dashboard/TeacherDashboard";
import { CoursesPage } from "@/pages/CoursesPage";
import { EcoQuestPage } from "@/pages/EcoQuestPage";
import { LeaderboardPage } from "@/pages/LeaderboardPage";
import { ProfilePage } from "@/pages/ProfilePage";
import { TopNav } from "@/components/navigation/TopNav";
import { BottomNav } from "@/components/navigation/BottomNav";

const queryClient = new QueryClient();

// Protected Route Component
const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const { user, loading } = useAuth();
  
  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-spin w-8 h-8 border-2 border-primary border-t-transparent rounded-full" />
      </div>
    );
  }
  
  if (!user) {
    return <Navigate to="/auth" replace />;
  }
  
  return (
    <div className="min-h-screen bg-background">
      <TopNav />
      {children}
      <BottomNav />
    </div>
  );
};

// App Routes Component
const AppRoutes = () => {
  const { user } = useAuth();
  
  return (
    <Routes>
      <Route path="/auth" element={!user ? <AuthPage /> : <Navigate to="/dashboard" replace />} />
      
      {/* Student Routes */}
      <Route 
        path="/dashboard" 
        element={
          <ProtectedRoute>
            {user?.role === 'student' ? <StudentDashboard /> : <Navigate to="/teacher/dashboard" replace />}
          </ProtectedRoute>
        } 
      />
      <Route 
        path="/courses" 
        element={
          <ProtectedRoute>
            {user?.role === 'student' ? <CoursesPage /> : <Navigate to="/teacher/courses" replace />}
          </ProtectedRoute>
        } 
      />
      <Route 
        path="/eco-quests" 
        element={
          <ProtectedRoute>
            {user?.role === 'student' ? <EcoQuestPage /> : <Navigate to="/teacher/dashboard" replace />}
          </ProtectedRoute>
        } 
      />
      <Route 
        path="/leaderboard" 
        element={
          <ProtectedRoute>
            {user?.role === 'student' ? <LeaderboardPage /> : <Navigate to="/teacher/dashboard" replace />}
          </ProtectedRoute>
        } 
      />
      <Route 
        path="/profile" 
        element={
          <ProtectedRoute>
            <ProfilePage />
          </ProtectedRoute>
        } 
      />
      
      {/* Teacher Routes */}
      <Route 
        path="/teacher/dashboard" 
        element={
          <ProtectedRoute>
            {user?.role === 'teacher' ? <TeacherDashboard /> : <Navigate to="/dashboard" replace />}
          </ProtectedRoute>
        } 
      />
      <Route 
        path="/teacher/students" 
        element={
          <ProtectedRoute>
            {user?.role === 'teacher' ? <LeaderboardPage /> : <Navigate to="/dashboard" replace />}
          </ProtectedRoute>
        } 
      />
      <Route 
        path="/teacher/courses" 
        element={
          <ProtectedRoute>
            {user?.role === 'teacher' ? <CoursesPage /> : <Navigate to="/dashboard" replace />}
          </ProtectedRoute>
        } 
      />
      <Route 
        path="/teacher/approvals" 
        element={
          <ProtectedRoute>
            {user?.role === 'teacher' ? <EcoQuestPage /> : <Navigate to="/dashboard" replace />}
          </ProtectedRoute>
        } 
      />
      <Route 
        path="/teacher/analytics" 
        element={
          <ProtectedRoute>
            {user?.role === 'teacher' ? <TeacherDashboard /> : <Navigate to="/dashboard" replace />}
          </ProtectedRoute>
        } 
      />
      
      {/* Catch-all routes */}
      <Route path="/" element={<Navigate to={user ? "/dashboard" : "/auth"} replace />} />
      <Route path="*" element={<Navigate to={user ? "/dashboard" : "/auth"} replace />} />
    </Routes>
  );
};

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <AuthProvider>
        <NotificationProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <AppRoutes />
          </BrowserRouter>
        </NotificationProvider>
      </AuthProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
