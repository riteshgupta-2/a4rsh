import { User } from 'firebase/auth';
import {
  doc,
  getDoc,
  serverTimestamp,
  updateDoc,
  writeBatch,
} from 'firebase/firestore';
import { CodeBlock, DEFAULT_BLOCKS } from '../data/codingData';
import { db, handleFirestoreError, OperationType } from '../firebase';
import { AvatarIconKey, AvatarTheme, UserProfile } from '../utils/profileStorage';

export type CloudAuthProvider = 'email' | 'phone' | 'apple' | 'google';

export interface CloudUserProgress {
  uid: string;
  username: string;
  avatarIcon: AvatarIconKey;
  avatarTheme: AvatarTheme;
  xp: number;
  completedPracticals: string[];
  completedLessons: string[];
  blocks: CodeBlock[];
}

const VALID_ICONS: AvatarIconKey[] = ['bot', 'cpu', 'rocket', 'compass', 'code'];
const VALID_THEMES: AvatarTheme[] = ['sky', 'emerald', 'amber', 'violet', 'rose'];

export function sanitizeUsername(raw: string | null | undefined, fallback = 'Young Inventor'): string {
  const cleaned = (raw || '').trim().replace(/\s+/g, ' ').slice(0, 24);
  if (cleaned.length >= 2) return cleaned;
  return fallback;
}

export function sanitizeBlocksForCloud(blocks: CodeBlock[]): CodeBlock[] {
  return blocks.slice(0, 100).map((b, index) => {
    const base: CodeBlock = {
      uid: String(b.uid || `b_${index}`).slice(0, 64),
      type: b.type,
    };
    if (typeof b.param === 'string') {
      base.param = b.param.slice(0, 128);
    } else if (typeof b.param === 'number' && Number.isFinite(b.param)) {
      base.param = b.param;
    }
    return base;
  });
}

export function sanitizeIdArray(items: string[], maxLen = 50): string[] {
  return Array.from(new Set(items))
    .filter((s) => typeof s === 'string' && s.trim().length > 0)
    .map((s) => s.trim().slice(0, 64))
    .slice(0, maxLen);
}

export function detectAuthProvider(user: User): CloudAuthProvider {
  const providerIds = user.providerData.map((p) => p.providerId);
  if (providerIds.includes('apple.com')) return 'apple';
  if (providerIds.includes('phone') || Boolean(user.phoneNumber && !user.email)) return 'phone';
  if (providerIds.includes('google.com')) return 'google';
  return 'email';
}

export async function ensureUserCloudDocs(
  user: User,
  seedProfile?: Partial<UserProfile>,
  preferredUsername?: string
): Promise<CloudUserProgress> {
  const userPath = `users/${user.uid}`;
  const privatePath = `users/${user.uid}/private/account`;
  const userRef = doc(db, 'users', user.uid);
  const privateRef = doc(db, 'users', user.uid, 'private', 'account');

  let existingSnap;
  try {
    existingSnap = await getDoc(userRef);
  } catch (error) {
    handleFirestoreError(error, OperationType.GET, userPath);
  }

  const provider = detectAuthProvider(user);

  if (existingSnap.exists()) {
    const data = existingSnap.data();
    return {
      uid: user.uid,
      username: sanitizeUsername(typeof data.username === 'string' ? data.username : user.displayName),
      avatarIcon: VALID_ICONS.includes(data.avatarIcon) ? data.avatarIcon : 'bot',
      avatarTheme: VALID_THEMES.includes(data.avatarTheme) ? data.avatarTheme : 'sky',
      xp: typeof data.xp === 'number' ? Math.max(0, Math.min(1000000, Math.floor(data.xp))) : 0,
      completedPracticals: Array.isArray(data.completedPracticals) ? data.completedPracticals : [],
      completedLessons: Array.isArray(data.completedLessons) ? data.completedLessons : [],
      blocks: Array.isArray(data.blocks) ? data.blocks : DEFAULT_BLOCKS,
    };
  }

  const derivedName = sanitizeUsername(
    preferredUsername ||
      user.displayName ||
      (user.email ? user.email.split('@')[0] : undefined) ||
      (user.phoneNumber ? `Builder ${user.phoneNumber.slice(-4)}` : undefined) ||
      seedProfile?.username
  );

  const initialProgress: CloudUserProgress = {
    uid: user.uid,
    username: derivedName,
    avatarIcon:
      seedProfile?.avatarIcon && VALID_ICONS.includes(seedProfile.avatarIcon)
        ? seedProfile.avatarIcon
        : 'bot',
    avatarTheme:
      seedProfile?.avatarTheme && VALID_THEMES.includes(seedProfile.avatarTheme)
        ? seedProfile.avatarTheme
        : 'sky',
    xp:
      typeof seedProfile?.xp === 'number'
        ? Math.max(0, Math.min(1000000, Math.floor(seedProfile.xp)))
        : 50,
    completedPracticals: sanitizeIdArray(
      seedProfile?.completedPracticals || ['traffic_signal'],
      50
    ),
    completedLessons: sanitizeIdArray(seedProfile?.completedLessons || [], 50),
    blocks: sanitizeBlocksForCloud(seedProfile?.blocks || DEFAULT_BLOCKS),
  };

  const privatePayload: Record<string, unknown> = {
    uid: user.uid,
    authProvider: provider,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  };
  if (user.email) {
    privatePayload.email = user.email.slice(0, 254);
  }
  if (user.phoneNumber) {
    privatePayload.phoneNumber = user.phoneNumber.slice(0, 32);
  }

  const batch = writeBatch(db);
  batch.set(userRef, {
    ...initialProgress,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });
  batch.set(privateRef, privatePayload);

  try {
    await batch.commit();
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, `${userPath} + ${privatePath}`);
  }

  return initialProgress;
}

export async function syncUserWorkspaceToCloud(
  uid: string,
  patch: Partial<Omit<CloudUserProgress, 'uid'>>
): Promise<void> {
  const userPath = `users/${uid}`;
  const userRef = doc(db, 'users', uid);

  const payload: Record<string, unknown> = {
    updatedAt: serverTimestamp(),
  };

  if (patch.username !== undefined) {
    payload.username = sanitizeUsername(patch.username);
  }
  if (patch.avatarIcon !== undefined && VALID_ICONS.includes(patch.avatarIcon)) {
    payload.avatarIcon = patch.avatarIcon;
  }
  if (patch.avatarTheme !== undefined && VALID_THEMES.includes(patch.avatarTheme)) {
    payload.avatarTheme = patch.avatarTheme;
  }
  if (patch.xp !== undefined) {
    payload.xp = Math.max(0, Math.min(1000000, Math.floor(patch.xp)));
  }
  if (patch.completedPracticals !== undefined) {
    payload.completedPracticals = sanitizeIdArray(patch.completedPracticals, 50);
  }
  if (patch.completedLessons !== undefined) {
    payload.completedLessons = sanitizeIdArray(patch.completedLessons, 50);
  }
  if (patch.blocks !== undefined) {
    payload.blocks = sanitizeBlocksForCloud(patch.blocks);
  }

  try {
    await updateDoc(userRef, payload);
  } catch (error) {
    handleFirestoreError(error, OperationType.UPDATE, userPath);
  }
}

export interface FormattedAuthError {
  message: string;
  needsConsoleSetup: boolean;
}

export function formatFirebaseAuthError(
  error: unknown,
  isHi: boolean
): FormattedAuthError {
  const code =
    typeof error === 'object' && error !== null && 'code' in error
      ? String((error as { code?: unknown }).code)
      : '';
  const rawMessage = error instanceof Error ? error.message : String(error);

  if (
    code === 'auth/operation-not-allowed' ||
    code === 'auth/configuration-not-found' ||
    rawMessage.includes('operation-not-allowed')
  ) {
    return {
      needsConsoleSetup: true,
      message: isHi
        ? 'यह साइन-इन विकल्प (Email / Phone / Apple) अभी Firebase Console में चालू नहीं है। नीचे दिए गए सेटअप गाइड से इसे चालू करें।'
        : 'This sign-in provider is not enabled in your Firebase Console yet. Open the Firebase Console Setup Guide below to enable it.',
    };
  }

  if (code === 'auth/unauthorized-domain') {
    return {
      needsConsoleSetup: true,
      message: isHi
        ? 'यह डोमेन Firebase Authorized Domains सूची में जुड़ा नहीं है। नीचे दिए गए गाइड से इसे जोड़ें।'
        : 'This app domain is not added to Firebase Authorized Domains yet. See the setup guide below.',
    };
  }

  if (code === 'auth/email-already-in-use') {
    return {
      needsConsoleSetup: false,
      message: isHi
        ? 'यह ईमेल पहले से पंजीकृत है — Sign In टैब से लॉगिन करें।'
        : 'An account with this email already exists — switch to Sign In instead.',
    };
  }

  if (code === 'auth/invalid-email') {
    return {
      needsConsoleSetup: false,
      message: isHi
        ? 'कृपया सही ईमेल पता लिखें।'
        : 'Please enter a valid email address.',
    };
  }

  if (code === 'auth/weak-password') {
    return {
      needsConsoleSetup: false,
      message: isHi
        ? 'पासवर्ड कम से कम 6 अक्षरों का होना चाहिए।'
        : 'Password must be at least 6 characters long.',
    };
  }

  if (code === 'auth/invalid-credential' || code === 'auth/wrong-password' || code === 'auth/user-not-found') {
    return {
      needsConsoleSetup: false,
      message: isHi
        ? 'ईमेल या पासवर्ड गलत है।'
        : 'Incorrect email or password.',
    };
  }

  if (code === 'auth/invalid-phone-number') {
    return {
      needsConsoleSetup: false,
      message: isHi
        ? 'देश कोड के साथ सही फ़ोन नंबर लिखें (जैसे +919876543210 या +15551234567)।'
        : 'Enter a valid phone number with country code (e.g. +15551234567 or +919876543210).',
    };
  }

  if (code === 'auth/invalid-verification-code' || code === 'auth/code-expired') {
    return {
      needsConsoleSetup: false,
      message: isHi
        ? 'यह 6-अंकीय OTP कोड गलत या पुराना हो गया है।'
        : 'That 6-digit SMS code is invalid or expired. Please try again.',
    };
  }

  if (code === 'auth/popup-closed-by-user' || code === 'auth/cancelled-popup-request') {
    return {
      needsConsoleSetup: false,
      message: isHi
        ? 'साइन-इन पॉपअप बंद हो गया। कृपया दोबारा प्रयास करें।'
        : 'Sign-in window was closed before finishing. Please try again.',
    };
  }

  if (code === 'auth/popup-blocked') {
    return {
      needsConsoleSetup: false,
      message: isHi
        ? 'ब्राउज़र ने साइन-इन पॉपअप ब्लॉक किया है — कृपया पॉपअप अनुमति दें।'
        : 'Your browser blocked the sign-in popup. Please allow popups for this site and retry.',
    };
  }

  if (code === 'auth/too-many-requests') {
    return {
      needsConsoleSetup: false,
      message: isHi
        ? 'बहुत अधिक प्रयास हुए — कृपया कुछ क्षण बाद कोशिश करें।'
        : 'Too many attempts. Please wait a moment and try again.',
    };
  }

  return {
    needsConsoleSetup: false,
    message: rawMessage || (isHi ? 'साइन-इन में त्रुटि हुई।' : 'Authentication failed. Please try again.'),
  };
}
