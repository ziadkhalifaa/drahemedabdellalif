# 🏥 Full-Stack Premium Upgrade — Dr. Ahmed Abdellatif Platform

## Overview

This plan covers a comprehensive upgrade of the Dr. Ahmed medical platform across **39 issues** organized in **6 phases**.
- **Frontend URL**: `http://gold-buffalo-912779.hostingersite.com/`
- **UltraMsg**: Instance `instance174882`, Token `8xs47mo4xtkktjfl`
- **Daily.co**: Key `f23110b62ea2208d4461ac0bdc48588ea85095a400a08cb97ae46577b754ed35`

---

## Proposed Changes

### Phase 1 — Critical Security (Issues #1-5)
- Fix CORS origin to `http://gold-buffalo-912779.hostingersite.com/`
- Add `emailVerificationExpiry`, `passwordResetCode`, `passwordResetExpiry` to User model
- Implement OTP expiry (10 mins)
- Add rate limiting to auth routes
- Disable Swagger in production

### Phase 2 — Core Backend Features (Issues #6-13)
- Working Hours API (CRUD + Available Slots)
- Pagination for all list endpoints
- Medical Reports upload for Admin
- Admin Notification Badges API
- UltraMsg WhatsApp Integration

### Phase 3 — Frontend Pages & Components (Issues #14-22)
- Dynamic Time Slots in Booking Wizard
- Admin Schedule management page
- SEO-optimized About page
- Custom 404, Loading, and Error pages
- Skeleton loaders
- Lightbox for Gallery
- Admin Calendar View

### Phase 4 — SEO & Performance (Issues #23-27)
- JSON-LD Structured Data
- Complete Sitemap
- Meta tags for all pages
- robots.txt update
- Cairo Arabic Font integration

### Phase 5 — Premium Features (Issues #28-35)
- Newsletter system
- Real-time Admin Notification badges
- Advanced GA4 tracking
- Footer social links & Settings API integration
- Admin Settings Page

### Phase 6 — Technical Polish (Issues #36-39)
- Refresh Token mechanism
- Image upload validation (size & MIME)
- Frontend API error handling improvements
- Appointment Reminder Cron (Email/WhatsApp)

---

## Verification Plan
1. `npx nest build` and `npx next build` checks.
2. Manual verification of booking flow and security restrictions.
3. Verify WhatsApp and Video consultation integration.
