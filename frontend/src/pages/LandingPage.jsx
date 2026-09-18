import React from 'react';
import { 
  ArrowRight, 
  Compass, 
  Shield, 
  Users, 
  Sparkles, 
  MapPin, 
  CheckCircle2, 
  Activity, 
  MessageSquare, 
  Lock,
  PlusCircle
} from 'lucide-react';
import { Button } from '../components/ui/Button.jsx';
import { Badge } from '../components/ui/Badge.jsx';
import { handleImageError } from '../utils/imageUtils.js';

export function LandingPage({ onGetStarted, onExplore, onComingSoon }) {
  const popularCategories = [
    { label: 'Badminton', icon: '🏸', count: '14 nearby', color: 'bg-emerald-50 text-emerald-700 border-emerald-200' },
    { label: 'Morning Run', icon: '🏃', count: '22 nearby', color: 'bg-blue-50 text-blue-700 border-blue-200' },
    { label: 'Study & Coffee', icon: '☕', count: '18 nearby', color: 'bg-amber-50 text-amber-700 border-amber-200' },
    { label: 'Gaming & Chess', icon: '♟️', count: '9 nearby', color: 'bg-purple-50 text-purple-700 border-purple-200' },
    { label: 'Gym Workout', icon: '💪', count: '31 nearby', color: 'bg-rose-50 text-rose-700 border-rose-200' },
    { label: 'Cycling Treks', icon: '🚴', count: '12 nearby', color: 'bg-teal-50 text-teal-700 border-teal-200' },
  ];

  const steps = [
    {
      num: '01',
      title: 'Discover Nearby',
      desc: 'Set your radius from 1 to 20 km. Browse real-world activities hosted by verified campus & neighborhood peers.',
      icon: MapPin,
      badge: 'Hyper-Local'
    },
    {
      num: '02',
      title: 'Chat Anonymously',
      desc: 'Connect under a fun pseudonym first. Discuss timing, equipment, and plans without exposing private phone numbers.',
      icon: MessageSquare,
      badge: 'Privacy-First'
    },
    {
      num: '03',
      title: 'Meet in the Real World',
      desc: 'Step out, meet at public courts, parks, or study spots. Have fun, make memories, and expand your physical circle.',
      icon: Users,
      badge: 'Zero Doomscroll'
    }
  ];

  return (
    <div className="w-full space-y-16 sm:space-y-24 pb-12">
      
      {/* Hero Section - Full Width Canvas */}
      <section className="relative pt-6 sm:pt-14 pb-12 sm:pb-20 overflow-hidden bg-gradient-to-b from-brand-50/50 via-white to-canvas border-b border-border/60">
        <div className="w-full max-w-[1700px] mx-auto px-4 sm:px-8 lg:px-12">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-12 items-center">
            
            {/* Left Column: Headlines & Call to Actions */}
            <div className="lg:col-span-6 space-y-6 text-left">
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-brand-50 border border-brand-200/80 text-brand-800 text-xs font-bold tracking-wide shadow-2xs">
                <span className="w-2 h-2 rounded-full bg-brand-500 animate-pulse"></span>
                <span>PEOPLE NEARBY • ACTIVITIES TOGETHER</span>
              </div>

              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-dark-text tracking-tight leading-[1.14]">
                Real People. <br />
                Real Activities. <br />
                <span className="text-brand-500 underline decoration-brand-200 decoration-wavy underline-offset-8">
                  Near You.
                </span>
              </h1>

              <p className="text-base sm:text-lg text-dark-muted max-w-xl leading-relaxed">
                Connect2Go helps you find active companions nearby for badminton, running, study sessions, gym workouts, and hangouts — safely and in the real world.
              </p>

              {/* Action Buttons */}
              <div className="flex flex-wrap items-center gap-3.5 pt-2">
                <Button
                  size="lg"
                  variant="primary"
                  onClick={onGetStarted}
                  icon={ArrowRight}
                  className="font-bold shadow-md shadow-brand-500/20 text-sm px-6 py-3.5"
                >
                  Get Started
                </Button>
                <Button
                  size="lg"
                  variant="outline"
                  onClick={onExplore}
                  icon={Compass}
                  className="font-semibold text-sm px-6 py-3.5"
                >
                  Explore Activities
                </Button>
              </div>

              {/* Social Proof Statistics */}
              <div className="pt-8 border-t border-border/70 grid grid-cols-3 gap-6">
                <div>
                  <div className="text-2xl sm:text-3xl font-extrabold text-dark-text tracking-tight">10K+</div>
                  <div className="text-xs text-dark-faint mt-0.5 font-medium">Active Members</div>
                </div>
                <div>
                  <div className="text-2xl sm:text-3xl font-extrabold text-dark-text tracking-tight">500+</div>
                  <div className="text-xs text-dark-faint mt-0.5 font-medium">Activities Weekly</div>
                </div>
                <div>
                  <div className="text-2xl sm:text-3xl font-extrabold text-dark-text tracking-tight">100%</div>
                  <div className="text-xs text-dark-faint mt-0.5 font-medium">Anti-Doomscroll</div>
                </div>
              </div>
            </div>

            {/* Right Column: Lifestyle Collage with Floating Activity Cards */}
            <div className="lg:col-span-6 relative">
              <div className="relative mx-auto max-w-lg lg:max-w-none">
                
                {/* Image Mosaic */}
                <div className="grid grid-cols-2 gap-4 sm:gap-5">
                  <div className="space-y-4 sm:space-y-5">
                    <div className="h-48 sm:h-60 rounded-2xl overflow-hidden shadow-soft border border-border bg-slate-100">
                      <img
                        src="https://images.unsplash.com/photo-1626224583764-f87db24ac4ea?w=800&auto=format&fit=crop&q=80"
                        alt="Badminton Match"
                        onError={(e) => handleImageError(e, 'Sports')}
                        className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                      />
                    </div>
                    <div className="h-64 sm:h-76 rounded-2xl overflow-hidden shadow-soft border border-border bg-slate-100">
                      <img
                        src="https://images.unsplash.com/photo-1476480862126-209bfaa8edc8?w=800&auto=format&fit=crop&q=80"
                        alt="Running Partners"
                        onError={(e) => handleImageError(e, 'Fitness')}
                        className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                      />
                    </div>
                  </div>

                  <div className="space-y-4 sm:space-y-5 pt-8 sm:pt-10">
                    <div className="h-64 sm:h-76 rounded-2xl overflow-hidden shadow-soft border border-border bg-slate-100">
                      <img
                        src="https://images.unsplash.com/photo-1522202176988-66273c2fd55f?w=800&auto=format&fit=crop&q=80"
                        alt="Study Group Session"
                        onError={(e) => handleImageError(e, 'Study')}
                        className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                      />
                    </div>
                    {/* Fixed Cycling / Outdoor Image */}
                    <div className="h-48 sm:h-60 rounded-2xl overflow-hidden shadow-soft border border-border bg-slate-100">
                      <img
                        src="https://images.unsplash.com/photo-1541625602330-2277a4c46182?w=800&auto=format&fit=crop&q=80"
                        alt="Cycling Outdoors"
                        onError={(e) => handleImageError(e, 'Travel')}
                        className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                      />
                    </div>
                  </div>
                </div>

                {/* Floating Activity Card 1 */}
                <div className="absolute top-12 -left-6 sm:-left-8 bg-white/95 backdrop-blur-md p-3.5 rounded-2xl border border-border shadow-xl max-w-[220px] hidden sm:flex items-center gap-3 animate-in fade-in slide-in-from-left duration-300">
                  <div className="w-10 h-10 rounded-xl bg-brand-100 text-brand-700 flex items-center justify-center shrink-0 font-bold text-lg shadow-2xs">
                    🏃
                  </div>
                  <div className="text-left text-xs">
                    <div className="font-bold text-dark-text">Morning Run</div>
                    <div className="text-[11px] text-brand-600 font-semibold">0.8 km away</div>
                    <div className="text-[10px] text-dark-faint">5 people interested</div>
                  </div>
                </div>

                {/* Floating Activity Card 2 */}
                <div className="absolute bottom-12 -right-4 sm:-right-6 bg-white/95 backdrop-blur-md p-3.5 rounded-2xl border border-border shadow-xl max-w-[220px] hidden sm:flex items-center gap-3 animate-in fade-in slide-in-from-right duration-300">
                  <div className="w-10 h-10 rounded-xl bg-blue-100 text-blue-700 flex items-center justify-center shrink-0 font-bold text-lg shadow-2xs">
                    🏸
                  </div>
                  <div className="text-left text-xs">
                    <div className="font-bold text-dark-text">Badminton Partner</div>
                    <div className="text-[11px] text-brand-600 font-semibold">1.2 km away</div>
                    <div className="text-[10px] text-dark-faint">3 interested • Tonight</div>
                  </div>
                </div>

              </div>
            </div>

          </div>
        </div>
      </section>

      {/* Popular Activity Quick Ticker - Full Width */}
      <section className="w-full max-w-[1700px] mx-auto px-4 sm:px-8 lg:px-12">
        <div className="p-6 bg-white rounded-3xl border border-border/80 shadow-soft space-y-4 text-left">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Activity className="w-4 h-4 text-brand-600" />
              <h3 className="text-sm font-bold text-dark-text uppercase tracking-wider">Popular Nearby Categories</h3>
            </div>
            <button
              onClick={onExplore}
              className="text-xs font-bold text-brand-600 hover:underline"
            >
              View All Activities →
            </button>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-3">
            {popularCategories.map((cat) => (
              <div 
                key={cat.label}
                onClick={onExplore}
                className={`p-3.5 rounded-2xl border ${cat.color} cursor-pointer hover:scale-102 hover:shadow-xs transition-all text-left space-y-1`}
              >
                <div className="text-2xl">{cat.icon}</div>
                <div className="text-xs font-bold text-dark-text">{cat.label}</div>
                <div className="text-[11px] text-dark-muted">{cat.count}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 3 Steps: How Connect2Go Works */}
      <section className="w-full max-w-[1700px] mx-auto px-4 sm:px-8 lg:px-12">
        <div className="text-center max-w-2xl mx-auto mb-12 space-y-3">
          <Badge variant="mint" size="md">
            SIMPLE & SAFE JOURNEY
          </Badge>
          <h2 className="text-2xl sm:text-4xl font-extrabold text-dark-text tracking-tight">
            How Connect2Go Works
          </h2>
          <p className="text-sm text-dark-muted">
            From discovering someone who wants to play, to meeting up safely at the court.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8">
          {steps.map((step) => {
            const Icon = step.icon;
            return (
              <div
                key={step.num}
                className="bg-white p-7 rounded-3xl border border-border/80 shadow-soft text-left space-y-4 relative group hover:border-brand-300 transition-colors"
              >
                <div className="flex items-center justify-between">
                  <div className="w-12 h-12 rounded-2xl bg-brand-50 text-brand-600 flex items-center justify-center font-bold">
                    <Icon className="w-6 h-6" />
                  </div>
                  <span className="text-3xl font-black text-slate-200 group-hover:text-brand-200 transition-colors">
                    {step.num}
                  </span>
                </div>

                <div className="space-y-1.5">
                  <div className="inline-block text-[10px] font-bold text-brand-700 bg-brand-50 px-2 py-0.5 rounded border border-brand-200">
                    {step.badge}
                  </div>
                  <h3 className="text-lg font-bold text-dark-text">{step.title}</h3>
                  <p className="text-xs sm:text-sm text-dark-muted leading-relaxed">
                    {step.desc}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* 3 Core Pillars Section */}
      <section className="w-full max-w-[1700px] mx-auto px-4 sm:px-8 lg:px-12">
        <div className="text-center max-w-2xl mx-auto mb-12 space-y-3">
          <Badge variant="mint" size="md">
            WHY CONNECT2GO
          </Badge>
          <h2 className="text-2xl sm:text-4xl font-extrabold text-dark-text tracking-tight">
            Built For Real-World Action, Not Endless Feeds
          </h2>
          <p className="text-sm text-dark-muted">
            No follower counts. No passive scrolling. Just real hobbies with people in your neighborhood.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8">
          <div className="bg-white p-7 rounded-3xl border border-border/80 shadow-soft text-left space-y-3.5">
            <div className="w-12 h-12 rounded-2xl bg-brand-50 text-brand-600 flex items-center justify-center font-bold">
              <MapPin className="w-6 h-6" />
            </div>
            <h3 className="text-base sm:text-lg font-bold text-dark-text">Hyper-Local Radius Discovery</h3>
            <p className="text-xs sm:text-sm text-dark-muted leading-relaxed">
              Find partners right within your chosen radius (0.5 km to 20 km). From campus sports complexes to local cafes.
            </p>
          </div>

          <div className="bg-white p-7 rounded-3xl border border-border/80 shadow-soft text-left space-y-3.5">
            <div className="w-12 h-12 rounded-2xl bg-purple-50 text-purple-600 flex items-center justify-center font-bold">
              <Shield className="w-6 h-6" />
            </div>
            <h3 className="text-base sm:text-lg font-bold text-dark-text">Anonymous-First Privacy</h3>
            <p className="text-xs sm:text-sm text-dark-muted leading-relaxed">
              Communicate safely under a pseudonym first. Only reveal personal information when you're 100% comfortable.
            </p>
          </div>

          <div className="bg-white p-7 rounded-3xl border border-border/80 shadow-soft text-left space-y-3.5">
            <div className="w-12 h-12 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center font-bold">
              <Sparkles className="w-6 h-6" />
            </div>
            <h3 className="text-base sm:text-lg font-bold text-dark-text">Smart Interest Matching</h3>
            <p className="text-xs sm:text-sm text-dark-muted leading-relaxed">
              Our matching engine pairs you based on shared sports, study goals, skill tiers, and mutual calendar availability.
            </p>
          </div>
        </div>
      </section>

      {/* Full-Bleed Call to Action Banner */}
      <section className="w-full max-w-[1700px] mx-auto px-4 sm:px-8 lg:px-12">
        <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-brand-950 text-white p-8 sm:p-14 rounded-3xl shadow-xl flex flex-col md:flex-row items-center justify-between gap-8 text-left">
          <div className="space-y-3 max-w-xl">
            <span className="text-xs font-bold text-brand-400 uppercase tracking-widest">
              Ready to step out?
            </span>
            <h3 className="text-2xl sm:text-4xl font-extrabold tracking-tight text-white leading-tight">
              Start an Activity Today in Your Neighborhood.
            </h3>
            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
              Join thousands who traded doomscrolling for running, badminton, coding jams, and morning workouts.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3 shrink-0">
            <Button
              size="lg"
              variant="primary"
              onClick={onExplore}
              className="font-bold text-sm px-6 py-3.5 shadow-lg shadow-brand-500/30"
            >
              Explore Nearby
            </Button>
          </div>
        </div>
      </section>

    </div>
  );
}
