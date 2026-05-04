# Security Specification: Smart To-Do

## 1. Data Invariants
- A task must have a name, a valid date, and belong to an authenticated user.
- A habit must have a name, frequency, and belong to an authenticated user.
- A habit completion must reference an existing habit and the user who owns it.
- Focus mode restricts task display but user can still have more tasks in DB (rules should allow CRUD, UI handles focus).

## 2. The Dirty Dozen Payloads (Rejection Targets)
1. **Identity Theft**: Creating a task with `userId` of another user.
2. **Shadow Field**: Adding `isAdmin: true` to a user profile.
3. **ID Poisoning**: Using a 2KB string as a task ID.
4. **Negative Streak**: Setting habit `streak` to -1.
5. **Future Completion**: Creating a habit completion for a date in the distant future (UI handles today, rules should cap date size/format).
6. **Orphan Completion**: Creating a completion for a non-existent habit.
7. **Cross-User Habit Update**: Updating another user's habit streak.
8. **Invalid Enum**: Setting `frequency` to 'monthly' (not allowed).
9. **Spam Tasks**: Creating a task with a name > 1000 characters.
10. **Timestamp Spoofing**: Setting `createdAt` to a manual timestamp instead of server time.
11. **Email Spoofing**: Reading a user profile where email is not verified (if mandated).
12. **Blanket Read**: Fetching all tasks in the system without a `userId` filter.

## 3. Test Runner Strategy
- `isValidId(id)` helper to restrict ID length and characters.
- `affectedKeys().hasOnly()` for updates.
- `isOwner()` check for all resources.
