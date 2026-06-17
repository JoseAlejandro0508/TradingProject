# Tasks: Home Page Update

## Phase 1: Foundation (CSS Variables & Theme System) - 8 hours

- [ ] 1.1 Create CSS variables system in `src/styles.scss` for TradingView theme
- [ ] 1.2 Add 6 banner gradient color tokens (--tv-banner-1 through --tv-banner-6 with glow sync)
- [ ] 1.3 Implement dark mode default variables (--tv-bg-main: #0c0d14, etc.)
- [ ] 1.4 Implement light mode variant [data-theme="light"] overrides
- [ ] 1.5 Add trading colors (--tv-red: #ef5350, --tv-green: #26a69a, --tv-blue: #2962ff)
- [ ] 1.6 Update ThemeService to export current theme as Observable for reactive sync
- [ ] 1.7 Create navbar glow animation CSS keyframes (transition 0.4s ease)
- [ ] 1.8 Create candlestick fluctuation animation keyframes (multiple durations: 2s, 2.5s, 3s, 3.5s)
- [ ] 1.9 Create toast slide-down animation with cubic-bezier(0.4, 0, 0.2, 1)
- [ ] 1.10 Create LIVE badge pulse glow animation
- [ ] 1.11 Verify all CSS variables render correctly in both themes

## Phase 2: Component Creation - 20 hours

### 2.1 Home Navbar Component - 3 hours
- [ ] 2.1.1 Create `home-navbar.component.ts` with HamburgerMenu, Brand, Support, ThemeToggle inputs
- [ ] 2.1.2 Create `home-navbar.component.html` with fixed top positioning, hamburger icon, brand logo
- [ ] 2.1.3 Implement theme toggle button using existing ThemeService
- [ ] 2.1.4 Create `home-navbar.component.scss` with exact paneltrd.html CSS
- [ ] 2.1.5 Add bottom glow line that syncs with banner color
- [ ] 2.1.6 Write unit tests: render, theme toggle, hamburger click
- [ ] 2.1.7 Acceptance: Navbar fixed at top, glow line animates, theme toggle works

### 2.2 Promo Carousel Component - 4 hours
- [ ] 2.2.1 Create `promo-carousel.component.ts` with Input slides: Array<Slide>
- [ ] 2.2.2 Create `promo-carousel.component.html` with 100vw width, 165px height
- [ ] 2.2.3 Implement 6 slides with distinct gradient backgrounds
- [ ] 2.2.4 Implement auto-scroll with 5s interval
- [ ] 2.2.5 Implement dot indicators (6 dots) with active state
- [ ] 2.2.6 Add scroll-snap and smooth scroll behavior
- [ ] 2.2.7 Create `promo-carousel.component.scss` with exact paneltrd.html CSS
- [ ] 2.2.8 Write unit tests: auto-scroll, dot navigation, manual scroll
- [ ] 2.2.9 Acceptance: 100vw, 165px height, auto-scroll, dots work, smooth transitions

### 2.3 Balance Card Component - 2 hours
- [ ] 2.3.1 Create `balance-card.component.ts` with Input balance: number
- [ ] 2.3.2 Create `balance-card.component.html` with balance display, COP format
- [ ] 2.3.3 Add top accent line with gradient
- [ ] 2.3.4 Create `balance-card.component.scss` with exact paneltrd.html CSS
- [ ] 2.3.5 Implement currency formatting pipe for COP (Colombian Peso)
- [ ] 2.3.6 Write unit tests: balance display, formatting, accent line
- [ ] 2.3.7 Acceptance: Shows formatted COP balance, accent line at top

### 2.4 Earnings Card Component - 5 hours
- [ ] 2.4.1 Create `earnings-card.component.ts` with bot availability logic
- [ ] 2.4.2 Inject BotPlanService to check getAvailableBots()
- [ ] 2.4.3 Create LIVE badge with pulse glow animation
- [ ] 2.4.4 Create candlestick chart with 4 candles using fluctuate animation
- [ ] 2.4.5 Create "Free Bot" button with visibility based on availability
- [ ] 2.4.6 Implement toast notification on button click (success/error)
- [ ] 2.4.7 Create `earnings-card.component.html` with all elements
- [ ] 2.4.8 Create `earnings-card.component.scss` with exact paneltrd.html CSS
- [ ] 2.4.9 Write unit tests: LIVE badge, candle animation, bot button visibility, toast
- [ ] 2.4.10 Write integration tests: BotPlanService.getAvailableBots() integration
- [ ] 2.4.11 Acceptance: LIVE badge pulses, candles animate, free bot button shows/hides, toast displays

### 2.5 Action Grid Component - 3 hours
- [ ] 2.5.1 Create `action-grid.component.ts` with 4 action buttons
- [ ] 2.5.2 Create `action-grid.component.html` with Recargar, Retirar, Referidos, Cuenta buttons
- [ ] 2.5.3 Implement navigation routing for each button
- [ ] 2.5.4 Create `action-grid.component.scss` with exact paneltrd.html CSS
- [ ] 2.5.5 Add icons for each action button
- [ ] 2.5.6 Write unit tests: button rendering, navigation on click
- [ ] 2.5.7 Acceptance: 4 buttons in grid, navigation works, icons display

### 2.6 Daily Bonus Component - 3 hours
- [ ] 2.6.1 Create `daily-bonus.component.ts` with gift icon and click handler
- [ ] 2.6.2 Create `daily-bonus.component.html` with full-width button
- [ ] 2.6.3 Add gift/icon element to button
- [ ] 2.6.4 Create `daily-bonus.component.scss` with exact paneltrd.html CSS
- [ ] 2.6.5 Implement click navigation to canjear-bono route
- [ ] 2.6.6 Write unit tests: button rendering, navigation on click
- [ ] 2.6.7 Acceptance: Full-width button, gift icon visible, navigation works

## Phase 3: Integration - 4 hours

- [ ] 3.1 Refactor `home.component.ts` to import new 6 components
- [ ] 3.2 Update `home.component.html` to use new component structure
- [ ] 3.3 Inject UserPlansService to fetch balance via GET /api/UserPlans/GetBalaceToUser/{username}
- [ ] 3.4 Wire balance data to balance-card component
- [ ] 3.5 Integrate earnings-card with BotPlanService.getAvailableBots()
- [ ] 3.6 Implement earnings-card POST /api/BotPlans/Deploy on free bot activation
- [ ] 3.7 Connect navbar theme toggle to global ThemeService
- [ ] 3.8 Add cookie consent modal (3 hours) - show once per user
- [ ] 3.9 Verify all navigation routes work from action-grid
- [ ] 3.10 Test full data flow: login → balance load → bot check → home render

## Phase 4: Testing - 2 hours

- [ ] 4.1 Write visual regression tests for dark/light themes
- [ ] 4.2 Test responsive behavior at 320px, 375px, 414px, 768px breakpoints
- [ ] 4.3 Test all animations: glow sync, carousel scroll, candle fluctuation, toast slide
- [ ] 4.4 Test API integration: UserPlans.getBalaceToUser error handling
- [ ] 4.5 Test API integration: BotPlanService.getAvailableBots() error handling
- [ ] 4.6 Test API integration: BotPlans/Deploy success/error responses
- [ ] 4.7 Verify CSP compliance for all external resources
- [ ] 4.8 Accessibility audit: keyboard navigation, focus states, ARIA labels
- [ ] 4.9 Performance: Lighthouse score >90 on mobile
- [ ] 4.10 Cross-browser test: Chrome, Safari, Firefox, Edge

## Phase 5: Cleanup - 1 hour

- [ ] 5.1 Delete old components: notice, carousel, actions-card, slider, memberlist, activity, modal
- [ ] 5.2 Remove old component imports from home.component.ts
- [ ] 5.3 Delete old component directories from `src/app/components/home/components/`
- [ ] 5.4 Clean up unused CSS from `src/styles.scss` (if any)
- [ ] 5.5 Update documentation with new component structure
- [ ] 5.6 Create archive note in `openspec/changes/Home Page Update/archive.md`
- [ ] 5.7 Verify no broken references to old components
- [ ] 5.8 Run final build: `npm run build` with no errors
- [ ] 5.9 Run final test suite: `ng test` with all passing
- [ ] 5.10 Mark change as complete in SDD tracking
