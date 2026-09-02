import { BrowserRouter, Route, Routes, useLocation } from "react-router-dom"
import Navbar from "./Components/Navbar/Navbar"
import Footer from "./Components/Footer/Footer"
import Home from "./Pages/Home/Home"
import AuthPage from "./Components/Auth/AuthPage"
import GoogleAuthCompletePage from "./Components/Auth/GoogleAuthCompletePage"
import ProtectedRoute from "./Components/Auth/ProtectedRoute"
import Entreprises from "./Pages/Entreprises/Entreprises"
import CompanyDetailsPage from "./Pages/Entreprises/CompanyDetailsPage"
import Jobs from "./Pages/Jobs/Jobs"
import Candidatures from "./Pages/Candidatures/CandidaturesPage"
import ApplicationDecisionPage from "./Pages/Candidatures/ApplicationDecisionPage"
import Dashboard from "./Pages/Dashboard/Dashboard"
import JobDetails from "./Pages/Jobs/JobDetailsPage"
import ProfilePage from "./Pages/Profile/ProfilePage"
import SettingsPage from "./Pages/Settings/SettingsPage"
import NotFoundPage from "./Pages/NotFound/NotFoundPage"
import PortfolioPage from "./Pages/Portfolio/PortfolioPage"
import RecruteurPage from "./Pages/Recruteur/RecruteurPage"
import RecruiterSolutionsPage from "./Pages/Recruteur/public/RecruiterSolutionsPage"
import RecruiterPricingPage from "./Pages/Recruteur/public/RecruiterPricingPage"
import RecruiterTestimonialsPage from "./Pages/Recruteur/public/RecruiterTestimonialsPage"
import RecruiterContactDemoPage from "./Pages/Recruteur/public/RecruiterContactDemoPage"
import CreateCompanyAccountPage from "./Pages/Recruteur/public/CreateCompanyAccountPage"
import RecruiterLoginPage from "./Pages/Recruteur/public/RecruiterLoginPage"
import RecruiterAppLayout from "./Pages/Recruteur/layouts/RecruiterAppLayout"
import RecruiterDashboardPage from "./Pages/Recruteur/app/RecruiterDashboardPage"
import RecruiterJobsPage from "./Pages/Recruteur/app/RecruiterJobsPage"
import RecruiterJobFormPage from "./Pages/Recruteur/app/RecruiterJobFormPage"
import RecruiterJobDetailsPage from "./Pages/Recruteur/app/RecruiterJobDetailsPage"
import RecruiterApplicationsPage from "./Pages/Recruteur/app/RecruiterApplicationsPage"
import RecruiterCandidateDetailsPage from "./Pages/Recruteur/app/RecruiterCandidateDetailsPage"
import RecruiterMessagesPage from "./Pages/Recruteur/app/RecruiterMessagesPage"
import RecruiterInterviewsPage from "./Pages/Recruteur/app/RecruiterInterviewsPage"
import RecruiterCompanyProfilePage from "./Pages/Recruteur/app/RecruiterCompanyProfilePage"
import RecruiterAnalyticsPage from "./Pages/Recruteur/app/RecruiterAnalyticsPage"
import RecruiterSettingsPage from "./Pages/Recruteur/app/RecruiterSettingsPage"
import AdminAppLayout from "./Pages/Console/layouts/AdminAppLayout"
import AdminDashboardPage from "./Pages/Console/app/AdminDashboardPage"
import AdminUsersPage from "./Pages/Console/app/AdminUsersPage"
import AdminCompaniesPage from "./Pages/Console/app/AdminCompaniesPage"
import AdminJobsPage from "./Pages/Console/app/AdminJobsPage"
import { AuthProvider } from "./context/AuthProvider"

function AppContent() {
  const location = useLocation();
  const isRecruiterArea = location.pathname.startsWith("/recruteur");
  const isConsoleArea = location.pathname.startsWith("/console");
  const hideChrome = isRecruiterArea || isConsoleArea;

  return (
    <>
    {!hideChrome && <Navbar />}
    <Routes>
      <Route path ="/" element={<Home />}/>
      <Route path="/auth" element={<AuthPage />} />
      <Route path="/auth/google/complete" element={<GoogleAuthCompletePage />} />
      <Route path="/jobs" element={<Jobs />} />
      <Route path="/jobs/:id" element={<JobDetails />} />
      <Route path="/entreprises" element={<Entreprises />} />
      <Route path="/entreprises/:id" element={<CompanyDetailsPage />} />
      <Route path="/portfolios" element={<PortfolioPage />} />

      <Route path="/recruteur" element={<RecruteurPage />} />
      <Route path="/recruteurs" element={<RecruteurPage />} />
      <Route path="/recruteur/solutions" element={<RecruiterSolutionsPage />} />
      <Route path="/recruteurs/solutions" element={<RecruiterSolutionsPage />} />
      <Route path="/recruteur/tarifs" element={<RecruiterPricingPage />} />
      <Route path="/recruteurs/tarifs" element={<RecruiterPricingPage />} />
      <Route path="/recruteur/temoignages" element={<RecruiterTestimonialsPage />} />
      <Route path="/recruteurs/temoignages" element={<RecruiterTestimonialsPage />} />
      <Route path="/recruteur/contact-demo" element={<RecruiterContactDemoPage />} />
      <Route path="/recruteurs/contact-demo" element={<RecruiterContactDemoPage />} />
      <Route path="/recruteur/inscription" element={<CreateCompanyAccountPage />} />
      <Route path="/recruteurs/inscription" element={<CreateCompanyAccountPage />} />
      <Route path="/recruteur/connexion" element={<RecruiterLoginPage />} />
      <Route path="/recruteurs/connexion" element={<RecruiterLoginPage />} />
      <Route
        path="/recruteur/app"
        element={
          <ProtectedRoute role="recruteur">
            <RecruiterAppLayout />
          </ProtectedRoute>
        }
      >
        <Route index element={<RecruiterDashboardPage />} />
        <Route path="offres" element={<RecruiterJobsPage />} />
        <Route path="offres/new" element={<RecruiterJobFormPage />} />
        <Route path="offres/:id" element={<RecruiterJobDetailsPage />} />
        <Route path="candidatures" element={<RecruiterApplicationsPage />} />
        <Route path="candidatures/:id" element={<RecruiterCandidateDetailsPage />} />
        <Route path="messages" element={<RecruiterMessagesPage />} />
        <Route path="entretiens" element={<RecruiterInterviewsPage />} />
        <Route path="entreprise" element={<RecruiterCompanyProfilePage />} />
        <Route path="analytics" element={<RecruiterAnalyticsPage />} />
        <Route path="parametres" element={<RecruiterSettingsPage />} />
      </Route>

      <Route
        path="/dashboard"
        element={
          <ProtectedRoute role="candidat">
            <Dashboard />
          </ProtectedRoute>
        }
      />
      <Route
        path="/candidatures"
        element={
          <ProtectedRoute role="candidat">
            <Candidatures />
          </ProtectedRoute>
        }
      />
      <Route path="/candidatures/decision/:token" element={<ApplicationDecisionPage />} />
      <Route
        path="/profil"
        element={
          <ProtectedRoute>
            <ProfilePage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/parametres"
        element={
          <ProtectedRoute>
            <SettingsPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/console/app"
        element={
          <ProtectedRoute role="admin">
            <AdminAppLayout />
          </ProtectedRoute>
        }
      >
        <Route index element={<AdminDashboardPage />} />
        <Route path="utilisateurs" element={<AdminUsersPage />} />
        <Route path="entreprises" element={<AdminCompaniesPage />} />
        <Route path="offres" element={<AdminJobsPage />} />
      </Route>

      <Route path="*" element={<NotFoundPage />} />
    </Routes>
    {!hideChrome && <Footer />}
    </>
  )
}

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <AppContent />
      </AuthProvider>
    </BrowserRouter>
  )
}

export default App
