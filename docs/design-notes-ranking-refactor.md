# Gamified Onboarding v2 – Ranking & Refactor Notes

This document explains the **host ranking system** and the **UI refactor** applied to the onboarding flow.  
It describes the *reference implementation* used in `App.jsx` and how it supports a **white-hat, Phase 1 Octalysis** experience.

---

## 1. Host Ranking System

### 1.1 Goals

- Give users a **clear sense of progression** from their very first event.
- Use **white-hat motivators** (meaning, accomplishment, empowerment, social) rather than pressure or FOMO.
- Keep the system **simple and legible** for onboarding, with room to expand later.

### 1.2 Rank Tiers (Phase 1)

Phase 1 uses three ranks. Names are deliberately readable and non‑intimidating.

1. **Rookie Host**
   - Entry rank for all new users.
   - Unlocked as soon as they complete the **“Choose Your Mission”** quest.
   - XP range (suggested): `0–199`.
   - Messaging focus:
     - “You are prototyping your hosting style.”
     - “Small actions already move you forward.”

2. **Seasoned Strategist**
   - Intermediate rank for users who consistently work on an event.
   - Targeted XP range (suggested): `200–599`.
   - Unlocked by:
     - Creating first event draft.
     - Completing a set of early operational quests (invites sent, vendors added, tasks completed).
   - Messaging focus:
     - “You design repeatable systems, not one‑offs.”
     - “Quests now emphasize planning and optimization.”

3. **Legendary Producer**
   - Phase‑1 “ceiling” rank; aspirational but reachable.
   - Targeted XP range (suggested): `600+`.
   - Unlocked by:
     - Running one or more events from draft to completion.
     - Consistently completing milestone quests (e.g., attendee feedback, vendor satisfaction).
   - Messaging focus:
     - “You orchestrate experiences at scale.”
     - “Later phases will unlock prestige paths and rare cosmetics.”

> In this reference implementation, only **Rookie Host** is “live”; higher ranks are **visualized** in the rank track but not actively calculated yet.

### 1.3 XP Sources (Phase 1 Only)

For the onboarding prototype, XP is treated as **event‑centric**, then mapped to the host’s overall profile.

Suggested XP values:

- **Set your mission** (why you host): `+20 XP`
- **Create first event draft**: `+50 XP`
- **Complete all Phase 1 onboarding quests**: bonus `+30 XP`

In code, these values are not yet persisted; the UI **simulates** progress and uses them as copy hints rather than real logic.

### 1.4 White‑Hat Octalysis Mapping

- **Meaning & Purpose (CD1)**
  - “Choose Your Mission” quest.
  - Copy that ties events to user goals (“Bring people together”, “Grow my business”, “Test a new idea”).
- **Development & Accomplishment (CD2)**
  - XP system and rank names.
  - Progress bars on quests and rank track.
- **Empowerment of Creativity & Feedback (CD3)**
  - Event draft form treated as a **sandbox**: easy changes, low risk.
  - Visual confirmation when saving the draft.
- **Social Influence & Relatedness (CD5)** – lightly hinted
  - “Next Up: Invite Allies” quest in Phase 2 preview.
  - Future hooks for collaborators and vendors.

No black‑hat mechanics (scarcity, FOMO countdowns, heavy loss aversion) are used in Phase 1.

---

## 2. UI Refactor Overview

### 2.1 Objectives

- Merge the **Stormbound-style quest UI** with a **GitHub-like dark dashboard shell**.
- Encapsulate UI into reusable **React components**:
  - `AppShell`, `TopBar`, `BalancesBar`, `FooterMeta`
  - `QuestCard` (core visual pattern)
- Structure onboarding as a **3‑step flow** backed by `useState`:
  - Step 1: Choose mission.
  - Step 2: Draft first event.
  - Step 3: Show completion + rank intro.

### 2.2 Component Responsibilities

#### `AppShell`

- Layout wrapper responsible for:
  - Dark background and central column (mobile‑first).
  - Rendering `TopBar`, `BalancesBar`, main quest content, and footer.
- Allows future reuse for post‑onboarding screens (events, vendors, messages).

#### `TopBar`

- Inspired by GitHub mobile:
  - Left: menu icon (hamburger).
  - Center: compact logo and “Questboard” title.
  - Right: avatar button.
- Keeps actions minimal to avoid cognitive overload during onboarding.

#### `BalancesBar`

- Shows three **non‑currency, meaning‑oriented** stats:
  - Rank (`Rookie Host`).
  - Event XP.
  - Impact Tokens (placeholder for future positive achievements).
- Implemented as horizontally scrollable **pills** styled like Stormbound’s resource badges.

#### `FooterMeta`

- Single line explaining current **phase and intent**:
  - “Phase 1: Learn the system and launch your first event.”
- Reduces ambiguity: users know this is just the beginning of a larger system.

#### `QuestCard`

- Core reusable pattern that encapsulates **visual structure and state**:
  - Props: `title`, `description`, `rewardLabel`, `rewardType`, `progress`, `total`, `status`, `ctaLabel`, `onAction`, `tone`.
  - Calculates percentage values for the progress bar.
  - Switches layout based on `status`:
    - `"active"` → shows progress bar + CTA button.
    - `"complete"` → greys out card and shows “Completed” badge.
  - Supports `tone` variations:
    - `"shadow"`, `"winter"`, `"default"` to change top accent gradients.
- This component can be reused for:
  - Future operational quests (invite vendors, publish agenda).
  - Achievement cards or feature unlock prompts.

### 2.3 Onboarding Flow Logic

#### Step 1 – Mission Selection

- State:
  - `step` (1–3).
  - `acceptedWhy` (boolean).
- UI:
  - Primary `QuestCard`: “Choose Your Mission”.
  - Inline choice card with three mission presets.
- Transition:
  - Clicking any mission sets `acceptedWhy = true`.
  - A second `QuestCard` appears: “First Path Unlocked”, with CTA to go to Step 2.
- Motivation:
  - Establish **meaning** before showing any operational UI.

#### Step 2 – First Event Draft

- State:
  - `eventDraft` object (`name`, `date`, `type`).
- UI:
  - `QuestCard`: “Create Your First Event”, reward “+50 Event XP”.
  - Inline form with:
    - Text input for event name.
    - Date input.
    - Select for event type.
- Logic:
  - `canCreateEvent` = all three fields filled.
  - Button label changes from “Fill the quick form” → “Save event draft”.
  - On submit:
    - `createdEvent` set to the draft.
    - `eventDraft` reset.
    - `step` → 3.
- Motivation:
  - **Empowerment** via a quick win and tangible progress.

#### Step 3 – Rank Introduction

- UI:
  - `QuestCard`: “First Event Drafted” marked as `complete`.
  - Rank card describing:
    - Current rank: `Rookie Host`.
    - Upcoming ranks: `Seasoned Strategist`, `Legendary Producer`.
  - Visual rank track with three nodes, first one active.
  - Future quest teaser: “Next Up: Invite Allies” (Phase 2).
- Motivation:
  - Leverages **accomplishment** and **clear future path**, without forcing Phase 2 behavior yet.

---

## 3. Technical Notes & Next Steps

### 3.1 What Changed Compared to Previous Version

- Flattened overly large `App` component into smaller, well‑named components.
- Replaced ad‑hoc divs with **semantic, stateful quest cards**.
- Centralized styling assumptions around:
  - Dark, gradient background.
  - Stormbound‑style cards with inner border and angled accent.
  - GitHub‑like sticky top bar.

### 3.2 Where to Integrate Real Logic

This is a **reference implementation**. To make it production‑ready:

- Replace local `useState` for XP and ranks with:
  - Global store (Redux, Zustand, or React context), or
  - Backend‑driven profile object.
- Wire `handleCreateEvent` to a real API call or event‑creation mutation.
- Replace static avatar and mission choices with user‑specific data and saved preferences.

### 3.3 Extension Ideas for Future Phases

- **Phase 2**
  - Quest line for inviting collaborators and vendors.
  - Social proof: “3 planners at your rank prefer vendor templates.”
- **Phase 3**
  - Cosmetic rewards (frames, icons) tied to rank.
  - Light scarcity timers, carefully balanced to avoid dark‑pattern pressure.

---

This document should be treated as the **design and implementation spec** for the v2 gamified onboarding and ranking model. It is intentionally narrow in scope and focuses solely on Phase 1 white‑hat mechanics and reference UI behavior.
