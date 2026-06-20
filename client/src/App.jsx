import { lazy, Suspense } from "react";
import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import Layout from "./components/Layout";
import ProtectedRoute from "./components/ProtectedRoute";
import { AuthProvider } from "./context/AuthContext";
import { ThemeProvider } from "./context/ThemeContext";
import Dashboard from "./pages/Dashboard";
import Login from "./pages/Login";
import NotFound from "./pages/NotFound";
import Portfolio from "./pages/Portfolio";
import Register from "./pages/Register";
import ForgotPassword from "./pages/ForgotPassword";
import ResetPassword from "./pages/ResetPassword";
import VerifyEmail from "./pages/VerifyEmail";

const Achievements = lazy(() => import("./pages/Achievements"));
const AdminDashboard = lazy(() => import("./pages/AdminDashboard"));
const AIResumeAnalyzer = lazy(() => import("./pages/AIResumeAnalyzer"));
const Analytics = lazy(() => import("./pages/Analytics"));
const Certificates = lazy(() => import("./pages/Certificates"));
const Goals = lazy(() => import("./pages/Goals"));
const InternshipRecommendations = lazy(() => import("./pages/InternshipRecommendations"));
const PortfolioGenerator = lazy(() => import("./pages/PortfolioGenerator"));
const Profile = lazy(() => import("./pages/Profile"));
const Projects = lazy(() => import("./pages/Projects"));
const ResumeBuilder = lazy(() => import("./pages/ResumeBuilder"));
const ResumeChecklist = lazy(() => import("./pages/ResumeChecklist"));
const Roadmap = lazy(() => import("./pages/Roadmap"));
const SkillGapAnalysis = lazy(() => import("./pages/SkillGapAnalysis"));
const Skills = lazy(() => import("./pages/Skills"));

const PageLoader = () => <div className="py-10 text-sm text-zinc-400">Loading workspace...</div>;

const App = () => (
  <BrowserRouter>
    <ThemeProvider>
      <AuthProvider>
        <Routes>
        <Route path="/" element={<Navigate to="/dashboard" replace />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/reset-password" element={<ResetPassword />} />
        <Route path="/verify-email" element={<VerifyEmail />} />
        <Route path="/portfolio/:userId" element={<Portfolio />} />
        <Route path="/p/:slug" element={<Portfolio />} />
        <Route element={<ProtectedRoute />}>
          <Route element={<Layout />}>
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/ai/resume-analyzer" element={<Suspense fallback={<PageLoader />}><AIResumeAnalyzer /></Suspense>} />
            <Route path="/ai/skill-gap" element={<Suspense fallback={<PageLoader />}><SkillGapAnalysis /></Suspense>} />
            <Route path="/ai/internships" element={<Suspense fallback={<PageLoader />}><InternshipRecommendations /></Suspense>} />
            <Route path="/analytics" element={<Suspense fallback={<PageLoader />}><Analytics /></Suspense>} />
            <Route path="/portfolio-generator" element={<Suspense fallback={<PageLoader />}><PortfolioGenerator /></Suspense>} />
            <Route path="/resume-builder" element={<Suspense fallback={<PageLoader />}><ResumeBuilder /></Suspense>} />
            <Route path="/achievements" element={<Suspense fallback={<PageLoader />}><Achievements /></Suspense>} />
            <Route path="/admin" element={<Suspense fallback={<PageLoader />}><AdminDashboard /></Suspense>} />
            <Route path="/skills" element={<Suspense fallback={<PageLoader />}><Skills /></Suspense>} />
            <Route path="/projects" element={<Suspense fallback={<PageLoader />}><Projects /></Suspense>} />
            <Route path="/certificates" element={<Suspense fallback={<PageLoader />}><Certificates /></Suspense>} />
            <Route path="/goals" element={<Suspense fallback={<PageLoader />}><Goals /></Suspense>} />
            <Route path="/roadmap" element={<Suspense fallback={<PageLoader />}><Roadmap /></Suspense>} />
            <Route path="/resume" element={<Suspense fallback={<PageLoader />}><ResumeChecklist /></Suspense>} />
            <Route path="/profile" element={<Suspense fallback={<PageLoader />}><Profile /></Suspense>} />
          </Route>
        </Route>
        <Route path="*" element={<NotFound />} />
        </Routes>
      </AuthProvider>
    </ThemeProvider>
  </BrowserRouter>
);

export default App;
