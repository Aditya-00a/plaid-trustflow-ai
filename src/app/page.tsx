"use client";

import Image from "next/image";
import {
  AlertTriangle,
  BadgeCheck,
  Ban,
  Building2,
  CheckCircle2,
  ChevronDown,
  CircleDollarSign,
  ClipboardCheck,
  Clock3,
  Download,
  Fingerprint,
  Gauge,
  KeyRound,
  Landmark,
  LockKeyhole,
  RefreshCcw,
  Shield,
  ShieldCheck,
  Sparkles,
  UserRoundCheck,
  WalletCards,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { useMemo, useState } from "react";

type Decision = "approve" | "step-up" | "review" | "block";
type Section = "Queue" | "KYA" | "Policy" | "Audit";

type PaymentRequest = {
  id: string;
  agent: string;
  user: string;
  amount: string;
  numericAmount: number;
  account: string;
  destination: string;
  request: string;
  riskScore: number;
  recommended: Decision;
  accountAge: string;
  balance: string;
  permissionLimit: string;
  consentExpiry: string;
  lastAction: string;
  drivers: string[];
  checks: Array<{ label: string; value: string; tone: "good" | "warn" | "bad" }>;
  timeline: string[];
};

const requests: PaymentRequest[] = [
  {
    id: "safe-wallet",
    agent: "ShoppingAgent 04",
    user: "Maya Patel",
    amount: "$120",
    numericAmount: 120,
    account: "Chase checking •••• 2041",
    destination: "Travel wallet",
    request: "Move $120 from Chase checking to my travel wallet.",
    riskScore: 22,
    recommended: "approve",
    accountAge: "28 months",
    balance: "$4,930 available",
    permissionLimit: "$1,000 wallet funding",
    consentExpiry: "22 days",
    lastAction: "Wallet funding, 8 days ago",
    drivers: [
      "Verified identity and ownership match",
      "Balance cushion is strong",
      "Amount is normal for this user",
      "Consent is active for wallet funding",
    ],
    checks: [
      { label: "Identity", value: "Verified", tone: "good" },
      { label: "Balance", value: "Available", tone: "good" },
      { label: "Return risk", value: "Low", tone: "good" },
      { label: "Permission", value: "Within limit", tone: "good" },
    ],
    timeline: [
      "Agent asserted delegated payment intent",
      "User identity and account ownership matched",
      "Balance checked in real time",
      "TrustFlow issued approval",
    ],
  },
  {
    id: "risky-merchant",
    agent: "TravelAgent 12",
    user: "Jordan Lee",
    amount: "$4,800",
    numericAmount: 4800,
    account: "Wells Fargo checking •••• 7810",
    destination: "New merchant account",
    request: "Move $4,800 to a new merchant account.",
    riskScore: 81,
    recommended: "review",
    accountAge: "14 months",
    balance: "$5,120 available",
    permissionLimit: "$1,000 payment cap",
    consentExpiry: "6 days",
    lastAction: "Flight search, 1 hour ago",
    drivers: [
      "New payee and new device",
      "Amount exceeds agent permission limit",
      "Low post-payment balance cushion",
      "First AI-initiated merchant payment",
    ],
    checks: [
      { label: "Identity", value: "Verified", tone: "good" },
      { label: "Balance", value: "Barely sufficient", tone: "warn" },
      { label: "Return risk", value: "Elevated", tone: "warn" },
      { label: "Permission", value: "Limit exceeded", tone: "bad" },
    ],
    timeline: [
      "Agent requested merchant payment",
      "New payee and device risk detected",
      "Permission limit exceeded by $3,800",
      "TrustFlow routed to review",
    ],
  },
  {
    id: "blocked-new-account",
    agent: "WalletAgent 19",
    user: "Avery Brooks",
    amount: "$2,500",
    numericAmount: 2500,
    account: "Newly connected account •••• 6193",
    destination: "Gaming wallet",
    request: "Fund wallet with $2,500 from a newly connected account.",
    riskScore: 96,
    recommended: "block",
    accountAge: "18 minutes",
    balance: "$2,710 available",
    permissionLimit: "No payment permission",
    consentExpiry: "Pending approval",
    lastAction: "Account connected, 18 minutes ago",
    drivers: [
      "Identity mismatch on account holder",
      "Newly connected funding source",
      "Suspicious velocity pattern",
      "No approved agent payment permission",
    ],
    checks: [
      { label: "Identity", value: "Mismatch", tone: "bad" },
      { label: "Balance", value: "Thin cushion", tone: "warn" },
      { label: "Return risk", value: "High", tone: "bad" },
      { label: "Permission", value: "Missing", tone: "bad" },
    ],
    timeline: [
      "Agent attempted wallet funding",
      "New account age and velocity risk detected",
      "Identity mismatch triggered policy block",
      "TrustFlow created blocked-payment evidence",
    ],
  },
];

const decisionLabels: Record<Decision, string> = {
  approve: "Approved",
  "step-up": "Step-up",
  review: "Review required",
  block: "Blocked",
};

const decisionStyles: Record<
  Decision,
  { badge: string; panel: string; icon: LucideIcon; summary: string }
> = {
  approve: {
    badge: "bg-[#d8fef3] text-[#012e37] border-[#42f0cd]",
    panel: "border-[#42f0cd] bg-[#effffa]",
    icon: CheckCircle2,
    summary:
      "Approve the agent action and issue a scoped payment token for the requested transfer.",
  },
  "step-up": {
    badge: "bg-[#e8fed7] text-[#012e37] border-[#86ef5a]",
    panel: "border-[#86ef5a] bg-[#f7ffef]",
    icon: KeyRound,
    summary:
      "Require user confirmation before the AI agent can continue the payment flow.",
  },
  review: {
    badge: "bg-[#cdf5fd] text-[#043c67] border-[#63daff]",
    panel: "border-[#63daff] bg-[#f2fbff]",
    icon: AlertTriangle,
    summary:
      "Hold the transfer and route the decision to a fintech risk reviewer.",
  },
  block: {
    badge: "bg-[#faf7ff] text-[#671877] border-[#c6a7ff]",
    panel: "border-[#c6a7ff] bg-[#faf7ff]",
    icon: Ban,
    summary:
      "Block the payment, preserve evidence, and prevent the agent from receiving payment credentials.",
  },
};

const guardrails = [
  ["Under $250", "Auto approve when identity, balance, and consent are clean"],
  ["$250 to $1,000", "Approve only when Signal risk remains low"],
  ["$1,000 to $5,000", "Step-up verification plus risk team review"],
  ["Over $5,000", "Manual review before money movement"],
  ["Identity mismatch", "Block and create evidence packet"],
  ["Sanctions or AML hit", "Block and escalate to compliance"],
];

const navItems: Array<[Section, string]> = [
  ["Queue", "Agentic payment review"],
  ["KYA", "Know Your Agent"],
  ["Policy", "Guardrails"],
  ["Audit", "Evidence"],
];

function PlaidLogo() {
  return (
    <div className="flex items-center gap-3" aria-label="Plaid Asion AI">
      <svg
        height="29"
        viewBox="0 0 77 29"
        xmlns="http://www.w3.org/2000/svg"
        aria-label="Plaid"
        className="h-[29px] w-[77px] text-[#232424]"
      >
        <g fill="currentColor" fillRule="evenodd">
          <path d="M37.3252 14.9546H36.2239V12.5005H37.2135C38.4162 12.5005 39.0177 12.9124 39.0177 13.7353C39.0177 14.5484 38.4537 14.9546 37.3252 14.9546ZM40.3753 10.9121C39.7365 10.3878 38.6455 10.126 37.1019 10.126H33.6211V20.617H36.2239V17.33H37.3893C38.8052 17.33 39.8431 17.0256 40.5028 16.417C41.2475 15.7359 41.6206 14.8291 41.6206 13.6961C41.6206 12.5218 41.2058 11.5939 40.3753 10.9121ZM46.0756 10.1256H43.3611V20.6173H49.2216V18.2421H46.0758L46.0756 10.1256ZM54.5063 16.9683L55.6241 13.382L56.7254 16.9683H54.5063ZM54.538 10.1256L50.275 20.6173H53.197L53.7559 19.0919H57.46L57.9707 20.6173H60.9256L56.6937 10.1256H54.538ZM62.2824 20.6173H64.9969V10.1256H62.2824V20.6173ZM71.1922 18.2422H70.0263V12.5005H71.2081C72.0385 12.5005 72.6766 12.7536 73.1239 13.2592C73.5712 13.7654 73.7944 14.4828 73.7944 15.4101C73.7944 17.2986 72.9266 18.2422 71.1922 18.2422ZM75.5353 12.0917C75.1737 11.588 74.7422 11.1849 74.2424 10.8806C73.4221 10.3769 72.3043 10.125 70.8885 10.125H67.3119V20.6167H71.4956C73.0068 20.6167 74.2209 20.135 75.1363 19.1701C76.0517 18.2052 76.5091 16.9261 76.5091 15.3319C76.5089 14.0633 76.1842 12.9835 75.5353 12.0917Z" />
          <path d="M25.7629 26.2628L28 17.5309L24.9691 14.5001L27.9999 11.4691L25.7628 2.73706L17.0309 0.5L14.0001 3.531L10.969 0.50014L2.23706 2.73734L0 11.4691L3.03128 14.4999L0.00014 17.531L2.2372 26.2629L10.9691 28.5L14.0001 25.469L17.031 28.4999L25.7629 26.2628ZM15.7321 23.7371L18.6186 20.8505L22.2912 24.5233L17.6956 25.7007L15.7321 23.7371ZM11.1136 9.88154L14.0003 6.99502L16.8868 9.8814L14.0001 12.7679L11.1136 9.88154ZM12.2682 14.5L9.38154 17.3865L6.49502 14.5L9.38154 11.6135L12.2682 14.5ZM18.6187 11.6133L21.5053 14.5L18.6186 17.3865L15.7321 14.5L18.6187 11.6133ZM16.8867 19.1186L14.0001 22.0051L11.1135 19.1185L14.0001 16.2319L16.8867 19.1186ZM10.3044 25.7007L5.70864 24.5233L9.38154 20.8504L12.2682 23.7371L10.3044 25.7007ZM4.76308 16.2319L7.6496 19.1185L3.9767 22.7914L2.7993 18.1957L4.76308 16.2319ZM3.9767 6.20836L7.64974 9.8814L4.76308 12.7681L2.7993 10.8041L3.9767 6.20836ZM12.2683 5.26294L9.38168 8.1496L5.70892 4.4767L10.3047 3.2993L12.2683 5.26294ZM17.6959 3.2993L22.2915 4.4767L18.6186 8.14946L15.7321 5.26294L17.6959 3.2993ZM23.2372 12.7681L20.3505 9.8814L24.0233 6.20878L25.2007 10.8046L23.2372 12.7681ZM24.0233 22.7914L20.3505 19.1186L23.2372 16.2321L25.2007 18.1957L24.0233 22.7914Z" />
        </g>
      </svg>
      <div className="h-8 w-px bg-[#93aeb8]" aria-hidden />
      <div className="leading-none">
        <div className="text-lg font-semibold text-[#012e37]">asion.ai</div>
        <p className="mt-1 text-[11px] font-semibold uppercase tracking-[0.12em] text-[#65716d]">
          TrustFlow AI
        </p>
      </div>
    </div>
  );
}

function Pill({
  children,
  className = "",
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <span
      className={`inline-flex items-center rounded-full border px-3 py-1 text-xs font-semibold ${className}`}
    >
      {children}
    </span>
  );
}

function RiskArc({ score, decision }: { score: number; decision: Decision }) {
  const stroke =
    decision === "block"
      ? "#5e5ed9"
      : decision === "review"
        ? "#0e94d8"
        : decision === "step-up"
          ? "#86ef5a"
          : "#42f0cd";

  return (
    <div className="relative mx-auto h-44 w-56">
      <svg viewBox="0 0 220 150" role="img" aria-label={`Risk score ${score}`}>
        <path
          d="M 34 126 A 76 76 0 0 1 186 126"
          fill="none"
          pathLength="100"
          stroke="#d8dfdc"
          strokeLinecap="round"
          strokeWidth="15"
        />
        <path
          d="M 34 126 A 76 76 0 0 1 186 126"
          fill="none"
          pathLength="100"
          stroke={stroke}
          strokeDasharray={`${score} 100`}
          strokeLinecap="round"
          strokeWidth="15"
        />
      </svg>
      <div className="absolute inset-x-0 top-[58px] text-center">
        <p className="text-5xl font-semibold text-[#01172e]">{score}</p>
        <p className="mt-1 text-sm font-semibold text-[#65716d]">risk score</p>
      </div>
    </div>
  );
}

export default function Home() {
  const [activeId, setActiveId] = useState(requests[1].id);
  const [overrideDecision, setOverrideDecision] = useState<Decision | null>(null);
  const [profileOpen, setProfileOpen] = useState(true);
  const [activeSection, setActiveSection] = useState<Section>("Queue");
  const [exportStatus, setExportStatus] = useState("Evidence packet ready");
  const [runCount, setRunCount] = useState(1);
  const [notice, setNotice] = useState(
    "TrustFlow is reviewing AI-initiated money movement with user-permissioned financial signals.",
  );

  const activeRequest = useMemo(
    () => requests.find((request) => request.id === activeId) ?? requests[0],
    [activeId],
  );

  const currentDecision = overrideDecision ?? activeRequest.recommended;
  const decision = decisionStyles[currentDecision];
  const DecisionIcon = decision.icon;

  function handleSelectRequest(id: string) {
    const next = requests.find((request) => request.id === id);
    if (!next) return;
    setActiveId(id);
    setOverrideDecision(null);
    setExportStatus("Evidence packet ready");
    setNotice(`${next.agent} selected. Recommended decision: ${decisionLabels[next.recommended]}.`);
  }

  function handleRunTrustFlowCheck() {
    setActiveSection("Queue");
    setOverrideDecision(null);
    setRunCount((count) => count + 1);
    setNotice(
      `TrustFlow check ${runCount + 1} completed using identity, balance, Signal risk, and permission guardrails.`,
    );
  }

  function handleDecision(decisionValue: Decision) {
    setActiveSection("Queue");
    setOverrideDecision(decisionValue);
    setNotice(
      `Decision changed to ${decisionLabels[decisionValue]} for ${activeRequest.agent}. Audit trail updated.`,
    );
  }

  function handleToggleProfile() {
    setActiveSection("KYA");
    setProfileOpen((current) => !current);
    setNotice(
      profileOpen
        ? "Know Your Agent profile collapsed."
        : "Know Your Agent profile expanded with owner, limits, consent, and last action.",
    );
  }

  function handleExportAudit() {
    setActiveSection("Audit");
    setExportStatus(`Exported ${activeRequest.id}-audit.json`);
    setNotice(
      `Audit packet exported for ${activeRequest.agent}: request, checks, policy, decision, and reviewer context.`,
    );
  }

  function handleQueueNav() {
    setActiveSection("Queue");
    setNotice("Queue selected. Review the three AI-initiated payment requests.");
  }

  function handleKyaNav() {
    setActiveSection("KYA");
    setProfileOpen(true);
    setNotice("Know Your Agent selected. Owner, consent, and limits are visible.");
  }

  function handlePolicyNav() {
    setActiveSection("Policy");
    setNotice("Policy selected. Guardrails define approval, review, and block thresholds.");
  }

  function handleAuditNav() {
    setActiveSection("Audit");
    setNotice("Audit selected. Timeline and export packet are ready for evidence review.");
  }

  const navActions: Record<Section, () => void> = {
    Queue: handleQueueNav,
    KYA: handleKyaNav,
    Policy: handlePolicyNav,
    Audit: handleAuditNav,
  };

  return (
    <main className="plaid-holographic-wash min-h-screen overflow-hidden text-[#111112]">
      <div className="pointer-events-none fixed inset-0 opacity-55">
        <Image
          src="/brand/images/holographic-strip.webp"
          alt=""
          fill
          priority
          sizes="100vw"
          className="object-cover"
        />
        <div className="absolute inset-0 bg-white/78" />
      </div>

      <div className="relative mx-auto flex max-w-[1500px] flex-col px-4 py-6 sm:px-6 lg:px-8">
        <header className="mx-auto flex w-full max-w-[1180px] flex-col gap-4 rounded-full border border-[#bcd3dc] bg-[#d7edf7]/90 px-5 py-3 shadow-[0_20px_70px_rgba(1,23,46,0.12)] backdrop-blur md:flex-row md:items-center md:justify-between">
          <PlaidLogo />
          <nav className="flex flex-wrap gap-2" aria-label="Dashboard sections">
            {navItems.map(([label, detail]) => (
              <button
                key={label}
                type="button"
                onClick={navActions[label]}
                className={`rounded-full border px-4 py-2 text-sm font-semibold ${
                  activeSection === label
                    ? "border-[#111112] bg-[#111112] text-white"
                    : "border-transparent bg-transparent text-[#232424] hover:bg-white/55"
                }`}
              >
                {label}
                <span
                  className={`ml-2 hidden font-medium md:inline ${
                    activeSection === label ? "text-[#d8fef3]" : "text-[#65716d]"
                  }`}
                >
                  {detail}
                </span>
              </button>
            ))}
          </nav>
        </header>

        <section className="grid gap-5 py-6 xl:grid-cols-[minmax(0,1.55fr)_430px]">
          <div className="grid gap-5">
            <section className="plaid-guilloche relative overflow-hidden rounded-[2px] border border-[#012e37] text-white shadow-[0_24px_90px_rgba(1,23,46,0.18)]">
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_75%_22%,rgba(216,254,243,0.26),transparent_18rem)]" />
              <div className="relative grid gap-0 lg:grid-cols-[minmax(0,1fr)_300px] 2xl:grid-cols-[minmax(0,1fr)_430px]">
                <div className="p-6 sm:p-8 lg:p-10">
                  <Pill className="border-[#d8fef3] bg-[#012e37]/80 text-[#d8fef3]">
                    Day 15 • Agentic payment risk copilot
                  </Pill>
                  <h1 className="plaid-gradient-text mt-5 max-w-4xl text-4xl font-semibold leading-[1.02] md:text-6xl lg:text-[58px] 2xl:text-[76px]">
                    Protect agentic payments with trusted data.
                  </h1>
                  <p className="mt-5 max-w-2xl text-base font-semibold leading-7 text-white md:text-lg">
                    TrustFlow AI reviews AI-initiated pay-by-bank, wallet
                    funding, and account connections using Plaid-style identity,
                    Balance, Signal, consent, and Know Your Agent guardrails.
                  </p>
                  <div className="mt-8 grid gap-3 sm:grid-cols-3">
                    {[
                      ["Identity", "verified owner"],
                      ["Balance", "real-time checks"],
                      ["Signal", "payment risk"],
                    ].map(([label, value]) => (
                      <div
                        key={label}
                        className="border border-white/20 bg-[#00172e]/25 px-4 py-3 backdrop-blur"
                      >
                        <p className="text-xs font-semibold text-[#42f0cd]">
                          {label}
                        </p>
                        <p className="mt-1 text-sm font-semibold text-white">
                          {value}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
                <div className="relative min-h-[340px] overflow-hidden border-t border-white/10 lg:border-l lg:border-t-0 2xl:min-h-[360px]">
                  <Image
                    src="/brand/images/plaid-home-hero.webp"
                    alt="Plaid guilloche financial illustration"
                    fill
                    priority
                    sizes="520px"
                    className="object-contain object-bottom"
                  />
                  <div className="absolute inset-x-0 bottom-[72px] h-5 bg-[linear-gradient(90deg,#63daff,#e7b7ff,#d8fef3,#cdf5fd)] opacity-90" />
                  <div className="absolute bottom-5 left-5 right-5 border border-white/20 bg-[#012e37]/92 p-4 text-sm font-semibold text-[#d8fef3] backdrop-blur">
                    KYA links every agent action to a verified, accountable
                    person or business.
                  </div>
                </div>
              </div>
            </section>

            <section className="rounded-[2px] border border-[#d8dfdc] bg-white p-5 shadow-[0_20px_70px_rgba(1,23,46,0.08)]">
              <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                <div>
                  <p className="text-sm font-semibold text-[#0ba299]">
                    Agentic payments queue
                  </p>
                  <h2 className="mt-1 text-2xl font-semibold">
                    Review AI-initiated money movement
                  </h2>
                </div>
                <button
                  type="button"
                  onClick={handleRunTrustFlowCheck}
                  className="inline-flex h-11 items-center justify-center gap-2 rounded-[2px] bg-[#111112] px-4 text-sm font-semibold text-white hover:bg-[#012e37]"
                >
                  <RefreshCcw className="h-4 w-4" aria-hidden />
                  Run TrustFlow check
                </button>
              </div>

              <div className="mt-5 grid gap-3">
                {requests.map((request) => {
                  const active = request.id === activeRequest.id;
                  const rowDecision =
                    active && overrideDecision
                      ? overrideDecision
                      : request.recommended;
                  return (
                    <button
                      key={request.id}
                      type="button"
                      onClick={() => handleSelectRequest(request.id)}
                      className={`grid gap-4 rounded-[2px] border p-4 text-left md:grid-cols-[1fr_130px_110px_150px] md:items-center ${
                        active
                          ? "border-[#111112] bg-[#effffa] shadow-[8px_8px_0_#111112]"
                          : "border-[#d8dfdc] bg-white hover:border-[#0ba299]"
                      }`}
                    >
                      <div>
                        <p className="text-sm font-semibold text-[#111112]">
                          {request.agent}
                        </p>
                        <p className="mt-1 text-sm text-[#65716d]">
                          {request.user} • {request.request}
                        </p>
                      </div>
                      <div>
                        <p className="text-xs font-semibold text-[#65716d]">
                          Amount
                        </p>
                        <p className="mt-1 text-xl font-semibold">
                          {request.amount}
                        </p>
                      </div>
                      <div>
                        <p className="text-xs font-semibold text-[#65716d]">
                          Risk
                        </p>
                        <p className="mt-1 text-xl font-semibold">
                          {request.riskScore}
                        </p>
                      </div>
                      <Pill className={decisionStyles[rowDecision].badge}>
                        {decisionLabels[rowDecision]}
                      </Pill>
                    </button>
                  );
                })}
              </div>
            </section>

            <section className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_minmax(0,0.9fr)]">
              <div className="rounded-[2px] border border-[#d8dfdc] bg-white p-5 shadow-[0_20px_70px_rgba(1,23,46,0.08)]">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <p className="text-sm font-semibold text-[#0ba299]">
                      Know Your Agent profile
                    </p>
                    <h2 className="mt-1 text-2xl font-semibold">
                      {activeRequest.agent}
                    </h2>
                  </div>
                  <button
                    type="button"
                    onClick={handleToggleProfile}
                    className="inline-flex h-10 items-center gap-2 rounded-[2px] border border-[#111112] px-3 text-sm font-semibold hover:bg-[#111112] hover:text-white"
                  >
                    <UserRoundCheck className="h-4 w-4" aria-hidden />
                    {profileOpen ? "Collapse" : "Open profile"}
                  </button>
                </div>

                {profileOpen ? (
                  <div className="mt-5 grid gap-3 sm:grid-cols-2">
                    {[
                      ["Human owner", activeRequest.user, Fingerprint],
                      ["Connected account", activeRequest.account, Landmark],
                      ["Allowed limit", activeRequest.permissionLimit, KeyRound],
                      ["Consent expires", activeRequest.consentExpiry, Clock3],
                      ["Account age", activeRequest.accountAge, Building2],
                      ["Last action", activeRequest.lastAction, ClipboardCheck],
                    ].map(([label, value, Icon]) => {
                      const TypedIcon = Icon as LucideIcon;
                      return (
                        <div
                          key={label as string}
                          className="border border-[#d8dfdc] bg-[#f8fbf6] p-4"
                        >
                          <TypedIcon
                            className="h-5 w-5 text-[#0ba299]"
                            aria-hidden
                          />
                          <p className="mt-3 text-xs font-semibold text-[#65716d]">
                            {label as string}
                          </p>
                          <p className="mt-1 text-sm font-semibold">
                            {value as string}
                          </p>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <p className="mt-5 border border-[#d8dfdc] bg-[#f8fbf6] p-4 text-sm font-semibold text-[#65716d]">
                    Profile hidden. Open it to view owner, account, limit, and
                    consent evidence.
                  </p>
                )}
              </div>

              <div className={`rounded-[2px] border p-5 ${decision.panel}`}>
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <p className="text-sm font-semibold text-[#65716d]">
                      Risk decision card
                    </p>
                    <h2 className="mt-1 text-2xl font-semibold">
                      {decisionLabels[currentDecision]}
                    </h2>
                  </div>
                  <div className="rounded-full bg-white p-3">
                    <DecisionIcon className="h-6 w-6" aria-hidden />
                  </div>
                </div>

                <RiskArc
                  score={activeRequest.riskScore}
                  decision={currentDecision}
                />
                <p className="text-sm font-semibold leading-6 text-[#012e37]">
                  {decision.summary}
                </p>

                <div className="mt-5 grid grid-cols-2 gap-2">
                  {(["approve", "step-up", "review", "block"] as Decision[]).map(
                    (decisionValue) => (
                      <button
                        key={decisionValue}
                        type="button"
                        onClick={() => handleDecision(decisionValue)}
                        className={`h-11 rounded-[2px] border px-3 text-sm font-semibold ${
                          currentDecision === decisionValue
                            ? "border-[#111112] bg-[#111112] text-white"
                            : "border-[#d8dfdc] bg-white text-[#111112] hover:border-[#0ba299]"
                        }`}
                      >
                        {decisionLabels[decisionValue]}
                      </button>
                    ),
                  )}
                </div>
              </div>
            </section>
          </div>

          <aside className="grid content-start gap-5">
            <section className="self-start rounded-[2px] border border-[#d8dfdc] bg-white p-5 shadow-[0_20px_70px_rgba(1,23,46,0.08)]">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <p className="text-sm font-semibold text-[#0ba299]">
                    Active console action
                  </p>
                  <p
                    data-testid="active-console-notice"
                    className="mt-1 text-sm font-semibold leading-6"
                  >
                    {notice}
                  </p>
                </div>
                <Sparkles className="h-6 w-6 text-[#5e5ed9]" aria-hidden />
              </div>
            </section>

            <section className="self-start rounded-[2px] border border-[#d8dfdc] bg-white p-5 shadow-[0_20px_70px_rgba(1,23,46,0.08)]">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-semibold">Risk drivers</h2>
                <Gauge className="h-5 w-5 text-[#0ba299]" aria-hidden />
              </div>
              <div className="mt-4 grid gap-3">
                {activeRequest.drivers.map((driver) => (
                  <div key={driver} className="flex items-start gap-3">
                    <ShieldCheck
                      className="mt-0.5 h-4 w-4 text-[#0ba299]"
                      aria-hidden
                    />
                    <p className="text-sm font-semibold leading-6">{driver}</p>
                  </div>
                ))}
              </div>
            </section>

            <section className="self-start rounded-[2px] border border-[#d8dfdc] bg-white p-5 shadow-[0_20px_70px_rgba(1,23,46,0.08)]">
              <h2 className="text-lg font-semibold">Signal checks</h2>
              <div className="mt-4 grid gap-2">
                {activeRequest.checks.map((check) => (
                  <div
                    key={check.label}
                    className="flex items-center justify-between border border-[#d8dfdc] bg-[#f8fbf6] px-3 py-2"
                  >
                    <span className="text-sm font-semibold text-[#65716d]">
                      {check.label}
                    </span>
                    <Pill
                      className={
                        check.tone === "good"
                          ? "border-[#42f0cd] bg-[#d8fef3] text-[#012e37]"
                          : check.tone === "warn"
                            ? "border-[#86ef5a] bg-[#e8fed7] text-[#012e37]"
                            : "border-[#c6a7ff] bg-[#faf7ff] text-[#671877]"
                      }
                    >
                      {check.value}
                    </Pill>
                  </div>
                ))}
              </div>
            </section>

            <section className="self-start overflow-hidden rounded-[2px] border border-[#111112] bg-[#01172e] text-white shadow-[0_20px_70px_rgba(1,23,46,0.16)]">
              <div className="relative h-24">
                <Image
                  src="/brand/images/tail-holo-strip.webp"
                  alt=""
                  fill
                  sizes="430px"
                  className="object-cover"
                />
              </div>
              <div className="p-5">
                <div className="flex items-center gap-3">
                  <LockKeyhole className="h-6 w-6 text-[#42f0cd]" aria-hidden />
                  <h2 className="text-lg font-semibold">
                    Scoped credentials only
                  </h2>
                </div>
                <p className="mt-3 text-sm font-medium leading-6 text-[#c8d3d0]">
                  TrustFlow never hands a long-lived bank credential to the AI
                  agent. It issues a task-scoped decision and preserves proof.
                </p>
              </div>
            </section>
          </aside>
        </section>

        <section className="grid gap-5 pb-6 xl:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)]">
          <div className="rounded-[2px] border border-[#d8dfdc] bg-white p-5 shadow-[0_20px_70px_rgba(1,23,46,0.08)]">
            <div className="flex items-center justify-between gap-3">
              <div>
                <p className="text-sm font-semibold text-[#0ba299]">
                  Payment guardrails
                </p>
                <h2 className="mt-1 text-2xl font-semibold">
                  Policy matrix
                </h2>
              </div>
              <ChevronDown className="h-5 w-5 text-[#65716d]" aria-hidden />
            </div>
            <div className="mt-5 overflow-hidden border border-[#d8dfdc]">
              {guardrails.map(([rule, action]) => (
                <div
                  key={rule}
                  className="grid gap-2 border-b border-[#d8dfdc] bg-white px-4 py-3 last:border-b-0 sm:grid-cols-[160px_1fr]"
                >
                  <p className="text-sm font-semibold">{rule}</p>
                  <p className="text-sm font-medium leading-6 text-[#65716d]">
                    {action}
                  </p>
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-[2px] border border-[#d8dfdc] bg-white p-5 shadow-[0_20px_70px_rgba(1,23,46,0.08)]">
            <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
              <div>
                <p className="text-sm font-semibold text-[#0ba299]">
                  Consent and audit trail
                </p>
                <h2 className="mt-1 text-2xl font-semibold">
                  Proof for every decision
                </h2>
              </div>
              <button
                type="button"
                onClick={handleExportAudit}
                className="inline-flex h-11 items-center justify-center gap-2 rounded-[2px] bg-[#111112] px-4 text-sm font-semibold text-white hover:bg-[#012e37]"
              >
                <Download className="h-4 w-4" aria-hidden />
                Export audit packet
              </button>
            </div>
            <div className="mt-5 grid gap-3 md:grid-cols-4">
              {activeRequest.timeline.map((event, index) => (
                <div
                  key={event}
                  className="border border-[#d8dfdc] bg-[#f8fbf6] p-4"
                >
                  <span className="flex h-9 w-9 items-center justify-center rounded-full bg-[#111112] text-sm font-semibold text-white">
                    {index + 1}
                  </span>
                  <p className="mt-4 text-sm font-semibold leading-6">
                    {event}
                  </p>
                </div>
              ))}
            </div>
            <div className="mt-4 flex flex-wrap items-center gap-3 border border-[#d8dfdc] bg-[#effffa] px-4 py-3">
              <WalletCards className="h-5 w-5 text-[#0ba299]" aria-hidden />
              <p className="text-sm font-semibold">{exportStatus}</p>
              <span className="ml-auto text-xs font-semibold text-[#65716d]">
                decision_id: tf-{activeRequest.id}
              </span>
            </div>
          </div>
        </section>

        <section className="grid gap-5 border-t border-[#d8dfdc] py-6 lg:grid-cols-4">
          {[
            [CircleDollarSign, "Money movement", "ACH, wallet funding, RTP"],
            [Shield, "Fraud posture", "Signal, velocity, account age"],
            [BadgeCheck, "Verified identity", "KYC-backed owner context"],
            [Landmark, "Open finance", "Consent and permissions evidence"],
          ].map(([Icon, title, detail]) => {
            const TypedIcon = Icon as LucideIcon;
            return (
              <div
                key={title as string}
                className="border border-[#d8dfdc] bg-white p-4"
              >
                <TypedIcon className="h-6 w-6 text-[#0ba299]" aria-hidden />
                <h3 className="mt-4 text-lg font-semibold">{title as string}</h3>
                <p className="mt-2 text-sm font-medium text-[#65716d]">
                  {detail as string}
                </p>
              </div>
            );
          })}
        </section>

        <footer className="pb-6 text-xs font-medium text-[#65716d]">
          Unofficial Asion concept demo inspired by Plaid-style financial
          infrastructure, AI, open finance, and payment risk workflows. Not
          affiliated with Plaid.
        </footer>
      </div>
    </main>
  );
}
