import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "./hooks/useAuth";
import { ThemeProvider } from "./components/ThemeProvider";
import ProtectedRoute from "./components/ProtectedRoute";
import MobileNavigation from "./components/MobileNavigation";
import LandingPage from "./pages/LandingPage";
import About from "./pages/About";
import Events from "./pages/Events";
import PublicEvents from "./pages/PublicEvents";
import DashboardEventsPage from "./pages/dashboard/events";
import Contact from "./pages/Contact";
import Auth from "./pages/Auth";
import Dashboard from "./pages/Dashboard";
import Profile from "./pages/Profile";
import Blogs from "./pages/Blogs";
import Campaigns from "./pages/Campaigns";
import Feed from "./pages/Feed";
import NotFound from "./pages/NotFound";
import JobBoard from "./pages/JobBoard";
import Mentorship from "./pages/Mentorship";
import UserDirectory from "./pages/UserDirectory";
import AdminPanel from "./pages/AdminPanel";
import Analytics from "./pages/Analytics";
import Recommendations from "./pages/Recommendations";
import AdminUsers from "./pages/AdminUsers";
import AdminEvents from "./pages/AdminEvents";
import AdminJobs from "./pages/AdminJobs";
import AdminMentorship from "./pages/AdminMentorship";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <ThemeProvider defaultTheme="system" storageKey="alumni-connect-theme">
      <AuthProvider>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <div className="relative">
              <Routes>
                <Route path="/" element={<LandingPage />} />
                <Route path="/about" element={<About />} />
                <Route path="/features" element={<LandingPage />} />
                {/* <Route path="/events" element={<Events />} /> */}
                <Route path="/public-events" element={<PublicEvents />} />
                <Route path="/contact" element={<Contact />} />
                <Route path="/blogs" element={<Blogs />} />
                <Route path="/campaigns" element={<Campaigns />} />
                <Route path="/auth" element={<Auth />} />
                <Route path="/login" element={<Auth />} />
                <Route path="/register" element={<Auth />} />
                <Route path="/dashboard" element={
                  <ProtectedRoute>
                    <Dashboard />
                  </ProtectedRoute>
                } />
                <Route path="/dashboard/profile" element={
                  <ProtectedRoute>
                    <Profile />
                  </ProtectedRoute>
                } />
                <Route path="/dashboard/feed" element={
                  <ProtectedRoute>
                    <Feed />
                  </ProtectedRoute>
                } />
                <Route path="/dashboard/events" element={
                  <ProtectedRoute>
                    <DashboardEventsPage />
                  </ProtectedRoute>
                } />
                <Route path="/dashboard/jobs" element={
                  <ProtectedRoute>
                    <JobBoard />
                  </ProtectedRoute>
                } />
                <Route path="/dashboard/mentorship" element={
                  <ProtectedRoute>
                    <Mentorship />
                  </ProtectedRoute>
                } />
                <Route path="/dashboard/user-directory" element={
                  <ProtectedRoute>
                    <UserDirectory />
                  </ProtectedRoute>
                } />
                <Route path="/dashboard/admin-panel" element={
                  <ProtectedRoute>
                    <AdminPanel />
                  </ProtectedRoute>
                } />
                <Route path="/dashboard/analytics" element={
                  <ProtectedRoute>
                    <Analytics />
                  </ProtectedRoute>
                } />
                <Route path="/dashboard/recommendations" element={
                  <ProtectedRoute>
                    <Recommendations />
                  </ProtectedRoute>
                } />
                <Route path="/dashboard/users" element={
                  <ProtectedRoute>
                    <AdminUsers />
                  </ProtectedRoute>
                } />
                <Route path="/dashboard/manage-events" element={
                  <ProtectedRoute>
                    <AdminEvents />
                  </ProtectedRoute>
                } />
                <Route path="/dashboard/manage-jobs" element={
                  <ProtectedRoute>
                    <AdminJobs />
                  </ProtectedRoute>
                } />
                <Route path="/dashboard/manage-mentorship" element={
                  <ProtectedRoute>
                    <AdminMentorship />
                  </ProtectedRoute>
                } />
                {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
                <Route path="*" element={<NotFound />} />
              </Routes>
              
              {/* Mobile Navigation - only show on dashboard routes */}
              <Routes>
                <Route path="/dashboard/*" element={
                  <ProtectedRoute>
                    <MobileNavigation />
                  </ProtectedRoute>
                } />
              </Routes>
            </div>
          </BrowserRouter>
        </TooltipProvider>
      </AuthProvider>
    </ThemeProvider>
  </QueryClientProvider>
);

export default App;
