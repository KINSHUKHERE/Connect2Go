import React, { useState } from 'react';
import { Modal } from '../ui/Modal.jsx';
import { Shield, FileText, Lock, CheckCircle2 } from 'lucide-react';
import { Button } from '../ui/Button.jsx';

export function LegalModal({ isOpen, onClose, initialTab = 'terms' }) {
  const [activeTab, setActiveTab] = useState(initialTab);

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={activeTab === 'terms' ? 'Terms & Conditions' : 'Privacy & Safety Policy'}
      subtitle="Connect2Go Community Standards & Legal Commitments"
      maxWidth="max-w-2xl"
    >
      {/* Sub Tabs */}
      <div className="flex border-b border-border/80 mb-4">
        <button
          onClick={() => setActiveTab('terms')}
          className={`pb-2.5 px-4 text-xs font-bold transition-all border-b-2 ${
            activeTab === 'terms'
              ? 'border-brand-500 text-brand-700'
              : 'border-transparent text-dark-muted hover:text-dark-text'
          }`}
        >
          Terms & Conditions
        </button>
        <button
          onClick={() => setActiveTab('privacy')}
          className={`pb-2.5 px-4 text-xs font-bold transition-all border-b-2 ${
            activeTab === 'privacy'
              ? 'border-brand-500 text-brand-700'
              : 'border-transparent text-dark-muted hover:text-dark-text'
          }`}
        >
          Privacy Policy
        </button>
      </div>

      <div className="max-h-[60vh] overflow-y-auto space-y-4 pr-1 text-left text-xs sm:text-sm text-dark-muted leading-relaxed">
        {activeTab === 'terms' ? (
          <div className="space-y-3.5">
            <div className="p-3 bg-brand-50 rounded-xl border border-brand-200/60 text-xs text-brand-900 font-medium">
              By using Connect2Go, you agree to foster a welcoming, respectful, and safe environment for offline, real-world activities.
            </div>

            <div>
              <h4 className="font-bold text-dark-text text-sm mb-1">1. Not a Dating App</h4>
              <p>
                Connect2Go is strictly an activity-partner and hobby-discovery community. Any harassment, unsolicited romantic solicitations, or inappropriate behavior is subject to immediate permanent suspension.
              </p>
            </div>

            <div>
              <h4 className="font-bold text-dark-text text-sm mb-1">2. Real-World Meetups & Safety</h4>
              <p>
                All meetups must take place in public, well-lit spaces (such as public courts, campus grounds, libraries, or cafes). Users are independently responsible for personal judgment and safety precautions.
              </p>
            </div>

            <div>
              <h4 className="font-bold text-dark-text text-sm mb-1">3. Anonymous First Communication</h4>
              <p>
                Initial interactions take place via anonymous pseudonyms until both parties feel comfortable exchanging real details. Do not solicit phone numbers, payment details, or personal addresses immediately.
              </p>
            </div>

            <div>
              <h4 className="font-bold text-dark-text text-sm mb-1">4. Zero Tolerance for Bad Actors</h4>
              <p>
                Fraud, commercial spam, hate speech, and harassment lead to immediate blacklisting and IP ban. Users can report any suspicious conduct through the 1-click Safety Report system.
              </p>
            </div>
          </div>
        ) : (
          <div className="space-y-3.5">
            <div className="p-3 bg-blue-50 rounded-xl border border-blue-200/60 text-xs text-blue-900 font-medium">
              We prioritize privacy by design. We never sell your personal data or broadcast exact home coordinates.
            </div>

            <div>
              <h4 className="font-bold text-dark-text text-sm mb-1">1. Approximate Location Only</h4>
              <p>
                Connect2Go uses fuzzy radius geocoding. Other users can only see your approximate discovery radius (e.g. 1.5 km), never your precise GPS latitude and longitude coordinates.
              </p>
            </div>

            <div>
              <h4 className="font-bold text-dark-text text-sm mb-1">2. Ephemeral Chat Security</h4>
              <p>
                Chats are purpose-driven for organizing the specific activity. You have the right to leave any conversation or block users with instant effect.
              </p>
            </div>

            <div>
              <h4 className="font-bold text-dark-text text-sm mb-1">3. Data Retention</h4>
              <p>
                You can delete hosted activities, clear participation history, or delete your profile at any time. We do not store long-term location traces.
              </p>
            </div>
          </div>
        )}
      </div>

      <div className="pt-4 mt-4 border-t border-border flex justify-end">
        <Button variant="primary" size="sm" onClick={onClose} className="font-bold text-xs">
          I Understand & Agree
        </Button>
      </div>
    </Modal>
  );
}
