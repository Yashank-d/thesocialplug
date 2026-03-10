"use client";

import { useEffect, useState } from "react";
import { createPortal } from "react-dom";

export default function TermsModal({
  isOpen,
  onClose,
  onAccept,
}: {
  isOpen: boolean;
  onClose: () => void;
  onAccept: () => void;
}) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isOpen]);

  if (!mounted || !isOpen) return null;

  return createPortal(
    <div className="fixed inset-0 z-[100] flex flex-col items-center justify-center p-4">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/60 backdrop-blur-sm transition-opacity"
        onClick={onClose}
      />
      
      {/* Modal */}
      <div className="relative w-full max-w-2xl max-h-[85vh] bg-[#0D0D0D] border border-white/10 rounded-3xl shadow-2xl flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-white/10 bg-white/[0.02]">
          <h2 className="font-seasons text-2xl font-black text-light uppercase tracking-tighter">
            Terms & Conditions
          </h2>
          <button 
            onClick={onClose}
            className="text-light/50 hover:text-light transition-colors p-2"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="18" y1="6" x2="6" y2="18"></line>
              <line x1="6" y1="6" x2="18" y2="18"></line>
            </svg>
          </button>
        </div>

        {/* Content */}
        <div className="p-6 md:p-8 overflow-y-auto custom-scrollbar text-light/80 font-inter text-sm leading-relaxed space-y-6">
          <p><strong className="text-light">thesocialplug.</strong></p>
          <p><em className="text-light/60">irl &gt; scrolling</em></p>
          <p><strong className="text-light uppercase tracking-widest text-[11px]">TERMS &amp; CONDITIONS</strong></p>
          <p>Community Membership &amp; Event Participation</p>
          <p className="text-light/50 text-xs">Effective Date: March 2026 | Bangalore, India</p>
          
          <div className="space-y-4">
            <h1 className="font-seasons font-black text-xl text-light/90 pt-4"><strong className="text-accent/90">1.</strong> About thesocialplug.</h1>
            <p>thesocialplug. is an offline social community based in Bangalore, India. We organise small, intentional in-person events — starting with UNO Sundays at Cubbon Park — for people who want to meet others in real life. By registering for any event or joining our community, you agree to these Terms &amp; Conditions.</p>
            
            <h1 className="font-seasons font-black text-xl text-light/90 pt-4"><strong className="text-accent/90">2.</strong> Registration &amp; Eligibility</h1>
            <p>To attend any thesocialplug. event, you must:</p>
            <ul className="list-disc pl-5 space-y-1 text-light/70">
              <li>Be 18 years of age or older</li>
              <li>Provide accurate information at the time of registration (name, email, and any other details requested)</li>
              <li>Complete the registration process on our official platform before the event</li>
            </ul>
            <p>We reserve the right to refuse registration or cancel a booking if we believe the information provided is false, misleading, or incomplete.</p>
            
            <h1 className="font-seasons font-black text-xl text-light/90 pt-4"><strong className="text-accent/90">3.</strong> Bookings, Capacity &amp; Waitlists</h1>
            <p>Events are limited in capacity — intentionally. Here is how it works:</p>
            <ul className="list-disc pl-5 space-y-1 text-light/70">
              <li>Spots are confirmed on a first-come, first-served basis</li>
              <li>If an event is full, you may be placed on a waitlist and notified automatically if a spot opens</li>
              <li>Your spot is personal and non-transferable — you cannot give it to someone else</li>
              <li>Registering for a spot and not showing up without notice is unfair to others on the waitlist</li>
            </ul>
            <p>We reserve the right to limit registrations per person or per event at our discretion.</p>
            
            <h1 className="font-seasons font-black text-xl text-light/90 pt-4"><strong className="text-accent/90">4.</strong> Cancellations &amp; No-Shows</h1>
            <p>We understand that plans change. However, because our events are small:</p>
            <ul className="list-disc pl-5 space-y-1 text-light/70">
              <li>Please cancel your spot at least 24 hours before the event if you cannot attend, so someone on the waitlist can join</li>
              <li>Repeated no-shows without notice may result in your registration being declined for future events</li>
            </ul>
            <p>thesocialplug. reserves the right to cancel or reschedule events due to weather, safety concerns, low registrations, or other circumstances outside our control. In such cases, registered attendees will be notified via email.</p>
            
            <h1 className="font-seasons font-black text-xl text-light/90 pt-4"><strong className="text-accent/90">5.</strong> Community Standards &amp; Code of Conduct</h1>
            <p>thesocialplug. is a space for genuine human connection. By attending, you agree to:</p>
            <ul className="list-disc pl-5 space-y-1 text-light/70">
              <li>Treat all attendees with respect, regardless of their background, identity, or views</li>
              <li>Not engage in harassment, discrimination, intimidation, or any harmful behaviour</li>
              <li>Not solicit attendees for business, marketing, or any commercial purpose without prior consent</li>
              <li>Not record, photograph, or film other attendees without their explicit permission</li>
              <li>Follow any instructions given by thesocialplug. organisers during an event</li>
            </ul>
            <p>Anyone who violates these standards may be asked to leave immediately and may be banned from future events without prior notice.</p>
            
            <h1 className="font-seasons font-black text-xl text-light/90 pt-4"><strong className="text-accent/90">6.</strong> Data &amp; Privacy</h1>
            <p>When you register for an event, we collect your name, email address, Instagram handle (optional), and city. This information is used solely to:</p>
            <ul className="list-disc pl-5 space-y-1 text-light/70">
              <li>Confirm your booking and send you event details</li>
              <li>Contact you about future thesocialplug. events</li>
              <li>Manage check-ins on the day of the event</li>
            </ul>
            <p>We do not sell, share, or rent your personal data to any third party. You may request deletion of your data at any time by writing to us. By registering, you consent to receiving transactional emails related to your booking and, occasionally, information about upcoming events. You may opt out at any time.</p>
            
            <h1 className="font-seasons font-black text-xl text-light/90 pt-4"><strong className="text-accent/90">7.</strong> Photography &amp; Content</h1>
            <p>thesocialplug. may photograph or film events for use on our social media channels (@thesocialplug.blr) and other platforms. By attending, you acknowledge that:</p>
            <ul className="list-disc pl-5 space-y-1 text-light/70">
              <li>Group or environmental shots may be taken during events</li>
              <li>We will not publish identifiable close-up photographs of you without your consent</li>
              <li>If you do not wish to appear in any content, please inform an organiser at the start of the event</li>
            </ul>
            <p>You retain full rights to any content you personally create at our events.</p>
            
            <h1 className="font-seasons font-black text-xl text-light/90 pt-4"><strong className="text-accent/90">8.</strong> Liability &amp; Assumption of Risk</h1>
            <p>thesocialplug. events are held in public outdoor spaces. By attending, you acknowledge that:</p>
            <ul className="list-disc pl-5 space-y-1 text-light/70">
              <li>You participate voluntarily and at your own risk</li>
              <li>thesocialplug. is not responsible for any personal injury, loss, or damage to property that occurs during or in connection with an event</li>
              <li>We are not liable for any interactions between attendees before, during, or after an event</li>
            </ul>
            <p>To the maximum extent permitted by applicable law, thesocialplug. and its organisers shall not be liable for any indirect, incidental, or consequential loss arising from your participation in our events.</p>
            
            <h1 className="font-seasons font-black text-xl text-light/90 pt-4"><strong className="text-accent/90">9.</strong> Changes to These Terms</h1>
            <p>We may update these Terms &amp; Conditions from time to time. The most current version will always be available on our platform. Continued participation in thesocialplug. events after changes are made constitutes your acceptance of the updated terms.</p>
            
            <h1 className="font-seasons font-black text-xl text-light/90 pt-4"><strong className="text-accent/90">10.</strong> Governing Law</h1>
            <p>These Terms are governed by the laws of India. Any disputes shall be subject to the jurisdiction of the courts in Bangalore, Karnataka.</p>
            
            <h1 className="font-seasons font-black text-xl text-light/90 pt-4"><strong className="text-accent/90">11.</strong> Contact</h1>
            <p>For any questions about these Terms, cancellations, or data requests, reach out to us at:</p>
            <p><strong className="text-light">Instagram:</strong> @thesocialplug.blr</p>
            <p><strong className="text-light">Platform:</strong> thesocialplug.vercel.app</p>
            <p className="pt-4"><em className="text-light/60">thesocialplug. · bangalore · irl &gt; scrolling</em></p>
          </div>
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-white/10 bg-white/[0.02] flex justify-end gap-4 shrink-0">
          <button
            onClick={onClose}
            className="px-6 py-3 rounded-xl font-bold text-sm tracking-widest uppercase text-light/70 hover:text-light hover:bg-white/5 transition-all"
          >
            Cancel
          </button>
          <button
            onClick={() => {
              onAccept();
              onClose();
            }}
            className="px-8 py-3 rounded-xl bg-accent text-dark font-black text-sm tracking-widest uppercase hover:opacity-90 hover:scale-[1.02] transition-all shadow-[0_0_20px_rgba(198,255,0,0.2)]"
          >
            I Agree
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
}
