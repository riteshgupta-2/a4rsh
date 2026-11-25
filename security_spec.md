# HARRBOTIX Security Specification (Phase 0)

## 1. Data Invariants
1. **Strict Ownership**: Every document under `/users/{userId}` and `/users/{userId}/private/{docId}` belongs strictly to the authenticated user whose `request.auth.uid == userId`.
2. **PII Isolation**: Email addresses (`email`) and phone numbers (`phoneNumber`) are stored exclusively in `/users/{userId}/private/account`, never in `/users/{userId}`.
3. **No User Enumeration**: `allow list` is `false` on both `/users` and `/users/{userId}/private`. Only single-document `get` by the owning UID is permitted.
4. **Schema & Bounds Integrity**: Usernames must be 2–24 characters, `xp` must be an integer between `0` and `1000000`, arrays are strictly bounded (`completedPracticals <= 50`, `completedLessons <= 50`, `blocks <= 100`), and `uid` / `createdAt` are immutable after creation.
5. **Temporal Integrity**: `createdAt` and `updatedAt` must equal `request.time` on creation, and `updatedAt` must equal `request.time` on update.

## 2. The "Dirty Dozen" Payloads (Expected: `PERMISSION_DENIED`)
1. Unauthenticated read of `/users/user_123`.
2. Unauthenticated write to `/users/user_123`.
3. Cross-user read of `/users/victim_uid` by `attacker_uid`.
4. Cross-user read of PII `/users/victim_uid/private/account` by `attacker_uid`.
5. `list` query on `/users` collection by an authenticated user.
6. Identity spoofing on create: writing `uid: "victim_uid"` under `/users/attacker_uid`.
7. Shadow field injection: adding `isAdmin: true` or `role: "admin"` on `/users/attacker_uid`.
8. Oversized username poisoning: `username` length > 24 characters.
9. Oversized document ID poisoning: `userId` > 128 characters or containing invalid symbols.
10. Invalid XP poisoning: setting `xp: -50`, `xp: "9999"`, or `xp: 99999999`.
11. Unbounded array exhaustion: sending `completedPracticals` with 51+ elements or `blocks` with 101+ elements.
12. Client-forged timestamp or immutable field mutation: altering `createdAt` or `uid` on update, or omitting `request.time` for `updatedAt`.
