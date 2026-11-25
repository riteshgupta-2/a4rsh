import React, { useEffect, useRef, useState } from 'react';
import { onAuthStateChanged, User } from 'firebase/auth';
import { doc, onSnapshot } from 'firebase/firestore';
import { ArrowRight, Download, Globe, Mail, MapPin, Phone, Scale } from 'lucide-react';
import { ComponentEncyclopedia } from './components/ComponentEncyclopedia';
import { CodingNavRequest, CodingStudio } from './components/CodingStudio';
import { OfflineIndicator } from './components/OfflineIndicator';
import { ProfileAvatarIcon, ProfileModal } from './components/ProfileModal';
import { PWAInstallButton } from './components/PWAInstallButton';
import { RoboticsLab } from './components/RoboticsLab';
import { RobotGuideWidget } from './components/RobotGuideWidget';
import { RoverArena } from './components/RoverArena';
import { StoreAndLegalCenter } from './components/StoreAndLegalCenter';
import {
  CREATOR_INFO,
  getGmailComposeUrl,
  getSmsUrl,
  TermsModal,
} from './components/TermsModal';
import { CodeBlock, DEFAULT_BLOCKS } from './data/codingData';
import { auth, db, handleFirestoreError, OperationType } from './firebase';
import { ROBOTICS_COMPONENTS, ROBOTICS_PRACTICALS } from './data/roboticsData';
import {
  LANGUAGES,
  LanguageCode,
  getTranslations,
} from './i18n/translations';
import {
  CloudUserProgress,
  ensureUserCloudDocs,
  sanitizeUsername,
  syncUserWorkspaceToCloud,
} from './services/userAccountService';
import {
  AVATAR_THEMES,
  AvatarIconKey,
  AvatarTheme,
  ProfilesStore,
  createDefaultProfile,
  loadProfilesStore,
  saveProfilesStore,
} from './utils/profileStorage';

type ActiveSection =
  | 'overview'
  | 'lab'
  | 'rover'
  | 'coding'
  | 'components'
  | 'publish';

const HERO_IMG = '/src/assets/images/hero_robotics_studio_1795610638925.jpg';
const LAB_IMG = '/src/assets/images/track_circuit_workbench_1795610639069.jpg';
const ROVER_IMG = '/src/assets/images/track_autonomous_rover_1795610639511.jpg';
const CODING_IMG = '/src/assets/images/track_coding_architecture_1795610641173.jpg';

export default function App() {
  const [section, setSection] = useState<ActiveSection>('overview');
  const [lang, setLang] = useState<LanguageCode>(() => {
    try {
      const saved = localStorage.getItem('robocode_lang') as LanguageCode | null;
      if (saved && LANGUAGES.some((l) => l.code === saved)) return saved;
      const browserLang = navigator.language?.slice(0, 2) as LanguageCode;
      if (LANGUAGES.some((l) => l.code === browserLang)) return browserLang;
    } catch {
      // ignore storage access errors
    }
    return 'en';
  });

  const [profileStore, setProfileStore] = useState<ProfilesStore>(() => loadProfilesStore());
  const [authUser, setAuthUser] = useState<User | null>(null);
  const [authReady, setAuthReady] = useState<boolean>(false);
  const [cloudProfile, setCloudProfile] = useState<CloudUserProgress | null>(null);
  const [isProfileModalOpen, setIsProfileModalOpen] = useState<boolean>(false);
  const [isTermsOpen, setIsTermsOpen] = useState<boolean>(false);
  const [labPracticalId, setLabPracticalId] = useState<string | undefined>(undefined);
  const [codingNavRequest, setCodingNavRequest] = useState<CodingNavRequest | undefined>(undefined);
  const [exportNotice, setExportNotice] = useState<boolean>(false);

  const blocksSyncTimerRef = useRef<number | null>(null);

  const activeLocalProfile =
    profileStore.profiles.find((p) => p.id === profileStore.activeProfileId) ||
    profileStore.profiles[0];

  const activeUsername = cloudProfile?.username || activeLocalProfile.username;
  const activeAvatarIcon = cloudProfile?.avatarIcon || activeLocalProfile.avatarIcon;
  const activeAvatarTheme = cloudProfile?.avatarTheme || activeLocalProfile.avatarTheme;
  const blocks = cloudProfile ? cloudProfile.blocks : activeLocalProfile.blocks;
  const completedPracticals = cloudProfile
    ? cloudProfile.completedPracticals
    : activeLocalProfile.completedPracticals;
  const completedLessons = cloudProfile
    ? cloudProfile.completedLessons
    : activeLocalProfile.completedLessons;
  const xp = cloudProfile ? cloudProfile.xp : activeLocalProfile.xp;

  const t = getTranslations(lang);
  const currentLangMeta = LANGUAGES.find((l) => l.code === lang) || LANGUAGES[0];

  useEffect(() => {
    document.documentElement.dir = currentLangMeta.dir || 'ltr';
    document.documentElement.lang = lang;
    try {
      localStorage.setItem('robocode_lang', lang);
    } catch {
      // ignore
    }
  }, [lang, currentLangMeta.dir]);

  useEffect(() => {
    saveProfilesStore(profileStore);
  }, [profileStore]);

  // Smooth GPU-backed scroll parallax & progress tracking
  useEffect(() => {
    let rafId = 0;
    const updateScrollVars = () => {
      rafId = 0;
      const y = window.scrollY || 0;
      const maxScroll = Math.max(
        1,
        document.documentElement.scrollHeight - window.innerHeight
      );
      const progress = Math.min(1, Math.max(0, y / maxScroll));
      document.documentElement.style.setProperty('--scroll-y', `${y.toFixed(1)}px`);
      document.documentElement.style.setProperty('--scroll-progress', progress.toFixed(4));
    };

    const handleScroll = () => {
      if (!rafId) {
        rafId = window.requestAnimationFrame(updateScrollVars);
      }
    };

    updateScrollVars();
    window.addEventListener('scroll', handleScroll, { passive: true });
    window.addEventListener('resize', handleScroll, { passive: true });
    return () => {
      window.removeEventListener('scroll', handleScroll);
      window.removeEventListener('resize', handleScroll);
      if (rafId) window.cancelAnimationFrame(rafId);
    };
  }, [section]);

  // Scroll-reveal observer for home showcase cards
  useEffect(() => {
    if (section !== 'overview') return;
    const elements = Array.from(
      document.querySelectorAll<HTMLElement>('.scroll-reveal-card')
    );
    if (elements.length === 0) return;

    if (
      typeof IntersectionObserver === 'undefined' ||
      window.matchMedia('(prefers-reduced-motion: reduce)').matches
    ) {
      elements.forEach((el) => el.setAttribute('data-revealed', 'true'));
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.setAttribute('data-revealed', 'true');
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.12, rootMargin: '0px 0px -24px 0px' }
    );

    elements.forEach((el) => {
      const rect = el.getBoundingClientRect();
      if (rect.top < window.innerHeight * 0.95) {
        el.setAttribute('data-revealed', 'true');
      } else {
        observer.observe(el);
      }
    });

    return () => observer.disconnect();
  }, [section]);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setAuthUser(user);
      setAuthReady(true);
      if (!user) {
        setCloudProfile(null);
        return;
      }
      try {
        const loaded = await ensureUserCloudDocs(user, activeLocalProfile);
        setCloudProfile((prev) => (prev && prev.uid === user.uid ? prev : loaded));
      } catch (err) {
        console.error('Failed to initialize cloud account docs:', err);
      }
    });
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    if (!authReady || !authUser) return;
    const path = `users/${authUser.uid}`;
    const unsubscribe = onSnapshot(
      doc(db, 'users', authUser.uid),
      (snap) => {
        if (!snap.exists()) return;
        const data = snap.data();
        setCloudProfile({
          uid: authUser.uid,
          username: sanitizeUsername(
            typeof data.username === 'string' ? data.username : authUser.displayName
          ),
          avatarIcon: data.avatarIcon || 'bot',
          avatarTheme: data.avatarTheme || 'sky',
          xp: typeof data.xp === 'number' ? data.xp : 0,
          completedPracticals: Array.isArray(data.completedPracticals)
            ? data.completedPracticals
            : [],
          completedLessons: Array.isArray(data.completedLessons)
            ? data.completedLessons
            : [],
          blocks: Array.isArray(data.blocks) ? data.blocks : DEFAULT_BLOCKS,
        });
      },
      (error) => {
        handleFirestoreError(error, OperationType.GET, path);
      }
    );
    return () => unsubscribe();
  }, [authReady, authUser]);

  const handleCloudAuthenticated = async (
    user: User,
    preferredUsername?: string
  ) => {
    const loaded = await ensureUserCloudDocs(
      user,
      activeLocalProfile,
      preferredUsername
    );
    setCloudProfile(loaded);
  };

  const handleUpdateCloudProfile = async (
    username: string,
    avatarIcon: AvatarIconKey,
    avatarTheme: AvatarTheme
  ) => {
    if (!authUser) return;
    setCloudProfile((prev) =>
      prev ? { ...prev, username, avatarIcon, avatarTheme } : prev
    );
    await syncUserWorkspaceToCloud(authUser.uid, {
      username,
      avatarIcon,
      avatarTheme,
    });
  };

  const setBlocks: React.Dispatch<React.SetStateAction<CodeBlock[]>> = (updater) => {
    if (authUser && cloudProfile) {
      setCloudProfile((prev) => {
        if (!prev) return prev;
        const nextBlocks =
          typeof updater === 'function' ? updater(prev.blocks) : updater;
        if (blocksSyncTimerRef.current) {
          window.clearTimeout(blocksSyncTimerRef.current);
        }
        blocksSyncTimerRef.current = window.setTimeout(() => {
          void syncUserWorkspaceToCloud(authUser.uid, { blocks: nextBlocks });
        }, 600);
        return { ...prev, blocks: nextBlocks };
      });
      return;
    }

    setProfileStore((prev) => ({
      ...prev,
      profiles: prev.profiles.map((p) => {
        if (p.id !== prev.activeProfileId) return p;
        const nextBlocks =
          typeof updater === 'function' ? updater(p.blocks) : updater;
        return { ...p, blocks: nextBlocks };
      }),
    }));
  };

  const handleCompletePractical = (id: string) => {
    if (authUser && cloudProfile) {
      if (cloudProfile.completedPracticals.includes(id)) return;
      const nextPracticals = [...cloudProfile.completedPracticals, id];
      const nextXp = cloudProfile.xp + 40;
      setCloudProfile((prev) =>
        prev
          ? { ...prev, completedPracticals: nextPracticals, xp: nextXp }
          : prev
      );
      void syncUserWorkspaceToCloud(authUser.uid, {
        completedPracticals: nextPracticals,
        xp: nextXp,
      });
      return;
    }

    setProfileStore((prev) => ({
      ...prev,
      profiles: prev.profiles.map((p) => {
        if (p.id !== prev.activeProfileId) return p;
        if (p.completedPracticals.includes(id)) return p;
        return {
          ...p,
          completedPracticals: [...p.completedPracticals, id],
          xp: p.xp + 40,
        };
      }),
    }));
  };

  const handleEarnXp = (lessonId: string, amount: number) => {
    if (authUser && cloudProfile) {
      if (cloudProfile.completedLessons.includes(lessonId)) return;
      const nextLessons = [...cloudProfile.completedLessons, lessonId];
      const nextXp = cloudProfile.xp + amount;
      setCloudProfile((prev) =>
        prev ? { ...prev, completedLessons: nextLessons, xp: nextXp } : prev
      );
      void syncUserWorkspaceToCloud(authUser.uid, {
        completedLessons: nextLessons,
        xp: nextXp,
      });
      return;
    }

    setProfileStore((prev) => ({
      ...prev,
      profiles: prev.profiles.map((p) => {
        if (p.id !== prev.activeProfileId) return p;
        if (p.completedLessons.includes(lessonId)) return p;
        return {
          ...p,
          completedLessons: [...p.completedLessons, lessonId],
          xp: p.xp + amount,
        };
      }),
    }));
  };

  const handleCreateProfile = (
    username: string,
    avatarIcon: AvatarIconKey,
    avatarTheme: AvatarTheme
  ) => {
    const newProfile = createDefaultProfile({
      username,
      avatarIcon,
      avatarTheme,
      xp: 0,
      completedPracticals: [],
      completedLessons: [],
    });
    setProfileStore((prev) => ({
      activeProfileId: newProfile.id,
      profiles: [...prev.profiles, newProfile],
    }));
  };

  const handleUpdateProfile = (
    id: string,
    username: string,
    avatarIcon: AvatarIconKey,
    avatarTheme: AvatarTheme
  ) => {
    setProfileStore((prev) => ({
      ...prev,
      profiles: prev.profiles.map((p) =>
        p.id === id ? { ...p, username, avatarIcon, avatarTheme } : p
      ),
    }));
  };

  const handleDeleteProfile = (id: string) => {
    setProfileStore((prev) => {
      if (prev.profiles.length <= 1) return prev;
      const remaining = prev.profiles.filter((p) => p.id !== id);
      const nextActive =
        prev.activeProfileId === id ? remaining[0].id : prev.activeProfileId;
      return {
        activeProfileId: nextActive,
        profiles: remaining,
      };
    });
  };

  const handleExportProject = () => {
    const payload = {
      app: 'HARRBOTIX',
      username: activeUsername,
      exportedAt: new Date().toISOString(),
      xp,
      completedPracticals,
      completedLessons,
      blocks,
    };
    const safeSlug = activeUsername
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-|-$/g, '');
    const blob = new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `harrbotix-${safeSlug || 'student'}-project.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    setExportNotice(true);
    window.setTimeout(() => setExportNotice(false), 2500);
  };

  const navItems: { id: ActiveSection; label: string }[] = [
    { id: 'lab', label: t.navLab },
    { id: 'rover', label: t.navRover },
    { id: 'coding', label: t.navCoding },
    { id: 'components', label: t.navComponents },
    { id: 'publish', label: t.navPublish },
  ];

  return (
    <div className="relative min-h-screen flex flex-col bg-transparent text-slate-900">
      {/* MOVING COLOUR BLUR AMBIENT BACKGROUND */}
      <div
        aria-hidden="true"
        className="pointer-events-none fixed inset-0 -z-10 overflow-hidden"
      >
        <div className="scroll-parallax-bg relative h-[125vh] w-full">
          <div className="aurora-orb-a absolute -left-24 -top-20 h-[28rem] w-[28rem] rounded-full bg-sky-400/30 blur-[100px]" />
          <div className="aurora-orb-b absolute -right-24 top-10 h-[26rem] w-[26rem] rounded-full bg-indigo-400/25 blur-[110px]" />
          <div className="aurora-orb-c absolute bottom-12 right-[14%] h-[25rem] w-[25rem] rounded-full bg-emerald-400/25 blur-[105px]" />
          <div className="aurora-orb-d absolute bottom-0 left-[12%] h-[24rem] w-[24rem] rounded-full bg-cyan-300/30 blur-[95px]" />
        </div>
      </div>

      {/* STRICT 3-ZONE TOP BAR CONTRACT */}
      <header className="sticky top-0 z-30 border-b border-white/60 bg-white/70 backdrop-blur-xl shadow-[0_1px_12px_rgba(15,23,42,0.04)]">
        <div
          aria-hidden="true"
          className="scroll-progress-bar absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-sky-500 via-cyan-400 to-emerald-400"
        />
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-8 px-4 py-3.5 sm:px-6">
          {/* Zone 1: Single-line Brand Logo & Wordmark */}
          <button
            type="button"
            onClick={() => setSection('overview')}
            className="inline-flex items-center gap-2.5 rounded-full border border-transparent bg-white/20 px-3 py-1 -ml-3 font-display text-lg font-bold tracking-tight text-slate-900 whitespace-nowrap shrink-0 backdrop-blur-md transition-all duration-200 hover:-translate-y-0.5 hover:border-white/80 hover:bg-white/50 hover:text-sky-700 hover:shadow-[0_6px_18px_rgba(2,132,199,0.16)] active:scale-95"
          >
            <img
              src="/assets/aistudio/Gemini_Generated_Image_8vw3mz8vw3mz8vw3_df720246.png"
              alt="HARRBOTIX logo"
              className="h-9 w-9 rounded-full object-cover border border-white/80 bg-white/80 shadow-sm shrink-0"
            />
            <span>{t.brand}</span>
          </button>

          {/* Zone 2: 5 concise single-line text nav links */}
          <nav aria-label="Primary Navigation" className="hidden md:flex items-center gap-2 text-sm font-medium text-slate-700">
            {navItems.map((item) => (
              <button
                key={item.id}
                type="button"
                onClick={() => setSection(item.id)}
                className={`whitespace-nowrap shrink-0 rounded-full border px-3.5 py-1.5 backdrop-blur-md transition-all duration-200 hover:-translate-y-0.5 active:scale-95 ${
                  section === item.id
                    ? 'border-sky-400/75 bg-sky-500/20 text-sky-950 font-semibold shadow-[0_4px_14px_rgba(2,132,199,0.2)]'
                    : 'border-white/50 bg-white/25 text-slate-700 hover:border-sky-300/80 hover:bg-white/60 hover:text-slate-900 hover:shadow-[0_4px_14px_rgba(15,23,42,0.08)]'
                }`}
              >
                {item.label}
              </button>
            ))}
          </nav>

          {/* Zone 3: Primary Action + Top-Right Circular Profile Button */}
          <div className="flex items-center gap-2.5 shrink-0">
            <PWAInstallButton
              installLabel={t.installApp}
              installIOSLabel={t.installIOS}
              onOpenStoreGuide={() => setSection('publish')}
            />
            <button
              type="button"
              onClick={() => setIsProfileModalOpen(true)}
              aria-label={`${t.profileLabel}: ${activeUsername}`}
              title={`${activeUsername} (${authUser ? 'Cloud Account' : t.profileLabel})`}
              className={`relative flex h-10 w-10 items-center justify-center rounded-full border backdrop-blur-md shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:scale-105 hover:shadow-[0_6px_18px_rgba(2,132,199,0.22)] active:scale-95 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-sky-600 shrink-0 ${
                authUser ? 'ring-2 ring-emerald-400/75 ring-offset-1 ring-offset-white/60' : ''
              } ${
                (AVATAR_THEMES[activeAvatarTheme] || AVATAR_THEMES.sky).ring
              } ${(AVATAR_THEMES[activeAvatarTheme] || AVATAR_THEMES.sky).bg} ${
                (AVATAR_THEMES[activeAvatarTheme] || AVATAR_THEMES.sky).text
              }`}
            >
              <ProfileAvatarIcon icon={activeAvatarIcon} className="h-5 w-5" />
            </button>
          </div>
        </div>
      </header>

      {/* WORKSPACE TOOLBAR (Language Switcher, Mobile Tabs, Student XP, Save) */}
      <div className="border-b border-white/50 bg-white/45 backdrop-blur-md">
        <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-3 px-4 py-2.5 sm:px-6">
          {/* Mobile Section Tabs */}
          <div className="flex md:hidden items-center gap-1.5 overflow-x-auto pb-1 w-full">
            <button
              type="button"
              onClick={() => setSection('overview')}
              className={`rounded-full border px-3 py-1.5 text-xs font-semibold whitespace-nowrap shrink-0 backdrop-blur-md transition-all duration-200 active:scale-95 ${
                section === 'overview'
                  ? 'border-sky-400/75 bg-sky-500/20 text-sky-950 shadow-sm'
                  : 'border-white/60 bg-white/25 text-slate-700 hover:bg-white/55'
              }`}
            >
              {t.navOverview}
            </button>
            {navItems.map((item) => (
              <button
                key={item.id}
                type="button"
                onClick={() => setSection(item.id)}
                className={`rounded-full border px-3 py-1.5 text-xs font-semibold whitespace-nowrap shrink-0 backdrop-blur-md transition-all duration-200 active:scale-95 ${
                  section === item.id
                    ? 'border-sky-400/75 bg-sky-500/20 text-sky-950 shadow-sm'
                    : 'border-white/60 bg-white/25 text-slate-700 hover:bg-white/55'
                }`}
              >
                {item.label}
              </button>
            ))}
          </div>

          {/* Unboxed Metadata Metrics */}
          <div className="flex flex-wrap items-center gap-2 text-xs text-slate-600 tabular-nums">
            <span className="max-w-[140px] truncate font-semibold text-slate-900">
              {activeUsername}
            </span>
            <span aria-hidden="true">·</span>
            <span>
              <strong className="font-semibold text-slate-900">{xp}</strong> {t.xpLabel}
            </span>
            <span aria-hidden="true">·</span>
            <span>
              <strong className="font-semibold text-slate-900">
                {completedPracticals.length}/{ROBOTICS_PRACTICALS.length}
              </strong>{' '}
              {t.practicalsDoneLabel}
            </span>
            <span aria-hidden="true" className="hidden sm:inline">·</span>
            <span className="hidden sm:inline">
              <strong className="font-semibold text-slate-900">{ROBOTICS_COMPONENTS.length}</strong>{' '}
              {t.navComponents}
            </span>
          </div>

          {/* Language Selector (14 Languages) + Export */}
          <div className="flex flex-wrap items-center gap-2.5">

            <div className="flex items-center gap-1.5">
              <Globe className="h-3.5 w-3.5 text-slate-500" aria-hidden="true" />
              <label htmlFor="lang-select" className="sr-only">
                {t.languageLabel}
              </label>
              <select
                id="lang-select"
                value={lang}
                onChange={(e) => setLang(e.target.value as LanguageCode)}
                className="rounded-full border border-white/80 bg-white/45 px-3 py-1.5 text-xs font-medium text-slate-800 backdrop-blur-md focus:border-sky-600 focus:outline-none"
              >
                {LANGUAGES.map((l) => (
                  <option key={l.code} value={l.code}>
                    {l.nativeName} ({l.englishName})
                  </option>
                ))}
              </select>
            </div>

            <button
              type="button"
              onClick={handleExportProject}
              className="inline-flex items-center gap-1.5 rounded-full border border-white/75 bg-white/30 px-3.5 py-1.5 text-xs font-semibold text-slate-800 backdrop-blur-md shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:border-sky-300/80 hover:bg-white/60 hover:text-sky-900 hover:shadow-[0_6px_18px_rgba(2,132,199,0.16)] active:scale-95 whitespace-nowrap"
            >
              <Download className="h-3.5 w-3.5" aria-hidden="true" />
              <span>{exportNotice ? t.savedToast : t.saveProgress}</span>
            </button>
          </div>
        </div>
      </div>

      {/* MAIN VIEWPORT CONTENT */}
      <main className="flex-1">
        {section === 'overview' && (
          <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 space-y-12">
            {/* Hero 2-Column Split */}
            <div className="grid grid-cols-1 gap-8 lg:grid-cols-12 items-stretch">
              <div className="lg:col-span-6 flex flex-col justify-center space-y-5">
                <p className="text-xs font-medium text-slate-500">{t.freeForeverLine}</p>
                <h1 className="font-display text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl lg:text-5xl [text-wrap:balance]">
                  {t.heroTitle}
                </h1>
                <p className="max-w-xl text-base leading-relaxed text-slate-600">
                  {t.heroSubtitle}
                </p>
                <div className="flex flex-wrap items-center gap-3 pt-1">
                  <button
                    type="button"
                    onClick={() => setSection('lab')}
                    className="inline-flex items-center gap-2 rounded-full border border-sky-400/75 bg-sky-500/20 px-6 py-3 text-sm font-semibold text-sky-950 backdrop-blur-md shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:bg-sky-500/35 hover:border-sky-500 hover:shadow-[0_8px_24px_rgba(2,132,199,0.28)] active:scale-95 whitespace-nowrap"
                  >
                    <span>{t.startRoboticsBtn}</span>
                    <ArrowRight className="h-4 w-4" aria-hidden="true" />
                  </button>
                  <button
                    type="button"
                    onClick={() => setSection('coding')}
                    className="inline-flex items-center gap-2 rounded-full border border-white/80 bg-white/30 px-6 py-3 text-sm font-semibold text-slate-900 backdrop-blur-md shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:border-sky-300/80 hover:bg-white/65 hover:text-sky-950 hover:shadow-[0_8px_24px_rgba(15,23,42,0.12)] active:scale-95 whitespace-nowrap"
                  >
                    <span>{t.startCodingBtn}</span>
                  </button>
                </div>
              </div>

              <div className="lg:col-span-6">
                <div className="scroll-parallax-hero group relative h-full min-h-[280px] overflow-hidden rounded-3xl border border-white/80 bg-gradient-to-br from-white/65 via-sky-50/45 to-slate-100/55 p-2 backdrop-blur-xl shadow-[0_20px_50px_rgba(15,23,42,0.09)] transition-shadow duration-300 hover:shadow-[0_26px_60px_rgba(2,132,199,0.16)]">
                  <img
                    src={HERO_IMG}
                    alt="Minimalist HARRBOTIX autonomous robotics chassis and transparent microcontroller workbench"
                    referrerPolicy="no-referrer"
                    className="h-full w-full rounded-2xl object-cover transition-transform duration-700 ease-out group-hover:scale-[1.025]"
                  />
                </div>
              </div>
            </div>

            {/* 3 Learning Tracks Showcase */}
            <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
              <button
                type="button"
                onClick={() => setSection('lab')}
                style={{ transitionDelay: '0ms' }}
                className="scroll-reveal-card group flex flex-col overflow-hidden rounded-3xl border border-white/80 bg-white/65 text-left backdrop-blur-xl shadow-[0_10px_30px_rgba(15,23,42,0.06)] transition-all duration-300 hover:-translate-y-1.5 hover:bg-white/85 hover:border-sky-300/80 hover:shadow-[0_22px_45px_rgba(2,132,199,0.14)] active:scale-[0.99]"
              >
                <div className="aspect-[4/3] w-full overflow-hidden bg-gradient-to-br from-slate-100 to-sky-50">
                  <img
                    src={LAB_IMG}
                    alt="Modern precision circuit workbench with frosted acrylic sensor modules"
                    referrerPolicy="no-referrer"
                    className="h-full w-full object-cover transition-transform duration-500 ease-out group-hover:scale-105"
                  />
                </div>
                <div className="p-5 space-y-2">
                  <h2 className="text-base font-bold text-slate-900 group-hover:text-sky-700 transition-colors">
                    {t.trackRoboticsTitle}
                  </h2>
                  <p className="text-xs leading-relaxed text-slate-600">{t.trackRoboticsDesc}</p>
                </div>
              </button>

              <button
                type="button"
                onClick={() => setSection('rover')}
                style={{ transitionDelay: '90ms' }}
                className="scroll-reveal-card group flex flex-col overflow-hidden rounded-3xl border border-white/80 bg-white/65 text-left backdrop-blur-xl shadow-[0_10px_30px_rgba(15,23,42,0.06)] transition-all duration-300 hover:-translate-y-1.5 hover:bg-white/85 hover:border-sky-300/80 hover:shadow-[0_22px_45px_rgba(2,132,199,0.14)] active:scale-[0.99]"
              >
                <div className="aspect-[4/3] w-full overflow-hidden bg-gradient-to-br from-slate-100 to-emerald-50">
                  <img
                    src={ROVER_IMG}
                    alt="Minimalist matte-white autonomous rover navigating a limestone architectural grid"
                    referrerPolicy="no-referrer"
                    className="h-full w-full object-cover transition-transform duration-500 ease-out group-hover:scale-105"
                  />
                </div>
                <div className="p-5 space-y-2">
                  <h2 className="text-base font-bold text-slate-900 group-hover:text-sky-700 transition-colors">
                    {t.trackRoverTitle}
                  </h2>
                  <p className="text-xs leading-relaxed text-slate-600">{t.trackRoverDesc}</p>
                </div>
              </button>

              <button
                type="button"
                onClick={() => setSection('coding')}
                style={{ transitionDelay: '180ms' }}
                className="scroll-reveal-card group flex flex-col overflow-hidden rounded-3xl border border-white/80 bg-white/65 text-left backdrop-blur-xl shadow-[0_10px_30px_rgba(15,23,42,0.06)] transition-all duration-300 hover:-translate-y-1.5 hover:bg-white/85 hover:border-sky-300/80 hover:shadow-[0_22px_45px_rgba(2,132,199,0.14)] active:scale-[0.99]"
              >
                <div className="aspect-[4/3] w-full overflow-hidden bg-gradient-to-br from-slate-100 to-indigo-50">
                  <img
                    src={CODING_IMG}
                    alt="Frosted glass coding architecture display with geometric logic nodes"
                    referrerPolicy="no-referrer"
                    className="h-full w-full object-cover transition-transform duration-500 ease-out group-hover:scale-105"
                  />
                </div>
                <div className="p-5 space-y-2">
                  <h2 className="text-base font-bold text-slate-900 group-hover:text-sky-700 transition-colors">
                    {t.trackCodingTitle}
                  </h2>
                  <p className="text-xs leading-relaxed text-slate-600">{t.trackCodingDesc}</p>
                </div>
              </button>
            </div>
          </div>
        )}

        {section === 'lab' && (
          <RoboticsLab
            lang={lang}
            t={t}
            initialPracticalId={labPracticalId}
            onCompletePractical={handleCompletePractical}
          />
        )}

        {section === 'rover' && (
          <RoverArena
            lang={lang}
            t={t}
            blocks={blocks}
            onGoalReached={() => handleEarnXp('rover_goal', 50)}
          />
        )}

        {section === 'coding' && (
          <CodingStudio
            lang={lang}
            t={t}
            blocks={blocks}
            setBlocks={setBlocks}
            onRunRoverBlocks={() => setSection('rover')}
            onEarnXp={handleEarnXp}
            completedLessons={completedLessons}
            defaultStudentName={activeUsername}
            codingNavRequest={codingNavRequest}
          />
        )}

        {section === 'components' && (
          <ComponentEncyclopedia
            lang={lang}
            t={t}
            onTryInLab={(practicalId) => {
              setLabPracticalId(practicalId);
              setSection('lab');
            }}
          />
        )}

        {section === 'publish' && <StoreAndLegalCenter lang={lang} t={t} />}
      </main>

      {/* FOOTER: CREATORS, CONTACT & TERMS */}
      <footer className="border-t border-white/60 bg-white/65 backdrop-blur-md">
        <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 space-y-5">
          <div className="grid grid-cols-1 gap-6 md:grid-cols-3 text-xs text-slate-600">
            {/* Creators */}
            <div className="space-y-1.5">
              <h2 className="text-sm font-bold tracking-tight text-slate-900">HARRBOTIX</h2>
              <p className="leading-relaxed">
                <span className="font-semibold text-slate-800">
                  {lang === 'hi' ? 'निर्माता:' : 'Created by:'}
                </span>{' '}
                {CREATOR_INFO.names}
              </p>
              <p className="inline-flex items-center gap-1.5 text-slate-600">
                <MapPin className="h-3.5 w-3.5 text-sky-700 shrink-0" aria-hidden="true" />
                <span>{CREATOR_INFO.address}</span>
              </p>
            </div>

            {/* Direct Contact */}
            <div className="space-y-1.5">
              <h3 className="text-xs font-bold text-slate-900">
                {lang === 'hi' ? 'संपर्क जानकारी' : 'Creator Contact'}
              </h3>
              {CREATOR_INFO.emails.map((email) => (
                <div key={email}>
                  <a
                    href={getGmailComposeUrl(email)}
                    target="_blank"
                    rel="noopener noreferrer"
                    title={`Open Gmail to email ${email}`}
                    aria-label={`Open Gmail to email ${email}`}
                    className="inline-flex items-center gap-1.5 text-slate-700 hover:text-sky-800 hover:underline transition-colors"
                  >
                    <Mail className="h-3.5 w-3.5 text-sky-700 shrink-0" aria-hidden="true" />
                    <span>{email}</span>
                  </a>
                </div>
              ))}
              {CREATOR_INFO.phones.map((phone) => (
                <div key={phone}>
                  <a
                    href={getSmsUrl(phone)}
                    title={`Open Messages to text ${phone}`}
                    aria-label={`Open Messages to text ${phone}`}
                    className="inline-flex items-center gap-1.5 text-slate-700 hover:text-sky-800 hover:underline transition-colors tabular-nums"
                  >
                    <Phone className="h-3.5 w-3.5 text-sky-700 shrink-0" aria-hidden="true" />
                    <span>{phone}</span>
                  </a>
                </div>
              ))}
            </div>

            {/* Navigation & Legal Capsule Buttons */}
            <div className="space-y-2 md:text-right">
              <h3 className="text-xs font-bold text-slate-900">
                {lang === 'hi' ? 'कानूनी एवं लिंक' : 'Resources & Legal'}
              </h3>
              <div className="flex flex-wrap items-center gap-2 md:justify-end">
                <button
                  type="button"
                  onClick={() => setSection('components')}
                  className="rounded-full border border-white/75 bg-white/30 px-3.5 py-1.5 font-semibold text-slate-700 backdrop-blur-md shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:border-sky-300/80 hover:bg-white/65 hover:text-slate-900 hover:shadow-sm active:scale-95"
                >
                  {t.navComponents}
                </button>
                <button
                  type="button"
                  onClick={() => setSection('publish')}
                  className="rounded-full border border-white/75 bg-white/30 px-3.5 py-1.5 font-semibold text-slate-700 backdrop-blur-md shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:border-sky-300/80 hover:bg-white/65 hover:text-slate-900 hover:shadow-sm active:scale-95"
                >
                  {t.navPublish}
                </button>
                <button
                  type="button"
                  onClick={() => setIsTermsOpen(true)}
                  className="inline-flex items-center gap-1.5 rounded-full border border-sky-400/75 bg-sky-500/20 px-3.5 py-1.5 font-semibold text-sky-950 backdrop-blur-md shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:border-sky-500 hover:bg-sky-500/35 hover:shadow-[0_6px_16px_rgba(2,132,199,0.2)] active:scale-95"
                >
                  <Scale className="h-3.5 w-3.5" aria-hidden="true" />
                  <span>{lang === 'hi' ? 'नियम व शर्तें' : 'Terms & Conditions'}</span>
                </button>
              </div>
            </div>
          </div>

          <div className="flex flex-wrap items-center justify-between gap-3 border-t border-white/60 pt-4 text-[11px] text-slate-500">
            <span>{t.footerCopyright}</span>
            <span>
              {lang === 'hi'
                ? 'शैक्षिक उपयोग के लिए सभी अधिकार सुरक्षित · बिहार, भारत'
                : 'Educational STEM Platform · Bihar, India · Use subject to Terms & Conditions'}
            </span>
          </div>
        </div>
      </footer>

      <ProfileModal
        isOpen={isProfileModalOpen}
        onClose={() => setIsProfileModalOpen(false)}
        lang={lang}
        authUser={authUser}
        cloudProfile={cloudProfile}
        onCloudAuthenticated={handleCloudAuthenticated}
        onUpdateCloudProfile={handleUpdateCloudProfile}
        profiles={profileStore.profiles}
        activeProfileId={profileStore.activeProfileId}
        onSelectProfile={(id) =>
          setProfileStore((prev) => ({ ...prev, activeProfileId: id }))
        }
        onCreateProfile={handleCreateProfile}
        onUpdateProfile={handleUpdateProfile}
        onDeleteProfile={handleDeleteProfile}
      />

      <TermsModal
        isOpen={isTermsOpen}
        onClose={() => setIsTermsOpen(false)}
        lang={lang}
      />

      <RobotGuideWidget
        lang={lang}
        activeSection={section}
        username={activeUsername}
        onNavigateSection={(nextSection) => {
          setSection(nextSection);
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }}
        onOpenPractical={(practicalId) => {
          setLabPracticalId(practicalId);
          setSection('lab');
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }}
        onOpenCodingTarget={({ tab, lessonId }) => {
          setCodingNavRequest({ tab, lessonId, nonce: Date.now() });
          setSection('coding');
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }}
        onOpenAccountModal={() => setIsProfileModalOpen(true)}
      />

      <OfflineIndicator message={t.offlineBanner} />
    </div>
  );
}
