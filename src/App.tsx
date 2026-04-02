import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AuthProvider } from "@/contexts/AuthContext";

// Pages
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";

// Customer
import Login from "./pages/customer/Login";
import CustomerHome from "./pages/customer/Home";
import Services from "./pages/customer/Services";
import Booking from "./pages/customer/Booking";
import BookingConfirmation from "./pages/customer/BookingConfirmation";
import ActiveBooking from "./pages/customer/ActiveBooking";
import RateService from "./pages/customer/RateService";
import MyBookings from "./pages/customer/MyBookings";
import CustomerProfile from "./pages/customer/Profile";
import Notifications from "./pages/customer/Notifications";

// Cleaner
import CleanerDashboard from "./pages/cleaner/Dashboard";
import BookingDetail from "./pages/cleaner/BookingDetail";
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
import AdminReports from "./pages/admin/Reports";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            {/* Splash */}
            <Route path="/" element={<Index />} />
            <Route path="/login" element={<Login />} />

            {/* Customer */}
            <Route path="/home" element={<CustomerHome />} />
            <Route path="/services" element={<Services />} />
            <Route path="/booking" element={<Booking />} />
            <Route path="/booking-confirmation" element={<BookingConfirmation />} />
            <Route path="/active-booking" element={<ActiveBooking />} />
            <Route path="/rate-service" element={<RateService />} />
            <Route path="/my-bookings" element={<MyBookings />} />
            <Route path="/profile" element={<CustomerProfile />} />
            <Route path="/notifications" element={<Notifications />} />

            {/* Cleaner */}
            <Route path="/cleaner" element={<CleanerDashboard />} />
            <Route path="/cleaner/bookings" element={<BookingDetail />} />
            <Route path="/cleaner/earnings" element={<CleanerEarnings />} />
            <Route path="/cleaner/profile" element={<CleanerProfile />} />

            {/* Enrolment */}
            <Route path="/enrol/register" element={<Register />} />
            <Route path="/enrol/status" element={<ApplicationStatus />} />
            <Route path="/enrol/training" element={<Training />} />

            {/* Admin */}
            <Route path="/admin" element={<AdminDashboard />} />
            <Route path="/admin/bookings" element={<AdminBookings />} />
            <Route path="/admin/customers" element={<AdminCustomers />} />
            <Route path="/admin/cleaners" element={<AdminCleaners />} />
            <Route path="/admin/enrolments" element={<AdminEnrolments />} />
            <Route path="/admin/training" element={<AdminTrainingProgress />} />
            <Route path="/admin/services" element={<AdminServices />} />
            <Route path="/admin/coupons" element={<AdminCoupons />} />
            <Route path="/admin/reports" element={<AdminReports />} />

            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
