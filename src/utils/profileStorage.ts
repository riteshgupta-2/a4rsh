import { CodeBlock, DEFAULT_BLOCKS } from '../data/codingData';

export type AvatarIconKey = 'bot' | 'cpu' | 'rocket' | 'compass' | 'code';
export type AvatarTheme = 'sky' | 'emerald' | 'amber' | 'violet' | 'rose';

export interface UserProfile {
  id: string;
  username: string;
  avatarIcon: AvatarIconKey;
  avatarTheme: AvatarTheme;
  xp: number;
  completedPracticals: string[];
  completedLessons: string[];
  blocks: CodeBlock[];
  createdAt: string;
}

export interface ProfilesStore {
  activeProfileId: string;
  profiles: UserProfile[];
}

const PROFILES_STORAGE_KEY = 'harrbotix_profiles_v1';
const LEGACY_PROGRESS_KEY = 'robocode_lab_progress_v1';

export const AVATAR_THEMES: Record<
  AvatarTheme,
  { label: string; ring: string; bg: string; text: string }
> = {
  sky: {
    label: 'Sky',
    ring: 'border-sky-400/75',
    bg: 'bg-sky-500/20',
    text: 'text-sky-800',
  },
  emerald: {
    label: 'Emerald',
    ring: 'border-emerald-400/75',
    bg: 'bg-emerald-500/20',
    text: 'text-emerald-800',
  },
  amber: {
    label: 'Amber',
    ring: 'border-amber-400/75',
    bg: 'bg-amber-500/20',
    text: 'text-amber-800',
  },
  violet: {
    label: 'Violet',
    ring: 'border-violet-400/75',
    bg: 'bg-violet-500/20',
    text: 'text-violet-800',
  },
  rose: {
    label: 'Rose',
    ring: 'border-rose-400/75',
    bg: 'bg-rose-500/20',
    text: 'text-rose-800',
  },
};

export function createDefaultProfile(overrides?: Partial<UserProfile>): UserProfile {
  return {
    id: `prof_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
    username: 'Young Inventor',
    avatarIcon: 'bot',
    avatarTheme: 'sky',
    xp: 50,
    completedPracticals: ['traffic_signal'],
    completedLessons: [],
    blocks: DEFAULT_BLOCKS.map((b) => ({ ...b })),
    createdAt: new Date().toISOString(),
    ...overrides,
  };
}

export function loadProfilesStore(): ProfilesStore {
  try {
    const raw = localStorage.getItem(PROFILES_STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw) as Partial<ProfilesStore>;
      if (Array.isArray(parsed.profiles) && parsed.profiles.length > 0) {
        const validActive = parsed.profiles.some((p) => p.id === parsed.activeProfileId)
          ? (parsed.activeProfileId as string)
          : parsed.profiles[0].id;
        return {
          activeProfileId: validActive,
          profiles: parsed.profiles,
        };
      }
    }

    // Migrate legacy single-user progress if present
    const legacyRaw = localStorage.getItem(LEGACY_PROGRESS_KEY);
    if (legacyRaw) {
      const legacy = JSON.parse(legacyRaw);
      const migrated = createDefaultProfile({
        id: 'prof_default',
        xp: typeof legacy.xp === 'number' ? legacy.xp : 50,
        completedPracticals: Array.isArray(legacy.completedPracticals)
          ? legacy.completedPracticals
          : ['traffic_signal'],
        completedLessons: Array.isArray(legacy.completedLessons)
          ? legacy.completedLessons
          : [],
        blocks:
          Array.isArray(legacy.blocks) && legacy.blocks.length > 0
            ? legacy.blocks
            : DEFAULT_BLOCKS,
      });
      return {
        activeProfileId: migrated.id,
        profiles: [migrated],
      };
    }
  } catch {
    // ignore storage access/parse errors
  }

  const initial = createDefaultProfile({ id: 'prof_default' });
  return {
    activeProfileId: initial.id,
    profiles: [initial],
  };
}

export function saveProfilesStore(store: ProfilesStore): void {
  try {
    localStorage.setItem(PROFILES_STORAGE_KEY, JSON.stringify(store));
  } catch {
    // ignore storage quota errors
  }
}
