import React, { useState, useEffect } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext.jsx';
import { GeoProvider } from './context/GeoContext.jsx';
import { ToastProvider } from './context/ToastContext.jsx';
import { Navbar } from './components/layout/Navbar.jsx';
import { BottomNavigation } from './components/layout/BottomNavigation.jsx';
import { LandingPage } from './pages/LandingPage.jsx';
import { DashboardPage } from './pages/DashboardPage.jsx';
import { MyActivitiesPage } from './pages/MyActivitiesPage.jsx';
import { MatchesPage } from './pages/MatchesPage.jsx';
import { AdminDashboardPage } from './pages/admin/AdminDashboardPage.jsx';
import { TrustLegalPage } from './pages/TrustLegalPage.jsx';
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
  const { 
    user, 
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
  const [activeTab, setActiveTab] = useState('home'); // 'home', 'explore', 'my-activities', 'matches', 'profile', 'safety'
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

  // Listen to browser URL navigation
  useEffect(() => {
    const handleLocationChange = () => {
      setCurrentPath(window.location.pathname);
    };
    window.addEventListener('popstate', handleLocationChange);
    return () => window.removeEventListener('popstate', handleLocationChange);
  }, []);

  const navigateTo = (path) => {
    window.history.pushState({}, '', path);
    setCurrentPath(path);
  };

  const handleOpenComingSoon = (featureName) => {
    setComingSoonModal({ isOpen: true, featureName });
  };

  const handleOpenReport = (targetName) => {
    setReportModal({ isOpen: true, targetUser: targetName });
  };

  const handleOpenLegal = (tab = 'terms') => {
    setActiveTab(tab);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleJoinActivity = (activity) => {
    setChatPeer(activity.creator?.name || activity.creator_name || 'Partner');
    setIsChatOpen(true);
  };

  // ==========================================
  // RENDER SEPARATE ADMIN PANEL AT /admin
  // ==========================================
  if (currentPath.startsWith('/admin')) {
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
      
      {/* Top Navigation */}
      <Navbar
        activeTab={activeTab}
        setActiveTab={(tab) => {
          setActiveTab(tab);
          if (tab === 'home') navigateTo('/');
        }}
        onNavigate={navigateTo}
        onOpenAuth={() => setAuthModalOpen(true)}
        onOpenCreate={() => setIsCreateModalOpen(true)}
        onOpenChat={() => setIsChatOpen(true)}
        onOpenLocationPicker={() => setIsLocationModalOpen(true)}
        onComingSoon={handleOpenComingSoon}
      />

      {/* Main Full-Width Content Container */}
      <main className="flex-1 w-full px-4 sm:px-6 lg:px-10 py-6">
          {activeTab === 'home' && (
            <LandingPage
              onGetStarted={() => setActiveTab('explore')}
              onExplore={() => setActiveTab('explore')}
              onComingSoon={handleOpenComingSoon}
            />
          )}

          {activeTab === 'explore' && (
            <DashboardPage
              onOpenCreate={() => setIsCreateModalOpen(true)}
              onJoinActivity={handleJoinActivity}
              onOpenLocationPicker={() => setIsLocationModalOpen(true)}
              onComingSoon={handleOpenComingSoon}
            />
          )}

          {activeTab === 'my-activities' && (
            <MyActivitiesPage
              onOpenCreate={() => setIsCreateModalOpen(true)}
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

          {/* User Profile View */}
          {activeTab === 'profile' && user && (
            <div className="bg-white rounded-2xl border border-border/80 shadow-soft p-6 sm:p-8 text-left space-y-6 max-w-2xl mx-auto">
              <div className="flex items-center gap-4 pb-6 border-b border-border/70">
                <img
                  src={getSafeAvatar(user.name, user.avatar)}
                  alt={user.name}
                  onError={(e) => handleAvatarError(e, user.name)}
                  className="w-20 h-20 rounded-full object-cover ring-4 ring-brand-100 bg-slate-100"
                />
                <div>
                  <h2 className="text-xl font-bold text-dark-text">{user.name}</h2>
                  <p className="text-xs text-brand-600 font-semibold">@{user.username || 'user'}</p>
                  <p className="text-xs text-dark-muted flex items-center gap-1 mt-1">
                    <MapPin className="w-3.5 h-3.5" />
                    {user.location || 'Jaipur, Rajasthan'}
                  </p>
                </div>
              </div>

              {/* Stats Row */}
              <div className="grid grid-cols-3 gap-4 py-2 bg-slate-50 rounded-xl p-3 text-center">
                <div>
                  <div className="text-lg font-bold text-dark-text">{user.stats?.activities || 12}</div>
                  <div className="text-[11px] text-dark-faint">Activities</div>
                </div>
                <div>
                  <div className="text-lg font-bold text-dark-text">{user.stats?.matches || 8}</div>
                  <div className="text-[11px] text-dark-faint">Matches</div>
                </div>
                <div>
                  <div className="text-lg font-bold text-dark-text">{user.stats?.connections || 24}</div>
                  <div className="text-[11px] text-dark-faint">Connections</div>
                </div>
              </div>

              {/* Bio & Interests */}
              <div className="space-y-3">
                <h4 className="text-xs font-bold text-dark-muted tracking-wider uppercase">About</h4>
                <p className="text-xs sm:text-sm text-dark-text leading-relaxed">
                  {user.bio || 'Ready to explore activities nearby!'}
                </p>
                
                <h4 className="text-xs font-bold text-dark-muted tracking-wider uppercase pt-2">Hobby & Activity Interests</h4>
                <div className="flex flex-wrap gap-1.5">
                  {(user.interests || ['Badminton', 'Running', 'Gaming', 'Music']).map((interest) => (
                    <Badge key={interest} variant="default" className="text-xs">
                      {interest}
                    </Badge>
                  ))}
                </div>
              </div>

              <div className="pt-4 flex gap-3">
                <Button
                  variant="primary"
                  size="sm"
                  onClick={() => handleOpenComingSoon('Edit Profile & Upload Cloudinary Photo')}
                  className="font-bold text-xs"
                >
                  Edit Profile
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleOpenComingSoon('Settings & Privacy Controls')}
                  className="text-xs"
                >
                  Privacy Settings
                </Button>
              </div>
            </div>
          )}

          {/* Dedicated Full Page for Safety & Trust Center, Terms & Conditions, Privacy Policy */}
          {(activeTab === 'safety' || activeTab === 'terms' || activeTab === 'privacy') && (
            <TrustLegalPage
              initialTab={activeTab}
              onNavigateHome={() => {
                setActiveTab('home');
                navigateTo('/');
              }}
              onOpenReport={() => handleOpenReport('General Member')}
            />
          )}

        </main>

      {/* Footer - Only rendered on the Home page */}
      {activeTab === 'home' && (
        <Footer
          onNavigate={navigateTo}
          onSelectTab={(tab) => {
            setActiveTab(tab);
            if (tab === 'home') navigateTo('/');
          }}
          onOpenCreate={() => setIsCreateModalOpen(true)}
          onOpenTerms={() => handleOpenLegal('terms')}
          onOpenPrivacy={() => handleOpenLegal('privacy')}
          onComingSoon={handleOpenComingSoon}
        />
      )}

      {/* Mobile Bottom Navigation */}
      <BottomNavigation
        currentTab={activeTab}
        setCurrentTab={setActiveTab}
        onOpenCreate={() => setIsCreateModalOpen(true)}
        onOpenChat={() => setIsChatOpen(true)}
      />

      {/* Create Activity Modal */}
      <CreateRequestModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onCreated={() => setActiveTab('explore')}
      />

      {/* Anonymous Real-Time Chat Drawer */}
      <ChatDrawer
        isOpen={isChatOpen}
        onClose={() => setIsChatOpen(false)}
        peerName={chatPeer}
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
              Quick Test as Administrator
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
          <MainApp />
        </GeoProvider>
      </AuthProvider>
    </ToastProvider>
  );
}
