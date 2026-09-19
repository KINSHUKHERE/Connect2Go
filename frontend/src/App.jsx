import React, { useState, useEffect } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext.jsx';
import { GeoProvider } from './context/GeoContext.jsx';
import { ToastProvider, useToast } from './context/ToastContext.jsx';
import { Navbar } from './components/layout/Navbar.jsx';
import { BottomNavigation } from './components/layout/BottomNavigation.jsx';
import { LandingPage } from './pages/LandingPage.jsx';
import { DashboardPage } from './pages/DashboardPage.jsx';
import { MyActivitiesPage } from './pages/MyActivitiesPage.jsx';
import { MatchesPage } from './pages/MatchesPage.jsx';
import { AdminDashboardPage } from './pages/admin/AdminDashboardPage.jsx';
import { AdminSecurityGate } from './pages/admin/AdminSecurityGate.jsx';
import { TrustLegalPage } from './pages/TrustLegalPage.jsx';
import { ProfilePage } from './pages/ProfilePage.jsx';
import { SettingsPage } from './pages/SettingsPage.jsx';
import { MessagesPage } from './pages/MessagesPage.jsx';
import { AuthPage } from './pages/AuthPage.jsx';
import { ChatProvider, useChat } from './context/ChatContext.jsx';
import { CreateRequestModal } from './components/requests/CreateRequestModal.jsx';
import { ChatDrawer } from './components/chat/ChatDrawer.jsx';
import { ReportModal } from './components/safety/ReportModal.jsx';
import { Modal } from './components/ui/Modal.jsx';
import { Button } from './components/ui/Button.jsx';
import { Badge } from './components/ui/Badge.jsx';
import { Footer } from './components/layout/Footer.jsx';
import { LegalModal } from './components/safety/LegalModal.jsx';
import { LocationPickerModal } from './components/map/LocationPickerModal.jsx';
import { Sparkles, Shield, MapPin, Check } from 'lucide-react';
import { getSafeAvatar, handleAvatarError } from './utils/imageUtils.js';

function MainApp() {
  const toast = useToast();
  const { 
    user, 
    logout,
    loginAsUser, 
    loginAsAdmin, 
    authModalOpen, 
    setAuthModalOpen,
    signInWithEmail,
    signUpWithEmail,
    authLoading,
    authError,
    setAuthError
  } = useAuth();
  
  // Track URL path to separate User Panel (/) from Admin Panel (/admin)
  const [currentPath, setCurrentPath] = useState(window.location.pathname);

  // Synchronously compute initial tab from URL pathname to eliminate millisecond flash on refresh
  const getInitialTab = () => {
    if (typeof window === 'undefined') return 'home';
    const cleanPath = window.location.pathname.replace(/^\//, '');
    const validTabs = ['explore', 'my-activities', 'matches', 'messages', 'profile', 'safety', 'settings', 'terms', 'privacy', 'login', 'signup'];
    if (validTabs.includes(cleanPath)) {
      return cleanPath;
    }
    return 'home';
  };

  const [activeTab, setActiveTab] = useState(getInitialTab);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [chatPeer, setChatPeer] = useState('Rohan');
  const [comingSoonModal, setComingSoonModal] = useState({ isOpen: false, featureName: '' });
  const [reportModal, setReportModal] = useState({ isOpen: false, targetUser: '' });
  const [legalModal, setLegalModal] = useState({ isOpen: false, tab: 'terms' });
  const [isLocationModalOpen, setIsLocationModalOpen] = useState(false);

  // Auth Modal State
  const [authMode, setAuthMode] = useState('signin'); // 'signin' | 'signup'
  const [authEmail, setAuthEmail] = useState('');
  const [authPassword, setAuthPassword] = useState('');
  const [authName, setAuthName] = useState('');

  // Access central Chat Context
  const { openOrCreateConversationWithPeer } = useChat();

  const navigateTo = (path) => {
    window.history.pushState({}, '', path);
    setCurrentPath(path);
  };

  const handleSelectTab = (tab) => {
    setActiveTab(tab);
    window.scrollTo({ top: 0, behavior: 'smooth' });
    const targetPath = tab === 'home' ? '/' : `/${tab}`;
    navigateTo(targetPath);
  };

  // Listen to browser URL navigation & initial path sync
  useEffect(() => {
    const handleLocationChange = () => {
      const path = window.location.pathname;
      setCurrentPath(path);
      const cleanPath = path.replace(/^\//, '');
      const validTabs = ['explore', 'my-activities', 'matches', 'messages', 'profile', 'safety', 'settings', 'terms', 'privacy', 'login', 'signup'];
      if (validTabs.includes(cleanPath)) {
        setActiveTab(cleanPath);
      } else if (path === '/' || cleanPath === '') {
        setActiveTab('home');
      }
    };
    window.addEventListener('popstate', handleLocationChange);
    handleLocationChange();
    return () => window.removeEventListener('popstate', handleLocationChange);
  }, []);

  // Dynamic Browser Document Title on Every Page
  useEffect(() => {
    if (currentPath.startsWith('/admin')) {
      document.title = 'Admin Operations Hub — Connect2Go';
      return;
    }

    const titleMap = {
      'home': 'Connect2Go — Discover Nearby Activities & Socialize',
      'explore': 'Explore Activities — Connect2Go',
      'my-activities': 'My Activities & Hosted Events — Connect2Go',
      'matches': 'Matched Peers & Activity Partners — Connect2Go',
      'messages': 'Messages & Live Chat — Connect2Go',
      'profile': 'My Profile — Connect2Go',
      'safety': 'Safety & Trust Center — Connect2Go',
      'settings': 'Settings & Privacy Hub — Connect2Go',
      'terms': 'Terms & Conditions — Connect2Go',
      'privacy': 'Privacy Policy — Connect2Go',
      'login': 'Sign In — Connect2Go',
      'signup': 'Create Account — Connect2Go',
    };

    document.title = titleMap[activeTab] || 'Connect2Go — Live Activity Partner Platform';
  }, [activeTab, currentPath]);

  const handleOpenComingSoon = (featureName) => {
    setComingSoonModal({ isOpen: true, featureName });
  };

  const handleOpenReport = (targetName) => {
    setReportModal({ isOpen: true, targetUser: targetName });
  };

  const handleOpenLegal = (tab = 'terms') => {
    handleSelectTab(tab);
  };

  const handleOpenCreate = () => {
    if (!user) {
      toast.warning('Please sign in to host an activity!');
      handleSelectTab('login');
      return;
    }
    setIsCreateModalOpen(true);
  };

  const handleJoinActivity = (activity) => {
    if (!user) {
      toast.warning('Please sign in to join activities and chat with partners!');
      handleSelectTab('login');
      return;
    }
    const peerData = activity?.creator || (activity?.name ? activity : {
      name: activity?.creator_name || 'Partner',
      avatar: activity?.creator_avatar,
      title: activity?.title,
      category: activity?.category,
    });
    setChatPeer(peerData);
    openOrCreateConversationWithPeer(peerData);
    handleSelectTab('messages');
  };

  const isAuthTab = activeTab === 'login' || activeTab === 'signup';

  // ==========================================
  // RENDER SEPARATE ADMIN PANEL AT /admin (PROTECTED)
  // ==========================================
  if (currentPath.startsWith('/admin')) {
    const isUserAdmin = Boolean(
      user && (
        user.isAdmin === true ||
        user.role === 'admin' ||
        (user.email && user.email.toLowerCase() === 'herekinshuk@gmail.com')
      )
    );

    // 1. Unauthenticated Guest -> Block with Security Gate
    if (!user) {
      return (
        <AdminSecurityGate
          reason="unauthenticated"
          onSignInAdmin={() => {
            handleSelectTab('login');
            toast.info('Please sign in with administrator credentials (herekinshuk@gmail.com).');
          }}
          onBackToHome={() => navigateTo('/')}
        />
      );
    }

    // 2. Authenticated Normal Member (Not Admin) -> 403 Access Denied Gate
    if (!isUserAdmin) {
      return (
        <AdminSecurityGate
          reason="unauthorized"
          user={user}
          onSignOut={async () => {
            await logout();
            handleSelectTab('login');
            toast.info('Signed out. Please sign in with administrator credentials.');
          }}
          onBackToHome={() => navigateTo('/')}
        />
      );
    }

    // 3. Verified Administrator -> Render Admin Operations Hub
    return (
      <AdminDashboardPage
        onBackToUserPanel={() => navigateTo('/')}
        onComingSoon={handleOpenComingSoon}
      />
    );
  }

  // ==========================================
  // RENDER USER PANEL AT /
  // ==========================================
  return (
    <div className="min-h-screen bg-canvas text-dark-text flex flex-col selection:bg-brand-100 selection:text-brand-900">
      
      {/* Top Navigation - Hidden completely on Login & Sign Up */}
      {!isAuthTab && (
        <Navbar
          activeTab={activeTab}
          setActiveTab={handleSelectTab}
          onNavigate={navigateTo}
          onOpenAuth={() => handleSelectTab('login')}
          onOpenCreate={handleOpenCreate}
          onOpenChat={() => {
            if (!user) {
              toast.warning('Please sign in to access messages!');
              handleSelectTab('login');
              return;
            }
            handleSelectTab('messages');
          }}
          onOpenLocationPicker={() => setIsLocationModalOpen(true)}
          onOpenSettings={() => handleSelectTab('settings')}
          onComingSoon={handleOpenComingSoon}
        />
      )}

      {/* Main Full-Width Content Container */}
      <main className={`flex-1 w-full ${isAuthTab ? 'p-0' : 'px-4 sm:px-6 lg:px-10 py-6'}`}>
          {activeTab === 'home' && (
            <LandingPage
              onGetStarted={() => handleSelectTab('explore')}
              onExplore={() => handleSelectTab('explore')}
              onOpenMessages={() => handleSelectTab('messages')}
              onComingSoon={handleOpenComingSoon}
            />
          )}

          {activeTab === 'explore' && (
            <DashboardPage
              onOpenCreate={handleOpenCreate}
              onJoinActivity={handleJoinActivity}
              onOpenLocationPicker={() => setIsLocationModalOpen(true)}
              onComingSoon={handleOpenComingSoon}
            />
          )}

          {activeTab === 'my-activities' && (
            <MyActivitiesPage
              onOpenCreate={handleOpenCreate}
              onOpenChat={handleJoinActivity}
              onComingSoon={handleOpenComingSoon}
            />
          )}

          {activeTab === 'matches' && (
            <MatchesPage
              onJoinChat={handleJoinActivity}
              onOpenReport={handleOpenReport}
              onComingSoon={handleOpenComingSoon}
            />
          )}

          {/* Dedicated Full Page: Messages & Live Chat */}
          {activeTab === 'messages' && (
            <MessagesPage
              onNavigate={navigateTo}
              onOpenSafety={() => handleSelectTab('safety')}
            />
          )}

          {/* Dedicated Full Page: My Profile */}
          {activeTab === 'profile' && (
            <ProfilePage
              onNavigate={navigateTo}
              onOpenSettings={() => handleSelectTab('settings')}
              onOpenSafety={() => handleSelectTab('safety')}
              onComingSoon={handleOpenComingSoon}
            />
          )}

          {/* Dedicated Full Page: Safety & Trust Center, Terms & Privacy */}
          {(activeTab === 'safety' || activeTab === 'terms' || activeTab === 'privacy') && (
            <TrustLegalPage
              initialTab={activeTab}
              onNavigateHome={() => handleSelectTab('home')}
              onOpenReport={() => handleOpenReport('General Member')}
            />
          )}

          {/* Dedicated Full Page: Settings & Privacy Hub */}
          {activeTab === 'settings' && (
            <SettingsPage
              onNavigate={navigateTo}
              onSelectTab={handleSelectTab}
              onOpenSafety={() => handleSelectTab('safety')}
              onOpenAuth={() => handleSelectTab('login')}
            />
          )}

          {/* Dedicated Full Page: Authentication (Sign In & Sign Up) */}
          {(activeTab === 'login' || activeTab === 'signup') && (
            <AuthPage
              mode={activeTab === 'signup' ? 'signup' : 'signin'}
              onNavigate={(dest) => {
                if (dest === 'home') handleSelectTab('home');
                else if (dest === 'admin') navigateTo('/admin');
                else handleSelectTab(dest);
              }}
            />
          )}

        </main>

      {/* Footer - Only rendered on the Home page */}
      {activeTab === 'home' && (
        <Footer
          onNavigate={navigateTo}
          onSelectTab={handleSelectTab}
          onOpenCreate={handleOpenCreate}
          onOpenTerms={() => handleOpenLegal('terms')}
          onOpenPrivacy={() => handleOpenLegal('privacy')}
          onComingSoon={handleOpenComingSoon}
        />
      )}

      {/* Mobile Bottom Navigation - Hidden on Login & Sign Up */}
      {!isAuthTab && (
        <BottomNavigation
          currentTab={activeTab}
          setCurrentTab={handleSelectTab}
          onOpenCreate={handleOpenCreate}
          onOpenChat={() => {
            if (!user) {
              toast.warning('Please sign in to access messages!');
              handleSelectTab('login');
              return;
            }
            handleSelectTab('messages');
          }}
        />
      )}

      {/* Create Activity Modal */}
      <CreateRequestModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onCreated={() => setActiveTab('explore')}
      />

      {/* Anonymous Real-Time Chat Drawer with Dual Reveal Handshake */}
      <ChatDrawer
        isOpen={isChatOpen}
        onClose={() => setIsChatOpen(false)}
        peer={chatPeer}
        peerName={typeof chatPeer === 'string' ? chatPeer : chatPeer?.name || 'Rohan'}
        onComingSoon={handleOpenComingSoon}
      />

      {/* Safety Report Modal */}
      <ReportModal
        isOpen={reportModal.isOpen}
        onClose={() => setReportModal({ isOpen: false, targetUser: '' })}
        targetUser={reportModal.targetUser}
      />

      {/* Terms & Conditions / Privacy Policy Legal Modal */}
      <LegalModal
        isOpen={legalModal.isOpen}
        onClose={() => setLegalModal({ isOpen: false, tab: 'terms' })}
        initialTab={legalModal.tab}
      />

      {/* Discovery Location & Live GPS Picker Modal (All India) */}
      <LocationPickerModal
        isOpen={isLocationModalOpen}
        onClose={() => setIsLocationModalOpen(false)}
      />

      {/* Coming Soon Notice Modal */}
      <Modal
        isOpen={comingSoonModal.isOpen}
        onClose={() => setComingSoonModal({ isOpen: false, featureName: '' })}
        title="Coming Soon"
        subtitle={comingSoonModal.featureName}
        maxWidth="max-w-md"
      >
        <div className="space-y-4 py-3 text-left">
          <div className="p-4 bg-brand-50/80 border border-brand-200/70 rounded-xl space-y-2">
            <div className="flex items-center gap-2 text-xs font-bold text-brand-900">
              <Sparkles className="w-4 h-4 text-brand-600" />
              <span>Planned for Future Release</span>
            </div>
            <p className="text-xs text-brand-800 leading-relaxed">
              This feature is planned for a future update. The core activity discovery, creation, and chat experiences are live right now!
            </p>
          </div>
          <Button
            variant="primary"
            onClick={() => setComingSoonModal({ isOpen: false, featureName: '' })}
            className="w-full font-bold text-xs"
          >
            Got It
          </Button>
        </div>
      </Modal>

      {/* Authentication Modal (Sign In / Sign Up) */}
      <Modal
        isOpen={authModalOpen}
        onClose={() => {
          setAuthModalOpen(false);
          setAuthError(null);
        }}
        title={authMode === 'signin' ? "Welcome Back to Connect2Go" : "Join Connect2Go"}
        subtitle={authMode === 'signin' ? "Sign in to connect with peers nearby." : "Create your account and discover active partners."}
        maxWidth="max-w-sm"
      >
        <div className="space-y-4 py-2 text-left">
          
          {/* Mode Switcher Tabs */}
          <div className="flex bg-slate-100 p-1 rounded-xl">
            <button
              onClick={() => { setAuthMode('signin'); setAuthError(null); }}
              className={`flex-1 py-1.5 text-xs font-bold rounded-lg transition-all ${
                authMode === 'signin' ? 'bg-white text-dark-text shadow-xs' : 'text-dark-muted hover:text-dark-text'
              }`}
            >
              Sign In
            </button>
            <button
              onClick={() => { setAuthMode('signup'); setAuthError(null); }}
              className={`flex-1 py-1.5 text-xs font-bold rounded-lg transition-all ${
                authMode === 'signup' ? 'bg-white text-dark-text shadow-xs' : 'text-dark-muted hover:text-dark-text'
              }`}
            >
              Create Account
            </button>
          </div>

          {/* Error Message */}
          {authError && (
            <div className="p-2.5 bg-red-50 border border-red-200 text-red-700 text-xs rounded-lg">
              {authError}
            </div>
          )}

          {/* Email / Password Form */}
          <form
            onSubmit={async (e) => {
              e.preventDefault();
              if (authMode === 'signin') {
                await signInWithEmail(authEmail, authPassword);
              } else {
                await signUpWithEmail(authEmail, authPassword, authName);
              }
            }}
            className="space-y-3"
          >
            {authMode === 'signup' && (
              <div>
                <label className="text-[11px] font-bold text-dark-muted block mb-1">Your Full Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Kinshuk Khandelwal"
                  value={authName}
                  onChange={(e) => setAuthName(e.target.value)}
                  className="w-full h-10 px-3 bg-slate-50 border border-border rounded-xl text-xs text-dark-text focus:outline-none focus:border-brand-500 focus:ring-1 focus:ring-brand-500"
                />
              </div>
            )}

            <div>
              <label className="text-[11px] font-bold text-dark-muted block mb-1">Email Address</label>
              <input
                type="email"
                required
                placeholder="you@example.com"
                value={authEmail}
                onChange={(e) => setAuthEmail(e.target.value)}
                className="w-full h-10 px-3 bg-slate-50 border border-border rounded-xl text-xs text-dark-text focus:outline-none focus:border-brand-500 focus:ring-1 focus:ring-brand-500"
              />
            </div>

            <div>
              <label className="text-[11px] font-bold text-dark-muted block mb-1">Password</label>
              <input
                type="password"
                required
                placeholder="••••••••"
                value={authPassword}
                onChange={(e) => setAuthPassword(e.target.value)}
                className="w-full h-10 px-3 bg-slate-50 border border-border rounded-xl text-xs text-dark-text focus:outline-none focus:border-brand-500 focus:ring-1 focus:ring-brand-500"
              />
            </div>

            <Button
              type="submit"
              variant="primary"
              disabled={authLoading}
              className="w-full text-xs font-bold h-10"
            >
              {authLoading ? 'Authenticating...' : authMode === 'signin' ? 'Sign In' : 'Create Account'}
            </Button>
          </form>

          <div className="flex items-center my-2">
            <div className="flex-1 border-t border-border"></div>
            <span className="px-3 text-[10px] uppercase font-bold text-dark-faint tracking-wider">or instant demo</span>
            <div className="flex-1 border-t border-border"></div>
          </div>

          <div className="space-y-2">
            <Button
              variant="outline"
              onClick={loginAsUser}
              className="w-full text-xs font-bold border-brand-200 text-brand-700 hover:bg-brand-50"
            >
              Quick Test as Demo User
            </Button>
            <Button
              variant="outline"
              onClick={loginAsAdmin}
              className="w-full text-xs font-semibold text-slate-700 hover:bg-slate-50"
            >
              Quick Test as Administrator (Kinshuk Khandelwal)
            </Button>
          </div>

        </div>
      </Modal>

    </div>
  );
}

export default function App() {
  return (
    <ToastProvider>
      <AuthProvider>
        <GeoProvider>
          <ChatProvider>
            <MainApp />
          </ChatProvider>
        </GeoProvider>
      </AuthProvider>
    </ToastProvider>
  );
}
