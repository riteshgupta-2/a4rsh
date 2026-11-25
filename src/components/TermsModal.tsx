import React from 'react';
import { Download, FileText, Mail, MapPin, Phone, Scale, X } from 'lucide-react';
import { LanguageCode } from '../i18n/translations';

export const CREATOR_INFO = {
  names: 'Ritesh Shah, Arsh Kumar, Hassan Khan, and Rudra',
  email: 'riteshprasad121212@gmail.com',
  emails: ['riteshprasad121212@gmail.com', 'a4rcxz@gmail.com'],
  address: 'Bihar, India',
  phone: '+91 6200349497',
  phones: ['+91 6200349497', '+91 9199535136'],
};

export function getGmailComposeUrl(email: string): string {
  return `https://mail.google.com/mail/?view=cm&fs=1&to=${encodeURIComponent(email)}&su=${encodeURIComponent('HARRBOTIX Inquiry')}`;
}

export function getSmsUrl(phone: string): string {
  return `sms:${phone.replace(/\s+/g, '')}`;
}

export interface TermsSection {
  title: string;
  body: string;
}

export const TERMS_SECTIONS: TermsSection[] = [
  {
    title: '1. Acceptance of Terms',
    body: 'By accessing or using HARRBOTIX ("the Application"), you agree to be bound by these Terms and Conditions. If you are under 18 years of age (or the applicable age of digital consent in your region), a parent, guardian, or educator must review and consent to these terms on your behalf.',
  },
  {
    title: '2. Educational Purpose & Free License',
    body: 'HARRBOTIX is provided free of charge for personal, classroom, and non-commercial STEM learning in robotics simulation, circuit design, autonomous rover navigation, and software programming. You may not sell, redistribute for commercial gain, or reverse-engineer the Application for unauthorized commercial use.',
  },
  {
    title: '3. Optional Accounts & User Responsibility',
    body: 'Core learning tools work offline without registration. If you choose to create a cloud account using Email, Phone Number, Apple ID, or Google, you are responsible for keeping your credentials secure and providing accurate information. Do not share confidential credentials with others.',
  },
  {
    title: '4. Hardware & Simulation Safety Disclaimer',
    body: 'All circuits, voltage checks, sensors, and motor actions inside HARRBOTIX are virtual simulations for educational learning. When wiring real physical microcontrollers, batteries, or motors outside the app, always follow proper electrical safety guidelines under qualified adult or instructor supervision.',
  },
  {
    title: '5. Intellectual Property',
    body: `All original educational lessons, simulator logic, visual design, and branding associated with HARRBOTIX remain the intellectual property of the HARRBOTIX creators (${CREATOR_INFO.names}). Student-created coding blocks, circuits, and exported project files remain the work of their respective learners.`,
  },
  {
    title: '6. Limitation of Liability',
    body: 'HARRBOTIX is provided on an "as is" and "as available" basis without warranties of any kind, express or implied. To the fullest extent permitted by law, the creators shall not be liable for any indirect, incidental, or consequential damages resulting from use of the simulator or external hardware experiments.',
  },
  {
    title: '7. Governing Law & Contact Information',
    body: `These Terms and Conditions are governed by the applicable laws of India, with primary jurisdiction in Bihar, India. For support, licensing, or legal inquiries, contact the creators at ${CREATOR_INFO.emails.join(' or ')}, or call ${CREATOR_INFO.phones.join(' / ')}.`,
  },
];

export const TERMS_PLAIN_TEXT = `TERMS AND CONDITIONS — HARRBOTIX
Effective Date: 2026
Creators: ${CREATOR_INFO.names}
Address: ${CREATOR_INFO.address}
Emails: ${CREATOR_INFO.emails.join(', ')}
Phones: ${CREATOR_INFO.phones.join(', ')}

${TERMS_SECTIONS.map((s) => `${s.title}\n${s.body}`).join('\n\n')}
`;

interface TermsModalProps {
  isOpen: boolean;
  onClose: () => void;
  lang: LanguageCode;
}

export const TermsModal: React.FC<TermsModalProps> = ({ isOpen, onClose, lang }) => {
  if (!isOpen) return null;
  const isHi = lang === 'hi';

  const handleDownloadTerms = () => {
    const blob = new Blob([TERMS_PLAIN_TEXT], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'harrbotix-terms-and-conditions.txt';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/45 p-4 backdrop-blur-sm"
      role="dialog"
      aria-modal="true"
      aria-labelledby="terms-modal-title"
      onClick={onClose}
    >
      <div
        className="w-full max-w-2xl rounded-2xl border border-white/75 bg-white/85 p-6 shadow-2xl backdrop-blur-xl space-y-5 max-h-[88vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-start gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-sky-400/70 bg-sky-500/15 text-sky-800">
              <Scale className="h-5 w-5" aria-hidden="true" />
            </div>
            <div>
              <h3 id="terms-modal-title" className="text-lg font-bold text-slate-900">
                {isHi ? 'नियम एवं शर्तें (Terms & Conditions)' : 'Terms & Conditions'}
              </h3>
              <p className="text-xs text-slate-600 mt-0.5">
                HARRBOTIX · {isHi ? 'प्रभावी तिथि: 2026' : 'Effective Date: 2026'}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            aria-label={isHi ? 'बंद करें' : 'Close'}
            className="rounded-full border border-white/75 bg-white/30 p-2 text-slate-600 backdrop-blur-sm transition-all duration-200 hover:-translate-y-0.5 hover:bg-white/75 hover:text-slate-900 hover:shadow-sm active:scale-95 shrink-0"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Creator & Contact Summary */}
        <div className="rounded-xl border border-white/75 bg-white/60 p-4 backdrop-blur-md space-y-1.5 text-xs text-slate-700">
          <p className="font-semibold text-slate-900">
            {isHi ? 'निर्माता (Creators):' : 'Created & Maintained By:'} {CREATOR_INFO.names}
          </p>
          <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-slate-600">
            <span className="inline-flex items-center gap-1.5">
              <MapPin className="h-3.5 w-3.5 text-sky-700" aria-hidden="true" />
              <span>{CREATOR_INFO.address}</span>
            </span>
            {CREATOR_INFO.emails.map((email) => (
              <a
                key={email}
                href={getGmailComposeUrl(email)}
                target="_blank"
                rel="noopener noreferrer"
                title={`Open Gmail to email ${email}`}
                aria-label={`Open Gmail to email ${email}`}
                className="inline-flex items-center gap-1.5 hover:text-sky-800 hover:underline"
              >
                <Mail className="h-3.5 w-3.5 text-sky-700" aria-hidden="true" />
                <span>{email}</span>
              </a>
            ))}
            {CREATOR_INFO.phones.map((phone) => (
              <a
                key={phone}
                href={getSmsUrl(phone)}
                title={`Open Messages to text ${phone}`}
                aria-label={`Open Messages to text ${phone}`}
                className="inline-flex items-center gap-1.5 hover:text-sky-800 hover:underline tabular-nums"
              >
                <Phone className="h-3.5 w-3.5 text-sky-700" aria-hidden="true" />
                <span>{phone}</span>
              </a>
            ))}
          </div>
        </div>

        {/* Clauses */}
        <div className="space-y-3.5">
          {TERMS_SECTIONS.map((sec) => (
            <div
              key={sec.title}
              className="rounded-xl border border-white/70 bg-white/50 p-3.5 backdrop-blur-sm space-y-1"
            >
              <h4 className="text-xs font-bold text-slate-900">{sec.title}</h4>
              <p className="text-xs leading-relaxed text-slate-600">{sec.body}</p>
            </div>
          ))}
        </div>

        <div className="flex flex-wrap items-center justify-between gap-3 pt-1">
          <button
            type="button"
            onClick={handleDownloadTerms}
            className="inline-flex items-center gap-1.5 rounded-full border border-sky-400/75 bg-sky-500/20 px-4 py-2 text-xs font-semibold text-sky-950 backdrop-blur-md shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:bg-sky-500/35 hover:border-sky-500 hover:shadow-[0_6px_18px_rgba(2,132,199,0.22)] active:scale-95"
          >
            <Download className="h-3.5 w-3.5" aria-hidden="true" />
            <span>{isHi ? 'नियम डाउनलोड करें (.txt)' : 'Download Terms (.txt)'}</span>
          </button>

          <button
            type="button"
            onClick={onClose}
            className="inline-flex items-center gap-1.5 rounded-full border border-white/80 bg-white/35 px-5 py-2 text-xs font-semibold text-slate-800 backdrop-blur-md shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:bg-white/70 active:scale-95"
          >
            <FileText className="h-3.5 w-3.5" aria-hidden="true" />
            <span>{isHi ? 'सहमत व बंद करें' : 'Close'}</span>
          </button>
        </div>
      </div>
    </div>
  );
};
