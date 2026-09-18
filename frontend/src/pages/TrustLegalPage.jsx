import React, { useState, useEffect } from 'react';
import { 
  ShieldCheck, 
  FileText, 
  Lock, 
  ArrowLeft, 
  AlertTriangle, 
  CheckCircle2, 
  EyeOff, 
  MapPin, 
  PhoneCall, 
  Users, 
  ExternalLink,
  ChevronRight
} from 'lucide-react';
import { Button } from '../components/ui/Button.jsx';
import { Badge } from '../components/ui/Badge.jsx';

export function TrustLegalPage({ initialTab = 'safety', onNavigateHome, onOpenReport }) {
  const [activeTab, setActiveTab] = useState(initialTab); // 'safety', 'terms', 'privacy'

  useEffect(() => {
    if (initialTab) {
      setActiveTab(initialTab);
    }
  }, [initialTab]);

  return (
    <div className="w-full min-h-screen bg-slate-50/50 pb-20">
      
      {/* Top Breadcrumb & Hero */}
      <div className="w-full bg-white border-b border-border/80 shadow-xs">
        <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          
          <div className="flex items-center gap-2 mb-4">
            <button
              onClick={onNavigateHome}
              className="inline-flex items-center gap-1.5 text-xs font-bold text-dark-muted hover:text-brand-600 transition-colors"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Back to Home</span>
            </button>
            <span className="text-slate-300">/</span>
            <span className="text-xs font-semibold text-slate-500 capitalize">
              {activeTab === 'safety' ? 'Safety & Trust Center' : activeTab === 'terms' ? 'Terms & Conditions' : 'Privacy Policy'}
            </span>
          </div>

          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <div className="flex items-center gap-2.5 mb-2">
                <div className="w-10 h-10 rounded-2xl bg-brand-500 text-white flex items-center justify-center shadow-soft">
                  {activeTab === 'safety' && <ShieldCheck className="w-5 h-5" />}
                  {activeTab === 'terms' && <FileText className="w-5 h-5" />}
                  {activeTab === 'privacy' && <Lock className="w-5 h-5" />}
                </div>
                <div>
                  <h1 className="text-2xl sm:text-3xl font-extrabold text-dark-text tracking-tight">
                    Trust, Safety & Legal Hub
                  </h1>
                  <p className="text-xs sm:text-sm text-dark-muted font-medium">
                    Our commitments, community standards, and real-world safety policies.
                  </p>
                </div>
              </div>
            </div>

            {onOpenReport && (
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={onOpenReport}
                  className="text-xs font-bold border-red-200 text-red-600 hover:bg-red-50"
                >
                  <AlertTriangle className="w-3.5 h-3.5 mr-1.5 text-red-500" />
                  <span>Report Suspicious Activity</span>
                </Button>
              </div>
            )}
          </div>

          {/* Tab Navigation Pill Bar */}
          <div className="flex items-center gap-2 mt-6 border-t border-slate-100 pt-5 overflow-x-auto no-scrollbar">
            <button
              onClick={() => setActiveTab('safety')}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all shrink-0 ${
                activeTab === 'safety'
                  ? 'bg-brand-500 text-white shadow-soft'
                  : 'bg-slate-100 hover:bg-slate-200 text-dark-muted hover:text-dark-text'
              }`}
            >
              <ShieldCheck className="w-4 h-4" />
              <span>Safety & Trust Center</span>
            </button>

            <button
              onClick={() => setActiveTab('terms')}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all shrink-0 ${
                activeTab === 'terms'
                  ? 'bg-brand-500 text-white shadow-soft'
                  : 'bg-slate-100 hover:bg-slate-200 text-dark-muted hover:text-dark-text'
              }`}
            >
              <FileText className="w-4 h-4" />
              <span>Terms & Conditions</span>
            </button>

            <button
              onClick={() => setActiveTab('privacy')}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all shrink-0 ${
                activeTab === 'privacy'
                  ? 'bg-brand-500 text-white shadow-soft'
                  : 'bg-slate-100 hover:bg-slate-200 text-dark-muted hover:text-dark-text'
              }`}
            >
              <Lock className="w-4 h-4" />
              <span>Privacy Policy</span>
            </button>
          </div>

        </div>
      </div>

      {/* Main Content Area */}
      <div className="w-full max-w-5xl mx-auto px-4 sm:px-6 py-10">
        
        {/* ================= TAB 1: SAFETY & TRUST CENTER ================= */}
        {activeTab === 'safety' && (
          <div className="space-y-8 animate-in fade-in duration-200 text-left">
            
            {/* Real-World Safety Rule Banner */}
            <div className="p-6 bg-gradient-to-r from-emerald-500 to-brand-600 rounded-3xl text-white shadow-card">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-2xl bg-white/20 backdrop-blur-md flex items-center justify-center shrink-0">
                  <ShieldCheck className="w-6 h-6 text-white" />
                </div>
                <div className="space-y-2">
                  <h3 className="text-lg sm:text-xl font-extrabold">The Real-World Meetup Golden Rules</h3>
                  <p className="text-xs sm:text-sm text-emerald-50 leading-relaxed max-w-3xl">
                    Connect2Go helps you find real people for offline activities — sports, study groups, runs, and coffee catchups. Your physical safety is our paramount priority. Always adhere to these golden principles before stepping out.
                  </p>
                </div>
              </div>
            </div>

            {/* 4 Core Pillars */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              
              <div className="p-5 bg-white rounded-2xl border border-border shadow-xs hover:border-brand-200 transition-colors">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-9 h-9 rounded-xl bg-brand-50 text-brand-600 flex items-center justify-center font-extrabold text-sm">
                    1
                  </div>
                  <h4 className="text-sm font-bold text-dark-text">Public & Well-Lit Venues Only</h4>
                </div>
                <p className="text-xs text-dark-muted leading-relaxed">
                  Never agree to meet a peer at private residences, isolated hotel rooms, or secluded areas. Always host and meet at established public venues: campus badminton courts, city parks, college libraries, or cafes.
                </p>
              </div>

              <div className="p-5 bg-white rounded-2xl border border-border shadow-xs hover:border-brand-200 transition-colors">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-9 h-9 rounded-xl bg-brand-50 text-brand-600 flex items-center justify-center font-extrabold text-sm">
                    2
                  </div>
                  <h4 className="text-sm font-bold text-dark-text">Inform a Friend or Family Member</h4>
                </div>
                <p className="text-xs text-dark-muted leading-relaxed">
                  Before heading out for any meetup, share your live location or send a quick text to a roommate, sibling, or close friend detailing who you are meeting, where, and what time you plan to return.
                </p>
              </div>

              <div className="p-5 bg-white rounded-2xl border border-border shadow-xs hover:border-brand-200 transition-colors">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-9 h-9 rounded-xl bg-brand-50 text-brand-600 flex items-center justify-center font-extrabold text-sm">
                    3
                  </div>
                  <h4 className="text-sm font-bold text-dark-text">Keep Chats on Platform Initially</h4>
                </div>
                <p className="text-xs text-dark-muted leading-relaxed">
                  Connect2Go offers anonymous, zero-phone-number messaging. Do not disclose personal banking details, OTPs, or home addresses to strangers before establishing verified rapport.
                </p>
              </div>

              <div className="p-5 bg-white rounded-2xl border border-border shadow-xs hover:border-brand-200 transition-colors">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-9 h-9 rounded-xl bg-brand-50 text-brand-600 flex items-center justify-center font-extrabold text-sm">
                    4
                  </div>
                  <h4 className="text-sm font-bold text-dark-text">Trust Your Instincts</h4>
                </div>
                <p className="text-xs text-dark-muted leading-relaxed">
                  If any peer pressures you, requests money, or makes you feel uncomfortable at any point, leave immediately. You have complete right to cancel participation with zero obligations.
                </p>
              </div>

            </div>

            {/* Zero Tolerance & Moderation */}
            <div className="p-6 bg-white rounded-2xl border border-border shadow-xs space-y-4">
              <div className="flex items-center gap-2">
                <Badge variant="danger" size="sm" className="font-bold">Zero Tolerance Policy</Badge>
                <span className="text-xs text-slate-400 font-semibold">• Permanent Blacklisting</span>
              </div>
              <h3 className="text-base font-extrabold text-dark-text">
                Strict Community Enforcement Against Misconduct
              </h3>
              <p className="text-xs text-dark-muted leading-relaxed">
                Connect2Go operates a zero-tolerance policy against any form of harassment, discrimination, hate speech, financial fraud, unauthorized commercial advertising, stalking, or inappropriate solicitation. Violators will face immediate account termination and permanent hardware/IP bans.
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
                <div className="p-3 bg-slate-50 rounded-xl border border-slate-100 flex items-center gap-2.5">
                  <CheckCircle2 className="w-4 h-4 text-brand-600 shrink-0" />
                  <span className="text-xs font-semibold text-dark-text">1-Click Fast Reporting</span>
                </div>
                <div className="p-3 bg-slate-50 rounded-xl border border-slate-100 flex items-center gap-2.5">
                  <CheckCircle2 className="w-4 h-4 text-brand-600 shrink-0" />
                  <span className="text-xs font-semibold text-dark-text">Anonymous Flagging</span>
                </div>
                <div className="p-3 bg-slate-50 rounded-xl border border-slate-100 flex items-center gap-2.5">
                  <CheckCircle2 className="w-4 h-4 text-brand-600 shrink-0" />
                  <span className="text-xs font-semibold text-dark-text">Active Admin Review</span>
                </div>
              </div>
            </div>

            {/* Emergency Contacts in India */}
            <div className="p-6 bg-red-50/70 rounded-2xl border border-red-200/80 space-y-3">
              <div className="flex items-center gap-2">
                <PhoneCall className="w-4 h-4 text-red-600" />
                <h4 className="text-xs font-bold text-red-900 uppercase tracking-wider">
                  Official Emergency Helplines (India)
                </h4>
              </div>
              <p className="text-xs text-red-700 leading-relaxed">
                In case of immediate physical emergency or threat, do not rely solely on in-app reporting. Contact state emergency services immediately:
              </p>
              <div className="flex flex-wrap gap-3 pt-1">
                <span className="px-3 py-1.5 bg-white rounded-lg border border-red-200 text-xs font-bold text-red-700 shadow-2xs">
                  National Emergency: 112
                </span>
                <span className="px-3 py-1.5 bg-white rounded-lg border border-red-200 text-xs font-bold text-red-700 shadow-2xs">
                  Police Assistance: 100
                </span>
                <span className="px-3 py-1.5 bg-white rounded-lg border border-red-200 text-xs font-bold text-red-700 shadow-2xs">
                  Women Helpline: 1091 / 181
                </span>
                <span className="px-3 py-1.5 bg-white rounded-lg border border-red-200 text-xs font-bold text-red-700 shadow-2xs">
                  Medical Ambulance: 108
                </span>
              </div>
            </div>

          </div>
        )}

        {/* ================= TAB 2: TERMS & CONDITIONS ================= */}
        {activeTab === 'terms' && (
          <div className="space-y-8 animate-in fade-in duration-200 text-left bg-white p-6 sm:p-10 rounded-3xl border border-border shadow-xs">
            
            <div className="border-b border-slate-100 pb-6">
              <span className="text-[11px] font-bold text-brand-600 uppercase tracking-wider">
                Legal Agreement
              </span>
              <h2 className="text-2xl font-extrabold text-dark-text mt-1">
                Terms and Conditions of Service
              </h2>
              <p className="text-xs text-slate-400 mt-1">
                Last updated: September 18, 2026 • Effective immediately for all registered and guest users.
              </p>
            </div>

            <div className="space-y-6 text-xs text-dark-muted leading-relaxed">
              
              <section className="space-y-2">
                <h3 className="text-sm font-bold text-dark-text">1. Acceptance of Terms</h3>
                <p>
                  By accessing, browsing, registering with, or utilizing the Connect2Go platform ("Platform", "we", "us", or "our"), you confirm that you have read, understood, and agree to be bound by these Terms and Conditions. If you do not agree to these terms, you must refrain from using the platform.
                </p>
              </section>

              <section className="space-y-2">
                <h3 className="text-sm font-bold text-dark-text">2. Eligibility & Account Integrity</h3>
                <p>
                  You must be at least 18 years old (or the legal age of majority in your jurisdiction) to participate in peer activities. You agree to provide accurate, truthful, and non-misleading information regarding your display name, hobbies, and profile photo. Accounts impersonating other individuals or institutions will be terminated without prior notice.
                </p>
              </section>

              <section className="space-y-2">
                <h3 className="text-sm font-bold text-dark-text">3. Nature of the Platform (Informal Activity Facilitation)</h3>
                <p>
                  Connect2Go acts solely as a peer discovery facilitator to connect individuals with shared real-world hobbies (e.g. badminton, running, chess, study groups). Connect2Go does not employ, supervise, or background-check general participants. All offline meetings, travel, equipment usage, and interactions are undertaken voluntarily and at the sole discretion and risk of the participating users.
                </p>
              </section>

              <section className="space-y-2">
                <h3 className="text-sm font-bold text-dark-text">4. Prohibited User Activities</h3>
                <p>Users agree that they will not use Connect2Go to:</p>
                <ul className="list-disc pl-5 space-y-1.5 text-slate-600">
                  <li>Post misleading or deceptive activity requests.</li>
                  <li>Solicit commercial services, multi-level marketing (MLM), or illegal financial schemes.</li>
                  <li>Harass, threaten, stalk, intimidate, or discriminate against any peer based on gender, religion, caste, nationality, or identity.</li>
                  <li>Propose illegal, physically dangerous, or hazardous gatherings.</li>
                  <li>Distribute unauthorized copyrighted media, pornography, or hateful content.</li>
                </ul>
              </section>

              <section className="space-y-2">
                <h3 className="text-sm font-bold text-dark-text">5. Limitation of Liability & Assumption of Risk</h3>
                <p>
                  To the maximum extent permitted by applicable law, Connect2Go, its creators, operators, and affiliates shall not be held liable for any direct, indirect, incidental, punitive, or consequential damages resulting from offline meetups, physical sports injuries, property damage, peer misconduct, or travel disputes occurring between users outside of the software application.
                </p>
              </section>

              <section className="space-y-2">
                <h3 className="text-sm font-bold text-dark-text">6. Account Termination & Moderation</h3>
                <p>
                  We reserve the right to review reported accounts, delete activity postings, restrict messaging capabilities, or suspend user access indefinitely at our sole discretion upon evidence of policy non-compliance.
                </p>
              </section>

              <section className="space-y-2">
                <h3 className="text-sm font-bold text-dark-text">7. Governing Law & Jurisdiction</h3>
                <p>
                  These Terms shall be construed and governed in accordance with the laws of the Republic of India. Any disputes arising hereunder shall be subject to the exclusive jurisdiction of the competent courts in Jaipur, Rajasthan, India.
                </p>
              </section>

            </div>

          </div>
        )}

        {/* ================= TAB 3: PRIVACY POLICY ================= */}
        {activeTab === 'privacy' && (
          <div className="space-y-8 animate-in fade-in duration-200 text-left bg-white p-6 sm:p-10 rounded-3xl border border-border shadow-xs">
            
            <div className="border-b border-slate-100 pb-6">
              <span className="text-[11px] font-bold text-brand-600 uppercase tracking-wider">
                Data Protection & Transparency
              </span>
              <h2 className="text-2xl font-extrabold text-dark-text mt-1">
                Privacy & Data Security Policy
              </h2>
              <p className="text-xs text-slate-400 mt-1">
                Last updated: September 18, 2026 • We respect your personal privacy and spatial integrity.
              </p>
            </div>

            <div className="space-y-6 text-xs text-dark-muted leading-relaxed">
              
              <section className="space-y-2">
                <h3 className="text-sm font-bold text-dark-text">1. Transparent Geolocation Handling</h3>
                <p>
                  Connect2Go is a location-based platform designed to discover activities nearby. Here is how your coordinates are handled:
                </p>
                <ul className="list-disc pl-5 space-y-1.5 text-slate-600">
                  <li><strong>Zero Background Tracking:</strong> We NEVER collect or track your GPS location in the background when the application is minimized or closed.</li>
                  <li><strong>Explicit Trigger Only:</strong> Your browser coordinates are queried only when you explicitly click "Detect My Live GPS" or open the interactive discovery map.</li>
                  <li><strong>Approximate Matching:</strong> In public discovery feeds, other peers see only your approximate distance in kilometers (e.g. "1.2 km away"), never your exact GPS coordinates or live address.</li>
                </ul>
              </section>

              <section className="space-y-2">
                <h3 className="text-sm font-bold text-dark-text">2. Information We Collect</h3>
                <p>
                  We collect minimal data necessary to provide seamless activity matching:
                </p>
                <ul className="list-disc pl-5 space-y-1.5 text-slate-600">
                  <li><strong>Profile Information:</strong> Name, handle, optional bio, hobby preferences (e.g. Badminton, Running, Coding), and avatar.</li>
                  <li><strong>Activity Content:</strong> Titles, descriptions, meeting time slots, and user-selected public meetup pins.</li>
                  <li><strong>In-App Chat Messages:</strong> Anonymous peer messages exchanged in activity coordination threads.</li>
                </ul>
              </section>

              <section className="space-y-2">
                <h3 className="text-sm font-bold text-dark-text">3. Anonymous Chat Security</h3>
                <p>
                  Our built-in chat system allows you to coordinate meetup details with peers without exposing your personal telephone number, email, or private social media accounts. You retain total authority over whether and when to share external contact information.
                </p>
              </section>

              <section className="space-y-2">
                <h3 className="text-sm font-bold text-dark-text">4. Third-Party Data Handlers</h3>
                <p>
                  We do not sell, rent, or monetize your personal data to advertising brokers. We partner strictly with industry-standard infrastructure providers:
                </p>
                <ul className="list-disc pl-5 space-y-1.5 text-slate-600">
                  <li><strong>Supabase:</strong> For enterprise-grade encrypted authentication and relational database storage.</li>
                  <li><strong>Cloudinary:</strong> For secure image delivery and avatar storage.</li>
                  <li><strong>OpenStreetMap / Photon:</strong> Open-source, community-governed geographic tile and geocoding services.</li>
                </ul>
              </section>

              <section className="space-y-2">
                <h3 className="text-sm font-bold text-dark-text">5. Your Data Rights & Deletion</h3>
                <p>
                  You own your data. You may at any time:
                </p>
                <ul className="list-disc pl-5 space-y-1.5 text-slate-600">
                  <li>Edit or clear your hobby tags and profile bio from the "My Profile" tab.</li>
                  <li>Delete any activity request you hosted, which immediately wipes it from active discovery.</li>
                  <li>Request complete account deletion and data scrubbing by contacting our team.</li>
                </ul>
              </section>

              <section className="space-y-2">
                <h3 className="text-sm font-bold text-dark-text">6. Contact Our Safety & Privacy Desk</h3>
                <p>
                  If you have any questions, suggestions, or concerns regarding your privacy or data usage on Connect2Go, please email us directly at: <span className="font-bold text-dark-text">support@connect2go.local</span>.
                </p>
              </section>

            </div>

          </div>
        )}

      </div>

    </div>
  );
}
