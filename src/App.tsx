import { useState, useCallback } from 'react';
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AuthProvider } from "@/contexts/AuthContext";
import ProtectedRoute from "@/components/ProtectedRoute";
import SplashScreen from "@/components/SplashScreen";

// Pages
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import Privacy from "./pages/legal/Privacy";
import Support from "./pages/legal/Support";

// Customer
import Login from "./pages/customer/Login";
import CustomerHome from "./pages/customer/Home";
import Services from "./pages/customer/Services";
import Booking from "./pages/customer/Booking";
import SearchingCleaner from "./pages/customer/SearchingCleaner";
import ExpressBooking from "./pages/customer/ExpressBooking";
import ScheduleBooking from "./pages/customer/ScheduleBooking";
import BookingConfirmation from "./pages/customer/BookingConfirmation";
import ActiveBooking from "./pages/customer/ActiveBooking";
import RateService from "./pages/customer/RateService";
import MyBookings from "./pages/customer/MyBookings";
import CustomerProfile from "./pages/customer/Profile";
import Notifications from "./pages/customer/Notifications";
import Chat from "./pages/customer/Chat";
import Help from "./pages/customer/Help";
import Wallet from "./pages/customer/Wallet";
import CleanerDetail from "./pages/customer/CleanerDetail";

// Cleaner
import CleanerDashboard from "./pages/cleaner/Dashboard";
import CleanerJobs from "./pages/cleaner/Jobs";
import CleanerSchedule from "./pages/cleaner/Schedule";
import CleanerEarnings from "./pages/cleaner/Earnings";
import CleanerProfile from "./pages/cleaner/Profile";

// Enrolment
import Register from "./pages/enrol/Register";
import ApplicationStatus from "./pages/enrol/ApplicationStatus";
import Training from "./pages/enrol/Training";

// Admin
import AdminDashboard from "./pages/admin/Dashboard";
import AdminBookings from "./pages/admin/Bookings";
import AdminCustomers from "./pages/admin/Customers";
import AdminCleaners from "./pages/admin/Cleaners";
import AdminEnrolments from "./pages/admin/Enrolments";
import AdminTrainingProgress from "./pages/admin/TrainingProgress";
import AdminServices from "./pages/admin/Services";
import AdminCoupons from "./pages/admin/Coupons";
import AdminLeaves from "./pages/admin/Leaves";
import AdminReports from "./pages/admin/Reports";
import AdminOffers from "./pages/admin/Offers";
import AdminAdmins from "./pages/admin/Admins";

const queryClient = new QueryClient();

const App = () => {
  const [showSplash, setShowSplash] = useState(true);
  const handleSplashComplete = useCallback(() => {
    setShowSplash(false);
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          {showSplash && <SplashScreen onComplete={handleSplashComplete} />}
          <BrowserRouter>
            <Routes>
              {/* Public */}
              <Route path="/" element={<Index />} />
              <Route path="/login" element={<Login />} />
              <Route path="/cleaner/login" element={<Login />} />
              <Route path="/admin/login" element={<Login />} />
              <Route path="/privacy" element={<Privacy />} />
              <Route path="/support" element={<Support />} />

              {/* Customer */}
              <Route path="/home" element={<ProtectedRoute allowedRoles={['customer']}><CustomerHome /></ProtectedRoute>} />
              <Route path="/services" element={<ProtectedRoute allowedRoles={['customer']}><Services /></ProtectedRoute>} />
              <Route path="/booking" element={<ProtectedRoute allowedRoles={['customer']}><Booking /></ProtectedRoute>} />
              <Route path="/express-booking" element={<ProtectedRoute allowedRoles={['customer']}><ExpressBooking /></ProtectedRoute>} />
              <Route path="/schedule-booking" element={<ProtectedRoute allowedRoles={['customer']}><ScheduleBooking /></ProtectedRoute>} />
              <Route path="/booking-confirmation" element={<ProtectedRoute allowedRoles={['customer']}><BookingConfirmation /></ProtectedRoute>} />
              <Route path="/searching-cleaner" element={<ProtectedRoute allowedRoles={['customer']}><SearchingCleaner /></ProtectedRoute>} />
              <Route path="/active-booking" element={<ProtectedRoute allowedRoles={['customer']}><ActiveBooking /></ProtectedRoute>} />
              <Route path="/rate-service" element={<ProtectedRoute allowedRoles={['customer']}><RateService /></ProtectedRoute>} />
              <Route path="/my-bookings" element={<ProtectedRoute allowedRoles={['customer']}><MyBookings /></ProtectedRoute>} />
              <Route path="/profile" element={<ProtectedRoute allowedRoles={['customer']}><CustomerProfile /></ProtectedRoute>} />
              <Route path="/notifications" element={<ProtectedRoute allowedRoles={['customer']}><Notifications /></ProtectedRoute>} />
              <Route path="/chat" element={<ProtectedRoute allowedRoles={['customer', 'cleaner']}><Chat /></ProtectedRoute>} />
              <Route path="/help" element={<ProtectedRoute allowedRoles={['customer']}><Help /></ProtectedRoute>} />
              <Route path="/wallet" element={<ProtectedRoute allowedRoles={['customer']}><Wallet /></ProtectedRoute>} />
              <Route path="/cleaner-detail" element={<ProtectedRoute allowedRoles={['customer']}><CleanerDetail /></ProtectedRoute>} />

              {/* Cleaner */}
              <Route path="/cleaner" element={<ProtectedRoute allowedRoles={['cleaner']}><CleanerDashboard /></ProtectedRoute>} />
              <Route path="/cleaner/jobs" element={<ProtectedRoute allowedRoles={['cleaner']}><CleanerJobs /></ProtectedRoute>} />
              <Route path="/cleaner/schedule" element={<ProtectedRoute allowedRoles={['cleaner']}><CleanerSchedule /></ProtectedRoute>} />
              <Route path="/cleaner/earnings" element={<ProtectedRoute allowedRoles={['cleaner']}><CleanerEarnings /></ProtectedRoute>} />
              <Route path="/cleaner/profile" element={<ProtectedRoute allowedRoles={['cleaner']}><CleanerProfile /></ProtectedRoute>} />

              {/* Enrolment (public) */}
              <Route path="/enrol/register" element={<Register />} />
              <Route path="/enrol/status" element={<ApplicationStatus />} />
              <Route path="/enrol/training" element={<Training />} />

              {/* Admin */}
              <Route path="/admin" element={<ProtectedRoute allowedRoles={['admin']}><AdminDashboard /></ProtectedRoute>} />
              <Route path="/admin/bookings" element={<ProtectedRoute allowedRoles={['admin']}><AdminBookings /></ProtectedRoute>} />
              <Route path="/admin/customers" element={<ProtectedRoute allowedRoles={['admin']}><AdminCustomers /></ProtectedRoute>} />
              <Route path="/admin/cleaners" element={<ProtectedRoute allowedRoles={['admin']}><AdminCleaners /></ProtectedRoute>} />
              <Route path="/admin/enrolments" element={<ProtectedRoute allowedRoles={['admin']}><AdminEnrolments /></ProtectedRoute>} />
              <Route path="/admin/training" element={<ProtectedRoute allowedRoles={['admin']}><AdminTrainingProgress /></ProtectedRoute>} />
              <Route path="/admin/services" element={<ProtectedRoute allowedRoles={['admin']}><AdminServices /></ProtectedRoute>} />
              <Route path="/admin/coupons" element={<ProtectedRoute allowedRoles={['admin']}><AdminCoupons /></ProtectedRoute>} />
              <Route path="/admin/leaves" element={<ProtectedRoute allowedRoles={['admin']}><AdminLeaves /></ProtectedRoute>} />
              <Route path="/admin/reports" element={<ProtectedRoute allowedRoles={['admin']}><AdminReports /></ProtectedRoute>} />
              <Route path="/admin/offers" element={<ProtectedRoute allowedRoles={['admin']}><AdminOffers /></ProtectedRoute>} />
              <Route path="/admin/admins" element={<ProtectedRoute allowedRoles={['admin']}><AdminAdmins /></ProtectedRoute>} />

              <Route path="*" element={<NotFound />} />
            </Routes>
          </BrowserRouter>
        </TooltipProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
};

export default App;
