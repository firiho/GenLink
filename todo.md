# TODOs

## 🔥 Critical Priority

- Wire up real Firebase password reset handling inside `src/pages/ForgotPassword.tsx` (currently only simulates API call).
- Create and maintain `profiles` records during signup/profile edits so data consumers (`src/services/auth.ts`, `src/components/dashboard/OverviewTab.tsx`, `src/components/dashboard/TeamsTab.tsx`, `src/pages/Community.tsx`) stop hitting missing documents.
- Fix the challenge join redirect (`/login` → `/signin`) and align challenge participation counters so `total_active_challenges` updates feed the dashboard stats (`src/pages/ChallengeView.tsx`, `src/components/dashboard/OverviewTab.tsx`).
- Guard `getAnalytics` so Firebase initialization does not break outside the browser (add conditional check for `typeof window !== 'undefined'` in `src/lib/firebase.ts`).
- Fix TypeScript `any` types throughout codebase for better type safety (`src/contexts/AuthContext.tsx`, `src/components/teams/ManageTeamModal.tsx`, `src/components/dashboard/TeamsTab.tsx`, `src/components/partner-dashboard/Stats.tsx`).

## 🚧 High Priority - Features & Functionality

- Extend `TeamService.discoverTeams` to respect all filters, and persist the `activeChallenges`/`completedChallenges` fields that the UI expects (`src/services/teamService.ts`, `src/components/teams/TeamDiscovery.tsx`, `src/components/teams/TeamCard.tsx`, `src/pages/PublicTeamDiscovery.tsx`).
- Persist participant profile and settings changes back to Firestore instead of keeping UI-only state (`src/components/dashboard/SettingsTab.tsx`, related profile components).
- Finish partner/admin workflows such as partner approvals and challenge publishing so Firestore documents remain in sync (`src/components/admin-dashboard/Partners.tsx`, `src/components/partner-dashboard/NewChallengeForm.tsx` and `ChallengesView.tsx`).
- Add real notification system - currently using mock `NotificationsDropdown` without backend integration (`src/components/dashboard/NotificationsDropdown.tsx`).
- Implement actual support ticket system in admin dashboard - currently only showing mock data (`src/components/admin-dashboard/Support.tsx`).
- Add real-time analytics data fetching instead of mock stats in admin dashboard (`src/components/admin-dashboard/Analytics.tsx`).
- Implement team member management functionality - add/remove members, change roles (`src/components/partner-dashboard/SettingsView.tsx` shows hardcoded members).
- Add billing/payment system integration for partners (`src/components/partner-dashboard/SettingsView.tsx` shows placeholder billing history).

## 📊 Data & Backend

- Replace hard-coded showcase data in public pages with live Firestore content (or clearly flag as demo content) (`src/pages/Projects.tsx`, `src/pages/Community.tsx`, `src/pages/Index.tsx` winners section).
- Add pagination/infinite scroll for large datasets - challenges list, teams list, community members, submissions (`src/components/challenges/PublicChallenges.tsx`, `src/pages/Community.tsx`).
- Implement proper error boundaries for component-level error handling across the app.
- Add data validation and sanitization for all form inputs before Firestore writes.
- Implement Firestore security rules validation and testing (`firestore.rules`).
- Add image optimization and compression before upload to Firebase Storage.
- Implement rate limiting for API calls and form submissions.

## 🐛 Bug Fixes

- Remove excessive `console.log` and `console.error` statements throughout codebase (found 20+ instances) - implement proper logging service instead.
- Fix missing error handling in async operations - many try/catch blocks only log errors without user feedback.
- Resolve routing inconsistencies - reconcile duplicate routing helpers versus actual router usage to prevent drift (`src/components/AppRoutes.tsx`, `src/App.tsx`, `src/lib/routing.ts`).
- Fix broken footer links - many links point to non-existent pages (`src/components/Footer.tsx` - /docs, /help, /blog, /partners, /contact pages don't exist).
- Fix challenge card navigation using wrong route (`/challenge/:id` should be `/challenges/:id`).
- Add proper loading states and skeletons for all async data fetches.
- **Fix hardcoded partner logos** in `Partners.tsx` - most logo files don't exist (MTN, Bank of Kigali, etc.).
- **Update placeholder billing in SettingsView** - remove hardcoded credit card info, add Mobile Money options.
- **Fix timezone-naive date handling** - all dates should respect CAT timezone.
- **Currency display inconsistency** - some places show `$` symbol, need RWF support.

## 🎨 UI/UX Improvements

- Add proper empty states for all lists (teams, challenges, notifications, etc.).
- Implement proper mobile responsiveness testing - some components may overflow on small screens.
- Add keyboard navigation support for all interactive elements (accessibility).
- Implement proper focus management for modals and dialogs.
- Add loading indicators for all image uploads and file operations.
- Improve error messages to be more user-friendly and actionable.
- Add confirmation dialogs for destructive actions (delete team, archive challenge, etc.).
- Implement toast notifications for all background operations.

## 🔒 Security & Performance

- Add proper authentication guards for all protected routes.
- Implement CSRF protection for forms.
- Add input sanitization to prevent XSS attacks.
- Implement proper session management and token refresh logic.
- Add email verification flow for new user signups.
- Implement 2FA/MFA option for admin accounts.
- Add audit logging for admin actions.
- Optimize bundle size - current dependencies might be bloated.
- Implement code splitting for better initial load performance.
- Add service worker for offline support and PWA capabilities.

## 📝 Code Quality

- Add comprehensive unit tests for services and utilities.
- Add integration tests for critical user flows.
- Add E2E tests for main user journeys.
- Implement proper TypeScript strict mode and fix all type issues.
- Add JSDoc comments for all exported functions and components.
- Implement consistent error handling pattern across the codebase.
- Add pre-commit hooks for linting and formatting (husky + lint-staged).
- Set up CI/CD pipeline for automated testing and deployment.
- **Add proper date formatting with localization** (currently hardcoded to 'en-US' in multiple places).
- **Standardize currency formatting** across all components (inconsistent use of `toLocaleString()`).
- **Create reusable payment/currency utilities** to handle RWF, USD conversions.

## � Payment & Financial Integration (CRITICAL - Regional Focus)

- **Integrate Mobile Money payments (MTN MoMo, Airtel Money)** - Primary payment method in Rwanda/East Africa for:
  - Partner subscription fees
  - Challenge entry fees (if applicable)
  - Prize pool funding
  - Platform transaction fees
- **Add multi-currency support:**
  - Rwandan Franc (RWF) as primary currency
  - USD as secondary
  - Display currency conversion rates
  - Allow users to set preferred currency
- **Implement prize payout system:**
  - Direct Mobile Money payouts to winners
  - Bank transfer integration (Bank of Kigali, Equity Bank, etc.)
  - Multi-winner distribution automation
  - Tax withholding compliance for Rwanda
  - Payment verification and receipt generation
- **Partner billing system:**
  - Subscription tiers with local pricing
  - Mobile Money recurring payments
  - Invoice generation with Rwanda tax compliance
  - Payment history and analytics
  - Automated reminders for payment due dates
- **Transaction management:**
  - Secure payment gateway integration (MTN, Airtel APIs)
  - Payment status tracking (pending, completed, failed)
  - Refund handling
  - Payment dispute resolution system
  - Escrow system for challenge prizes
- **Financial reporting:**
  - Revenue analytics dashboard
  - Transaction logs with filters
  - Export financial reports (CSV, PDF)
  - Tax reporting features
  - Partner payout tracking

## 🌍 Localization & Regional Features (CRITICAL - Rwanda/East Africa)

- **Multi-language support:**
  - English (primary)
  - Kinyarwanda (national language)
  - French (official language)
  - Swahili (East African regional)
  - i18n implementation with language switcher
  - RTL support consideration for future
- **Regional time zones:**
  - Default to CAT (Central Africa Time / GMT+2)
  - Display all dates/times in local timezone
  - Event scheduling with timezone awareness
- **Local content and examples:**
  - Rwanda-specific challenge templates
  - Local company/startup showcases
  - East African success stories
  - Regional innovation hubs integration
- **Regional partnerships:**
  - Integration with local innovation hubs (Kigali Innovation City, Norrsken, Impact Hub)
  - Rwanda government ministry partnerships
  - East African Community (EAC) expansion features
  - COMESA tech initiative integration
- **Local compliance:**
  - Rwanda data privacy laws compliance
  - Local business registration requirements
  - Tax compliance (VAT, withholding tax)
  - Terms of service aligned with Rwanda laws
- **Regional infrastructure:**
  - CDN optimization for East Africa
  - Local data centers consideration
  - SMS notifications via local providers (MTN, Airtel)
  - WhatsApp integration for notifications (widely used in Rwanda)

## �🚀 New Features

- Add real-time collaboration features for teams (chat, shared workspace).
- Implement challenge submission review and grading system for partners.
- Add leaderboard functionality for challenges and overall platform.
- Implement achievement/badge system for user gamification.
- Add email notification system for important events (challenge starts, team invites, etc.).
- Implement advanced search and filtering across all content.
- Add social sharing capabilities for challenges and achievements.
- Implement user reputation/karma system.
- Add mentorship/matching system to connect beginners with experts.
- Implement challenge templates for partners to quick-create similar events.
- **Add SMS notifications system for important updates** (critical in Rwanda - more reliable than email).
- **Implement WhatsApp Business API integration** for communication and notifications.
- **Add offline-first capabilities** for areas with poor internet connectivity.
- **Implement data-light mode** for users with limited internet bundles.
- **Add voice/audio features** for accessibility and low-literacy users.
- **Create skills marketplace** to connect freelancers with opportunities.
- **Implement job board** for tech opportunities in Rwanda/East Africa.

## 📚 Documentation

- Add comprehensive README with setup instructions.
- Create API documentation for all services.
- Add component storybook for UI components.
- Create user guide for participants, partners, and admins.
- Document Firestore schema and data models.
- Add deployment guide for production environment.
- Create troubleshooting guide for common issues.

## 🧪 Testing & Monitoring

- Set up error tracking (Sentry, LogRocket, etc.).
- Implement analytics tracking for user behavior.
- Add performance monitoring for page load times.
- Set up uptime monitoring for critical services.
- Add A/B testing framework for feature experiments.
- Implement feature flags for gradual rollouts.
- **Monitor Mobile Money payment success rates** and failure reasons.
- **Track regional performance metrics** (load times by location).
- **Add network quality detection** to adapt features for slow connections.

## 🎯 Rwanda-Specific Features

- **Government integration:**
  - Rwanda Development Board (RDB) portal integration
  - IREMBO services integration for business registration
  - RRA (Revenue Authority) tax integration
- **Education partnerships:**
  - ALU (African Leadership University) integration
  - UR (University of Rwanda) collaboration features
  - TVET schools partnership programs
- **Community features:**
  - Kigali tech meetup calendar integration
  - Co-working space booking (kLab, Impact Hub, Norrsken)
  - Local event promotion and RSVP system
- **Startup ecosystem:**
  - Investment readiness scorecard
  - Connect with local VCs and angel investors
  - Incubator/accelerator program listings (250 Startups, Westerwelle, etc.)
  - Pitch deck templates for Rwandan context
- **Digital infrastructure:**
  - Integration with Rwanda's digital platforms (Irembo, RSSBOnline, etc.)
  - Support for National ID verification (Nida)
  - Rwanda digital payment systems
- **Social impact tracking:**
  - SDG alignment tracking for challenges
  - Social impact metrics dashboard
  - Community benefit measurements
  - Job creation tracking
- **Local market features:**
  - Support for local languages in challenge descriptions
  - Agriculture tech category (relevant for Rwanda)
  - Tourism tech innovations
  - Healthcare/telemedicine solutions category
  - Clean energy/sustainability focus