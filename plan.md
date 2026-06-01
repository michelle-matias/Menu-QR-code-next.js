# Plan: Refactor Menu4U QR-Code Project to Next.js

## TL;DR
Rewrite your vanilla JavaScript SPA as a modern Next.js 14+ application with App Router, keeping Supabase as your backend. This migration improves code organization, adds built-in optimizations, enables environment variable management, and provides a foundation for future scalability. The rewrite follows a modular approach: establish the Next.js foundation + core infrastructure, then migrate each feature module sequentially (auth → menu editor → QR generator → orders → statistics), finally moving shared components.

---

## Steps

### **Phase 1: Project Setup & Infrastructure** (Foundation - blocks all other phases)

1. **Initialize Next.js project with modern defaults**
   - Create new Next.js 14+ project with TypeScript and App Router
   - Install dependencies: `next`, `react`, `react-dom`, `@supabase/supabase-js`
   - Structure: `/src/app`, `/src/components`, `/src/lib`, `/src/styles`
   - Keep current `/public` folder organization (fonts, icons, etc.)

2. **Set up environment configuration**
   - Create `.env.local` with Supabase URL and API key (move from `.env.js`)
   - Create `.env.example` for documentation
   - Add `next.config.js` for any custom configurations

3. **Configure Supabase client**
   - Create `/src/lib/supabase.ts` with single Supabase client instance
   - Implement utility functions for common operations (auth, CRUD, storage)
   - Add auth state management using React Context + hooks
   - Create `/src/hooks/useAuth.ts` for auth state and session validation

4. **Build core layout & navigation component**
   - Create root layout (`/src/app/layout.tsx`) with header
   - Build reusable header component (`/src/components/Header.tsx`) with restaurant name
   - Build sidebar navigation component (`/src/components/Sidebar.tsx`)
   - Create protected layout wrapper (`/src/app/(dashboard)/layout.tsx`) for authenticated pages
   - Add global CSS from `shared.css` to layout

---

### **Phase 2: Authentication System** (Depends on Phase 1 - blocks dashboard pages)

5. **Implement authentication pages & flows**
   - Create `/src/app/(auth)/page.tsx` - Main/landing page (replaces `main.html`)
   - Create `/src/app/(auth)/login/page.tsx` - Login page (replaces `login/login.html`)
   - Create `/src/app/(auth)/register/page.tsx` - Register page (replaces `Create account/Create.html`)
   - Migrate auth logic from `login.js` and `create.js` to each respective page
   - Implement redirect logic: unauthenticated → landing, authenticated → `/dashboard`

6. **Create authentication context & hooks**
   - Build `AuthProvider` wrapper for session state
   - Implement protected route middleware using Next.js middleware
   - Add loading states for auth transitions
   - Create hook: `useProtectedRoute()` to gate dashboard access

---

### **Phase 3: Dashboard & Statistics** (Depends on Phase 2 - provides reference layout)

7. **Build dashboard page & layout**
   - Create `/src/app/(dashboard)/page.tsx` - Main dashboard (replaces `estatistics.html`)
   - Migrate statistics logic from `estatistics.js`
   - Use client component for real-time data fetching
   - Create reusable stat cards: `MetricCard.tsx`, `TrendIndicator.tsx`

---

### **Phase 4: Menu Editor Module** (Parallel with Phases 3+ after Phase 2)

8. **Implement menu management pages & components**
   - Create `/src/app/(dashboard)/menu/page.tsx` - Menu list view
   - Create `/src/app/(dashboard)/menu/[id]/edit/page.tsx` - Edit dish page (dynamic routes)
   - Create `/src/app/(dashboard)/menu/create/page.tsx` - Create new dish page
   - Migrate menu CRUD logic from `menu_editor/menu.js`
   - Build reusable components:
     - `DishForm.tsx` - Form for create/edit (handles image upload)
     - `DishCard.tsx` - Display individual dish
     - `DishGallery.tsx` - Grid/list of dishes
     - `ImageUploader.tsx` - Supabase storage integration

---

### **Phase 5: QR Code Generator Module** (Parallel with Phase 4 after Phase 2)

9. **Implement QR code generation page**
   - Create `/src/app/(dashboard)/qr/page.tsx` - QR code generator (replaces `QR-Code/QR.html`)
   - Migrate QR customization logic from `QR.js`
   - Build reusable components:
     - `QRCodePreview.tsx` - Display generated QR code
     - `QRCustomizer.tsx` - Color, logo, error correction options
     - `QRExporter.tsx` - PNG/SVG/Print export functionality
   - Keep `qrcode.min.js` library or migrate to npm package

---

### **Phase 6: Orders Management Module** (Parallel with Phase 4-5 after Phase 2)

10. **Implement orders tracking page**
    - Create `/src/app/(dashboard)/orders/page.tsx` - Orders list (replaces `orders/order.html`)
    - Migrate order logic from `orders/order.js`
    - Build reusable components:
      - `OrdersTable.tsx` - Display order list with status
      - `OrderStatusBadge.tsx` - Status indicator
      - `OrderMetrics.tsx` - Today's count, pending, completed, revenue
      - `PrinterIntegration.tsx` - Printer connection UI (keep placeholder for future)
    - Set up real-time updates with Supabase subscriptions (optional enhancement)

---

### **Phase 7: Styling & Assets** (Parallel with all feature phases)

11. **Migrate styling system**
    - Option A (Recommended): Keep CSS files, move to `/src/styles` and import in components
    - Option B: Migrate to CSS Modules (`file.module.css`)
    - Option C: Add Tailwind CSS for faster development
    - Convert inline styles from `element.style.*` to className props
    - Consolidate `shared.css` styles into component-level imports

12. **Set up font & icon imports**
    - Configure Font Awesome 6 (via npm or CDN in HTML head)
    - Ensure all icon references from current `.css` are preserved

---

### **Phase 8: Data Layer & Utilities** (Parallel foundation work)

13. **Create database query utilities**
    - Build `/src/lib/database.ts` with typed queries:
      - `getDishes(userId)`, `createDish()`, `updateDish()`, `deleteDish()`
      - `getOrders(userId)`, `updateOrderStatus()`
      - `getStatistics()` with date filters
    - Create TypeScript types for tables: `Dish`, `Order`, `User` in `/src/types/`
    - Add error handling & logging utilities

14. **Create storage utility**
    - Build `/src/lib/storage.ts` for dish image uploads
    - Handle file naming, URL generation, error cases
    - Migrate from hardcoded storage logic to reusable functions

---

### **Phase 9: Testing & Quality Assurance** (After Phases 1-8)

15. **Manual testing & validation**
    - Test complete auth flow: register → login → redirect
    - Verify each dashboard page loads with correct data
    - Test CRUD operations on menu (create, read, update, delete)
    - Test QR generation and export options
    - Test order status updates
    - Verify statistics calculations
    - Test responsive design and header/sidebar navigation
    - Validate Supabase queries and error states

---

## Relevant Files

**To Migrate/Reference:**
- `config.js` → `/src/lib/config.ts` (environment constants)
- `header.js` → `/src/components/Header.tsx`
- `shared.css` → `/src/styles/global.css` (or distribute to components)
- `login/login.js` → `/src/app/(auth)/login/page.tsx`
- `Create account/create.js` → `/src/app/(auth)/register/page.tsx`
- `main/main.js` → `/src/app/(auth)/page.tsx`
- `menu_editor/menu.js` → `/src/app/(dashboard)/menu/page.tsx` + `DishForm.tsx`, `DishCard.tsx`
- `QR-Code/QR.js` → `/src/app/(dashboard)/qr/page.tsx` + `QRCodePreview.tsx`, `QRCustomizer.tsx`
- `orders/order.js` → `/src/app/(dashboard)/orders/page.tsx` + `OrdersTable.tsx`
- `estatistics/estatistics.js` → `/src/app/(dashboard)/page.tsx` + `MetricCard.tsx`

**New Files to Create:**
- `/src/lib/supabase.ts` — Supabase client instance
- `/src/lib/database.ts` — Typed database query functions
- `/src/lib/storage.ts` — Image storage utilities
- `/src/hooks/useAuth.ts` — Auth state hook
- `/src/types/index.ts` — TypeScript types for `Dish`, `Order`, `User`, etc.
- `next.config.js` — Next.js configuration
- `.env.local` — Environment variables (not committed)
- `.env.example` — Template for environment variables

---

## Verification

1. **Authentication verification:**
   - New user can register successfully
   - Login redirects to `/dashboard` with valid credentials
   - Unauthenticated access to `/dashboard/*` redirects to login
   - Session persists on page refresh

2. **Menu editor verification:**
   - Can view all dishes for logged-in user
   - Can create new dish with image upload
   - Can edit dish name, price, description, category, image
   - Can delete dish (remove from database and storage)
   - Dishes are user-scoped (don't see other users' dishes)

3. **QR code verification:**
   - QR code generates with custom URL
   - Color customization updates preview in real-time
   - Logo upload overlays correctly
   - Export to PNG/SVG works
   - Print option opens print dialog

4. **Orders verification:**
   - Orders display with correct status
   - Status can be updated (pending → done)
   - Metrics calculate correctly (today's count, pending, completed, revenue)
   - Only shows current user's orders

5. **Statistics verification:**
   - Dashboard shows correct metrics (orders today, revenue, etc.)
   - Trend indicators (↑/↓) display correct comparisons
   - Most ordered dishes list is accurate
   - Date filtering works for comparisons

6. **General verification:**
   - Header displays restaurant name from user metadata
   - Sidebar navigation works on all dashboard pages
   - CSS styling matches current design
   - No console errors or warnings
   - Application is responsive on mobile/tablet

---

## Decisions

- **Next.js App Router (not Pages Router):** App Router is the modern standard with better performance, built-in optimizations, and cleaner file structure
- **Keep Supabase:** Maintains backend compatibility, no database migration needed
- **No testing suite added:** Per user preference; manual testing only
- **Client components for data fetching:** Use `useEffect` + Supabase client directly in components (simpler than API routes for your use case, since Supabase auth is client-based)
- **TypeScript optional but recommended:** Improves code quality and IDE support, though not strictly required
- **CSS strategy:** Keep existing CSS files for now (minimal refactoring overhead), organize in `/src/styles`
- **No API routes needed:** Supabase client-side queries are sufficient; only add API routes if you need server-side operations later

---

## Further Considerations

1. **Environment variable handling:** Should we add a `.env.local.template` file with instructions for developers on how to obtain Supabase credentials? *(Recommended: Yes, improves security and onboarding)*

2. **Error boundaries & loading states:** The current app has minimal error handling. Should we add React Error Boundaries and loading skeletons during this refactor? *(Recommended: Yes, especially for data-heavy pages like menu editor and statistics)*

3. **Real-time updates:** The current Orders page could benefit from Supabase real-time subscriptions for live order updates. Should we implement this during migration? *(Recommended: Add as Phase 6.5 - optional enhancement, not blocking)*
