/**
 * Phase 0 Security Test Specification for HARRBOTIX Firestore Rules.
 * Run against Firebase Emulator Suite with @firebase/rules-unit-testing when emulators are active.
 */

export interface SecurityTestCase {
  id: string;
  description: string;
  operation: 'get' | 'list' | 'create' | 'update' | 'delete';
  path: string;
  authUid: string | null;
  payload?: Record<string, unknown>;
  expected: 'PERMISSION_DENIED' | 'ALLOW';
}

export const DIRTY_DOZEN_TESTS: SecurityTestCase[] = [
  {
    id: 'DD-01',
    description: 'Reject unauthenticated read on user progress',
    operation: 'get',
    path: '/users/user_123',
    authUid: null,
    expected: 'PERMISSION_DENIED',
  },
  {
    id: 'DD-02',
    description: 'Reject unauthenticated write on user progress',
    operation: 'create',
    path: '/users/user_123',
    authUid: null,
    payload: { uid: 'user_123', username: 'Anon' },
    expected: 'PERMISSION_DENIED',
  },
  {
    id: 'DD-03',
    description: 'Reject cross-user read on another user progress document',
    operation: 'get',
    path: '/users/victim_uid',
    authUid: 'attacker_uid',
    expected: 'PERMISSION_DENIED',
  },
  {
    id: 'DD-04',
    description: 'Reject cross-user read on private PII document',
    operation: 'get',
    path: '/users/victim_uid/private/account',
    authUid: 'attacker_uid',
    expected: 'PERMISSION_DENIED',
  },
  {
    id: 'DD-05',
    description: 'Reject collection list query on /users',
    operation: 'list',
    path: '/users',
    authUid: 'attacker_uid',
    expected: 'PERMISSION_DENIED',
  },
  {
    id: 'DD-06',
    description: 'Reject uid spoofing during profile creation',
    operation: 'create',
    path: '/users/attacker_uid',
    authUid: 'attacker_uid',
    payload: {
      uid: 'victim_uid',
      username: 'Hacker',
      avatarIcon: 'bot',
      avatarTheme: 'sky',
      xp: 0,
      completedPracticals: [],
      completedLessons: [],
      blocks: [],
    },
    expected: 'PERMISSION_DENIED',
  },
  {
    id: 'DD-07',
    description: 'Reject shadow field injection (role / isAdmin)',
    operation: 'create',
    path: '/users/attacker_uid',
    authUid: 'attacker_uid',
    payload: {
      uid: 'attacker_uid',
      username: 'Builder',
      avatarIcon: 'bot',
      avatarTheme: 'sky',
      xp: 50,
      completedPracticals: [],
      completedLessons: [],
      blocks: [],
      isAdmin: true,
    },
    expected: 'PERMISSION_DENIED',
  },
  {
    id: 'DD-08',
    description: 'Reject oversized username (> 24 chars)',
    operation: 'update',
    path: '/users/attacker_uid',
    authUid: 'attacker_uid',
    payload: {
      username: 'A'.repeat(40),
    },
    expected: 'PERMISSION_DENIED',
  },
  {
    id: 'DD-09',
    description: 'Reject invalid document ID format',
    operation: 'create',
    path: '/users/bad$id!space',
    authUid: 'bad$id!space',
    payload: { uid: 'bad$id!space', username: 'Bad' },
    expected: 'PERMISSION_DENIED',
  },
  {
    id: 'DD-10',
    description: 'Reject negative or out-of-range XP value',
    operation: 'update',
    path: '/users/attacker_uid',
    authUid: 'attacker_uid',
    payload: { xp: -100 },
    expected: 'PERMISSION_DENIED',
  },
  {
    id: 'DD-11',
    description: 'Reject unbounded practicals array (> 50 items)',
    operation: 'update',
    path: '/users/attacker_uid',
    authUid: 'attacker_uid',
    payload: {
      completedPracticals: Array.from({ length: 55 }, (_, i) => `item_${i}`),
    },
    expected: 'PERMISSION_DENIED',
  },
  {
    id: 'DD-12',
    description: 'Reject client-forged createdAt mutation on update',
    operation: 'update',
    path: '/users/attacker_uid',
    authUid: 'attacker_uid',
    payload: {
      createdAt: '2020-01-01T00:00:00Z',
    },
    expected: 'PERMISSION_DENIED',
  },
];
