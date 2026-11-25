import React, { useEffect, useRef, useState } from 'react';
import {
  ConfirmationResult,
  createUserWithEmailAndPassword,
  RecaptchaVerifier,
  sendEmailVerification,
  sendPasswordResetEmail,
  signInWithEmailAndPassword,
  signInWithPhoneNumber,
  signInWithPopup,
  signOut,
  updateProfile,
  User,
} from 'firebase/auth';
import {
  Bot,
  Check,
  CheckCircle2,
  ChevronDown,
  ChevronUp,
  Cloud,
  Code2,
  Compass,
  Cpu,
  ExternalLink,
  Eye,
  EyeOff,
  LogOut,
  Mail,
  Pencil,
  Phone,
  Rocket,
  ShieldCheck,
  Trash2,
  UserPlus,
  Users,
  X,
} from 'lucide-react';
import {
  appleProvider,
  auth,
  FIREBASE_AUTH_DOMAIN,
  FIREBASE_PROJECT_ID,
  googleProvider,
} from '../firebase';
import { LanguageCode } from '../i18n/translations';
import {
  CloudUserProgress,
  detectAuthProvider,
  formatFirebaseAuthError,
  sanitizeUsername,
} from '../services/userAccountService';
import {
  AVATAR_THEMES,
  AvatarIconKey,
  AvatarTheme,
  UserProfile,
} from '../utils/profileStorage';

interface ProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  lang: LanguageCode;
  authUser: User | null;
  cloudProfile: CloudUserProgress | null;
  onCloudAuthenticated: (user: User, preferredUsername?: string) => Promise<void>;
  onUpdateCloudProfile: (
    username: string,
    avatarIcon: AvatarIconKey,
    avatarTheme: AvatarTheme
  ) => Promise<void>;
  profiles: UserProfile[];
  activeProfileId: string;
  onSelectProfile: (id: string) => void;
  onCreateProfile: (
    username: string,
    avatarIcon: AvatarIconKey,
    avatarTheme: AvatarTheme
  ) => void;
  onUpdateProfile: (
    id: string,
    username: string,
    avatarIcon: AvatarIconKey,
    avatarTheme: AvatarTheme
  ) => void;
  onDeleteProfile: (id: string) => void;
}

const ICON_OPTIONS: { key: AvatarIconKey; label: string }[] = [
  { key: 'bot', label: 'Bot' },
  { key: 'cpu', label: 'Chip' },
  { key: 'rocket', label: 'Rocket' },
  { key: 'compass', label: 'Rover' },
  { key: 'code', label: 'Code' },
];

export const ProfileAvatarIcon: React.FC<{
  icon: AvatarIconKey;
  className?: string;
}> = ({ icon, className = 'h-4 w-4' }) => {
  switch (icon) {
    case 'cpu':
      return <Cpu className={className} aria-hidden="true" />;
    case 'rocket':
      return <Rocket className={className} aria-hidden="true" />;
    case 'compass':
      return <Compass className={className} aria-hidden="true" />;
    case 'code':
      return <Code2 className={className} aria-hidden="true" />;
    case 'bot':
    default:
      return <Bot className={className} aria-hidden="true" />;
  }
};

const AppleLogoSvg: React.FC<{ className?: string }> = ({ className = 'h-4 w-4' }) => (
  <svg viewBox="0 0 24 24" fill="currentColor" className={className} aria-hidden="true">
    <path d="M16.365 1.43c0 1.14-.493 2.27-1.177 3.08-.744.9-1.99 1.57-2.987 1.57-.12 0-.23-.02-.3-.03-.01-.06-.04-.22-.04-.39 0-1.15.572-2.27 1.206-2.98.804-.94 2.142-1.64 3.248-1.68.03.13.05.28.05.43zm4.565 15.71c-.03.07-.463 1.58-1.518 3.12-.945 1.34-1.94 2.71-3.43 2.71-1.517 0-1.9-.88-3.63-.88-1.698 0-2.302.91-3.67.91-1.377 0-2.332-1.26-3.428-2.8-1.287-1.82-2.323-4.63-2.323-7.28 0-4.28 2.797-6.55 5.552-6.55 1.448 0 2.675.95 3.6.95.865 0 2.222-1.01 3.902-1.01.613 0 2.886.06 4.374 2.19-.13.09-2.383 1.37-2.383 4.19 0 3.26 2.854 4.42 2.955 4.45z" />
  </svg>
);

export const ProfileModal: React.FC<ProfileModalProps> = ({
  isOpen,
  onClose,
  lang,
  authUser,
  cloudProfile,
  onCloudAuthenticated,
  onUpdateCloudProfile,
  profiles,
  activeProfileId,
  onSelectProfile,
  onCreateProfile,
  onUpdateProfile,
  onDeleteProfile,
}) => {
  const isHi = lang === 'hi';

  const [activeTab, setActiveTab] = useState<'account' | 'profiles'>('account');
  const [authMethod, setAuthMethod] = useState<'email' | 'phone' | 'apple'>('email');
  const [emailFlow, setEmailFlow] = useState<'signup' | 'signin'>('signup');

  // Account auth states
  const [accountUsername, setAccountUsername] = useState('');
  const [emailInput, setEmailInput] = useState('');
  const [passwordInput, setPasswordInput] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const [phoneInput, setPhoneInput] = useState('+1');
  const [otpInput, setOtpInput] = useState('');
  const [confirmationResult, setConfirmationResult] = useState<ConfirmationResult | null>(null);
  const recaptchaContainerRef = useRef<HTMLDivElement | null>(null);
  const recaptchaVerifierRef = useRef<RecaptchaVerifier | null>(null);

  const [authBusy, setAuthBusy] = useState(false);
  const [authError, setAuthError] = useState('');
  const [authSuccess, setAuthSuccess] = useState('');
  const [showSetupGuide, setShowSetupGuide] = useState(false);

  // Signed-in profile editor state
  const [editingCloudProfile, setEditingCloudProfile] = useState(false);
  const [cloudNameDraft, setCloudNameDraft] = useState('');
  const [cloudIconDraft, setCloudIconDraft] = useState<AvatarIconKey>('bot');
  const [cloudThemeDraft, setCloudThemeDraft] = useState<AvatarTheme>('sky');

  // Local profile states
  const [localMode, setLocalMode] = useState<'list' | 'create' | 'edit'>('list');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [usernameInput, setUsernameInput] = useState('');
  const [selectedIcon, setSelectedIcon] = useState<AvatarIconKey>('bot');
  const [selectedTheme, setSelectedTheme] = useState<AvatarTheme>('sky');
  const [localErrorMsg, setLocalErrorMsg] = useState('');

  useEffect(() => {
    if (cloudProfile) {
      setCloudNameDraft(cloudProfile.username);
      setCloudIconDraft(cloudProfile.avatarIcon);
      setCloudThemeDraft(cloudProfile.avatarTheme);
    }
  }, [cloudProfile]);

  useEffect(() => {
    return () => {
      if (recaptchaVerifierRef.current) {
        try {
          recaptchaVerifierRef.current.clear();
        } catch {
          // ignore
        }
        recaptchaVerifierRef.current = null;
      }
    };
  }, [isOpen, authMethod]);

  if (!isOpen) return null;

  const clearAuthNotices = () => {
    setAuthError('');
    setAuthSuccess('');
  };

  const handleEmailSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    clearAuthNotices();

    const cleanedEmail = emailInput.trim();
    if (!cleanedEmail || !cleanedEmail.includes('@')) {
      setAuthError(isHi ? 'कृपया सही ईमेल पता लिखें।' : 'Please enter a valid email address.');
      return;
    }
    if (passwordInput.length < 6) {
      setAuthError(
        isHi ? 'पासवर्ड कम से कम 6 अक्षरों का होना चाहिए।' : 'Password must be at least 6 characters.'
      );
      return;
    }

    setAuthBusy(true);
    try {
      if (emailFlow === 'signup') {
        const chosenName = accountUsername.trim()
          ? sanitizeUsername(accountUsername)
          : sanitizeUsername(cleanedEmail.split('@')[0]);
        const cred = await createUserWithEmailAndPassword(auth, cleanedEmail, passwordInput);
        try {
          await updateProfile(cred.user, { displayName: chosenName });
        } catch {
          // non-fatal displayName update failure
        }
        try {
          await sendEmailVerification(cred.user);
        } catch {
          // non-fatal verification email error
        }
        await onCloudAuthenticated(cred.user, chosenName);
        setAuthSuccess(
          isHi
            ? 'खाता बन गया! हमने आपके ईमेल पर वेरिफिकेशन लिंक भेजा है।'
            : 'Account created! We sent a verification link to your email.'
        );
      } else {
        const cred = await signInWithEmailAndPassword(auth, cleanedEmail, passwordInput);
        await onCloudAuthenticated(cred.user);
        setAuthSuccess(isHi ? 'लॉगिन सफल!' : 'Signed in successfully!');
      }
      setPasswordInput('');
    } catch (err) {
      const formatted = formatFirebaseAuthError(err, isHi);
      setAuthError(formatted.message);
      if (formatted.needsConsoleSetup) {
        setShowSetupGuide(true);
      }
    } finally {
      setAuthBusy(false);
    }
  };

  const handlePasswordReset = async () => {
    clearAuthNotices();
    const cleanedEmail = emailInput.trim();
    if (!cleanedEmail || !cleanedEmail.includes('@')) {
      setAuthError(
        isHi
          ? 'पासवर्ड रीसेट के लिए पहले ऊपर अपना ईमेल लिखें।'
          : 'Enter your email address above first to receive a password reset link.'
      );
      return;
    }
    setAuthBusy(true);
    try {
      await sendPasswordResetEmail(auth, cleanedEmail);
      setAuthSuccess(
        isHi
          ? 'पासवर्ड रीसेट ईमेल भेज दिया गया है।'
          : 'Password reset link sent to your email.'
      );
    } catch (err) {
      const formatted = formatFirebaseAuthError(err, isHi);
      setAuthError(formatted.message);
      if (formatted.needsConsoleSetup) setShowSetupGuide(true);
    } finally {
      setAuthBusy(false);
    }
  };

  const handleSendPhoneOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    clearAuthNotices();

    const cleanedPhone = phoneInput.replace(/[\s()-]/g, '');
    const normalizedPhone = cleanedPhone.startsWith('+') ? cleanedPhone : `+${cleanedPhone}`;
    if (!/^\+[1-9]\d{6,14}$/.test(normalizedPhone)) {
      setAuthError(
        isHi
          ? 'देश कोड के साथ फ़ोन नंबर लिखें (जैसे +919876543210 या +15551234567)।'
          : 'Enter a phone number with country code (e.g. +15551234567 or +919876543210).'
      );
      return;
    }

    if (!recaptchaContainerRef.current) {
      setAuthError('Security check container is not ready. Please try again.');
      return;
    }

    setAuthBusy(true);
    try {
      if (recaptchaVerifierRef.current) {
        try {
          recaptchaVerifierRef.current.clear();
        } catch {
          // ignore
        }
        recaptchaVerifierRef.current = null;
      }

      const verifier = new RecaptchaVerifier(auth, recaptchaContainerRef.current, {
        size: 'invisible',
      });
      recaptchaVerifierRef.current = verifier;

      const result = await signInWithPhoneNumber(auth, normalizedPhone, verifier);
      setConfirmationResult(result);
      setPhoneInput(normalizedPhone);
      setAuthSuccess(
        isHi
          ? `${normalizedPhone} पर 6-अंकीय OTP कोड भेजा गया है।`
          : `6-digit SMS code sent to ${normalizedPhone}.`
      );
    } catch (err) {
      const formatted = formatFirebaseAuthError(err, isHi);
      setAuthError(formatted.message);
      if (formatted.needsConsoleSetup) {
        setShowSetupGuide(true);
      }
      if (recaptchaVerifierRef.current) {
        try {
          recaptchaVerifierRef.current.clear();
        } catch {
          // ignore
        }
        recaptchaVerifierRef.current = null;
      }
    } finally {
      setAuthBusy(false);
    }
  };

  const handleVerifyPhoneOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    clearAuthNotices();
    if (!confirmationResult) return;

    const code = otpInput.trim();
    if (code.length < 6) {
      setAuthError(isHi ? '6-अंकीय SMS कोड लिखें।' : 'Enter the 6-digit SMS code.');
      return;
    }

    setAuthBusy(true);
    try {
      const cred = await confirmationResult.confirm(code);
      const preferred = accountUsername.trim()
        ? sanitizeUsername(accountUsername)
        : undefined;
      if (preferred) {
        try {
          await updateProfile(cred.user, { displayName: preferred });
        } catch {
          // non-fatal
        }
      }
      await onCloudAuthenticated(cred.user, preferred);
      setConfirmationResult(null);
      setOtpInput('');
      setAuthSuccess(isHi ? 'फ़ोन खाता सत्यापित और लॉगिन हो गया!' : 'Phone account verified and signed in!');
    } catch (err) {
      const formatted = formatFirebaseAuthError(err, isHi);
      setAuthError(formatted.message);
    } finally {
      setAuthBusy(false);
    }
  };

  const handleAppleSignIn = async () => {
    clearAuthNotices();
    setAuthBusy(true);
    try {
      const cred = await signInWithPopup(auth, appleProvider);
      const preferred = accountUsername.trim()
        ? sanitizeUsername(accountUsername)
        : undefined;
      await onCloudAuthenticated(cred.user, preferred);
      setAuthSuccess(isHi ? 'Apple ID से लॉगिन सफल!' : 'Signed in with Apple ID!');
    } catch (err) {
      const formatted = formatFirebaseAuthError(err, isHi);
      setAuthError(formatted.message);
      if (formatted.needsConsoleSetup) {
        setShowSetupGuide(true);
      }
    } finally {
      setAuthBusy(false);
    }
  };

  const handleGoogleSignIn = async () => {
    clearAuthNotices();
    setAuthBusy(true);
    try {
      const cred = await signInWithPopup(auth, googleProvider);
      const preferred = accountUsername.trim()
        ? sanitizeUsername(accountUsername)
        : undefined;
      await onCloudAuthenticated(cred.user, preferred);
      setAuthSuccess(isHi ? 'Google खाते से लॉगिन सफल!' : 'Signed in with Google!');
    } catch (err) {
      const formatted = formatFirebaseAuthError(err, isHi);
      setAuthError(formatted.message);
      if (formatted.needsConsoleSetup) {
        setShowSetupGuide(true);
      }
    } finally {
      setAuthBusy(false);
    }
  };

  const handleResendVerification = async () => {
    if (!authUser) return;
    clearAuthNotices();
    setAuthBusy(true);
    try {
      await sendEmailVerification(authUser);
      setAuthSuccess(
        isHi ? 'नया वेरिफिकेशन ईमेल भेज दिया गया है।' : 'Verification email resent! Check your inbox.'
      );
    } catch (err) {
      const formatted = formatFirebaseAuthError(err, isHi);
      setAuthError(formatted.message);
    } finally {
      setAuthBusy(false);
    }
  };

  const handleSignOut = async () => {
    clearAuthNotices();
    setAuthBusy(true);
    try {
      await signOut(auth);
      setEditingCloudProfile(false);
      setConfirmationResult(null);
      setAuthSuccess(isHi ? 'आप साइन आउट हो गए हैं।' : 'Signed out. Local profiles remain active.');
    } catch (err) {
      const formatted = formatFirebaseAuthError(err, isHi);
      setAuthError(formatted.message);
    } finally {
      setAuthBusy(false);
    }
  };

  const handleSaveCloudProfileEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    clearAuthNotices();
    const cleaned = cloudNameDraft.trim();
    if (cleaned.length < 2) {
      setAuthError(
        isHi
          ? 'कम से कम 2 अक्षरों का यूज़रनेम लिखें।'
          : 'Please enter a username with at least 2 characters.'
      );
      return;
    }
    setAuthBusy(true);
    try {
      await onUpdateCloudProfile(cleaned.slice(0, 24), cloudIconDraft, cloudThemeDraft);
      setEditingCloudProfile(false);
      setAuthSuccess(isHi ? 'क्लाउड प्रोफ़ाइल अपडेट हो गया!' : 'Cloud profile updated!');
    } catch (err) {
      const formatted = formatFirebaseAuthError(err, isHi);
      setAuthError(formatted.message);
    } finally {
      setAuthBusy(false);
    }
  };

  // Local profile helpers
  const openCreateForm = () => {
    setLocalMode('create');
    setEditingId(null);
    setUsernameInput('');
    setSelectedIcon('rocket');
    setSelectedTheme('sky');
    setLocalErrorMsg('');
  };

  const openEditForm = (profile: UserProfile) => {
    setLocalMode('edit');
    setEditingId(profile.id);
    setUsernameInput(profile.username);
    setSelectedIcon(profile.avatarIcon);
    setSelectedTheme(profile.avatarTheme);
    setLocalErrorMsg('');
  };

  const handleLocalSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const cleaned = usernameInput.trim();
    if (cleaned.length < 2) {
      setLocalErrorMsg(
        isHi
          ? 'कम से कम 2 अक्षरों का यूज़रनेम लिखें।'
          : 'Please enter a username with at least 2 characters.'
      );
      return;
    }
    const duplicate = profiles.some(
      (p) => p.username.toLowerCase() === cleaned.toLowerCase() && p.id !== editingId
    );
    if (duplicate) {
      setLocalErrorMsg(
        isHi
          ? 'यह यूज़रनेम पहले से मौजूद है — कृपया दूसरा नाम चुनें।'
          : 'That username already exists — please pick a different one.'
      );
      return;
    }
    if (localMode === 'edit' && editingId) {
      onUpdateProfile(editingId, cleaned, selectedIcon, selectedTheme);
    } else {
      onCreateProfile(cleaned, selectedIcon, selectedTheme);
    }
    setLocalMode('list');
    setLocalErrorMsg('');
  };

  const activeCloudTheme =
    AVATAR_THEMES[cloudProfile?.avatarTheme || 'sky'] || AVATAR_THEMES.sky;
  const authProviderName = authUser ? detectAuthProvider(authUser) : null;
  const currentHostname =
    typeof window !== 'undefined' ? window.location.hostname : 'localhost';

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/45 p-4 backdrop-blur-sm"
      role="dialog"
      aria-modal="true"
      aria-labelledby="profile-modal-title"
      onClick={onClose}
    >
      <div
        className="w-full max-w-lg rounded-2xl border border-white/75 bg-white/85 p-6 shadow-2xl backdrop-blur-xl space-y-5 max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="flex items-start justify-between gap-3">
          <div>
            <h3 id="profile-modal-title" className="text-lg font-bold text-slate-900">
              {isHi ? 'HARRBOTIX खाता और प्रोफ़ाइल' : 'HARRBOTIX Account & Profiles'}
            </h3>
            <p className="text-xs text-slate-600 mt-0.5">
              {isHi
                ? 'ईमेल, फ़ोन नंबर या Apple ID से खाता बनाएँ, या ऑफलाइन लोकल प्रोफ़ाइल चुनें।'
                : 'Create an account with Email, Phone Number, or Apple ID, or switch offline profiles.'}
            </p>
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

        {/* Top-Level Tab Switcher */}
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => {
              setActiveTab('account');
              clearAuthNotices();
            }}
            className={`inline-flex flex-1 items-center justify-center gap-1.5 rounded-full border px-4 py-2 text-xs font-semibold backdrop-blur-md transition-all duration-200 hover:-translate-y-0.5 active:scale-95 ${
              activeTab === 'account'
                ? 'border-sky-400/80 bg-sky-500/20 text-sky-950 shadow-sm'
                : 'border-white/80 bg-white/35 text-slate-700 hover:bg-white/65'
            }`}
          >
            <Cloud className="h-3.5 w-3.5" aria-hidden="true" />
            <span>{isHi ? 'क्लाउड खाता' : 'Account (Email · Phone · Apple)'}</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('profiles')}
            className={`inline-flex items-center justify-center gap-1.5 rounded-full border px-4 py-2 text-xs font-semibold backdrop-blur-md transition-all duration-200 hover:-translate-y-0.5 active:scale-95 whitespace-nowrap ${
              activeTab === 'profiles'
                ? 'border-sky-400/80 bg-sky-500/20 text-sky-950 shadow-sm'
                : 'border-white/80 bg-white/35 text-slate-700 hover:bg-white/65'
            }`}
          >
            <Users className="h-3.5 w-3.5" aria-hidden="true" />
            <span>{isHi ? 'लोकल प्रोफ़ाइल' : 'Local Profiles'}</span>
          </button>
        </div>

        {activeTab === 'account' ? (
          <div className="space-y-4">
            {authError && (
              <div
                role="alert"
                className="rounded-xl border border-rose-300/80 bg-rose-500/10 px-3.5 py-2.5 text-xs font-medium text-rose-900"
              >
                {authError}
              </div>
            )}

            {authSuccess && (
              <div
                role="status"
                className="rounded-xl border border-emerald-300/80 bg-emerald-500/15 px-3.5 py-2.5 text-xs font-medium text-emerald-900 flex items-center gap-2"
              >
                <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0" aria-hidden="true" />
                <span>{authSuccess}</span>
              </div>
            )}

            {authUser ? (
              /* SIGNED-IN CLOUD ACCOUNT VIEW */
              <div className="space-y-4">
                <div className="rounded-2xl border border-sky-300/75 bg-sky-500/10 p-4 backdrop-blur-md space-y-3">
                  <div className="flex items-center justify-between gap-3">
                    <div className="flex items-center gap-3 min-w-0">
                      <span
                        className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-full border ${activeCloudTheme.ring} ${activeCloudTheme.bg} ${activeCloudTheme.text}`}
                      >
                        <ProfileAvatarIcon
                          icon={cloudProfile?.avatarIcon || 'bot'}
                          className="h-5 w-5"
                        />
                      </span>
                      <div className="min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="truncate text-sm font-bold text-slate-900">
                            {cloudProfile?.username ||
                              authUser.displayName ||
                              'HARRBOTIX Builder'}
                          </span>
                          <span className="text-[11px] font-semibold text-sky-800 uppercase">
                            {authProviderName}
                          </span>
                        </div>
                        <p className="truncate text-xs text-slate-600">
                          {authUser.email || authUser.phoneNumber || authUser.uid}
                        </p>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => setEditingCloudProfile((v) => !v)}
                      aria-label={isHi ? 'प्रोफ़ाइल बदलें' : 'Edit display profile'}
                      className="rounded-full border border-white/80 bg-white/45 p-2 text-slate-700 backdrop-blur-md transition-all duration-200 hover:-translate-y-0.5 hover:bg-white/80 hover:text-sky-900 active:scale-95 shrink-0"
                    >
                      <Pencil className="h-3.5 w-3.5" aria-hidden="true" />
                    </button>
                  </div>

                  <div className="flex flex-wrap items-center justify-between gap-2 text-xs text-slate-600 tabular-nums pt-1 border-t border-white/60">
                    <span>
                      <strong className="text-slate-900">{cloudProfile?.xp ?? 0}</strong> XP
                    </span>
                    <span>
                      <strong className="text-slate-900">
                        {cloudProfile?.completedPracticals.length ?? 0}
                      </strong>{' '}
                      {isHi ? 'प्रैक्टिकल' : 'Practicals'}
                    </span>
                    <span className="inline-flex items-center gap-1 text-emerald-700 font-semibold">
                      <ShieldCheck className="h-3.5 w-3.5" aria-hidden="true" />
                      {isHi ? 'क्लाउड सिंक चालू' : 'Cloud Synced'}
                    </span>
                  </div>
                </div>

                {authUser.email && !authUser.emailVerified && authProviderName === 'email' && (
                  <div className="flex flex-wrap items-center justify-between gap-2 rounded-xl border border-amber-300/80 bg-amber-500/10 px-3.5 py-2.5 text-xs text-amber-950">
                    <span>
                      {isHi
                        ? 'ईमेल अभी सत्यापित नहीं है — कृपया अपना इनबॉक्स जाँचें।'
                        : 'Email not verified yet — check your inbox for the verification link.'}
                    </span>
                    <button
                      type="button"
                      disabled={authBusy}
                      onClick={handleResendVerification}
                      className="rounded-full border border-amber-400/75 bg-amber-500/20 px-3 py-1 text-[11px] font-semibold text-amber-950 backdrop-blur-md transition-all duration-200 hover:-translate-y-0.5 hover:bg-amber-500/35 active:scale-95 disabled:opacity-50"
                    >
                      {isHi ? 'लिंक फिर भेजें' : 'Resend Link'}
                    </button>
                  </div>
                )}

                {editingCloudProfile && (
                  <form
                    onSubmit={handleSaveCloudProfileEdit}
                    className="space-y-3 rounded-2xl border border-white/75 bg-white/55 p-4 backdrop-blur-md"
                  >
                    <label className="block space-y-1">
                      <span className="text-xs font-semibold text-slate-800">
                        {isHi ? 'डिस्प्ले यूज़रनेम' : 'Display Username'}
                      </span>
                      <input
                        type="text"
                        maxLength={24}
                        value={cloudNameDraft}
                        onChange={(e) => setCloudNameDraft(e.target.value)}
                        className="w-full rounded-full border border-slate-300/80 bg-white/80 px-4 py-2 text-sm text-slate-900 focus:border-sky-500 focus:bg-white focus:outline-none"
                      />
                    </label>

                    <div className="flex flex-wrap gap-1.5">
                      {ICON_OPTIONS.map((opt) => (
                        <button
                          key={opt.key}
                          type="button"
                          onClick={() => setCloudIconDraft(opt.key)}
                          className={`inline-flex items-center gap-1 rounded-full border px-3 py-1.5 text-xs font-semibold transition-all duration-200 hover:-translate-y-0.5 active:scale-95 ${
                            cloudIconDraft === opt.key
                              ? 'border-sky-400/80 bg-sky-500/20 text-sky-950'
                              : 'border-white/80 bg-white/40 text-slate-700 hover:bg-white/70'
                          }`}
                        >
                          <ProfileAvatarIcon icon={opt.key} className="h-3.5 w-3.5" />
                          <span>{opt.label}</span>
                        </button>
                      ))}
                    </div>

                    <div className="flex flex-wrap gap-1.5">
                      {(Object.keys(AVATAR_THEMES) as AvatarTheme[]).map((themeKey) => {
                        const theme = AVATAR_THEMES[themeKey];
                        return (
                          <button
                            key={themeKey}
                            type="button"
                            onClick={() => setCloudThemeDraft(themeKey)}
                            className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-semibold transition-all duration-200 hover:-translate-y-0.5 active:scale-95 ${
                              cloudThemeDraft === themeKey
                                ? `${theme.ring} ${theme.bg} ${theme.text}`
                                : 'border-white/80 bg-white/40 text-slate-700 hover:bg-white/70'
                            }`}
                          >
                            <span
                              className={`h-2.5 w-2.5 rounded-full border ${theme.ring} ${theme.bg}`}
                              aria-hidden="true"
                            />
                            <span>{theme.label}</span>
                          </button>
                        );
                      })}
                    </div>

                    <div className="flex justify-end gap-2 pt-1">
                      <button
                        type="button"
                        onClick={() => setEditingCloudProfile(false)}
                        className="rounded-full border border-white/80 bg-white/35 px-4 py-1.5 text-xs font-semibold text-slate-800 hover:bg-white/70 transition-all duration-200 active:scale-95"
                      >
                        {isHi ? 'रद्द करें' : 'Cancel'}
                      </button>
                      <button
                        type="submit"
                        disabled={authBusy}
                        className="inline-flex items-center gap-1.5 rounded-full border border-emerald-400/75 bg-emerald-500/20 px-4 py-1.5 text-xs font-semibold text-emerald-950 hover:bg-emerald-500/35 transition-all duration-200 active:scale-95 disabled:opacity-50"
                      >
                        <Check className="h-3.5 w-3.5" aria-hidden="true" />
                        <span>{isHi ? 'सहेजें' : 'Save'}</span>
                      </button>
                    </div>
                  </form>
                )}

                <div className="flex items-center justify-between gap-3 pt-1">
                  <button
                    type="button"
                    disabled={authBusy}
                    onClick={handleSignOut}
                    className="inline-flex items-center gap-1.5 rounded-full border border-rose-400/75 bg-rose-500/15 px-4 py-2 text-xs font-semibold text-rose-900 backdrop-blur-md transition-all duration-200 hover:-translate-y-0.5 hover:bg-rose-500/30 hover:shadow-sm active:scale-95 disabled:opacity-50"
                  >
                    <LogOut className="h-3.5 w-3.5" aria-hidden="true" />
                    <span>{isHi ? 'साइन आउट' : 'Sign Out'}</span>
                  </button>
                  <button
                    type="button"
                    onClick={onClose}
                    className="rounded-full border border-white/80 bg-white/35 px-5 py-2 text-xs font-semibold text-slate-800 backdrop-blur-md transition-all duration-200 hover:-translate-y-0.5 hover:bg-white/70 active:scale-95"
                  >
                    {isHi ? 'तैयार' : 'Done'}
                  </button>
                </div>
              </div>
            ) : (
              /* SIGN UP / SIGN IN VIEW (EMAIL, PHONE NUMBER, APPLE ID, GOOGLE) */
              <div className="space-y-4">
                {/* Method Selector Pills */}
                <div className="grid grid-cols-3 gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      setAuthMethod('email');
                      clearAuthNotices();
                    }}
                    className={`inline-flex items-center justify-center gap-1.5 rounded-full border px-3 py-2 text-xs font-semibold backdrop-blur-md transition-all duration-200 hover:-translate-y-0.5 active:scale-95 ${
                      authMethod === 'email'
                        ? 'border-sky-400/80 bg-sky-500/20 text-sky-950 shadow-sm'
                        : 'border-white/80 bg-white/35 text-slate-700 hover:bg-white/65'
                    }`}
                  >
                    <Mail className="h-3.5 w-3.5" aria-hidden="true" />
                    <span>{isHi ? 'ईमेल' : 'Email'}</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setAuthMethod('phone');
                      clearAuthNotices();
                    }}
                    className={`inline-flex items-center justify-center gap-1.5 rounded-full border px-3 py-2 text-xs font-semibold backdrop-blur-md transition-all duration-200 hover:-translate-y-0.5 active:scale-95 ${
                      authMethod === 'phone'
                        ? 'border-emerald-400/80 bg-emerald-500/20 text-emerald-950 shadow-sm'
                        : 'border-white/80 bg-white/35 text-slate-700 hover:bg-white/65'
                    }`}
                  >
                    <Phone className="h-3.5 w-3.5" aria-hidden="true" />
                    <span>{isHi ? 'फ़ोन' : 'Phone'}</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setAuthMethod('apple');
                      clearAuthNotices();
                    }}
                    className={`inline-flex items-center justify-center gap-1.5 rounded-full border px-3 py-2 text-xs font-semibold backdrop-blur-md transition-all duration-200 hover:-translate-y-0.5 active:scale-95 ${
                      authMethod === 'apple'
                        ? 'border-slate-700/80 bg-slate-900/15 text-slate-950 shadow-sm'
                        : 'border-white/80 bg-white/35 text-slate-700 hover:bg-white/65'
                    }`}
                  >
                    <AppleLogoSvg className="h-3.5 w-3.5" />
                    <span>Apple ID</span>
                  </button>
                </div>

                {/* EMAIL FORM */}
                {authMethod === 'email' && (
                  <form onSubmit={handleEmailSubmit} className="space-y-3">
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => {
                          setEmailFlow('signup');
                          clearAuthNotices();
                        }}
                        className={`rounded-full border px-3.5 py-1 text-[11px] font-semibold transition-all duration-200 active:scale-95 ${
                          emailFlow === 'signup'
                            ? 'border-sky-400/80 bg-sky-500/20 text-sky-950'
                            : 'border-white/80 bg-white/35 text-slate-600 hover:bg-white/65'
                        }`}
                      >
                        {isHi ? 'नया खाता बनाएँ' : 'Create Account'}
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setEmailFlow('signin');
                          clearAuthNotices();
                        }}
                        className={`rounded-full border px-3.5 py-1 text-[11px] font-semibold transition-all duration-200 active:scale-95 ${
                          emailFlow === 'signin'
                            ? 'border-sky-400/80 bg-sky-500/20 text-sky-950'
                            : 'border-white/80 bg-white/35 text-slate-600 hover:bg-white/65'
                        }`}
                      >
                        {isHi ? 'साइन इन करें' : 'Sign In'}
                      </button>
                    </div>

                    {emailFlow === 'signup' && (
                      <label className="block space-y-1">
                        <span className="text-xs font-semibold text-slate-800">
                          {isHi ? 'यूज़रनेम (वैकल्पिक)' : 'Username (optional)'}
                        </span>
                        <input
                          type="text"
                          maxLength={24}
                          value={accountUsername}
                          onChange={(e) => setAccountUsername(e.target.value)}
                          placeholder="e.g. robo_alex"
                          className="w-full rounded-full border border-slate-300/80 bg-white/80 px-4 py-2 text-sm text-slate-900 focus:border-sky-500 focus:bg-white focus:outline-none"
                        />
                      </label>
                    )}

                    <label className="block space-y-1">
                      <span className="text-xs font-semibold text-slate-800">
                        {isHi ? 'ईमेल पता' : 'Email Address'}
                      </span>
                      <input
                        type="email"
                        required
                        value={emailInput}
                        onChange={(e) => setEmailInput(e.target.value)}
                        placeholder="you@example.com"
                        className="w-full rounded-full border border-slate-300/80 bg-white/80 px-4 py-2 text-sm text-slate-900 focus:border-sky-500 focus:bg-white focus:outline-none"
                      />
                    </label>

                    <label className="block space-y-1">
                      <span className="text-xs font-semibold text-slate-800">
                        {isHi ? 'पासवर्ड' : 'Password'}
                      </span>
                      <div className="relative">
                        <input
                          type={showPassword ? 'text' : 'password'}
                          required
                          minLength={6}
                          value={passwordInput}
                          onChange={(e) => setPasswordInput(e.target.value)}
                          placeholder={isHi ? 'कम से कम 6 अक्षर' : 'At least 6 characters'}
                          className="w-full rounded-full border border-slate-300/80 bg-white/80 px-4 py-2 pr-10 text-sm text-slate-900 focus:border-sky-500 focus:bg-white focus:outline-none"
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword((v) => !v)}
                          aria-label={showPassword ? 'Hide password' : 'Show password'}
                          className="absolute right-2.5 top-1/2 -translate-y-1/2 rounded-full p-1 text-slate-500 hover:text-slate-800"
                        >
                          {showPassword ? (
                            <EyeOff className="h-4 w-4" aria-hidden="true" />
                          ) : (
                            <Eye className="h-4 w-4" aria-hidden="true" />
                          )}
                        </button>
                      </div>
                    </label>

                    <div className="flex flex-wrap items-center justify-between gap-2 pt-1">
                      {emailFlow === 'signin' ? (
                        <button
                          type="button"
                          disabled={authBusy}
                          onClick={handlePasswordReset}
                          className="rounded-full border border-white/75 bg-white/30 px-3 py-1.5 text-[11px] font-semibold text-slate-700 hover:bg-white/65 transition-all duration-200 active:scale-95"
                        >
                          {isHi ? 'पासवर्ड भूल गए?' : 'Forgot password?'}
                        </button>
                      ) : (
                        <span className="text-[11px] text-slate-500">
                          {isHi ? 'मुफ़्त और सुरक्षित क्लाउड सिंक' : 'Free cloud progress sync'}
                        </span>
                      )}

                      <button
                        type="submit"
                        disabled={authBusy}
                        className="inline-flex items-center gap-1.5 rounded-full border border-sky-400/75 bg-sky-500/20 px-5 py-2 text-xs font-semibold text-sky-950 backdrop-blur-md shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:bg-sky-500/35 hover:border-sky-500 hover:shadow-[0_6px_18px_rgba(2,132,199,0.24)] active:scale-95 disabled:opacity-50"
                      >
                        <Mail className="h-3.5 w-3.5" aria-hidden="true" />
                        <span>
                          {authBusy
                            ? isHi
                              ? 'प्रतीक्षा करें...'
                              : 'Please wait...'
                            : emailFlow === 'signup'
                            ? isHi
                              ? 'ईमेल से खाता बनाएँ'
                              : 'Create Email Account'
                            : isHi
                            ? 'ईमेल से साइन इन'
                            : 'Sign In with Email'}
                        </span>
                      </button>
                    </div>
                  </form>
                )}

                {/* PHONE NUMBER FORM */}
                {authMethod === 'phone' && (
                  <div className="space-y-3">
                    {!confirmationResult ? (
                      <form onSubmit={handleSendPhoneOtp} className="space-y-3">
                        <label className="block space-y-1">
                          <span className="text-xs font-semibold text-slate-800">
                            {isHi ? 'यूज़रनेम (वैकल्पिक)' : 'Username (optional)'}
                          </span>
                          <input
                            type="text"
                            maxLength={24}
                            value={accountUsername}
                            onChange={(e) => setAccountUsername(e.target.value)}
                            placeholder="e.g. rover_kid"
                            className="w-full rounded-full border border-slate-300/80 bg-white/80 px-4 py-2 text-sm text-slate-900 focus:border-emerald-500 focus:bg-white focus:outline-none"
                          />
                        </label>

                        <div className="space-y-1.5">
                          <div className="flex items-center justify-between gap-2">
                            <span className="text-xs font-semibold text-slate-800">
                              {isHi ? 'फ़ोन नंबर (देश कोड सहित)' : 'Phone Number (with country code)'}
                            </span>
                            <div className="flex items-center gap-1">
                              {['+1', '+91', '+44', '+61'].map((cc) => (
                                <button
                                  key={cc}
                                  type="button"
                                  onClick={() => {
                                    const stripped = phoneInput.replace(/^\+\d{1,3}/, '');
                                    setPhoneInput(`${cc}${stripped}`);
                                  }}
                                  className="rounded-full border border-white/80 bg-white/40 px-2 py-0.5 text-[10px] font-semibold text-slate-700 hover:bg-white/75 transition-all"
                                >
                                  {cc}
                                </button>
                              ))}
                            </div>
                          </div>
                          <input
                            type="tel"
                            required
                            value={phoneInput}
                            onChange={(e) => setPhoneInput(e.target.value)}
                            placeholder="+15551234567"
                            className="w-full rounded-full border border-slate-300/80 bg-white/80 px-4 py-2 text-sm text-slate-900 focus:border-emerald-500 focus:bg-white focus:outline-none"
                          />
                        </div>

                        <div id="harrbotix-recaptcha-container" ref={recaptchaContainerRef} />

                        <div className="flex justify-end pt-1">
                          <button
                            type="submit"
                            disabled={authBusy}
                            className="inline-flex items-center gap-1.5 rounded-full border border-emerald-400/75 bg-emerald-500/20 px-5 py-2 text-xs font-semibold text-emerald-950 backdrop-blur-md shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:bg-emerald-500/35 hover:border-emerald-500 hover:shadow-[0_6px_18px_rgba(5,150,105,0.24)] active:scale-95 disabled:opacity-50"
                          >
                            <Phone className="h-3.5 w-3.5" aria-hidden="true" />
                            <span>
                              {authBusy
                                ? isHi
                                  ? 'कोड भेजा जा रहा है...'
                                  : 'Sending SMS...'
                                : isHi
                                ? 'SMS OTP कोड भेजें'
                                : 'Send Verification Code'}
                            </span>
                          </button>
                        </div>
                      </form>
                    ) : (
                      <form onSubmit={handleVerifyPhoneOtp} className="space-y-3">
                        <label className="block space-y-1">
                          <span className="text-xs font-semibold text-slate-800">
                            {isHi
                              ? `${phoneInput} पर आया 6-अंकीय कोड लिखें`
                              : `Enter 6-digit SMS code sent to ${phoneInput}`}
                          </span>
                          <input
                            type="text"
                            inputMode="numeric"
                            autoFocus
                            maxLength={6}
                            value={otpInput}
                            onChange={(e) => setOtpInput(e.target.value.replace(/\D/g, ''))}
                            placeholder="123456"
                            className="w-full rounded-full border border-slate-300/80 bg-white/80 px-4 py-2 text-center text-base font-mono tracking-widest text-slate-900 focus:border-emerald-500 focus:bg-white focus:outline-none"
                          />
                        </label>

                        <div className="flex flex-wrap items-center justify-between gap-2">
                          <button
                            type="button"
                            onClick={() => {
                              setConfirmationResult(null);
                              setOtpInput('');
                              clearAuthNotices();
                            }}
                            className="rounded-full border border-white/80 bg-white/35 px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-white/70 transition-all duration-200 active:scale-95"
                          >
                            {isHi ? 'नंबर बदलें' : 'Change Number'}
                          </button>
                          <button
                            type="submit"
                            disabled={authBusy}
                            className="inline-flex items-center gap-1.5 rounded-full border border-emerald-400/75 bg-emerald-500/20 px-5 py-2 text-xs font-semibold text-emerald-950 backdrop-blur-md shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:bg-emerald-500/35 active:scale-95 disabled:opacity-50"
                          >
                            <Check className="h-3.5 w-3.5" aria-hidden="true" />
                            <span>
                              {authBusy
                                ? isHi
                                  ? 'सत्यापित हो रहा है...'
                                  : 'Verifying...'
                                : isHi
                                ? 'कोड सत्यापित करें'
                                : 'Verify & Create Account'}
                            </span>
                          </button>
                        </div>
                      </form>
                    )}
                  </div>
                )}

                {/* APPLE ID SIGN-IN / CREATE ACCOUNT */}
                {authMethod === 'apple' && (
                  <div className="space-y-3 rounded-2xl border border-white/75 bg-white/50 p-4 backdrop-blur-md">
                    <label className="block space-y-1">
                      <span className="text-xs font-semibold text-slate-800">
                        {isHi ? 'यूज़रनेम (वैकल्पिक)' : 'Display Username (optional)'}
                      </span>
                      <input
                        type="text"
                        maxLength={24}
                        value={accountUsername}
                        onChange={(e) => setAccountUsername(e.target.value)}
                        placeholder="e.g. apple_inventor"
                        className="w-full rounded-full border border-slate-300/80 bg-white/80 px-4 py-2 text-sm text-slate-900 focus:border-slate-500 focus:bg-white focus:outline-none"
                      />
                    </label>

                    <p className="text-xs leading-relaxed text-slate-600">
                      {isHi
                        ? 'अपने Apple ID से एक क्लिक में HARRBOTIX खाता बनाएँ या साइन इन करें।'
                        : 'Create or sign in to your HARRBOTIX account with your Apple ID in one click.'}
                    </p>

                    <button
                      type="button"
                      disabled={authBusy}
                      onClick={handleAppleSignIn}
                      className="w-full inline-flex items-center justify-center gap-2 rounded-full border border-slate-800/75 bg-slate-900/85 px-5 py-2.5 text-xs font-semibold text-white backdrop-blur-md shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:bg-slate-900 hover:shadow-[0_8px_22px_rgba(15,23,42,0.28)] active:scale-95 disabled:opacity-50"
                    >
                      <AppleLogoSvg className="h-4 w-4" />
                      <span>
                        {authBusy
                          ? isHi
                            ? 'Apple खुल रहा है...'
                            : 'Connecting Apple ID...'
                          : isHi
                          ? 'Apple ID के साथ जारी रखें'
                          : 'Continue with Apple'}
                      </span>
                    </button>
                  </div>
                )}

                {/* Divider + Quick Google Option */}
                <div className="flex items-center gap-3">
                  <div className="h-px flex-1 bg-slate-300/60" />
                  <span className="text-[11px] font-medium text-slate-500">
                    {isHi ? 'या' : 'or'}
                  </span>
                  <div className="h-px flex-1 bg-slate-300/60" />
                </div>

                <button
                  type="button"
                  disabled={authBusy}
                  onClick={handleGoogleSignIn}
                  className="w-full inline-flex items-center justify-center gap-2 rounded-full border border-white/80 bg-white/40 px-4 py-2 text-xs font-semibold text-slate-800 backdrop-blur-md shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:border-sky-300/80 hover:bg-white/75 active:scale-95 disabled:opacity-50"
                >
                  <span>{isHi ? 'Google खाते से जारी रखें' : 'Continue with Google'}</span>
                </button>

                {/* Collapsible Firebase Console Provider Setup Guide */}
                <div className="rounded-xl border border-white/75 bg-white/45 p-3 backdrop-blur-sm">
                  <button
                    type="button"
                    onClick={() => setShowSetupGuide((v) => !v)}
                    className="flex w-full items-center justify-between gap-2 text-left text-xs font-semibold text-slate-700 hover:text-sky-900"
                  >
                    <span>
                      {isHi
                        ? 'Firebase Console में Email / Phone / Apple कैसे चालू करें?'
                        : 'Firebase Console Setup (Enable Email, Phone & Apple ID)'}
                    </span>
                    {showSetupGuide ? (
                      <ChevronUp className="h-4 w-4 shrink-0" aria-hidden="true" />
                    ) : (
                      <ChevronDown className="h-4 w-4 shrink-0" aria-hidden="true" />
                    )}
                  </button>

                  {showSetupGuide && (
                    <div className="mt-2.5 space-y-2 border-t border-white/70 pt-2.5 text-[11px] leading-relaxed text-slate-600">
                      <p>
                        1. Open{' '}
                        <a
                          href={`https://console.firebase.google.com/project/${FIREBASE_PROJECT_ID}/authentication/providers`}
                          target="_blank"
                          rel="noreferrer"
                          className="inline-flex items-center gap-1 font-semibold text-sky-700 underline"
                        >
                          <span>Firebase Authentication → Sign-in method</span>
                          <ExternalLink className="h-3 w-3" aria-hidden="true" />
                        </a>
                      </p>
                      <p>
                        2. Enable <strong>Email/Password</strong>, <strong>Phone</strong> (for SMS OTP), and <strong>Apple</strong> (add your Apple Services ID, Team ID, Key ID, and private key, with callback{' '}
                        <code className="rounded bg-white/80 px-1 py-0.5 text-[10px] text-slate-800">
                          https://{FIREBASE_AUTH_DOMAIN}/__/auth/handler
                        </code>
                        ).
                      </p>
                      <p>
                        3. Under <strong>Authentication → Settings → Authorized domains</strong>, ensure{' '}
                        <code className="rounded bg-white/80 px-1 py-0.5 text-[10px] text-slate-800">
                          {currentHostname}
                        </code>{' '}
                        is listed so popup & SMS verification work.
                      </p>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        ) : localMode === 'list' ? (
          /* LOCAL OFFLINE PROFILES LIST */
          <>
            <div className="space-y-2.5">
              {profiles.map((prof) => {
                const isActive = !authUser && prof.id === activeProfileId;
                const theme = AVATAR_THEMES[prof.avatarTheme] || AVATAR_THEMES.sky;
                return (
                  <div
                    key={prof.id}
                    className={`flex items-center justify-between gap-3 rounded-2xl border p-3 backdrop-blur-md transition-all duration-200 ${
                      isActive
                        ? 'border-sky-400/80 bg-sky-500/15 shadow-sm'
                        : 'border-white/75 bg-white/45 hover:bg-white/70'
                    }`}
                  >
                    <button
                      type="button"
                      onClick={() => {
                        onSelectProfile(prof.id);
                        onClose();
                      }}
                      className="flex flex-1 items-center gap-3 text-left min-w-0 rounded-full py-1 px-1 transition-transform duration-200 hover:translate-x-0.5"
                    >
                      <span
                        className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full border ${theme.ring} ${theme.bg} ${theme.text}`}
                      >
                        <ProfileAvatarIcon icon={prof.avatarIcon} className="h-5 w-5" />
                      </span>
                      <div className="min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="truncate text-sm font-bold text-slate-900">
                            {prof.username}
                          </span>
                          {isActive && (
                            <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-sky-800">
                              <Check className="h-3.5 w-3.5 text-sky-600" aria-hidden="true" />
                              {isHi ? 'सक्रिय' : 'Active'}
                            </span>
                          )}
                        </div>
                        <div className="text-xs text-slate-600 tabular-nums">
                          <span>{prof.xp} XP</span>
                          <span aria-hidden="true"> · </span>
                          <span>
                            {prof.completedPracticals.length}{' '}
                            {isHi ? 'प्रैक्टिकल' : 'Practicals'}
                          </span>
                          <span aria-hidden="true"> · </span>
                          <span>
                            {prof.completedLessons.length} {isHi ? 'पाठ' : 'Lessons'}
                          </span>
                        </div>
                      </div>
                    </button>

                    <div className="flex items-center gap-1.5 shrink-0">
                      <button
                        type="button"
                        onClick={() => openEditForm(prof)}
                        aria-label={`Edit ${prof.username}`}
                        className="rounded-full border border-white/80 bg-white/35 p-2 text-slate-700 backdrop-blur-md transition-all duration-200 hover:-translate-y-0.5 hover:border-sky-300 hover:bg-white/75 hover:text-sky-900 hover:shadow-sm active:scale-95"
                      >
                        <Pencil className="h-3.5 w-3.5" aria-hidden="true" />
                      </button>
                      {profiles.length > 1 && (
                        <button
                          type="button"
                          onClick={() => onDeleteProfile(prof.id)}
                          aria-label={`Delete ${prof.username}`}
                          className="rounded-full border border-white/80 bg-white/35 p-2 text-slate-600 backdrop-blur-md transition-all duration-200 hover:-translate-y-0.5 hover:border-rose-300 hover:bg-rose-500/20 hover:text-rose-800 hover:shadow-sm active:scale-95"
                        >
                          <Trash2 className="h-3.5 w-3.5" aria-hidden="true" />
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="flex flex-wrap items-center justify-between gap-3 pt-1">
              <button
                type="button"
                onClick={openCreateForm}
                className="inline-flex items-center gap-2 rounded-full border border-sky-400/75 bg-sky-500/20 px-5 py-2.5 text-xs font-semibold text-sky-950 backdrop-blur-md shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:bg-sky-500/35 hover:border-sky-500 hover:shadow-[0_6px_18px_rgba(2,132,199,0.24)] active:scale-95"
              >
                <UserPlus className="h-4 w-4" aria-hidden="true" />
                <span>{isHi ? 'नया प्रोफ़ाइल बनाएँ' : 'Create Local Profile'}</span>
              </button>

              <button
                type="button"
                onClick={onClose}
                className="rounded-full border border-white/80 bg-white/30 px-4 py-2.5 text-xs font-semibold text-slate-800 backdrop-blur-md shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:border-sky-300/80 hover:bg-white/65 hover:shadow-sm active:scale-95"
              >
                {isHi ? 'तैयार' : 'Done'}
              </button>
            </div>
          </>
        ) : (
          /* LOCAL CREATE / EDIT PROFILE FORM */
          <form onSubmit={handleLocalSubmit} className="space-y-4">
            <label className="block space-y-1.5">
              <span className="text-xs font-semibold text-slate-800">
                {isHi ? 'यूज़रनेम (Username)' : 'Username'}
              </span>
              <input
                type="text"
                autoFocus
                maxLength={24}
                value={usernameInput}
                onChange={(e) => {
                  setUsernameInput(e.target.value);
                  if (localErrorMsg) setLocalErrorMsg('');
                }}
                placeholder={
                  isHi
                    ? 'अपना यूज़रनेम लिखें (जैसे Aarav_Bot)'
                    : 'Enter a username (e.g. robo_alex)'
                }
                className="w-full rounded-full border border-slate-300/80 bg-white/80 px-4 py-2.5 text-sm text-slate-900 backdrop-blur-sm focus:border-sky-500 focus:bg-white focus:outline-none"
              />
            </label>

            {localErrorMsg && (
              <p className="text-xs font-medium text-rose-700" role="alert">
                {localErrorMsg}
              </p>
            )}

            <div className="space-y-1.5">
              <span className="block text-xs font-semibold text-slate-800">
                {isHi ? 'अवतार आइकन चुनें' : 'Choose Avatar Icon'}
              </span>
              <div className="flex flex-wrap gap-2">
                {ICON_OPTIONS.map((opt) => (
                  <button
                    key={opt.key}
                    type="button"
                    onClick={() => setSelectedIcon(opt.key)}
                    className={`inline-flex items-center gap-1.5 rounded-full border px-3.5 py-2 text-xs font-semibold backdrop-blur-md transition-all duration-200 hover:-translate-y-0.5 active:scale-95 ${
                      selectedIcon === opt.key
                        ? 'border-sky-400/80 bg-sky-500/20 text-sky-950 shadow-sm'
                        : 'border-white/80 bg-white/35 text-slate-700 hover:bg-white/65'
                    }`}
                  >
                    <ProfileAvatarIcon icon={opt.key} className="h-3.5 w-3.5" />
                    <span>{opt.label}</span>
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-1.5">
              <span className="block text-xs font-semibold text-slate-800">
                {isHi ? 'रंग चुनें' : 'Choose Badge Color'}
              </span>
              <div className="flex flex-wrap gap-2">
                {(Object.keys(AVATAR_THEMES) as AvatarTheme[]).map((themeKey) => {
                  const theme = AVATAR_THEMES[themeKey];
                  return (
                    <button
                      key={themeKey}
                      type="button"
                      onClick={() => setSelectedTheme(themeKey)}
                      className={`inline-flex items-center gap-1.5 rounded-full border px-3.5 py-1.5 text-xs font-semibold backdrop-blur-md transition-all duration-200 hover:-translate-y-0.5 active:scale-95 ${
                        selectedTheme === themeKey
                          ? `${theme.ring} ${theme.bg} ${theme.text} shadow-sm`
                          : 'border-white/80 bg-white/35 text-slate-700 hover:bg-white/65'
                      }`}
                    >
                      <span
                        className={`h-2.5 w-2.5 rounded-full border ${theme.ring} ${theme.bg}`}
                        aria-hidden="true"
                      />
                      <span>{theme.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="flex flex-wrap items-center justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => {
                  setLocalMode('list');
                  setLocalErrorMsg('');
                }}
                className="rounded-full border border-white/80 bg-white/30 px-4 py-2 text-xs font-semibold text-slate-800 backdrop-blur-md shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:bg-white/65 active:scale-95"
              >
                {isHi ? 'वापस' : 'Cancel'}
              </button>
              <button
                type="submit"
                className="inline-flex items-center gap-1.5 rounded-full border border-emerald-400/75 bg-emerald-500/20 px-5 py-2 text-xs font-semibold text-emerald-950 backdrop-blur-md shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:bg-emerald-500/35 hover:border-emerald-500 hover:shadow-[0_6px_18px_rgba(5,150,105,0.24)] active:scale-95"
              >
                <Check className="h-3.5 w-3.5" aria-hidden="true" />
                <span>
                  {localMode === 'edit'
                    ? isHi
                      ? 'बदलाव सहेजें'
                      : 'Save Changes'
                    : isHi
                    ? 'प्रोफ़ाइल बनाएँ'
                    : 'Create Profile'}
                </span>
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};
