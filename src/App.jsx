// App.jsx (Reference UI v2 – Gamified Onboarding)

import React, { useState } from "react";

/* ---------- Shared UI primitives ---------- */

const AppShell = ({ children }) => (
  <div className="app">
    <TopBar />
    <BalancesBar />
    <main className="quest-list">{children}</main>
    <FooterMeta />
  </div>
);

const TopBar = () => (
  <header className="topbar">
    <button className="icon-button" aria-label="Menu">
      <span />
      <span />
      <span />
    </button>

    <div className="topbar-title">
      <span className="topbar-logo">🎟️</span>
      <span className="topbar-text">Questboard</span>
    </div>

    <button className="avatar-button" aria-label="Profile">
      <img src="/avatar-placeholder.png" alt="Profile" />
    </button>
  </header>
);

const BalancesBar = () => (
  <section className="balances">
    <div className="balance-pill balance-xp">
      <span className="label">Rank</span>
      <span className="value">Rookie Host</span>
    </div>
    <div className="balance-pill balance-gold">
      <span className="label">Event XP</span>
      <span className="value">0</span>
    </div>
    <div className="balance-pill balance-gems">
      <span className="label">Impact Tokens</span>
      <span className="value">0</span>
    </div>
  </section>
);

const FooterMeta = () => (
  <footer className="footer-meta">
    <div className="meta-item">
      <span className="meta-icon">🌱</span>
      <span className="meta-text">
        Phase 1: Learn the system and launch your first event.
      </span>
    </div>
  </footer>
);

/* ---------- Reusable Quest Card ---------- */

const QuestCard = ({
  title,
  description,
  rewardLabel,
  rewardType = "xp",
  progress,
  total,
  status,
  ctaLabel,
  onAction,
  tone = "default",
}) => {
  const percent = Math.min(100, Math.round((progress / total) * 100 || 0));
  const isComplete = status === "complete";

  const rewardClass =
    rewardType === "gems"
      ? "quest-reward-pill quest-reward-ruby"
      : rewardType === "gold"
      ? "quest-reward-pill quest-reward-gold"
      : "quest-reward-pill";

  const cardClassNames = [
    "quest-card",
    tone === "winter" && "quest-winter",
    tone === "shadow" && "quest-shadow",
    isComplete && "is-claimed",
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <article className={cardClassNames}>
      <header className="quest-header">
        <h2 className="quest-title">{title}</h2>
        <span className={rewardClass}>
          <span className="reward-icon">
            {rewardType === "gems" ? "♦" : rewardType === "gold" ? "◎" : "★"}
          </span>
          <span className="reward-amount">{rewardLabel}</span>
        </span>
      </header>

      <p className="quest-description">{description}</p>

      {!isComplete && (
        <div className="quest-progress">
          <div className="quest-progress-track">
            <div
              className="quest-progress-fill"
              style={{ width: `${percent}%` }}
            />
          </div>
          <span className="quest-progress-label">
            {progress} / {total}
          </span>
        </div>
      )}

      <div className="quest-footer">
        {isComplete ? (
          <span className="quest-status">Completed</span>
        ) : (
          <button className="quest-cta" onClick={onAction}>
            {ctaLabel}
          </button>
        )}
      </div>
    </article>
  );
};

/* ---------- Octalysis Phase 1 Experience ---------- */

const defaultEvent = {
  name: "",
  date: "",
  type: "",
};

const App = () => {
  const [step, setStep] = useState(1);
  const [eventDraft, setEventDraft] = useState(defaultEvent);
  const [createdEvent, setCreatedEvent] = useState(null);
  const [acceptedWhy, setAcceptedWhy] = useState(false);

  const handleEventChange = (field, value) => {
    setEventDraft((prev) => ({ ...prev, [field]: value }));
  };

  const canCreateEvent =
    eventDraft.name.trim() && eventDraft.date.trim() && eventDraft.type.trim();

  const handleCreateEvent = () => {
    if (!canCreateEvent) return;
    setCreatedEvent(eventDraft);
    setEventDraft(defaultEvent);
    setStep(3);
  };

  /* --- Step 1: Meaning & Purpose (Why host?) --- */
  const renderStep1 = () => (
    <>
      <QuestCard
        title="Choose Your Mission"
        description="Every event changes a small part of the world. Pick why you are hosting, so your Questboard can align rewards with what matters to you."
        rewardLabel="Unlock Event XP"
        rewardType="xp"
        progress={acceptedWhy ? 1 : 0}
        total={1}
        status={acceptedWhy ? "complete" : "active"}
        ctaLabel={acceptedWhy ? "Mission saved" : "Set my mission"}
        onAction={() => setAcceptedWhy(true)}
        tone="shadow"
      />

      {!acceptedWhy && (
        <section className="inline-form-card">
          <h3 className="inline-form-title">Why are you hosting?</h3>
          <div className="inline-choice-row">
            <button
              className="choice-pill"
              onClick={() => setAcceptedWhy(true)}
            >
              Bring people together
            </button>
            <button
              className="choice-pill"
              onClick={() => setAcceptedWhy(true)}
            >
              Grow my business
            </button>
            <button
              className="choice-pill"
              onClick={() => setAcceptedWhy(true)}
            >
              Test a new idea
            </button>
          </div>
        </section>
      )}

      {acceptedWhy && (
        <QuestCard
          title="First Path Unlocked"
          description="Nice. Next, sketch your first event so the system can guide you with quests and XP tailored to your mission."
          rewardLabel="Go to Step 2"
          rewardType="gold"
          progress={0}
          total={1}
          status="active"
          ctaLabel="Design my first event"
          onAction={() => setStep(2)}
          tone="winter"
        />
      )}
    </>
  );

  /* --- Step 2: Empowerment – create first event --- */
  const renderStep2 = () => (
    <>
      <QuestCard
        title="Create Your First Event"
        description="Give your event a working title, date, and type. You can change everything later—the goal is to get a playable draft."
        rewardLabel="+50 Event XP"
        rewardType="xp"
        progress={canCreateEvent ? 1 : 0}
        total={1}
        status={canCreateEvent ? "active" : "active"}
        ctaLabel={canCreateEvent ? "Save event draft" : "Fill the quick form"}
        onAction={handleCreateEvent}
        tone="winter"
      />

      <section className="inline-form-card">
        <h3 className="inline-form-title">Event draft</h3>
        <div className="field">
          <label className="field-label">Event name</label>
          <input
            className="field-input"
            type="text"
            placeholder="e.g. Summer Rooftop Mixer"
            value={eventDraft.name}
            onChange={(e) => handleEventChange("name", e.target.value)}
          />
        </div>

        <div className="field-row">
          <div className="field">
            <label className="field-label">Date</label>
            <input
              className="field-input"
              type="date"
              value={eventDraft.date}
              onChange={(e) => handleEventChange("date", e.target.value)}
            />
          </div>
          <div className="field">
            <label className="field-label">Type</label>
            <select
              className="field-input"
              value={eventDraft.type}
              onChange={(e) => handleEventChange("type", e.target.value)}
            >
              <option value="">Choose</option>
              <option value="launch">Launch</option>
              <option value="networking">Networking</option>
              <option value="workshop">Workshop</option>
              <option value="showcase">Showcase</option>
            </select>
          </div>
        </div>

        <p className="inline-form-hint">
          You will earn XP for every meaningful action linked to this event:
          invitations, vendor coordination, and follow-up.
        </p>
      </section>
    </>
  );

  /* --- Step 3: Accomplishment & early rank intro --- */
  const renderStep3 = () => (
    <>
      <QuestCard
        title="First Event Drafted"
        description={`Nice work. "${createdEvent?.name}" is now your anchor event. Every quest you complete will feed XP into this event and your host rank.`}
        rewardLabel="+50 XP Claimed"
        rewardType="gold"
        progress={1}
        total={1}
        status="complete"
        tone="shadow"
      />

      <section className="inline-form-card">
        <h3 className="inline-form-title">Your starting rank</h3>
        <p className="inline-form-copy">
          You start as a <strong>Rookie Host</strong>. Climb to{" "}
          <strong>Seasoned Strategist</strong> and then{" "}
          <strong>Legendary Producer</strong> by completing quests connected to
          your event.
        </p>
        <div className="rank-track">
          <div className="rank-node rank-node-active">
            <span className="rank-label">Rookie</span>
          </div>
          <div className="rank-node">
            <span className="rank-label">Strategist</span>
          </div>
          <div className="rank-node">
            <span className="rank-label">Producer</span>
          </div>
        </div>
      </section>

      <QuestCard
        title="Next Up: Invite Allies"
        description="In Phase 2, you will unlock quests that reward you for bringing collaborators and vendors into this event workspace."
        rewardLabel="Phase 2 Preview"
        rewardType="gems"
        progress={0}
        total={1}
        status="active"
        ctaLabel="Stay in Phase 1 (demo only)"
        onAction={() => {}}
        tone="winter"
      />
    </>
  );

  return (
    <AppShell>
      {step === 1 && renderStep1()}
      {step === 2 && renderStep2()}
      {step === 3 && renderStep3()}
    </AppShell>
  );
};

export default App;
