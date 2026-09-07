import { useEffect, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { Toaster } from 'sonner';

// Contexts
import { AuthProvider, useAuthContext } from './contexts/AuthContext';

// Components
import { Sidebar } from './components/SidebarLaali';
import { TopBar } from './components/TopBar';
import { ErrorBoundary } from './components/ErrorBoundary';
import { LaaliLogoAnimated } from './components/LaaliLogo';

// Pages
import { AuthPage } from './pages/AuthPageLaali';
import { DashboardPage } from './pages/DashboardNew';
import { OnboardingPage } from './pages/OnboardingPage';
import { VoiceAgentsPage } from './pages/VoiceAgentsPage';
import { CallAnalyticsPage } from './pages/CallAnalyticsPage';
import DataConnectorsPage from './pages/DataConnectorsPage';
import BillingPage from './pages/BillingPageNew';
import { SettingsPage } from './pages/SettingsNew';
import { VoicePage } from './pages/VoicePage';
import { RAGPage } from './pages/RAGPage';
import { AdminDashboardPage, ADMIN_EMAIL } from './pages/AdminDashboardPage';
import { LaaliChatPage } from './pages/LaaliChatPage';
import PhoneNumbersPage from './pages/PhoneNumbersPage';

// Store
import { useStore } from './store';

// Page configuration - Updated for LAALI
const PAGES: Record<string, { title: string; description: string }> = {
  dashboard:    { title: 'Dashboard',       description: 'Your LAALI voice AI overview' },
  onboarding:   { title: 'Get Started',     description: 'Connect. Choose. Deploy. — 3 minutes' },
  agents:       { title: 'Voice Agents',    description: 'Manage your AI voice agents' },
  phones:       { title: 'Phone Numbers',   description: 'Buy and manage phone numbers' },
  analytics:    { title: 'Call Analytics',  description: 'Insights and performance metrics' },
  connectors:   { title: 'Data Sources',    description: 'Connect your data for voice AI' },
  laali:        { title: 'LAALI Chat',      description: 'Ask questions about LAALI AI platform' },
  billing:      { title: 'Billing & Usage', description: 'Plans, usage, and invoices' },
  settings:     { title: 'Settings',        description: 'Account and organization settings' },
  voice:        { title: 'Voice Console',   description: 'Real-time voice testing' },
  rag:          { title: 'RAG Engine',      description: 'Retrieval augmented generation' },
  admin:        { title: 'Admin Dashboard', description: 'LAALI Platform Management' },
};

// Protected App Content
function AppContent() {
  const { user, profile, initialized } = useAuthContext();
  const { activePage, setActivePage } = useStore();
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  // DEV MODE: Allow ?dev=true to bypass auth for UI testing
  const isDev = new URLSearchParams(window.location.search).get('dev') === 'true';

  // Check if user needs onboarding
  const needsOnboarding = profile ? !profile.onboarding_completed : false;

  // Redirect to onboarding if needed
  useEffect(() => {
    if (needsOnboarding && activePage !== 'onboarding' && !isDev) {
      setActivePage('onboarding');
    }
  }, [needsOnboarding, activePage, setActivePage, isDev]);

  // Show auth page if not logged in (no loading screen) - bypass if dev mode
  if (!isDev && (!initialized || !user)) {
    return <AuthPage />;
  }

  // Get current page info
  const pageInfo = PAGES[activePage] || PAGES.dashboard;

  return (
    <div className="flex min-h-screen bg-surface-900 bg-grid-pattern">
      {/* Sidebar */}
      <Sidebar 
        collapsed={sidebarCollapsed} 
        onToggle={() => setSidebarCollapsed(!sidebarCollapsed)}
        needsOnboarding={needsOnboarding}
      />

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top Bar */}
        <TopBar 
          title={pageInfo.title}
          description={pageInfo.description}
        />

        {/* Page Content */}
        <main className="flex-1 p-6 overflow-auto">
          <AnimatePresence mode="wait">
            <motion.div
              key={activePage}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.2 }}
            >
              {activePage === 'dashboard' && <DashboardPage />}
              {activePage === 'onboarding' && <OnboardingPage />}
              {activePage === 'agents' && <VoiceAgentsPage />}
              {activePage === 'phones' && <PhoneNumbersPage />}
              {activePage === 'analytics' && <CallAnalyticsPage />}
              {activePage === 'connectors' && <DataConnectorsPage />}
              {activePage === 'laali' && <LaaliChatPage />}
              {activePage === 'billing' && <BillingPage />}
              {activePage === 'settings' && <SettingsPage />}
              {activePage === 'voice' && <VoicePage />}
              {activePage === 'rag' && <RAGPage />}
              {activePage === 'admin' && profile?.email === ADMIN_EMAIL && <AdminDashboardPage />}
            </motion.div>
          </AnimatePresence>
        </main>
      </div>

      {/* Toast Notifications - LAALI themed */}
      <Toaster
        theme="dark"
        position="bottom-right"
        toastOptions={{
          style: {
            background: '#1a1a2e',
            border: '1px solid rgba(255, 107, 107, 0.1)',
            color: '#e2e8f0',
          },
          className: 'shadow-xl',
        }}
      />
    </div>
  );
}

// Main App with Provider
export default function App() {
  return (
    <ErrorBoundary>
      <AuthProvider>
        <AppContent />
      </AuthProvider>
    </ErrorBoundary>
  );
}
