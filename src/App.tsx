
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import Index from "./pages/Index";
import BookingPage from "./pages/BookingPage";
import AdminDashboard from "./pages/AdminDashboard";
import AdminUsers from "./pages/AdminUsers";
import AdminEvents from "./pages/AdminEvents";
import AdminSessions from "./pages/AdminSessions";
import AdminReservations from "./pages/AdminReservations";
import AdminMessageTemplates from "./pages/AdminMessageTemplates";
import Login from "./pages/Login";
import SignUp from "./pages/SignUp";
import NotFound from "./pages/NotFound";
import MyReservationsPage from "./pages/MyReservationsPage";
import EventDetailPage from "./pages/EventDetailPage";
import AccountPage from "./pages/AccountPage";
import ProtectedRoute from "./components/ProtectedRoute";
import AdminRoute from "./components/AdminRoute";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <BrowserRouter>
        <AuthProvider>
          <Toaster />
          <Sonner />
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/booking/:eventId" element={<BookingPage />} />
            <Route path="/event/:eventId" element={<EventDetailPage />} />
            <Route path="/admin" element={
              <AdminRoute>
                <AdminDashboard />
              </AdminRoute>
            } />
            <Route path="/admin/users" element={
              <AdminRoute>
                <AdminUsers />
              </AdminRoute>
            } />
            <Route path="/admin/events" element={
              <AdminRoute>
                <AdminEvents />
              </AdminRoute>
            } />
            <Route path="/admin/events/:eventId/sessions" element={
              <AdminRoute>
                <AdminSessions />
              </AdminRoute>
            } />
            <Route path="/admin/reservations" element={
              <AdminRoute>
                <AdminReservations />
              </AdminRoute>
            } />
            <Route path="/admin/message-templates" element={
              <AdminRoute>
                <AdminMessageTemplates />
              </AdminRoute>
            } />
            <Route path="/login" element={<Login />} />
            <Route path="/signup" element={<SignUp />} />
            <Route path="/account" element={
              <ProtectedRoute>
                <AccountPage />
              </ProtectedRoute>
            } />
            <Route path="/my-reservations" element={
              <ProtectedRoute>
                <MyReservationsPage />
              </ProtectedRoute>
            } />
            {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </AuthProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
