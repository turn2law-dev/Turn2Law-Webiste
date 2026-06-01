# 🟢 Later Fixes (Low Priority)

> These can be fixed after launch / during maintenance sprints

---

## UI Polish
| # | Issue | File |
|---|-------|------|
| 36 | No confirm for destructive actions | Wallet |
| 37 | Missing empty states | Dashboard |
| 41 | Missing keyboard accessibility | Various |
| 47 | Loading spinner inconsistent | Various |
| 51 | Mobile menu missing some pages | Various |
| 55 | Downloads as .txt not .docx | `documents/page.tsx` |
| 56 | No loading skeleton on cards | `documents/page.tsx` |

---

## Code Quality
| # | Issue | File |
|---|-------|------|
| 29 | Console.log in production | Multiple |
| 30 | Magic numbers throughout | Multiple |
| 31 | Hardcoded LawGPT API URL | `lawgpt/page.tsx` |
| 32 | Unused `index` variable | `lawgpt/page.tsx` |
| 33 | Type assertion `any` | `lawgpt/page.tsx` |
| 34 | Duplicate Logo components | `login/signup` |
| 35 | Missing Error Boundaries | All pages |
| 38 | Inconsistent date formatting | Multiple |
| 39 | No TypeScript strict mode | `tsconfig.json` |
| 40 | Tailwind classes repetitive | Multiple |
| 42 | Inconsistent naming (camel/snake) | Multiple |
| 43 | No offline handling | All pages |
| 44 | Large component files | `lawgpt`, `dashboard` |
| 45 | Potential XSS in forms | Service pages |
| 46 | No API response types | Frontend |
| 48 | Unused CSS classes | Various |
| 49 | Service success unclear | Service pages |
| 57 | Form persisted in localStorage | `use-documents-store.ts` |
| 63 | Type `any` in SmartMatch | `SmartMatchModal.tsx` |
| 64 | Type `any` in verify-email | `verify-email-otp/page.tsx` |

---

## Quick Wins (30 min fixes)

When you have spare time:
- [ ] Remove `console.log` statements
- [ ] Fix title truncation "..." logic
- [ ] Remove deprecated auth file
- [ ] Fix "Member Since" to use `created_at`
- [ ] Remove hardcoded "+15% this month"
