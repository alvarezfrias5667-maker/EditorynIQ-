import React, { useState } from 'react';
import { useI18n } from '../i18n';
import { PageHero } from '../components/ui/PageHero';
import { PremiumButton } from '../components/ui/PremiumButton';

export interface ContactPageProps {
  onNavigate: (path: string) => void;
}

export const ContactPage: React.FC<ContactPageProps> = () => {
  const { t } = useI18n();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !email.trim() || !message.trim()) {
      setError('Please fill in all required fields (Name, Email, Message).');
      return;
    }
    setError('');
    setSubmitted(true);
  };

  return (
    <div className="space-y-12 pb-20">
      <PageHero
        title={t.contact.title}
        subtitle={t.contact.subtitle}
      />

      <div className="max-w-3xl mx-auto px-4 sm:px-6 space-y-8">
        <div className="bg-slate-900 text-white p-6 rounded-2xl border border-slate-800 space-y-2">
          <span className="text-xs font-bold text-[#16C8BA] uppercase tracking-wider">
            {t.contact.infoTitle}
          </span>
          <p className="text-xs text-slate-300 leading-relaxed">
            {t.contact.infoNotice}
          </p>
        </div>

        <form onSubmit={handleSubmit} className="bg-white rounded-2xl border border-slate-200/90 p-8 space-y-6 shadow-2xs">
          {submitted && (
            <div className="p-4 rounded-xl bg-[#16836D]/10 text-[#16836D] border border-[#16836D]/30 text-xs font-semibold">
              ✓ {t.contact.successMsg}
            </div>
          )}

          {error && (
            <div className="p-4 rounded-xl bg-[#D14343]/10 text-[#D14343] border border-[#D14343]/30 text-xs font-semibold">
              ⚠ {error}
            </div>
          )}

          <div className="space-y-2">
            <label htmlFor="contactName" className="block text-xs font-bold uppercase tracking-wider text-[#081629]">
              {t.contact.nameLabel} *
            </label>
            <input
              id="contactName"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-4 py-2.5 text-sm rounded-lg border border-slate-300 focus:ring-2 focus:ring-[#345CFF] focus:outline-none"
            />
          </div>

          <div className="space-y-2">
            <label htmlFor="contactEmail" className="block text-xs font-bold uppercase tracking-wider text-[#081629]">
              {t.contact.emailLabel} *
            </label>
            <input
              id="contactEmail"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-2.5 text-sm rounded-lg border border-slate-300 focus:ring-2 focus:ring-[#345CFF] focus:outline-none"
            />
          </div>

          <div className="space-y-2">
            <label htmlFor="contactSubject" className="block text-xs font-bold uppercase tracking-wider text-[#081629]">
              {t.contact.subjectLabel}
            </label>
            <input
              id="contactSubject"
              type="text"
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              className="w-full px-4 py-2.5 text-sm rounded-lg border border-slate-300 focus:ring-2 focus:ring-[#345CFF] focus:outline-none"
            />
          </div>

          <div className="space-y-2">
            <label htmlFor="contactMsg" className="block text-xs font-bold uppercase tracking-wider text-[#081629]">
              {t.contact.messageLabel} *
            </label>
            <textarea
              id="contactMsg"
              rows={5}
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              className="w-full px-4 py-2.5 text-sm rounded-lg border border-slate-300 focus:ring-2 focus:ring-[#345CFF] focus:outline-none"
            />
          </div>

          <div className="pt-2">
            <PremiumButton type="submit" variant="primary" size="md">
              {t.contact.submitBtn}
            </PremiumButton>
          </div>
        </form>
      </div>
    </div>
  );
};
