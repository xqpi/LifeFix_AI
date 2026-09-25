# LifeFix Design System

> **Visual Source of Truth for the LifeFix Frontend**  
> *Version 1.0 — Visual Specification & AI Agent Implementation Guide*

---

## 1. Visual Theme & Atmosphere

LifeFix is an **intelligent, practical problem-solving workspace** designed to help users diagnose and resolve everyday, low-risk personal issues across technology, home living, productivity, cooking, tools, and lifestyle.

### The Emotional Experience
When a user arrives at LifeFix, they are often experiencing friction, confusion, or mild frustration. The visual atmosphere must immediately project:

> *"I have a problem. I can explain it naturally, and LifeFix will help me figure it out."*

### What LifeFix Feels Like:
- **Calm**: Low-contrast canvas backgrounds that reduce eye strain and visual noise.
- **Intelligent**: Crisp typographic hierarchy, clear diagnostic reasoning, and transparent source attribution.
- **Practical**: Actionable, numbered step-by-step solutions with difficulty and time estimates.
- **Friendly & Approachable**: Warm micro-interactions and non-judgmental language that invite clarification.
- **Trustworthy & Modern**: Hairline borders, precise alignment, and subtle elevation inspired by modern craft-focused engineering tools.
- **Simple & Focused**: A single clear path forward at every step of the journey.

### What LifeFix Is NOT:
- **NOT a Healthcare/Medical Application**: No sterile clinical blues, cross icons, or emergency triage styling.
- **NOT a Corporate Dashboard**: No dense analytics widgets, KPI scorecards, or complex multi-pane sidebars.
- **NOT a Generic Chatbot**: No speech bubbles, avatar ping-pongs, or endless conversation scrollback.
- **NOT a Cyberpunk/Futuristic AI Experiment**: No neon glowing borders, animated particle nets, matrix streams, or heavy glassmorphism.
- **NOT a Social Media Platform**: No endless feeds, noisy likes, or distracting gamification.

---

## 2. Design Philosophy

LifeFix blends design principles from three world-class product interfaces without copying any single brand:

| Inspiration Source | Principles Borrowed for LifeFix | How LifeFix Adapts It |
| :--- | :--- | :--- |
| **Claude** (Anthropic) | Humanist warmth, editorial typography, generous reading margins, thoughtful AI acknowledgment. | LifeFix uses a clean, warm-neutral canvas with empathetic problem understanding, avoiding cold technical detachment. |
| **Linear** | 1px hairline borders, compact metadata chips, status indicators, keyboard-first focus, uncompromising precision. | Solution steps, difficulty tags, time estimates, and source cases use crisp linear geometry and purposeful visual density. |
| **Notion** | Document-like modularity, scannable block layout, non-intimidating whitespace, content-first simplicity. | Solutions are formatted like actionable living guides rather than chat transcripts, making complex multi-step guidance easy to scan. |

### Core Architectural Principles:
1. **Respect the User's Attention**: Put the problem input front and center. Once a solution is generated, highlight the immediate first step.
2. **Structure Over Conversation**: Never present a solution as a monolithic block of AI text. Deconstruct it into an understanding summary, possible causes, numbered practical steps, warnings, and source cases.
3. **The Refinement Loop as a First-Class Citizen**: A solution is not final until the user confirms it worked. Feedback ("Did this solve your problem?") and Refinement ("Tell us what happened") are natural structural sections of the solution page, not hidden dialogs.
4. **Restraint as a Feature**: Colors are functional cues, not decorations. Purple is our purposeful accent—used for brand identity, primary actions, and active focus—never plastered across entire backgrounds.

---

## 3. Color Palette & Semantic Roles

The LifeFix color system is built on **semantic roles** to ensure high contrast, accessibility (WCAG AA compliant), and calm visual hierarchy.

> **Note on Dark Mode**: Dark mode is intentionally deferred. The initial design system focuses exclusively on an optimized, high-readability light workspace.

### Semantic Color Tokens

```css
:root {
  /* Canvas & Base Surfaces */
  --color-background: #F8F9FA;         /* Soft warm-tinted off-white canvas */
  --color-background-subtle: #F1F3F5;  /* Secondary background for containers & callouts */
  --color-surface: #FFFFFF;            /* Pure white for cards, panels, and input areas */
  --color-surface-elevated: #FFFFFF;   /* Raised surface for dropdowns, tooltips, modals */

  /* Text & Content */
  --color-text-primary: #111827;       /* Dark charcoal for headings and primary content */
  --color-text-secondary: #4B5563;     /* Muted slate for body instructions, descriptions */
  --color-text-muted: #6B7280;         /* Neutral gray for captions, metadata, timestamps */
  --color-text-inverse: #FFFFFF;       /* High contrast white text on dark/primary surfaces */

  /* Borders & Dividers */
  --color-border: #E5E7EB;             /* Crisp 1px hairline border for cards and inputs */
  --color-border-subtle: #F3F4F6;      /* Faint interior divider lines */
  --color-border-hover: #D1D5DB;       /* Interactive element hover border */
  --color-border-focus: #4F46E5;       /* Focus ring accent border */

  /* Primary Brand (Intelligent Iris / Purple Accent) */
  --color-primary: #4F46E5;            /* Iris 600: Calm, focused, intelligent accent */
  --color-primary-hover: #4338CA;      /* Iris 700: Hover state for primary actions */
  --color-primary-active: #3730A3;     /* Iris 800: Pressed state */
  --color-primary-soft: #EEF2FF;       /* Iris 50: Soft tinted background for chips & badges */
  --color-primary-border: #C7D2FE;     /* Iris 200: Subtle border for highlighted components */

  /* Success Semantic Role */
  --color-success: #059669;            /* Emerald 600: Confirmed solution, success state */
  --color-success-hover: #047857;      /* Emerald 700 */
  --color-success-soft: #ECFDF5;       /* Emerald 50: Success banner & tag backgrounds */
  --color-success-border: #A7F3D0;     /* Emerald 200 */

  /* Warning Semantic Role */
  --color-warning: #D97706;            /* Amber 600: Important cautions, prerequisite warnings */
  --color-warning-soft: #FFFBEB;       /* Amber 50: Cautionary callout box background */
  --color-warning-border: #FDE68A;     /* Amber 200 */

  /* Error Semantic Role */
  --color-error: #DC2626;              /* Red 600: Validation errors, failed attempts */
  --color-error-soft: #FEF2F2;         /* Red 50: Error message backgrounds */
  --color-error-border: #FECACA;       /* Red 200 */

  /* Info / Knowledge Semantic Role */
  --color-info: #2563EB;               /* Blue 600: Retrieved knowledge & RAG case indicators */
  --color-info-soft: #EFF6FF;          /* Blue 50: Source case badge backgrounds */
  --color-info-border: #BFDBFE;        /* Blue 200 */
}
```

### Color Distribution Strategy (The 60-30-10 Rule)
- **60% Neutral Canvas (`--color-background`, `--color-surface`)**: Generous, calm whitespace that allows dense problem-solving steps to breathe.
- **30% Structural Content (`--color-text-primary`, `--color-border`)**: High-contrast text and crisp 1px borders providing linear clarity.
- **10% Semantic Accents (`--color-primary`, `--color-success`, `--color-warning`)**: Reserved strictly for primary action buttons, status indicators, step numbers, and verified resolution states.

---

## 4. Typography

Typography is the backbone of LifeFix. Solutions must be effortlessly readable across diverse display sizes.

### Typeface Stack
- **Primary Sans**: `'Plus Jakarta Sans', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif`  
  *Why*: Plus Jakarta Sans offers geometric precision with humanist warmth, open counters for readability, and exceptional legibility at small sizes.
- **Monospace / Code / Data**: `'JetBrains Mono', 'SF Mono', Consolas, Menlo, monospace`  
  *Why*: Clean tabular numerals and high-legibility punctuation for case IDs, timers, and step coordinates.
- **Bilingual Arabic Fallback**: `'Noto Sans Arabic', 'Cairo', sans-serif`  
  *Why*: Matches the optical height and stroke weight of the primary sans for bilingual English/Arabic problem prompts.

### Typographic Scale

| Role | Font Size | Line Height | Weight | Letter Spacing | Usage |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **Display Heading** | `32px` (`2rem`) | `1.2` (`38px`) | `700` | `-0.025em` | Hero problem greeting, home headline |
| **Heading 1 (H1)** | `24px` (`1.5rem`) | `1.3` (`31px`) | `600` | `-0.02em` | Solution title, primary view header |
| **Heading 2 (H2)** | `20px` (`1.25rem`) | `1.35` (`27px`) | `600` | `-0.015em` | Section headers: "Recommended Steps", "Diagnosis" |
| **Heading 3 (H3)** | `16px` (`1rem`) | `1.4` (`22px`) | `600` | `-0.01em` | Step title, card group title |
| **Body Large** | `17px` (`1.0625rem`) | `1.6` (`27px`) | `400` | `0` | AI Understanding summary, lead problem text |
| **Body Regular** | `15px` (`0.9375rem`) | `1.55` (`23px`) | `400` | `0` | Default step instructions, explanations, inputs |
| **Body Small** | `13px` (`0.8125rem`) | `1.5` (`20px`) | `400` | `0` | Secondary notes, source case description |
| **Caption / Meta** | `12px` (`0.75rem`) | `1.4` (`17px`) | `500` | `+0.01em` | Badges, tags, timestamps, case IDs |
| **Button Text** | `14px` (`0.875rem`) | `1.0` (`14px`) | `600` | `-0.01em` | Button labels, interactive controls |
| **Input Text** | `15px` (`0.9375rem`) | `1.5` (`22px`) | `400` | `0` | Textarea and input field typing |

---

## 5. Spacing System

LifeFix adheres strictly to an **8px base grid** with a **4px half-step** for tight component padding.

```css
:root {
  --space-1: 4px;    /* Micro: badge padding, tight icon margins */
  --space-2: 8px;    /* Compact: between icon and label, gap in chip rows */
  --space-3: 12px;   /* Small: input vertical padding, compact card padding */
  --space-4: 16px;   /* Base: standard card padding, gap between step items */
  --space-5: 20px;   /* Medium: generous button padding, card header gap */
  --space-6: 24px;   /* Large: standard card interior spacing, gap between sections */
  --space-8: 32px;   /* Extra-Large: space between major page sections */
  --space-10: 40px;  /* Section: vertical spacing between hero and content */
  --space-12: 48px;  /* Major: top page padding on desktop */
  --space-16: 64px;  /* Hero padding on desktop */
}
```

### Layout Constraints
- **Primary Content Container (Problem Input & Solution View)**: `max-width: 768px` (`48rem`). Focused single-column reading column preventing long, unreadable line lengths.
- **Wide Utility Container (Navigation & Breadcrumbs)**: `max-width: 1024px` (`64rem`).
- **Standard Page Horizontal Padding**:
  - Mobile: `16px` (`--space-4`)
  - Tablet: `24px` (`--space-6`)
  - Desktop: `32px` (`--space-8`)

---

## 6. Border Radius

LifeFix utilizes purposeful, subtle curves. Elements feel soft and modern, but never ballooned or bubbly.

```css
:root {
  --radius-xs: 4px;    /* Inner tags, compact badges, case ID chips */
  --radius-sm: 6px;    /* Small buttons, input accessories, tooltips */
  --radius-md: 8px;    /* Standard buttons, search bars, rating stars */
  --radius-lg: 12px;   /* Solution step items, alert callout boxes */
  --radius-xl: 16px;   /* Main Problem Input box, Solution Wrapper Card */
  --radius-full: 9999px; /* Pill badges, status indicator dots, circular icon buttons */
}
```

> **Rule**: Never make cards or form text inputs pill-shaped (`9999px`). Reserve `--radius-full` strictly for small tags, category chips, and circular icon buttons.

---

## 7. Borders & Elevation

LifeFix favors **crisp hairline borders** over heavy drop shadows. Shadows are soft, ambient, and barely perceptible, creating subtle separation between planes.

```css
:root {
  /* Borders */
  --border-width: 1px;
  --border-style: solid;
  --border-hairline: 1px solid var(--color-border);
  --border-interactive: 1px solid var(--color-border);

  /* Elevation (Soft Ambient Shadows) */
  --shadow-none: none;
  --shadow-xs: 0 1px 2px rgba(17, 24, 39, 0.04);
  --shadow-sm: 0 1px 3px rgba(17, 24, 39, 0.06), 0 1px 2px rgba(17, 24, 39, 0.04);
  --shadow-md: 0 4px 6px -1px rgba(17, 24, 39, 0.06), 0 2px 4px -2px rgba(17, 24, 39, 0.04);
  --shadow-lg: 0 10px 15px -3px rgba(17, 24, 39, 0.08), 0 4px 6px -4px rgba(17, 24, 39, 0.03);
}
```

---

## 8. Component Styling

### Buttons
All buttons have a minimum touch height of `40px` (`44px` on mobile), centered flex alignment, and explicit state transitions.

| Button Variant | Default Appearance | Hover State | Active / Pressed | Focus State |
| :--- | :--- | :--- | :--- | :--- |
| **Primary** | Background: `var(--color-primary)`<br>Text: `var(--color-text-inverse)`<br>Radius: `var(--radius-md)` | Background: `var(--color-primary-hover)`<br>Shadow: `var(--shadow-xs)` | Background: `var(--color-primary-active)` | `outline: 2px solid var(--color-primary)`<br>`outline-offset: 2px` |
| **Secondary** | Background: `var(--color-surface)`<br>Border: `1px solid var(--color-border)`<br>Text: `var(--color-text-primary)` | Background: `var(--color-background-subtle)`<br>Border: `var(--color-border-hover)` | Background: `#E5E7EB` | `outline: 2px solid var(--color-primary)`<br>`outline-offset: 2px` |
| **Ghost** | Background: `transparent`<br>Border: `1px solid transparent`<br>Text: `var(--color-text-secondary)` | Background: `var(--color-background-subtle)`<br>Text: `var(--color-text-primary)` | Background: `var(--color-border)` | `outline: 2px solid var(--color-primary)`<br>`outline-offset: 2px` |
| **Text** | Background: `transparent`<br>Text: `var(--color-primary)`<br>Underline: none | Text: `var(--color-primary-hover)`<br>Underline: `1px solid currentColor` | Text: `var(--color-primary-active)` | `outline: 2px solid var(--color-primary)` |
| **Success (Feedback Yes)** | Background: `var(--color-success-soft)`<br>Border: `1px solid var(--color-success-border)`<br>Text: `var(--color-success)` | Background: `var(--color-success)`<br>Text: `#FFFFFF`<br>Border: `var(--color-success)` | Background: `var(--color-success-hover)` | `outline: 2px solid var(--color-success)` |
| **Unsuccessful (Feedback No)** | Background: `var(--color-background-subtle)`<br>Border: `1px solid var(--color-border)`<br>Text: `var(--color-text-secondary)` | Background: `var(--color-error-soft)`<br>Text: `var(--color-error)`<br>Border: `var(--color-error-border)` | Background: `#FEE2E2` | `outline: 2px solid var(--color-error)` |

### Form Inputs & Textareas
- **Default**: Background `var(--color-surface)`, Border `1px solid var(--color-border)`, Radius `var(--radius-md)`.
- **Hover**: Border `1px solid var(--color-border-hover)`.
- **Focus**: Border `1px solid var(--color-primary)`, Box-shadow `0 0 0 3px rgba(79, 70, 229, 0.12)`.
- **Disabled**: Background `var(--color-background-subtle)`, Text `var(--color-text-muted)`, Cursor `not-allowed`.
- **Error**: Border `1px solid var(--color-error)`, Box-shadow `0 0 0 3px rgba(220, 38, 38, 0.12)`.

### Tags & Badges
- **Category Badge**: Background `var(--color-background-subtle)`, Text `var(--color-text-secondary)`, Border `1px solid var(--color-border)`, Radius `var(--radius-full)`, Padding `2px 8px`, Font size `12px`, Weight `500`.
- **Difficulty Tag (Easy)**: Background `var(--color-success-soft)`, Text `var(--color-success)`, Border `1px solid var(--color-success-border)`.
- **Difficulty Tag (Medium)**: Background `var(--color-warning-soft)`, Text `var(--color-warning)`, Border `1px solid var(--color-warning-border)`.
- **Difficulty Tag (Hard)**: Background `var(--color-error-soft)`, Text `var(--color-error)`, Border `1px solid var(--color-error-border)`.
- **Time Estimate Tag**: Background `var(--color-background-subtle)`, Text `var(--color-text-muted)`, Icon: Subtle clock SVG, Font size `12px`.
- **Source Case Pill**: Background `var(--color-info-soft)`, Text `var(--color-info)`, Border `1px solid var(--color-info-border)`, Font size `12px`, Radius `var(--radius-xs)`.

---

## 9. Navigation

The navigation bar is lean, clean, and unobtrusive, framing the workspace without taking focus away from the problem-solving task.

### Structure
- **Container**: Full-width sticky bar, height `60px` (`56px` on mobile), background `rgba(248, 249, 250, 0.85)` with `backdrop-filter: blur(8px)`, bottom border `1px solid var(--color-border)`.
- **Brand / Logo Area**:
  - Logo icon: Modern geometric spark/wrench glyph in a `28x28px` rounded container (`var(--color-primary-soft)` with `var(--color-primary)` stroke).
  - Wordmark: "LifeFix" in `18px`, Weight `700`, Letter-spacing `-0.02em`. The dot above the 'i' or terminal period subtly tinted with `--color-primary`.
  - Tagline pill (desktop only): "Personal Problem Solver", Font size `11px`, Text `var(--color-text-muted)`, Background `var(--color-background-subtle)`, Padding `2px 8px`, Radius `var(--radius-full)`.
- **Right Action Area**:
  - "New Problem" text button (resets workspace).
  - Subtle status indicator: Green dot + "Ready" (indicates API connectivity).

---

## 10. Problem Input Experience

The Problem Input is the focal point of the home view. It must feel open, inviting, and spacious.

### Layout & Anatomy
1. **Container**:
   - Background: `var(--color-surface)`
   - Border: `1px solid var(--color-border)` (transitions to `--color-primary` on focus)
   - Radius: `var(--radius-xl)` (`16px`)
   - Shadow: `var(--shadow-sm)` (elevates to `var(--shadow-md)` on focus)
   - Padding: `20px`
2. **Textarea**:
   - Placeholder: *"Describe what's happening... (e.g., My laptop becomes very slow when opening Chrome and VS Code together, or how do I clean white sneakers?)"*
   - Font size: `16px` (avoids automatic iOS zoom on mobile), Line height `1.55`.
   - Minimum height: `110px`, auto-expands cleanly up to `240px`.
   - Border: `none`, Outline: `none` (the outer container provides the visual focus ring).
3. **Category Hint Selector (Optional Pill Row)**:
   - Below the textarea, a row of subtle category suggestion chips: `Technology`, `Home & Living`, `Productivity`, `Cooking`, `Everyday Fixes`.
   - Clicking a pill highlights it in `var(--color-primary-soft)` and sets `category_hint`.
4. **Bottom Action Bar**:
   - Left: Subtle keyboard shortcut helper: *"Press Ctrl + Enter on Windows/Linux; Cmd + Enter on macOS to solve"* (hidden on mobile).
   - Right: Primary Submit Button:
     - Label: **"Solve Problem"**
     - Icon: Sparkle or subtle right-arrow.
     - Height: `40px`, Padding: `0 20px`.

---

## 11. Solution Experience

The solution view is an **actionable, scannable document**, structured specifically for problem-solving rather than conversational chatting.

```
+-----------------------------------------------------------------+
|  PROBLEM BREADCRUMB & EDIT ACCESS                               |
|  "My laptop freezes when opening Chrome and VS Code together"    |
+-----------------------------------------------------------------+
|  [ UNDERSTANDING SUMMARY BANNER ]                               |
|  Reassuring, clear synthesis of the user's issue                |
+-----------------------------------------------------------------+
|  POSSIBLE CAUSES                                                |
|  * RAM contention between heavy processes                       |
|  * Chrome hardware acceleration GPU crash                       |
+-----------------------------------------------------------------+
|  RECOMMENDED ACTION STEPS (Numbered & Prioritized)              |
|                                                                 |
|  [ 1 ] Disable Chrome Hardware Acceleration   [Easy] [2 min]    |
|        Specific actionable instruction...                       |
|                                                                 |
|  [ 2 ] Configure VS Code Memory Limits        [Medium] [5 min]  |
|        Specific actionable instruction...                       |
|                                                                 |
|  [ 3 ] Monitor System Memory Usage            [Easy] [3 min]    |
|        Specific actionable instruction...                       |
+-----------------------------------------------------------------+
|  IMPORTANT NOTES & WARNINGS (If applicable)                     |
|  ! Save active files before restarting the browser.             |
+-----------------------------------------------------------------+
|  KNOWLEDGE ATTRIBUTION                                          |
|  Retrieved from LifeFix verified cases: [Case #d9f4a8da]        |
+-----------------------------------------------------------------+
|  "DID THIS SOLVE YOUR PROBLEM?" FEEDBACK BAR                    |
|  [ Yes, it worked! ]      [ No, I still need help ]             |
+-----------------------------------------------------------------+
```

### Detailed Component Specifications

#### A. Understanding Banner
- Background: `var(--color-background-subtle)`
- Border-left: `3px solid var(--color-primary)`
- Padding: `16px 20px`
- Radius: `var(--radius-md)`
- Text: Body Large (`17px`), Color `var(--color-text-primary)`

#### B. Possible Causes Module
- Title: Heading 3 (`16px`), Text `var(--color-text-secondary)`
- Format: Grid or flex row of clean bullet cards with subtle background (`var(--color-surface)`), border `1px solid var(--color-border)`.

#### C. Recommended Action Steps
Each step is rendered as an independent, high-clarity step card:
- Container: Background `var(--color-surface)`, Border `1px solid var(--color-border)`, Radius `var(--radius-lg)`, Padding `20px`.
- Left Badge: Step number in `28x28px` rounded square (`var(--color-primary-soft)` background, `var(--color-primary)` text, Weight `700`).
- Header: Step title (Heading 3, `16px`), accompanied by inline badges for:
  - Difficulty tag (`Easy`, `Medium`, `Hard`)
  - Estimated time tag (`~3 min`)
- Body: Instruction text (Body Regular, `15px`, `var(--color-text-primary)`).
- Visual Separation: `12px` gap between consecutive steps.

#### D. Warnings & Notes Callout
- Background: `var(--color-warning-soft)`
- Border: `1px solid var(--color-warning-border)`
- Border-left: `3px solid var(--color-warning)`
- Icon: Warning triangle SVG (`var(--color-warning)`)
- Text: `var(--color-text-primary)`

#### E. Source Knowledge Attribution
- Displays retrieved LifeFix verified cases (from `source_cases`).
- Rendered as subtle inline pills with case ID and matched case title.
- Transmits transparency without overwhelming the user with raw data.

---

## 12. Feedback Experience

Directly following the solution steps, the user is presented with a clear question that anchors the LifeFix loop:

> **"Did this solve your problem?"**

### Interaction Rules
1. **Initial Presentation**:
   - Two prominent side-by-side buttons:
     - `[ Yes, it worked! ]` (Success button styling)
     - `[ No, I still need help ]` (Subtle secondary styling)
2. **When YES is clicked**:
   - Trigger `POST /api/attempts/{id}/feedback` with `{"was_successful": true}`.
   - Smoothly morphs the container into a **Resolution Celebration Card**:
     - Emerald checkmark icon.
     - Confirmation message: *"Great! Glad we could help resolve this."*
     - Optional 5-star rating control (`1` to `5` stars with hover preview).
     - Optional qualitative comment textarea.
     - "Save Feedback" button.
3. **When NO is clicked**:
   - Trigger `POST /api/attempts/{id}/feedback` with `{"was_successful": false}`.
   - The feedback container smoothly updates to acknowledge: *"Sorry that didn't do the trick. Let's refine the solution."*
   - Immediately reveals the **Refinement Experience** directly below.

---

## 13. Refinement Experience

The Refinement Experience allows users to append context, correct assumptions, or describe what happened after trying the steps.

### Structure & Behavior
1. **Container**:
   - Appears inline below the unsuccessful feedback confirmation with a smooth fade-and-slide animation (`200ms`).
   - Background: `var(--color-surface)`
   - Border: `1px solid var(--color-primary-border)`
   - Radius: `var(--radius-xl)`
   - Padding: `24px`
2. **Context Prompt**:
   - Header: **"Tell us what happened / Add more details"** (Heading 2, `20px`)
   - Subtext: *"Mention any error messages, what step failed, or new details you noticed. LifeFix will combine this with your original problem to find a tailored fix."*
3. **Refinement Input**:
   - Multiline textarea with placeholder: *"e.g., I disabled hardware acceleration, but the laptop still freezes specifically when opening three or more tabs..."*
   - Minimum height: `90px`.
   - Character count indicator and validation against empty submission.
4. **Primary Action**:
   - Button: **"Refine Solution"** (Primary button styling)
   - Triggers `POST /api/attempts/{attempt_id}/refine`.
5. **Multi-Turn Chained Attempts Lineage**:
   - When viewing a refined solution, display a subtle **Attempt History Navigator** at the top of the solution:
     - Example: `Attempt 1 (Original)  →  Attempt 2 (Refined)`
     - Allows users to click back and review earlier advice without losing the current refinement.

---

## 14. Loading, Error & Empty States

### A. Loading State (Analyzing Problem / Refining)
Never show a generic spinning circle in the middle of a blank screen. Provide an informative, calm progressive indicator:
- **Progressive Status Messages**:
  - `Analyzing your problem symptoms...`
  - `Searching verified LifeFix knowledge cases...`
  - `Assembling actionable step-by-step guidance...`
- **Skeleton Shimmer**:
  - Three pulse-animated skeleton step cards mimicking the final layout.
  - Animation: Subtle horizontal gradient shimmer (`background: linear-gradient(90deg, #F3F4F6 0%, #E5E7EB 50%, #F3F4F6 100%)`).

### B. Error State
- Friendly, clear explanation without leaking raw stack traces or database errors:
  - *"We couldn't connect to the LifeFix solver right now. Your problem description is saved."*
  - Action: **"Try Again"** button.

### C. Empty State (Home Screen)
- Directly beneath the Problem Input box:
  - Three sample problem prompt cards to inspire immediate interaction:
    - *"My computer fan won't stop running loudly"*
    - *"How to organize a small cluttered study desk"*
    - *"Vegetables spoil too quickly in my refrigerator"*
  - Clicking a prompt pre-populates the input box and focuses the textarea.

---

## 15. Layout Principles

1. **Focused Single-Column Spine**: The main problem-solving thread stays constrained to `768px` max-width and centered on the viewport. This keeps user attention strictly on diagnosis and resolution.
2. **Visual Hierarchy Flow**:
   - Primary: The current active step or problem prompt.
   - Secondary: Diagnostic causes and explanations.
   - Tertiary: Case IDs, metadata tags, and background knowledge indicators.
3. **Consistent Vertical Rhythm**:
   - `40px` between primary sections.
   - `16px` between related cards.
   - `8px` between titles and captions.

---

## 16. Responsive Behavior

LifeFix is built mobile-first, ensuring full functionality on phones, tablets, and desktop workstations.

### Breakpoint Table

| Breakpoint | Target Devices | Content Width | Page Padding | Key Layout Behavior |
| :--- | :--- | :--- | :--- | :--- |
| **Mobile (`< 640px`)** | Phones | `100%` | `16px` | Full-width buttons, stacked step tags, sticky bottom submit button when typing, touch targets $\ge 44\text{px}$. |
| **Tablet (`640px – 1024px`)** | iPads, Tablets | `600px` | `24px` | Category pills horizontally scrollable or wrapping, side-by-side feedback buttons. |
| **Desktop (`> 1024px`)** | Laptops, Desktops | `768px` | `32px` | Centered spine, full keyboard shortcut hints, inline metadata tags. |

### Mobile Ergonomics
- **Touch Targets**: All interactive elements (buttons, stars, chips, links) have a minimum touch footprint of `44x44px`.
- **Keyboard Preservation**: Inputs do not jump unexpectedly when mobile virtual keyboards appear.
- **Card Stacking**: On mobile screens, step tags (Difficulty, Time) wrap neatly below the step title rather than forcing awkward horizontal truncation.

---

## 17. Accessibility (a11y)

LifeFix is engineered for inclusivity and universal access.

1. **Color Contrast**:
   - All text and interactive elements must meet WCAG 2.1 AA contrast requirements across all supported foreground and background combinations.
2. **Keyboard Navigation & Focus Rings**:
   - All interactive controls are fully navigable via `Tab` and `Shift + Tab`.
   - Focus ring style:
     ```css
     :focus-visible {
       outline: 2px solid var(--color-primary);
       outline-offset: 2px;
     }
     ```
3. **Semantic HTML Structure**:
   - Single `<h1>` per page.
   - Numbered steps use `<ol>` and `<li>` with ARIA labels.
   - Feedback controls use `<fieldset>` and `<legend>` for assistive grouping.
4. **Live Regions**:
   - Problem solving progress announcements use `aria-live="polite"` so screen readers speak loading updates without interrupting the user.

---

## 18. Animation & Interaction

Animations are functional, quick, and purposeful—never gratuitous or distracting.

```css
:root {
  --transition-fast: 120ms cubic-bezier(0.16, 1, 0.3, 1);
  --transition-normal: 200ms cubic-bezier(0.16, 1, 0.3, 1);
  --transition-slow: 320ms cubic-bezier(0.16, 1, 0.3, 1);
}
```

### Approved Interactions:
- **Button Hover/Active**: Micro-scale and color transition (`120ms`).
- **Input Focus**: Border color transition and subtle glow ring expansion (`150ms`).
- **Step Card Reveal**: Smooth staggered fade-in (`200ms`, `opacity: 0 -> 1`, `translateY(4px) -> translateY(0)`).
- **Feedback State Morph**: Height transition and cross-fade (`250ms`).
- **Reduced Motion**: All animations immediately disable when user has `prefers-reduced-motion: reduce` enabled:
  ```css
  @media (prefers-reduced-motion: reduce) {
    *, ::before, ::after {
      animation-duration: 0.01ms !important;
      transition-duration: 0.01ms !important;
    }
  }
  ```

---

## 19. Do's and Don'ts

| Category | DO | DON'T |
| :--- | :--- | :--- |
| **Interface Metaphor** | Design an actionable, structured problem-solving document. | Don't create a standard chatbot with user and AI speech bubbles. |
| **Color Usage** | Use purple as a deliberate, thoughtful accent for primary actions and active focus. | Don't make the entire background purple or use saturated neon colors. |
| **Cards & Elevation** | Use subtle 1px hairline borders (`#E5E7EB`) with soft ambient shadows. | Don't stack cards inside cards with heavy black drop shadows or glow effects. |
| **Typography** | Maintain high contrast between primary titles (`#111827`) and secondary instructions. | Don't use low-contrast light gray text or stylized decorative fonts. |
| **Feedback Loop** | Place "Did this solve your problem?" prominently after the steps. | Don't hide feedback behind hidden dropdowns or multi-click menus. |
| **Refinement** | Keep the refinement prompt in the same visual flow, showing attempt lineage. | Don't reset the page or wipe the user's previous context during refinement. |
| **Border Radius** | Use balanced, modern curves (`8px` buttons, `12px` steps, `16px` main input). | Don't make every card, input, and container pill-shaped (`9999px`). |
| **Motion** | Use subtle `150-200ms` transitions to smooth state changes. | Don't use bouncy, slow, or looping decorative animations that delay access. |

---

## 20. Design Tokens (CSS Custom Properties)

Copy-pasteable design tokens to be placed in `frontend/src/index.css`:

```css
:root {
  /* Brand & Accents */
  --color-primary: #4F46E5;
  --color-primary-hover: #4338CA;
  --color-primary-active: #3730A3;
  --color-primary-soft: #EEF2FF;
  --color-primary-border: #C7D2FE;

  /* Neutrals & Surfaces */
  --color-background: #F8F9FA;
  --color-background-subtle: #F1F3F5;
  --color-surface: #FFFFFF;
  --color-surface-elevated: #FFFFFF;

  /* Typography Colors */
  --color-text-primary: #111827;
  --color-text-secondary: #4B5563;
  --color-text-muted: #6B7280;
  --color-text-inverse: #FFFFFF;

  /* Borders */
  --color-border: #E5E7EB;
  --color-border-subtle: #F3F4F6;
  --color-border-hover: #D1D5DB;
  --color-border-focus: #4F46E5;

  /* Semantics */
  --color-success: #059669;
  --color-success-hover: #047857;
  --color-success-soft: #ECFDF5;
  --color-success-border: #A7F3D0;

  --color-warning: #D97706;
  --color-warning-soft: #FFFBEB;
  --color-warning-border: #FDE68A;

  --color-error: #DC2626;
  --color-error-soft: #FEF2F2;
  --color-error-border: #FECACA;

  --color-info: #2563EB;
  --color-info-soft: #EFF6FF;
  --color-info-border: #BFDBFE;

  /* Spacing Grid */
  --space-1: 4px;
  --space-2: 8px;
  --space-3: 12px;
  --space-4: 16px;
  --space-5: 20px;
  --space-6: 24px;
  --space-8: 32px;
  --space-10: 40px;
  --space-12: 48px;
  --space-16: 64px;

  /* Radii */
  --radius-xs: 4px;
  --radius-sm: 6px;
  --radius-md: 8px;
  --radius-lg: 12px;
  --radius-xl: 16px;
  --radius-full: 9999px;

  /* Shadows */
  --shadow-none: none;
  --shadow-xs: 0 1px 2px rgba(17, 24, 39, 0.04);
  --shadow-sm: 0 1px 3px rgba(17, 24, 39, 0.06), 0 1px 2px rgba(17, 24, 39, 0.04);
  --shadow-md: 0 4px 6px -1px rgba(17, 24, 39, 0.06), 0 2px 4px -2px rgba(17, 24, 39, 0.04);
  --shadow-lg: 0 10px 15px -3px rgba(17, 24, 39, 0.08), 0 4px 6px -4px rgba(17, 24, 39, 0.03);

  /* Transitions */
  --transition-fast: 120ms cubic-bezier(0.16, 1, 0.3, 1);
  --transition-normal: 200ms cubic-bezier(0.16, 1, 0.3, 1);
  --transition-slow: 320ms cubic-bezier(0.16, 1, 0.3, 1);

  /* Fonts */
  --font-sans: 'Plus Jakarta Sans', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
  --font-mono: 'JetBrains Mono', 'SF Mono', Consolas, monospace;
}
```

---

## 21. Agent Prompt Guide

When implementing frontend components, views, or styles for LifeFix, coding agents must follow this checklist:

1. **Adhere to the Single Source of Truth**:
   - Always reference variables from `DESIGN.md` (e.g., `var(--color-primary)`, `var(--space-4)`, `var(--radius-lg)`).
   - Never introduce hardcoded random hex codes (`#663399`, `#123456`) or arbitrary pixel values.
2. **Build a Living Document, Not a Chatroom**:
   - When consuming backend API responses from `POST /api/solve` or `POST /api/attempts/{id}/refine`, map the response strictly to the structured sections defined in **Section 11 (Solution Experience)**:
     - `understanding` $\to$ Understanding Banner
     - `possible_causes` $\to$ Possible Causes Module
     - `recommended_steps` $\to$ Numbered Action Step Cards
     - `warnings_or_notes` $\to$ Warning Callout Box
     - `source_cases` $\to$ Knowledge Attribution Pills
     - `follow_up_question` $\to$ Clarification Callout
3. **Respect the Resolution Loop**:
   - The feedback section ("Did this solve your problem?") must always be directly visible after the action steps.
   - If `was_successful === false`, render the inline refinement card without navigating away or wiping the screen.
4. **Enforce Touch & Accessibility Standards**:
   - Ensure all buttons and form fields meet the minimum `44px` height on mobile.
   - Use semantic tags (`<button>`, `<main>`, `<article>`, `<section>`, `<nav>`, `<textarea>`).
   - Implement visible `:focus-visible` rings on all interactive elements.
