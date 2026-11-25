import React from 'react';
import {
  CheckCircle2,
  Download,
  FileText,
  Laptop,
  Mail,
  MapPin,
  Phone,
  Scale,
  ShieldCheck,
  Smartphone,
  Store,
} from 'lucide-react';
import { usePWAInstall } from '../hooks/usePWAInstall';
import { LanguageCode, TranslationStrings } from '../i18n/translations';
import {
  CREATOR_INFO,
  getGmailComposeUrl,
  getSmsUrl,
  TERMS_PLAIN_TEXT,
  TERMS_SECTIONS,
} from './TermsModal';

interface StoreAndLegalCenterProps {
  lang: LanguageCode;
  t: TranslationStrings;
}

export const StoreAndLegalCenter: React.FC<StoreAndLegalCenterProps> = ({ lang, t }) => {
  const { isInstallable, isInstalled, install } = usePWAInstall();
  const isHi = lang === 'hi';

  const downloadTextFile = (filename: string, content: string) => {
    const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const privacyPolicyText = `PRIVACY POLICY FOR HARRBOTIX (KIDS EDUCATIONAL APP)
Effective Date: 2026
App Name: HARRBOTIX

1. PRIVACY-FIRST & OPTIONAL ACCOUNTS (COPPA & GDPR-K DESIGN)
HARRBOTIX is designed specifically for children, students, and classrooms.
- Offline mode works without creating an account or sharing personal details.
- If you choose to create an optional cloud account (via Email, Phone Number, Apple ID, or Google), your email/phone metadata is isolated in your private user document protected by strict owner-only security rules.
- We DO NOT display third-party advertisements or behavioral tracking scripts.

2. LOCAL + OPTIONAL CLOUD STORAGE
When used offline, all robotics circuits, visual block programs, Python/HTML code, and XP progress are stored exclusively on your device. When signed in to an account, your workspace syncs securely to your private Firebase account.

3. FREE EDUCATIONAL LICENSE
HARRBOTIX is provided 100% free of cost for educational learning on Android, iOS, and Windows.
`;

  const playStoreStepsText = `HOW TO PUBLISH HARRBOTIX TO GOOGLE PLAY STORE & MICROSOFT STORE (NO CODING REQUIRED)

1. HOST THIS APP LIVE:
Deploy or publish this web app URL (HTTPS). Because it already has a complete Web App Manifest and offline Service Worker, it is 100% PWA Store-Ready.

2. GENERATE PLAY STORE ANDROID PACKAGE (.AAB) VIA PWABUILDER:
- Open https://www.pwabuilder.com in your browser.
- Paste your live HTTPS app URL and click "Start".
- Click "Package For Stores" -> Select "Android" (Google Play).
- Click "Generate Package" to download the ready-to-upload .aab file and assetlinks.json.

3. UPLOAD TO GOOGLE PLAY CONSOLE LEGALLY:
- Create a Google Play Developer account (play.google.com/console).
- Create App -> Upload the .aab bundle.
- Set Target Audience to Children / Families and upload the included Privacy Policy (zero data collection, zero ads).
- For Windows Microsoft Store, select "Windows" in PWABuilder to download the .msix package.
- For iPhone / iPad, users can install directly via Safari -> Share -> Add to Home Screen, or wrap via PWABuilder iOS option.
`;

  return (
    <section className="mx-auto max-w-7xl px-4 py-6 sm:px-6 space-y-8">
      <div className="rounded-2xl border border-white/70 bg-white/65 p-6 backdrop-blur-md shadow-sm">
        <h2 className="text-2xl font-bold text-slate-900">{t.publishTitle}</h2>
        <p className="mt-2 max-w-3xl text-sm leading-relaxed text-slate-600">{t.publishSubtitle}</p>

        {/* Cross-Platform Installation Matrix */}
        <div className="mt-6 grid grid-cols-1 gap-4 md:grid-cols-3">
          <div className="rounded-xl border border-white/70 bg-white/55 p-4 backdrop-blur-sm space-y-2">
            <div className="flex items-center gap-2 text-sm font-bold text-slate-900">
              <Smartphone className="h-4 w-4 text-emerald-600" aria-hidden="true" />
              <span>Android (Phone &amp; Tablet)</span>
            </div>
            <p className="text-xs leading-relaxed text-slate-600">
              {isHi
                ? 'Chrome ब्राउज़र में "ऐप इंस्टॉल करें" दबाएँ या तीन-बिंदु मेनू → Install App चुनें। यह बिना इंटरनेट के भी चलेगा।'
                : 'Tap "Install App" below or open Chrome menu → Install App. Runs full-screen offline like a native Play Store app.'}
            </p>
            {isInstallable && !isInstalled && (
              <button
                type="button"
                onClick={install}
                className="inline-flex items-center gap-1.5 rounded-full border border-sky-400/75 bg-sky-500/20 px-4 py-1.5 text-xs font-semibold text-sky-950 backdrop-blur-md shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:bg-sky-500/35 hover:border-sky-500 hover:shadow-[0_6px_18px_rgba(2,132,199,0.24)] active:scale-95"
              >
                <Download className="h-3.5 w-3.5" aria-hidden="true" />
                <span>{t.installApp}</span>
              </button>
            )}
          </div>

          <div className="rounded-xl border border-white/70 bg-white/55 p-4 backdrop-blur-sm space-y-2">
            <div className="flex items-center gap-2 text-sm font-bold text-slate-900">
              <Smartphone className="h-4 w-4 text-sky-600" aria-hidden="true" />
              <span>iPhone &amp; iPad (iOS Safari)</span>
            </div>
            <p className="text-xs leading-relaxed text-slate-600">
              {isHi
                ? 'iPhone Safari में नीचे Share (तीर) बटन दबाएँ → "Add to Home Screen" चुनें → Add पर टैप करें।'
                : 'Open in Safari → tap the Share icon at the bottom → scroll to "Add to Home Screen" → tap Add.'}
            </p>
          </div>

          <div className="rounded-xl border border-white/70 bg-white/55 p-4 backdrop-blur-sm space-y-2">
            <div className="flex items-center gap-2 text-sm font-bold text-slate-900">
              <Laptop className="h-4 w-4 text-slate-700" aria-hidden="true" />
              <span>Windows 10 / 11 PC</span>
            </div>
            <p className="text-xs leading-relaxed text-slate-600">
              {isHi
                ? 'Edge या Chrome में एड्रेस बार के दाईं ओर Install आइकन दबाएँ और इसे Desktop / Start Menu ऐप की तरह चलाएँ।'
                : 'In Chrome or Microsoft Edge, click the Install icon in the address bar to pin HARRBOTIX to your Windows Start Menu.'}
            </p>
          </div>
        </div>
      </div>

      {/* Two-Column Guide: Play Store Publishing + Legal Compliance */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <div className="rounded-2xl border border-white/70 bg-white/65 p-6 backdrop-blur-md shadow-sm space-y-4">
          <div className="flex items-center gap-2">
            <Store className="h-5 w-5 text-sky-600" aria-hidden="true" />
            <h3 className="text-lg font-bold text-slate-900">
              {isHi
                ? 'बिना कोडिंग के Google Play Store पर कैसे डालें'
                : 'Publish to Google Play Store & Microsoft Store (Zero Coding)'}
            </h3>
          </div>

          <ol className="space-y-2.5 text-xs leading-relaxed text-slate-600">
            <li className="flex items-start gap-2">
              <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0 mt-0.5" aria-hidden="true" />
              <span>
                <strong>Step 1 — Share / Host URL:</strong>{' '}
                {isHi
                  ? 'इस ऐप का लाइव HTTPS लिंक कॉपी करें। इसमें पहले से PWA Manifest और ऑफलाइन इंजन लगा हुआ है।'
                  : 'Copy your published HTTPS app URL. All PWA manifest icons (192px, 512px, maskable) and service worker are already configured.'}
              </span>
            </li>
            <li className="flex items-start gap-2">
              <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0 mt-0.5" aria-hidden="true" />
              <span>
                <strong>Step 2 — Use PWABuilder.com (Free Official Tool):</strong>{' '}
                {isHi
                  ? 'PWABuilder.com खोलकर अपना लिंक डालें और Android (.aab) या Windows (.msix) पैकेज 1 क्लिक में डाउनलोड करें।'
                  : 'Paste your URL at pwabuilder.com to automatically generate a Play Store-ready Android .aab (Trusted Web Activity) or Windows .msix package.'}
              </span>
            </li>
            <li className="flex items-start gap-2">
              <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0 mt-0.5" aria-hidden="true" />
              <span>
                <strong>Step 3 — Google Play Console Upload:</strong>{' '}
                {isHi
                  ? 'Play Console में .aab अपलोड करें, Kids / Education श्रेणी चुनें और नीचे दी गई Privacy Policy लगाएँ।'
                  : 'Upload the .aab file in Google Play Console, select Education / Families category, and attach the COPPA-safe Privacy Policy.'}
              </span>
            </li>
          </ol>

          <button
            type="button"
            onClick={() => downloadTextFile('play-store-checklist.txt', playStoreStepsText)}
            className="inline-flex items-center gap-2 rounded-full border border-white/80 bg-white/30 px-4 py-2 text-xs font-semibold text-slate-800 backdrop-blur-md shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:border-sky-300/80 hover:bg-white/60 hover:text-sky-900 hover:shadow-[0_6px_18px_rgba(2,132,199,0.16)] active:scale-95"
          >
            <FileText className="h-4 w-4 text-sky-600" aria-hidden="true" />
            <span>{isHi ? 'Play Store गाइड डाउनलोड करें (.txt)' : 'Download Play Store Checklist (.txt)'}</span>
          </button>
        </div>

        <div className="rounded-2xl border border-white/70 bg-white/65 p-6 backdrop-blur-md shadow-sm space-y-4">
          <div className="flex items-center gap-2">
            <ShieldCheck className="h-5 w-5 text-emerald-600" aria-hidden="true" />
            <h3 className="text-lg font-bold text-slate-900">
              {isHi
                ? 'कानूनी नियम व बच्चों की सुरक्षा (COPPA / GDPR-K)'
                : 'Legal Compliance & Child Privacy Guarantee'}
            </h3>
          </div>

          <ul className="space-y-2.5 text-xs leading-relaxed text-slate-600">
            <li className="flex items-start gap-2">
              <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0 mt-0.5" aria-hidden="true" />
              <span>
                <strong>Zero Personal Data Collected:</strong>{' '}
                {isHi
                  ? 'यह ऐप बच्चों का नाम, ईमेल, फ़ोन नंबर या लोकेशन नहीं मांगता और न ही किसी सर्वर पर भेजता है।'
                  : 'No login, no email, no camera/location tracking, and no third-party ad SDKs. Meets Google Play Families Policy & COPPA.'}
              </span>
            </li>
            <li className="flex items-start gap-2">
              <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0 mt-0.5" aria-hidden="true" />
              <span>
                <strong>100% Free &amp; Open Educational Use:</strong>{' '}
                {isHi
                  ? 'बच्चों, स्कूलों और शिक्षकों के लिए हमेशा के लिए मुफ़्त — कोई छुपी हुई फीस या सब्सक्रिप्शन नहीं।'
                  : 'Licensed under open educational terms (Apache-2.0 compatible) with zero paywalls or in-app purchases.'}
              </span>
            </li>
            <li className="flex items-start gap-2">
              <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0 mt-0.5" aria-hidden="true" />
              <span>
                <strong>100% On-Device Storage:</strong>{' '}
                {isHi
                  ? 'बच्चों के सभी प्रोजेक्ट और सर्टिफिकेट उनके अपने मोबाइल या कंप्यूटर में सुरक्षित रहते हैं।'
                  : 'Student projects and progress stay safely in local browser storage with instant JSON backup export.'}
              </span>
            </li>
          </ul>

          <button
            type="button"
            onClick={() => downloadTextFile('privacy-policy.txt', privacyPolicyText)}
            className="inline-flex items-center gap-2 rounded-full border border-emerald-400/75 bg-emerald-500/20 px-4 py-2 text-xs font-semibold text-emerald-950 backdrop-blur-md shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:bg-emerald-500/35 hover:border-emerald-500 hover:shadow-[0_6px_18px_rgba(5,150,105,0.22)] active:scale-95"
          >
            <Download className="h-4 w-4" aria-hidden="true" />
            <span>{isHi ? 'Privacy Policy डाउनलोड करें (.txt)' : 'Download Privacy Policy (.txt)'}</span>
          </button>
        </div>
      </div>

      {/* Professional Terms & Conditions + Creators Section */}
      <div className="rounded-2xl border border-white/70 bg-white/65 p-6 backdrop-blur-md shadow-sm space-y-5">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <Scale className="h-5 w-5 text-sky-600" aria-hidden="true" />
            <h3 className="text-lg font-bold text-slate-900">
              {isHi ? 'नियम एवं शर्तें तथा निर्माता विवरण' : 'Terms & Conditions & Creators'}
            </h3>
          </div>
          <button
            type="button"
            onClick={() => downloadTextFile('harrbotix-terms-and-conditions.txt', TERMS_PLAIN_TEXT)}
            className="inline-flex items-center gap-2 rounded-full border border-sky-400/75 bg-sky-500/20 px-4 py-2 text-xs font-semibold text-sky-950 backdrop-blur-md shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:bg-sky-500/35 hover:border-sky-500 hover:shadow-[0_6px_18px_rgba(2,132,199,0.22)] active:scale-95"
          >
            <Download className="h-4 w-4" aria-hidden="true" />
            <span>{isHi ? 'Terms & Conditions डाउनलोड करें (.txt)' : 'Download Terms & Conditions (.txt)'}</span>
          </button>
        </div>

        <div className="rounded-xl border border-white/75 bg-white/55 p-4 backdrop-blur-sm text-xs text-slate-700 space-y-1.5">
          <p>
            <strong>{isHi ? 'निर्माता:' : 'Creators:'}</strong> {CREATOR_INFO.names}
          </p>
          <div className="flex flex-wrap items-center gap-x-5 gap-y-1 text-slate-600">
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

        <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
          {TERMS_SECTIONS.map((sec) => (
            <div
              key={sec.title}
              className="rounded-xl border border-white/70 bg-white/50 p-4 backdrop-blur-sm space-y-1"
            >
              <h4 className="text-xs font-bold text-slate-900">{sec.title}</h4>
              <p className="text-xs leading-relaxed text-slate-600">{sec.body}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
