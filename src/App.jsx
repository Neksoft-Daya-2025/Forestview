import { useEffect, useId, useLayoutEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import {
  Baby,
  BadgeCheck,
  Bell,
  CalendarDays,
  FileText,
  GraduationCap,
  HeartHandshake,
  Home,
  Mail,
  MapPin,
  Phone,
  ShieldCheck,
  Users,
  Flag,
  CircleHelp,
  Check,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Send,
  MessageCircle,
  Menu,
  X,
} from "lucide-react";
import schoolLogo from "./assets/forestviewschoollogo.png";
import footerLogo from "./assets/forestviewfooterlogo.png";
import heroPhoto from "./assets/hero-leafbuckle.jpg";
import classroomPhoto from "./assets/grid-whole.jpg";
import familyPhoto from "./assets/grid-community.jpg";
import signPhoto from "./assets/grid-sign.jpg";
import experienceChild from "./assets/division-ycc.jpg";
import experienceVideo from "./assets/video.mp4";
import {
  SYLLABUS_ASSESSMENT,
  SYLLABUS_FAMILIES,
  SYLLABUS_OFFERINGS,
  SYLLABUS_PHILOSOPHY,
  SYLLABUS_PRESCHOOL,
  SYLLABUS_SCHEDULE,
  SYLLABUS_TOC,
  SYLLABUS_TODDLER,
  SYLLABUS_VALUES,
} from "./syllabusContent.js";
import {
  EMAIL_INPUT_PATTERN,
  PHONE_INPUT_PATTERN,
  sanitizePhoneInput,
  validateAdmissionFields,
  validateContactFields,
  validateTourFields,
} from "./formValidation.js";
import { MathChallengeField, useMathChallenge } from "./mathChallenge.jsx";

gsap.registerPlugin(ScrollTrigger);

function handlePhoneInput(e) {
  e.target.value = sanitizePhoneInput(e.target.value);
}

const HERO_SLIDE = {
  image: heroPhoto,
  objectPosition: "center 22%",
  alt: "A child working with Montessori materials in the classroom",
  title: "Purposeful work, side by side",
  subtitle: "Room to move, room to grow.",
};

/** Years of operation updates each calendar year automatically. */
const FOUNDED_YEAR = 1994;

/** Official school name — one word: Forestview. */
const SCHOOL_NAME = "Forestview Montessori";
const SCHOOL_SHORT = "Forestview";
/** Consistent program pair label sitewide. */
const PROGRAMS_LABEL = "Toddler & Preschool";
const CHILD_CARE_TAGLINE = "Montessori Child Care in Plymouth";
const HERO_SUBHEADLINE =
  "Nurturing confident, independent learners through toddler and preschool programs.";
const SCHEDULE_TOUR_HREF = "#/tour";
const ADMISSION_FORM_HREF = "#/admission-form";

async function postToApi(path, payload) {
  const res = await fetch(`/api/${path}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    throw new Error(data.message || "Something went wrong. Please try again or call the office.");
  }
  return data;
}

const ADMIN_TOKEN_KEY = "fv_admin_token";

async function adminFetch(path, options = {}) {
  const token = sessionStorage.getItem(ADMIN_TOKEN_KEY);
  const res = await fetch(`/api/admin/${path}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...(options.headers || {}),
    },
    body: options.body,
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    throw new Error(data.message || "Request failed.");
  }
  return data;
}

function formatAdminDate(iso) {
  if (!iso) return "—";
  try {
    return new Date(iso).toLocaleString("en-US", {
      dateStyle: "medium",
      timeStyle: "short",
    });
  } catch {
    return iso;
  }
}

function AdminDetailList({ rows }) {
  return (
    <dl className="adminDetailList">
      {rows.map(([label, value]) =>
        value ? (
          <div key={label} className="adminDetailList-row">
            <dt>{label}</dt>
            <dd>{value}</dd>
          </div>
        ) : null,
      )}
    </dl>
  );
}

function AdminPage() {
  const [token, setToken] = useState(() =>
    typeof window !== "undefined" ? sessionStorage.getItem(ADMIN_TOKEN_KEY) : null,
  );
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [loginError, setLoginError] = useState("");
  const [loggingIn, setLoggingIn] = useState(false);
  const [tab, setTab] = useState("contact");
  const [data, setData] = useState(null);
  const [loadError, setLoadError] = useState("");
  const [loading, setLoading] = useState(false);
  const [expandedId, setExpandedId] = useState(null);

  async function loadSubmissions() {
    setLoading(true);
    setLoadError("");
    try {
      const result = await adminFetch("submissions");
      setData(result);
    } catch (err) {
      setLoadError(err.message || "Could not load submissions.");
      if (err.message === "Unauthorized.") {
        sessionStorage.removeItem(ADMIN_TOKEN_KEY);
        setToken(null);
      }
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    if (token) loadSubmissions();
  }, [token]);

  async function handleLogin(e) {
    e.preventDefault();
    setLoggingIn(true);
    setLoginError("");
    try {
      const result = await adminFetch("login", {
        method: "POST",
        body: JSON.stringify({ username: username.trim(), password }),
      });
      sessionStorage.setItem(ADMIN_TOKEN_KEY, result.token);
      setToken(result.token);
      setPassword("");
    } catch (err) {
      setLoginError(err.message || "Login failed.");
    } finally {
      setLoggingIn(false);
    }
  }

  function handleLogout() {
    const current = sessionStorage.getItem(ADMIN_TOKEN_KEY);
    if (current) {
      adminFetch("logout", { method: "POST" }).catch(() => {});
    }
    sessionStorage.removeItem(ADMIN_TOKEN_KEY);
    setToken(null);
    setData(null);
    setUsername("");
    setPassword("");
  }

  if (!token) {
    return (
      <main className="adminPage adminPage--login">
        <div className="adminPage-card">
          <h1 className="adminPage-title">Forestview Admin</h1>
          <p className="adminPage-lead">Sign in to view form submissions.</p>
          <form className="adminLoginForm" onSubmit={handleLogin}>
            <label className="adminLoginForm-field">
              <span>Username</span>
              <input
                type="text"
                name="username"
                autoComplete="username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
              />
            </label>
            <label className="adminLoginForm-field">
              <span>Password</span>
              <input
                type="password"
                name="password"
                autoComplete="current-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </label>
            {loginError ? (
              <p className="formFeedback formFeedback--error" role="alert">
                {loginError}
              </p>
            ) : null}
            <button type="submit" className="adminPage-btn" disabled={loggingIn}>
              {loggingIn ? "Signing in…" : "Sign in"}
            </button>
          </form>
        </div>
      </main>
    );
  }

  const tabs = [
    { id: "contact", label: "Contact", count: data?.counts?.contact ?? 0 },
    { id: "tour", label: "Tours", count: data?.counts?.tour ?? 0 },
    { id: "admission", label: "Applications", count: data?.counts?.admission ?? 0 },
  ];

  const rows = data?.[tab] ?? [];

  return (
    <main className="adminPage">
      <header className="adminPage-header">
        <div>
          <h1 className="adminPage-title">Submissions</h1>
          <p className="adminPage-lead">{data?.counts?.total ?? 0} total entries</p>
        </div>
        <div className="adminPage-headerActions">
          <button type="button" className="adminPage-btn adminPage-btn--ghost" onClick={loadSubmissions} disabled={loading}>
            {loading ? "Refreshing…" : "Refresh"}
          </button>
          <button type="button" className="adminPage-btn adminPage-btn--ghost" onClick={handleLogout}>
            Sign out
          </button>
        </div>
      </header>

      <div className="adminPage-tabs" role="tablist" aria-label="Submission types">
        {tabs.map((t) => (
          <button
            key={t.id}
            type="button"
            role="tab"
            aria-selected={tab === t.id}
            className={`adminPage-tab${tab === t.id ? " adminPage-tab--active" : ""}`}
            onClick={() => {
              setTab(t.id);
              setExpandedId(null);
            }}
          >
            {t.label}
            <span className="adminPage-tabCount">{t.count}</span>
          </button>
        ))}
      </div>

      {loadError ? (
        <p className="formFeedback formFeedback--error" role="alert">
          {loadError}
        </p>
      ) : null}

      {loading && !data ? <p className="adminPage-empty">Loading submissions…</p> : null}

      {!loading && rows.length === 0 ? <p className="adminPage-empty">No {tab} submissions yet.</p> : null}

      <div className="adminPage-list">
        {rows.map((entry) => {
          const open = expandedId === entry.id;
          let summary = "";
          let details = [];

          if (tab === "contact") {
            summary = `${entry.name} · ${entry.email}`;
            details = [
              ["Submitted", formatAdminDate(entry.submittedAt)],
              ["Name", entry.name],
              ["Email", entry.email],
              ["Phone", entry.phone],
              ["Message", entry.message],
            ];
          } else if (tab === "tour") {
            summary = `${entry.parentName} · ${entry.tourDate}`;
            details = [
              ["Submitted", formatAdminDate(entry.submittedAt)],
              ["Parent / guardian", entry.parentName],
              ["Child", entry.childName],
              ["Child age", entry.childAge],
              ["Saturday", entry.tourDate],
              ["Phone", entry.phone],
              ["Email", entry.email],
              ["Message", entry.message],
            ];
          } else {
            summary = `${entry.childLegalName} · ${entry.parentName}`;
            details = [
              ["Submitted", formatAdminDate(entry.submittedAt)],
              ["Parent", entry.parentName],
              ["Relationship", entry.parentRelation],
              ["Phone", entry.phone],
              ["Email", entry.email],
              ["Address", `${entry.addressLine}, ${entry.city}, ${entry.state} ${entry.zip}`],
              ["Second contact", entry.secondaryName],
              ["Second email", entry.secondaryEmail],
              ["Second phone", entry.secondaryPhone],
              ["Child (legal)", entry.childLegalName],
              ["Preferred name", entry.childPreferredName],
              ["Date of birth", entry.childDob],
              ["Current care", entry.currentCare],
              ["Program", entry.program],
              ["Schedule", entry.schedulePref],
              ["Desired start", entry.start],
              ["Sibling enrolled", entry.siblingAtSchool],
              ["Sibling name(s)", entry.siblingNames],
              ["Referral", entry.referralSource],
              ["Referral detail", entry.referralDetail],
              ["Health notes", entry.healthNotes],
              ["Learning notes", entry.learningNotes],
              ["Message", entry.message],
            ];
          }

          return (
            <article key={entry.id} className={`adminEntry${open ? " adminEntry--open" : ""}`}>
              <button
                type="button"
                className="adminEntry-summary"
                onClick={() => setExpandedId(open ? null : entry.id)}
                aria-expanded={open}
              >
                <span className="adminEntry-main">{summary}</span>
                <span className="adminEntry-date">{formatAdminDate(entry.submittedAt)}</span>
              </button>
              {open ? <AdminDetailList rows={details} /> : null}
            </article>
          );
        })}
      </div>
    </main>
  );
}
const ADMISSIONS_PROCESS_HREF = "#/admissions/admissions-process";
const ADMISSIONS_APPLY_HREF = "#/admissions/admissions-apply";
const ADMISSIONS_SECTION_IDS = ["admissions-process", "admissions-apply"];

const ABOUT_WHY_US = [
  {
    Icon: ShieldCheck,
    title: "Authentic Montessori",
    text: "Prepared rooms, sequenced materials, and guides who observe before they teach - so independence and concentration grow naturally.",
  },
  {
    Icon: Users,
    title: "Small by design",
    text: `${PROGRAMS_LABEL} child care stays intimate enough that teachers know your child’s strengths, needs, and personality - not just their schedule.`,
  },
  {
    Icon: HeartHandshake,
    title: "Families matter here",
    text: "You’re part of the team: clear communication, shared expectations, and a culture where parents feel welcome in the life of our center.",
  },
  {
    Icon: Home,
    title: "Stable roots in Plymouth",
    text: `Founded in ${FOUNDED_YEAR}, we have served generations of local families with consistent leadership and deep community trust.`,
  },
];

function getYearsOperating() {
  return Math.max(0, new Date().getFullYear() - FOUNDED_YEAR);
}

/** "1 year" vs "2 years" for copy and labels. */
function yearsLabel(count) {
  return `${count} year${count === 1 ? "" : "s"}`;
}

function buildFeatureCards(yearsOperating) {
  const legacyText =
    yearsOperating > 0
      ? `${yearsLabel(yearsOperating)} helping Plymouth children grow in confidence and joy.`
      : `Since ${FOUNDED_YEAR}, helping Plymouth children grow in confidence and joy.`;

  return [
    {
      icon: CalendarDays,
      title: "Preschool",
      text: "Children 33 months to 6 years of age enjoy all of the benefits of our carefully prepared Montessori learning environment. Children may work either individually or in small groups, learning from and sharing with one another.",
      image: classroomPhoto,
      area: "whole",
      ctaLabel: "Preschool Rates",
      ctaHref: "#/admissions",
    },
    {
      icon: Baby,
      title: "Toddler",
      text: "Children ages 16 to 33 months. In our Toddler program, children build basic skills for a smooth transition to Preschool.",
      area: "faculty",
      ctaLabel: "Toddler Rates",
      ctaHref: "#/admissions",
    },
    {
      icon: Users,
      title: "Diverse & Inclusive",
      text: "Every family belongs here - kindness, curiosity, and friendship at the center.",
      area: "diverse",
    },
    {
      icon: HeartHandshake,
      title: "Rich Legacy",
      text: legacyText,
      area: "legacy",
    },
    {
      icon: Users,
      title: "Individualized Instruction",
      text: "Lessons follow your child’s pace - not a one-size chart - so effort feels personal and possible.",
      area: "individual",
    },
    {
      icon: GraduationCap,
      title: "Ready for What’s Next",
      text: "Strong habits and warm hearts - ready for the next classroom and the wider world.",
      area: "after",
    },
    {
      icon: Flag,
      title: "Montessori education",
      text: "Authentic Montessori: prepared spaces, trained adults, and deep respect for every child.",
      area: "ami",
    },
  ];
}

const programs = {
  YCC: {
    label: "Toddler",
    age: "Ages 16–33 months",
    text: "Our youngest learners build language, confidence, and independence in a gentle, prepared space - together with caring guides.",
    features: [
      "Language-rich, calm environment",
      "Practical life and sensorial materials",
      "Consistent guides who know your child",
      "Center Hours Mon to Fri 6:30 AM to 6 PM",
    ],
    cta: { label: "Inquire about Toddler", href: "#/admissions" },
  },
  Preschool: {
    label: "Preschool",
    age: "Ages 33 months–6 years",
    text: "Hands-on materials, time to concentrate, and a classroom family where each child is known and respected - the core of our Montessori Preschool child care program.",
    features: [
      "Full Montessori curriculum areas",
      "Mixed-age 3–6 year classroom",
      "Reading, math, culture, and art",
      "Center Hours Mon to Fri 6:30 AM to 6 PM",
    ],
    cta: { label: "Inquire about Preschool", href: "#/admissions" },
  },
};

const PROGRAM_CARD_ICONS = {
  YCC: Baby,
  Preschool: GraduationCap,
};

const COOKIE_CONSENT_STORAGE_KEY = "fvm-cookie-consent-v1";

function HomeTourPopup() {
  const [mounted, setMounted] = useState(false);
  const [open, setOpen] = useState(false);
  const requestRef = useRef(null);

  const dismiss = () => {
    setOpen(false);
    window.setTimeout(() => setMounted(false), 420);
  };

  useEffect(() => {
    if (typeof window === "undefined") return undefined;
    setMounted(true);
    const timer = window.setTimeout(() => setOpen(true), 2200);
    return () => window.clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (!open) return undefined;
    requestRef.current?.focus({ preventScroll: true });
    const onKey = (e) => {
      if (e.key === "Escape") dismiss();
    };
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = prevOverflow;
      window.removeEventListener("keydown", onKey);
    };
  }, [open]);

  if (!mounted) return null;

  return createPortal(
    <>
      <button
        type="button"
        className={`homeTourPopup-overlay${open ? " homeTourPopup-overlay--open" : ""}`}
        aria-label="Close tour information"
        onClick={dismiss}
        tabIndex={open ? 0 : -1}
      />
      <div
        className={`homeTourPopup${open ? " homeTourPopup--open" : ""}`}
        role="dialog"
        aria-modal="true"
        aria-labelledby="home-tour-popup-title"
        aria-describedby="home-tour-popup-desc"
      >
        <div className="homeTourPopup-panel">
          <button type="button" className="homeTourPopup-close" onClick={dismiss} aria-label="Close">
            <X size={18} strokeWidth={2.5} aria-hidden />
          </button>
          <CalendarDays className="homeTourPopup-icon" size={28} strokeWidth={1.65} aria-hidden />
          <h2 id="home-tour-popup-title" className="homeTourPopup-title">
            Book a Tour on Request
          </h2>
          <p id="home-tour-popup-desc" className="homeTourPopup-text">
            We welcome families to visit our child care center. Tours run by appointment on Saturdays between 10 AM and
            12 PM — send a request and the office will confirm your time.
          </p>
          <p className="homeTourPopup-hours" aria-label="Tour hours: Saturdays 10 AM to 12 PM">
            <span className="homeTourPopup-hoursLabel">When</span>
            <span className="homeTourPopup-hoursValue">Saturday · 10:00 AM – 12:00 PM</span>
          </p>
          <div className="homeTourPopup-actions">
            <a ref={requestRef} href={SCHEDULE_TOUR_HREF} className="ctaPrimary homeTourPopup-cta" onClick={dismiss}>
              Request a tour
            </a>
            <button type="button" className="homeTourPopup-dismiss" onClick={dismiss}>
              Not now
            </button>
          </div>
        </div>
      </div>
    </>,
    document.body,
  );
}

function CookieConsent() {
  const [mounted, setMounted] = useState(false);
  const [open, setOpen] = useState(false);
  const acceptRef = useRef(null);

  useEffect(() => {
    if (typeof window === "undefined") return undefined;
    try {
      if (window.localStorage.getItem(COOKIE_CONSENT_STORAGE_KEY) === "1") {
        return undefined;
      }
    } catch {
      /* ignore */
    }
    setMounted(true);
    const raf = window.requestAnimationFrame(() => {
      window.requestAnimationFrame(() => setOpen(true));
    });
    return () => window.cancelAnimationFrame(raf);
  }, []);

  useEffect(() => {
    if (open && mounted) {
      acceptRef.current?.focus();
    }
  }, [open, mounted]);

  const accept = () => {
    try {
      window.localStorage.setItem(COOKIE_CONSENT_STORAGE_KEY, "1");
    } catch {
      /* ignore */
    }
    setOpen(false);
    window.setTimeout(() => setMounted(false), 480);
  };

  if (!mounted) return null;

  return createPortal(
    <div
      className={`cookieConsent ${open ? "cookieConsent--open" : ""}`}
      role="dialog"
      aria-modal="true"
      aria-labelledby="cookie-consent-title"
      aria-describedby="cookie-consent-desc"
    >
      <div className="cookieConsent-panel">
        <h2 id="cookie-consent-title" className="cookieConsent-title">
          Cookie notice
        </h2>
        <p id="cookie-consent-desc" className="cookieConsent-text">
          We use essential cookies so this site works properly. You can control or delete cookies in your browser
          settings at any time.
        </p>
        <button ref={acceptRef} type="button" className="cookieConsent-accept" onClick={accept}>
          Accept
        </button>
      </div>
    </div>,
    document.body,
  );
}

function getAdmissionsSectionIdFromHash() {
  if (typeof window === "undefined") return null;
  const raw = window.location.hash.replace(/^#\/?/, "").split("?")[0];
  const parts = raw.split("/").filter(Boolean);
  if (parts[0] === "admissions" && parts[1]) return decodeURIComponent(parts[1]);
  if (parts[0]?.startsWith("admissions-")) return parts[0];
  return null;
}

function scrollToAdmissionsSection(sectionId) {
  if (!sectionId || !ADMISSIONS_SECTION_IDS.includes(sectionId)) return;
  const el = document.getElementById(sectionId);
  if (!el) return;
  const instant = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  requestAnimationFrame(() => {
    el.scrollIntoView({ behavior: instant ? "auto" : "smooth", block: "start" });
  });
}

function EnrollingTicker() {
  const label = "Enrolling Now";
  const repeats = 10;

  const segment = (keyPrefix) => (
    <div className="enrollTicker-segment" key={keyPrefix} aria-hidden={keyPrefix === "b" ? true : undefined}>
      {Array.from({ length: repeats }, (_, i) => (
        <span className="enrollTicker-item" key={`${keyPrefix}-${i}`}>
          <span className="enrollTicker-dot" aria-hidden="true" />
          <span className="enrollTicker-text">{label}</span>
        </span>
      ))}
    </div>
  );

  return (
    <div className="enrollTicker enrollTicker--site" role="region" aria-label="Enrolling now">
      <a className="enrollTicker-hit" href={ADMISSION_FORM_HREF}>
        <div className="enrollTicker-viewport">
          <div className="enrollTicker-track">
            {segment("a")}
            {segment("b")}
          </div>
        </div>
      </a>
    </div>
  );
}

function SiteChrome() {
  return (
    <>
      <EnrollingTicker />
      <CookieConsent />
      <EnquiryChat />
    </>
  );
}

/** Replace with your real portal URLs when available. */
const LOGIN_PAGE_URL = "#login";
const STAFF_LOGIN_URL = "#staff-login";

const SCHOOL_NOTICES = [
  {
    title: "Winter break",
    meta: "Dec 24, 2026 – Jan 2, 2027",
    text: "School closed for winter break. We wish your family a peaceful holiday season.",
  },
  {
    title: "Martin Luther King Jr. Day",
    meta: "Monday, Jan 19, 2027",
    text: "No school — closed in observance of this holiday.",
  },
  {
    title: "Spring conference day",
    meta: "Friday, Mar 13, 2027",
    text: "Early dismissal for parent–guide conferences. Details will be emailed the week prior.",
  },
  {
    title: "Memorial Day",
    meta: "Monday, May 25, 2027",
    text: "School closed. Classes resume Tuesday, May 26.",
  },
];

function NavNoticesPopover() {
  const [open, setOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const wrapRef = useRef(null);

  useEffect(() => {
    const mq = window.matchMedia("(max-width: 980px)");
    setIsMobile(mq.matches);
    const handler = (e) => setIsMobile(e.matches);
    mq.addEventListener("change", handler);
    return () => mq.removeEventListener("change", handler);
  }, []);

  useEffect(() => {
    if (!open) return undefined;
    const close = (e) => {
      if (wrapRef.current && !wrapRef.current.contains(e.target)) {
        setOpen(false);
      }
    };
    document.addEventListener("click", close);
    return () => document.removeEventListener("click", close);
  }, [open]);

  useEffect(() => {
    if (!open) return undefined;
    const onKey = (e) => {
      if (e.key === "Escape") setOpen(false);
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open]);

  const panel = open ? (
    <>
      {isMobile && (
        <div
          className="navNotices-overlay"
          aria-hidden
          onClick={() => setOpen(false)}
        />
      )}
      <div
        id="nav-notices-panel"
        className={`navNotices-panel${isMobile ? " navNotices-panel--modal" : ""}`}
        role="region"
        aria-labelledby="nav-notices-heading"
      >
        {isMobile && (
          <button
            className="navNotices-close"
            onClick={() => setOpen(false)}
            aria-label="Close notices"
          >
            <X size={18} strokeWidth={2.5} aria-hidden />
          </button>
        )}
        <h2 id="nav-notices-heading" className="navNotices-heading">
          Notices
        </h2>
        <p className="navNotices-intro">Holidays and upcoming dates for families.</p>
        <ul className="navNotices-list">
          {SCHOOL_NOTICES.map((n) => (
            <li key={n.title} className="navNotices-item">
              <strong className="navNotices-itemTitle">{n.title}</strong>
              <span className="navNotices-itemMeta">{n.meta}</span>
              <p className="navNotices-itemText">{n.text}</p>
            </li>
          ))}
        </ul>
        <a href="#/admissions" className="navNotices-calendarLink" onClick={() => setOpen(false)}>
          View full calendar
        </a>
      </div>
    </>
  ) : null;

  return (
    <div className="navNotices" ref={wrapRef}>
      <button
        type="button"
        className="navNotices-trigger"
        id="nav-notices-button"
        aria-expanded={open}
        aria-haspopup="true"
        aria-controls="nav-notices-panel"
        onClick={() => setOpen((v) => !v)}
        aria-label="School notices"
      >
        <Bell size={20} strokeWidth={2} aria-hidden />
      </button>
      {isMobile ? createPortal(panel, document.body) : panel}
    </div>
  );
}

function NavContactMenu({ onNavigate }) {
  const [open, setOpen] = useState(false);
  const wrapRef = useRef(null);
  const closeTimerRef = useRef(null);

  const close = () => setOpen(false);

  const openMenu = () => {
    if (closeTimerRef.current) {
      window.clearTimeout(closeTimerRef.current);
      closeTimerRef.current = null;
    }
    setOpen(true);
  };

  const scheduleClose = () => {
    if (closeTimerRef.current) window.clearTimeout(closeTimerRef.current);
    closeTimerRef.current = window.setTimeout(() => {
      close();
      closeTimerRef.current = null;
    }, 140);
  };

  useEffect(() => {
    return () => {
      if (closeTimerRef.current) window.clearTimeout(closeTimerRef.current);
    };
  }, []);

  useEffect(() => {
    if (!open) return undefined;
    const onClickOutside = (e) => {
      if (wrapRef.current && !wrapRef.current.contains(e.target)) {
        close();
      }
    };
    document.addEventListener("click", onClickOutside);
    return () => document.removeEventListener("click", onClickOutside);
  }, [open]);

  useEffect(() => {
    if (!open) return undefined;
    const onKey = (e) => {
      if (e.key === "Escape") close();
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open]);

  const go = () => {
    close();
    onNavigate?.();
  };

  return (
    <div
      className="navContact"
      ref={wrapRef}
      onMouseEnter={openMenu}
      onMouseLeave={scheduleClose}
    >
      <button
        type="button"
        className="navContact-trigger"
        id="nav-contact-button"
        aria-expanded={open}
        aria-haspopup="true"
        aria-controls="nav-contact-menu"
        onClick={() => setOpen((v) => !v)}
      >
        Contact
        <ChevronDown size={14} strokeWidth={2.5} aria-hidden className="navContact-chevron" />
      </button>
      {open ? (
        <div id="nav-contact-menu" className="navContact-menu" role="menu" aria-labelledby="nav-contact-button">
          <a href="#/contact" role="menuitem" className="navContact-item" onClick={go}>
            Contact us
          </a>
          <a href="#/careers" role="menuitem" className="navContact-item" onClick={go}>
            Careers
          </a>
          <a href={SCHEDULE_TOUR_HREF} role="menuitem" className="navContact-item navContact-item--accent" onClick={go}>
            Book a Tour
          </a>
        </div>
      ) : null}
    </div>
  );
}

function NavLoginDropdown() {
  const [open, setOpen] = useState(false);
  const wrapRef = useRef(null);

  useEffect(() => {
    if (!open) return undefined;
    const close = (e) => {
      if (wrapRef.current && !wrapRef.current.contains(e.target)) {
        setOpen(false);
      }
    };
    document.addEventListener("click", close);
    return () => document.removeEventListener("click", close);
  }, [open]);

  useEffect(() => {
    if (!open) return undefined;
    const onKey = (e) => {
      if (e.key === "Escape") setOpen(false);
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open]);

  return (
    <div className="navLogin" ref={wrapRef}>
      <button
        type="button"
        className="navLogin-trigger"
        id="nav-login-button"
        aria-expanded={open}
        aria-haspopup="true"
        aria-controls="nav-login-menu"
        onClick={() => setOpen((v) => !v)}
        aria-label="Parent logins"
      >
        <Users size={20} strokeWidth={2} aria-hidden />
      </button>
      {open ? (
        <div id="nav-login-menu" className="navLogin-menu" role="menu" aria-labelledby="nav-login-button">
          <a href={LOGIN_PAGE_URL} role="menuitem" className="navLogin-item" onClick={() => setOpen(false)}>
            Parent Login
          </a>
          <a href={STAFF_LOGIN_URL} role="menuitem" className="navLogin-item" onClick={() => setOpen(false)}>
            Staff Login
          </a>
        </div>
      ) : null}
    </div>
  );
}

const SOCIAL_PROFILE_URLS = {
  facebook: "https://www.facebook.com/profile.php?id=61590173237299",
  instagram: "https://www.instagram.com/forestviewmontessoriplymouth?igsh=MzRlODBiNWFlZA==",
  twitter: "https://x.com/ForestviewMont",
  youtube: "https://www.youtube.com/@ForestviewMontessori",
};

function SocialLinks({ className = "socials", linkClassName = "" }) {
  const uid = useId().replace(/:/g, "");
  const igGrad = `${uid}-instagram-grad`;

  const linkProps = (label, href) => ({
    href,
    className: linkClassName ? `${linkClassName} socialLink` : "socialLink",
    "aria-label": label,
    ...(href.startsWith("http")
      ? { target: "_blank", rel: "noopener noreferrer" }
      : {}),
  });

  return (
    <div className={className}>
      <a {...linkProps("Facebook", SOCIAL_PROFILE_URLS.facebook)}>
        <svg className="socialIcon socialIcon--brand" viewBox="0 0 48 48" width="46" height="46" aria-hidden="true">
          <circle cx="24" cy="24" r="24" fill="#1877F2" />
          <path
            fill="#fff"
            d="M27.2 38V24.8h4.4l0.7-5.1H27.2v-3.3c0-1.5.8-3 3.1-3h2.6V10.8c-.5 0-2.1-.2-4-.2-4 0-6.7 2.4-6.7 6.8v3.7H17v5.1h4.2V38h6z"
          />
        </svg>
      </a>
      <a {...linkProps("Instagram", SOCIAL_PROFILE_URLS.instagram)}>
        <svg className="socialIcon socialIcon--brand" viewBox="0 0 48 48" width="46" height="46" aria-hidden="true">
          <defs>
            <linearGradient id={igGrad} x1="0%" y1="100%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#FEDA75" />
              <stop offset="25%" stopColor="#FA7E1E" />
              <stop offset="50%" stopColor="#D62976" />
              <stop offset="75%" stopColor="#962FBF" />
              <stop offset="100%" stopColor="#4F5BD5" />
            </linearGradient>
          </defs>
          <rect x="2" y="2" width="44" height="44" rx="12" fill={`url(#${igGrad})`} />
          <rect x="12" y="12" width="24" height="24" rx="7" fill="none" stroke="#fff" strokeWidth="3" />
          <circle cx="24" cy="24" r="6.5" fill="none" stroke="#fff" strokeWidth="3" />
          <circle cx="33.5" cy="14.5" r="2.5" fill="#fff" />
        </svg>
      </a>
      <a {...linkProps("Twitter", SOCIAL_PROFILE_URLS.twitter)}>
        <svg className="socialIcon socialIcon--brand" viewBox="0 0 48 48" width="46" height="46" aria-hidden="true">
          <rect width="48" height="48" rx="6" fill="#000" />
          <path
            fill="#fff"
            d="M28.2 12h5.2l-6.8 7.8 8.1 9.8h-5.3l-5-6.1-5.7 6.1h-5.2l7.3-8.4-6.6-8.2h5.3l4.5 5.5 5.2-5.5zm-1.6 21.6h2.9L17.4 14.2h-3l12.2 19.4z"
          />
        </svg>
      </a>
      <a {...linkProps("YouTube", SOCIAL_PROFILE_URLS.youtube)}>
        <svg className="socialIcon socialIcon--brand" viewBox="0 0 48 48" width="46" height="46" aria-hidden="true">
          <rect width="48" height="48" rx="8" fill="#FF0000" />
          <path
            fill="#fff"
            d="M36.2 18.4c-.2-1.1-.9-2-1.9-2.1C32.4 16 24 16 24 16s-8.4 0-10.3.3c-1 .1-1.7 1-1.9 2.1-.3 1.8-.3 5.6-.3 5.6s0 3.8.3 5.6c.2 1.1.9 2 1.9 2.1 1.9.3 10.3.3 10.3.3s8.4 0 10.3-.3c1-.1 1.7-1 1.9-2.1.3-1.8.3-5.6.3-5.6s0-3.8-.3-5.6zM21.5 28.2V19.8l8.2 4.2-8.2 4.2z"
          />
        </svg>
      </a>
    </div>
  );
}

function Logo({ light = false }) {
  const logoSrc = light ? footerLogo : schoolLogo;
  return (
    <a className={`logo ${light ? "logoLight" : ""}`} href="#top" aria-label={`${SCHOOL_NAME} home`}>
      <img className="logoMark" src={logoSrc} alt={SCHOOL_NAME} />
    </a>
  );
}

function PhotoCrop({ className = "", src, alt = "", children }) {
  return (
    <div className={`photoCrop ${className}`}>
      <img src={src} alt={alt} />
      {children}
    </div>
  );
}

function HeroImageSlider() {
  return (
    <>
      <div className="heroSlider" aria-label="Featured school photo">
        <div className="heroSliderSlides">
          <div className="heroSliderSlide is-active">
            <img
              src={HERO_SLIDE.image}
              alt={HERO_SLIDE.alt}
              loading="eager"
              style={{ objectPosition: HERO_SLIDE.objectPosition }}
            />
          </div>
        </div>
      </div>
      <div className="heroPanelOverlay" aria-hidden="true" />
      <div className="heroPanelCaption">
        <strong>{HERO_SLIDE.title}</strong>
        <span>{HERO_SLIDE.subtitle}</span>
      </div>
    </>
  );
}

function FeatureCard({ item, index }) {
  if (item.imageOnly) {
    return (
      <article
        className={`featureCard featureCard-imageOnly area-${item.area}`}
        data-card-index={index}
        aria-label={item.alt}
      >
        <PhotoCrop className="cardPhoto cardPhoto-fill" src={item.image} alt={item.alt || ""} />
      </article>
    );
  }

  const Icon = item.icon;
  return (
    <article
      className={`featureCard ${item.image ? "withImage" : ""} ${item.accent ? "accent" : ""} area-${item.area}`}
      data-card-index={index}
    >
      <div className="cardBody">
        <Icon className="cardIcon" size={23} strokeWidth={1.7} />
        <h3>{item.title}</h3>
        <p>{item.text}</p>
        {item.ctaHref && item.ctaLabel ? (
          <a className="cardCta" href={item.ctaHref}>
            {item.ctaLabel}
          </a>
        ) : null}
      </div>
      {item.image && <PhotoCrop className="cardPhoto" src={item.image} alt="" />}
    </article>
  );
}

function ProgramsSectionInner({ programLayout = "grid" }) {
  const programKeys = Object.keys(programs);
  const [activeKey, setActiveKey] = useState("YCC");

  function onTabsKeyDown(ev) {
    if (ev.key !== "ArrowLeft" && ev.key !== "ArrowRight") return;
    ev.preventDefault();
    const i = programKeys.indexOf(activeKey);
    const next =
      ev.key === "ArrowRight"
        ? programKeys[(i + 1) % programKeys.length]
        : programKeys[(i - 1 + programKeys.length) % programKeys.length];
    setActiveKey(next);
    window.requestAnimationFrame(() => {
      document.getElementById(`program-tab-${next}`)?.focus();
    });
  }

  return (
    <div className="programSection exp-right">
      <header className="programIntro">
        <p className="programIntro-eyebrow">Child care programs</p>
        <h2>{PROGRAMS_LABEL}</h2>
        <p className="programIntro-lead">
          {CHILD_CARE_TAGLINE} for ages 16 months–6 years - structure, warmth, and joy at every step.
        </p>
      </header>

      {programLayout === "tabs" ? (
        <>
          <div
            className="programTabs"
            role="tablist"
            aria-label="Programs by age"
            onKeyDown={onTabsKeyDown}
          >
            {Object.entries(programs).map(([key, prog]) => (
              <button
                key={key}
                type="button"
                role="tab"
                id={`program-tab-${key}`}
                aria-selected={activeKey === key}
                aria-controls={`program-panel-${key}`}
                tabIndex={activeKey === key ? 0 : -1}
                className={`programTab ${activeKey === key ? "is-active" : ""}`}
                onClick={() => setActiveKey(key)}
              >
                {prog.label}
              </button>
            ))}
          </div>

          <div className="programTabPanels">
            {Object.entries(programs).map(([key, prog]) => {
              const Icon = PROGRAM_CARD_ICONS[key];
              return (
                <div
                  key={key}
                  role="tabpanel"
                  id={`program-panel-${key}`}
                  aria-labelledby={`program-tab-${key}`}
                  hidden={activeKey !== key}
                  className="programTabPanel"
                >
                  <div className="programDetail">
                    <div className="programDetail-icon" aria-hidden>
                      <Icon size={28} strokeWidth={1.5} />
                    </div>
                    <p className="programDetail-age">{prog.age}</p>
                    <p className="programDetail-text">{prog.text}</p>
                    <ul className="programDetail-features">
                      <li className="programDetail-featuresRow">
                        {prog.features.slice(0, 2).map((f) => (
                          <span key={f} className="programDetail-feature">
                            {f}
                          </span>
                        ))}
                      </li>
                      <li className="programDetail-featuresRow">
                        {prog.features.slice(2, 4).map((f) => (
                          <span key={f} className="programDetail-feature">
                            {f}
                          </span>
                        ))}
                      </li>
                    </ul>
                    <a href={prog.cta.href} className="programDetail-cta">
                      {prog.cta.label}
                    </a>
                  </div>
                </div>
              );
            })}
          </div>
        </>
      ) : (
        <ul className="programCardGrid">
          {Object.entries(programs).map(([key, prog]) => {
            const Icon = PROGRAM_CARD_ICONS[key];
            const variant = key === "YCC" ? "toddler" : "preschool";
            return (
              <li key={key} className={`programCard programCard--${variant}`}>
                <div className="programCard-head">
                  <span className="programCard-iconWrap" aria-hidden>
                    <Icon size={22} strokeWidth={1.65} />
                  </span>
                  <span className="programCard-label">{prog.label}</span>
                </div>
                <h3>{prog.age}</h3>
                <p>{prog.text}</p>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}

function ExperienceProgramsBlock({ extraClass = "", showVideo = true, programLayout = "grid" }) {
  const rootClass = [
    "experience",
    extraClass || null,
    showVideo ? null : "experience--noVideo",
    programLayout === "tabs" ? "experience--tabs" : null,
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <section className={rootClass} id="programs">
      {showVideo ? (
        <div className="experienceVideoBg" aria-hidden="true">
          <video
            className="experienceBgVideo"
            src={experienceVideo}
            poster={experienceChild}
            muted
            autoPlay
            loop
            playsInline
            tabIndex={-1}
          />
          <div className="experienceVideoOverlay" />
        </div>
      ) : null}
      <div className="experienceInner">
        <ProgramsSectionInner programLayout={programLayout} />
      </div>
    </section>
  );
}

const ADMISSION_ROLLING_OVERVIEW = `We enroll ${PROGRAMS_LABEL} students throughout the year as space allows in our Montessori child care program. For the best chance at your preferred schedule, we encourage families to inquire early. The office will share current openings, timelines, and any priority dates for the upcoming school year.`;

const ADMISSION_PROCESS_STEPS = [
  {
    Icon: Phone,
    label: "Connect with us",
    body:
      "Call or email the office to share your child’s age, schedule needs, and what you’re looking for in Montessori child care. We’ll answer questions and let you know how to schedule a visit.",
  },
  {
    Icon: MapPin,
    label: "Tour the school",
    body:
      `Seeing the classroom is the best introduction to our school. During your visit you’ll meet staff, observe the prepared environment, and learn how our ${PROGRAMS_LABEL} child care programs work day to day.`,
  },
  {
    Icon: FileText,
    label: "Application packet",
    body:
      "When you’re ready to move forward, we’ll guide you through our application packet - family information, permissions, and enrollment forms. Completed paperwork helps us hold a place fairly and plan staffing.",
  },
  {
    Icon: HeartHandshake,
    label: "Family conversation",
    body:
      "We meet with parents or guardians to talk about your goals for your child, daily routines, and how we can partner together. This conversation helps ensure we are a strong fit for your family.",
  },
  {
    Icon: Baby,
    label: "Child visit",
    body:
      "Your child spends time in the classroom with our guides so we can see them in our environment and they can become comfortable here. We’ll schedule this at an age-appropriate pace.",
  },
  {
    Icon: BadgeCheck,
    label: "Enrollment decision",
    body:
      "Offers are made with attention to balanced classrooms and program capacity. Once accepted, you’ll receive enrollment paperwork and tuition details. Our office team walks you through each step until your start date.",
  },
];

const PARENT_TESTIMONIALS = [
  {
    quote:
      "We wanted a classroom where adults listen to children. The tone here - patient, respectful - matched what we hoped for.",
    attribution: "Parent · Preschool",
  },
  {
    quote:
      "The office made enrollment straightforward. Questions about scheduling and tuition were answered clearly, without pressure.",
    attribution: "Parent · Toddler",
  },
  {
    quote:
      "Our child knows the guides by name and looks forward to school. That settled feeling matters more to us than any brochure promise.",
    attribution: "Parent · Preschool",
  },
];

const RULES_TOC_LINKS = [
  { sectionId: "rules-enrollment", label: "Enrollment & tuition" },
  { sectionId: "rules-attendance", label: "Attendance & hours" },
  { sectionId: "rules-health", label: "Health & safety" },
  { sectionId: "rules-conduct", label: "Conduct & community" },
  { sectionId: "rules-changes", label: "Policy updates" },
];

const HOME_SECTION_IDS = ["programs", "highlights", "support", "top"];

function homeSectionHref(sectionId) {
  if (!sectionId) return "#/";
  return `#${sectionId}`;
}

function redirectLegacyTourHash() {
  if (typeof window === "undefined") return;
  const parts = window.location.hash.replace(/^#\/?/, "").split("?")[0].split("/").filter(Boolean);
  if (parts[0] === "contact" && parts[1] === "tour") {
    window.location.replace(`${window.location.pathname}${window.location.search}#/tour`);
  }
}

function getRouteFromHash() {
  if (typeof window === "undefined") return "home";
  const raw = window.location.hash.replace(/^#\/?/, "").split("?")[0];
  const parts = raw.split("/").filter(Boolean);
  const segment = parts[0] ?? "";
  if (segment === "about") return "about";
  if (segment === "admissions" || segment.startsWith("admissions-")) return "admissions";
  if (segment === "admission-form") return "admission-form";
  if (segment === "rules") return "rules";
  if (parts[0] === "syllabus" || segment === "syllabus" || segment.startsWith("syllabus-")) return "syllabus";
  if (segment === "tour") return "tour-request";
  if (segment === "admin") return "admin";
  if (segment === "contact") return "contact";
  if (segment === "careers") return "careers";
  if (segment === "blog") return parts.length > 1 ? "blog-post" : "blog";
  if (HOME_SECTION_IDS.includes(segment)) return "home";
  return "home";
}

function getBlogPostSlugFromHash() {
  if (typeof window === "undefined") return null;
  const parts = window.location.hash.replace(/^#\/?/, "").split("?")[0].split("/").filter(Boolean);
  if (parts[0] !== "blog" || parts.length < 2) return null;
  return decodeURIComponent(parts[1]);
}

function formatDateISO(date) {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

function getNextSaturday(from = new Date()) {
  const d = new Date(from.getFullYear(), from.getMonth(), from.getDate());
  const dow = d.getDay();
  d.setDate(d.getDate() + (6 - dow + 7) % 7);
  return d;
}

function getTourSaturdayDateBounds() {
  const min = getNextSaturday();
  const max = new Date(min);
  max.setDate(max.getDate() + 7 * 26);
  return { min: formatDateISO(min), max: formatDateISO(max) };
}

function isSaturdayDateValue(iso) {
  if (!iso || !/^\d{4}-\d{2}-\d{2}$/.test(iso)) return false;
  const [y, m, d] = iso.split("-").map(Number);
  return new Date(y, m - 1, d).getDay() === 6;
}

function formatTourSaturdayLabel(iso) {
  const [y, m, d] = iso.split("-").map(Number);
  return new Date(y, m - 1, d).toLocaleDateString("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
    year: "numeric",
  });
}

const BLOG_POSTS = [
  {
    slug: "welcome-to-our-school-blog",
    title: "Welcome to our school blog",
    date: "2026-05-02",
    listImage: classroomPhoto,
    listImageAlt: "Children working together in a bright Montessori classroom.",
    excerpt:
      "Montessori child care in Plymouth — classroom glimpses, parent tips, and school news.",
    paragraphs: [
      "We’re glad you’re here. This space is for short updates from our team: what children are exploring in the rooms, how we think about independence and community, and reminders that help your family stay connected to school life.",
      "If you ever have a topic you’d like us to write about, mention it at pickup or email the office. We’ll shape future posts around questions we hear often from parents.",
    ],
  },
  {
    slug: "practical-life-in-the-toddler-room",
    title: "Practical life in the toddler room",
    date: "2026-04-18",
    listImage: experienceChild,
    listImageAlt: "A young child exploring materials in the toddler environment.",
    excerpt:
      "Pouring, dressing frames, and caring for the environment - why these “simple” jobs matter for toddlers.",
    paragraphs: [
      "Practical life isn’t busywork. For toddlers, it’s where concentration begins: hands repeat a sequence, mistakes are visible and fixable, and pride comes from finishing something real.",
      "You might see pourings, spoons, or towel folding and wonder if it’s “academic.” In Montessori, those activities build coordination, language, and confidence that carry into every other area of the room.",
      "At home, you can invite the same spirit: a small pitcher of water, a child-sized dustpan, or wiping a spill together. Keep expectations gentle - the goal is engagement, not perfection.",
    ],
  },
  {
    slug: "montessori-at-home-consistency-without-pressure",
    title: "Montessori at home: consistency without pressure",
    date: "2026-03-07",
    listImage: familyPhoto,
    listImageAlt: "A family relaxing together outdoors on a sunny day.",
    excerpt:
      "A few rhythms - order, respect, and real tasks - go further than themed worksheets or flashcards.",
    paragraphs: [
      "Montessori at home doesn’t require special furniture or a full set of materials. It starts with an orderly space where your child can find things and put them back, and with adults who model calm, respectful language.",
      "We’re not chasing early academics at the expense of play and rest. Consistency means predictable routines (meals, sleep, time outdoors) and trusting your child with small, real responsibilities when they show interest.",
      "When school and home both value independence within limits, children feel the same story in both places - and that’s when growth is steadiest.",
    ],
  },
];

function getBlogPostBySlug(slug) {
  return BLOG_POSTS.find((p) => p.slug === slug) ?? null;
}

const BLOG_COMMENTS_STORAGE_PREFIX = "fvm-blog-comments:";

function loadBlogComments(slug) {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(`${BLOG_COMMENTS_STORAGE_PREFIX}${slug}`);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed.filter((c) => c && typeof c.author === "string" && typeof c.body === "string");
  } catch {
    return [];
  }
}

function saveBlogComments(slug, comments) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(`${BLOG_COMMENTS_STORAGE_PREFIX}${slug}`, JSON.stringify(comments));
}

function BlogCommentsSection({ slug }) {
  const [comments, setComments] = useState(() => loadBlogComments(slug));
  const [author, setAuthor] = useState("");
  const [body, setBody] = useState("");
  const mathChallenge = useMathChallenge(slug);

  useEffect(() => {
    setComments(loadBlogComments(slug));
    setAuthor("");
    setBody("");
  }, [slug]);

  function handleSubmit(e) {
    e.preventDefault();
    const name = author.trim();
    const text = body.trim();
    if (!name || !text) return;
    if (!mathChallenge.validate()) return;
    const id =
      typeof crypto !== "undefined" && crypto.randomUUID
        ? crypto.randomUUID()
        : `c-${Date.now()}-${Math.random().toString(16).slice(2)}`;
    const next = [
      ...comments,
      {
        id,
        author: name,
        body: text,
        at: new Date().toISOString(),
      },
    ];
    setComments(next);
    saveBlogComments(slug, next);
    setAuthor("");
    setBody("");
    mathChallenge.reset();
  }

  return (
    <section className="blogComments" aria-labelledby="blog-comments-h">
      <h2 id="blog-comments-h" className="blogComments-title">
        Comments
      </h2>
      <p className="blogComments-note">
        Comments are stored on this device for demonstration. They are not sent to the school automatically - email the
        office if you need a reply.
      </p>
      {comments.length ? (
        <ul className="blogComments-list">
          {comments.map((c) => (
            <li key={c.id} className="blogComments-item">
              <div className="blogComments-itemMeta">
                <span className="blogComments-itemAuthor">{c.author}</span>
                <time className="blogComments-itemTime" dateTime={c.at}>
                  {new Date(c.at).toLocaleString(undefined, {
                    dateStyle: "medium",
                    timeStyle: "short",
                  })}
                </time>
              </div>
              <p className="blogComments-itemBody">{c.body}</p>
            </li>
          ))}
        </ul>
      ) : (
        <p className="blogComments-empty">No comments yet. Be the first to share a thought.</p>
      )}
      <form className="blogComments-form" onSubmit={handleSubmit}>
        <div className="blogComments-fields">
          <label className="blogComments-field">
            <span className="blogComments-label">Your name</span>
            <input
              className="blogComments-input"
              type="text"
              name="author"
              autoComplete="name"
              value={author}
              onChange={(ev) => setAuthor(ev.target.value)}
              maxLength={120}
              required
            />
          </label>
          <label className="blogComments-field blogComments-field--wide">
            <span className="blogComments-label">Comment</span>
            <textarea
              className="blogComments-input blogComments-textarea"
              name="comment"
              value={body}
              onChange={(ev) => setBody(ev.target.value)}
              rows={4}
              maxLength={4000}
              required
            />
          </label>
        </div>
        <MathChallengeField
          idPrefix={`blog-math-${slug}`}
          questionText={mathChallenge.questionText}
          answer={mathChallenge.answer}
          onAnswerChange={mathChallenge.setAnswer}
          error={mathChallenge.error}
        />
        <button type="submit" className="blogComments-submit">
          Post comment
        </button>
      </form>
    </section>
  );
}

function formatBlogDate(isoDate) {
  try {
    return new Date(isoDate + "T12:00:00").toLocaleDateString(undefined, {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  } catch {
    return isoDate;
  }
}

function BlogPage() {
  return (
    <main id="top" className="aboutPage blogPage">
      <div className="aboutPage-top">
        <SiteHeader />
      </div>
      <header className="blogPage-hero">
        <div className="aboutPage-inner blogPage-heroInner">
          <p className="aboutPage-eyebrow blogPage-eyebrow">News &amp; ideas</p>
          <h1 className="blogPage-title">Blog</h1>
          <p className="blogPage-lead">
            Classroom stories, Montessori perspective, and school updates for current and future families.
          </p>
        </div>
      </header>
      <div className="blogPage-body">
        <div className="aboutPage-inner blogPage-inner">
          <ul className="blogPage-postList">
            {BLOG_POSTS.map((post) => (
              <li key={post.slug}>
                <article className="blogPage-card">
                  <a href={`#/blog/${post.slug}`} className="blogPage-cardMedia">
                    <img src={post.listImage} alt={post.listImageAlt} loading="lazy" width={640} height={400} />
                  </a>
                  <div className="blogPage-cardBody">
                    <time className="blogPage-cardDate" dateTime={post.date}>
                      {formatBlogDate(post.date)}
                    </time>
                    <h2 className="blogPage-cardTitle">
                      <a href={`#/blog/${post.slug}`}>{post.title}</a>
                    </h2>
                    <p className="blogPage-cardExcerpt">{post.excerpt}</p>
                    <a href={`#/blog/${post.slug}`} className="blogPage-cardRead">
                      Read post
                    </a>
                  </div>
                </article>
              </li>
            ))}
          </ul>
        </div>
      </div>
      <SiteFooter />
    </main>
  );
}

function BlogPostPage() {
  const slug = getBlogPostSlugFromHash();
  const post = slug ? getBlogPostBySlug(slug) : null;

  if (!post) {
    return (
      <main id="top" className="aboutPage blogPage">
        <div className="aboutPage-top">
          <SiteHeader />
        </div>
        <div className="blogPage-body blogPage-body--narrow">
          <div className="aboutPage-inner blogPage-inner">
            <p className="blogPage-missKicker">Post not found</p>
            <h1 className="blogPage-missTitle">We couldn&apos;t find that article</h1>
            <p className="blogPage-missText">The link may be outdated, or the post may have moved.</p>
            <a href="#/blog" className="blogPage-backLink">
              ← Back to blog
            </a>
          </div>
        </div>
        <SiteFooter />
      </main>
    );
  }

  return (
    <main id="top" className="aboutPage blogPage">
      <div className="aboutPage-top">
        <SiteHeader />
      </div>
      <article className="blogPost">
        <div className="aboutPage-inner blogPost-inner">
          <a href="#/blog" className="blogPost-back">
            ← All posts
          </a>
          <header className="blogPost-header">
            <time className="blogPost-date" dateTime={post.date}>
              {formatBlogDate(post.date)}
            </time>
            <h1 className="blogPost-title">{post.title}</h1>
            <p className="blogPost-excerpt">{post.excerpt}</p>
          </header>
          <div className="blogPost-content">
            {post.paragraphs.map((para, i) => (
              <p key={i}>{para}</p>
            ))}
          </div>
          <BlogCommentsSection slug={post.slug} />
        </div>
      </article>
      <SiteFooter />
    </main>
  );
}

const CONTACT_MAPS_URL = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
  "105 Forestview Ln N, Plymouth, MN 55441",
)}`;
const CONTACT_MAP_EMBED_SRC = `https://maps.google.com/maps?q=${encodeURIComponent(
  "105 Forestview Ln N, Plymouth, MN 55441",
)}&z=15&ie=UTF8&output=embed`;

const OFFICE_PHONE_DISPLAY = "+1 (763) 546-1421";
const OFFICE_PHONE_TEL = "tel:+17635461421";
const OFFICE_EMAIL = "info@forestviewmontessori.org";

const ENQUIRY_INTRO =
  "Hi — ask about programs, tours, admission, health & safety, Montessori, and more. Tap a topic below or type your question.";

const ENQUIRY_FAQ = [
  {
    keywords: ["hour", "hours", "schedule", "open", "close", "time", "when", "arrival", "pickup", "pick up"],
    reply:
      "Our child care center is generally open 8:00 a.m. – 5:00 p.m. for enrolled Toddler & Preschool programs. Arrival and pickup stay within published hours unless the office approves something different. Holidays and breaks are listed in School notices (bell icon) and on Admissions.",
  },
  {
    keywords: ["age", "ages", "toddler", "preschool", "program", "children", "child care", "daycare", "ycc"],
    reply: `We offer Montessori child care for ${PROGRAMS_LABEL}: Toddler (about 16–33 months) and Preschool (about 33 months through 6 years). See Programs on the homepage and Admissions for details.`,
  },
  {
    keywords: ["tuition", "fee", "fees", "cost", "price", "payment", "afford", "pay"],
    reply:
      "Tuition varies by program and schedule. Current ranges are on the homepage Tuition section and Admissions page. Call the office for exact pricing for your child's program and schedule.",
  },
  {
    keywords: ["tour", "visit", "saturday", "book a tour", "schedule a tour", "see the school", "look around"],
    reply: `We'd love to show you our ${CHILD_CARE_TAGLINE} program. Request a tour online (${SCHEDULE_TOUR_HREF}) — Saturdays, 10:00 AM – 12:00 PM by appointment. We will contact you to confirm your visit.`,
  },
  {
    keywords: ["apply", "application", "admission", "admissions", "enroll", "enrollment", "waitlist", "admission form"],
    reply: `Ready to apply? Complete the online admission form (${ADMISSION_FORM_HREF}) or visit Admissions for the process overview. The office will follow up with next steps after you submit.`,
  },
  {
    keywords: ["parent", "involvement", "involved", "volunteer", "participate", "community event", "family event"],
    reply:
      "We value family partnership. Parents are welcome to connect with guides at pickup and drop-off, join school events when offered, and communicate with the office about questions or concerns. Ask the office about current opportunities to be involved.",
  },
  {
    keywords: ["update", "updates", "during the day", "daily", "report", "communication", "know what", "happens at school", "what my child"],
    reply:
      "Guides share regular communication about your child's day — routines, learning, and any needs that arise. For specific questions, call the office or speak with your child's guide at pickup.",
  },
  {
    keywords: ["observe", "observation", "visit during", "drop in", "watch classroom", "see my child", "visit him", "visit her"],
    reply:
      "Parents are welcome to arrange classroom observations and visits through the office so we can plan a meaningful time without disrupting the children's work cycle. Call to schedule.",
  },
  {
    keywords: ["ratio", "ratios", "teacher to child", "staff to child", "class size", "how many children"],
    reply:
      "We follow Minnesota licensing requirements for teacher-to-child ratios in each classroom. Ratios vary by age group. Contact the office for current classroom ratios and group sizes.",
  },
  {
    keywords: ["sick", "illness", "ill", "fever", "vomit", "health policy", "stay home", "contagious", "when sick"],
    reply:
      "Children join class when they are well enough to participate. If your child has fever, vomiting, diarrhea, or other contagious symptoms, please keep them home until they are symptom-free. See Rules & regulations for full health guidance.",
  },
  {
    keywords: ["safety", "secure", "security", "door", "entry", "pickup authorization", "authorized", "who can pick up"],
    reply:
      "Safety is a priority: secure entry, current pickup authorization on file, and health policies that protect the community. Only approved adults may pick up your child. Details are in Rules & regulations and your enrollment packet.",
  },
  {
    keywords: ["kindergarten", "elementary", "readiness", "school ready", "prepare for school", "next school"],
    reply:
      "Our Preschool program builds independence, concentration, social skills, and early literacy and math foundations through Montessori materials — strong preparation for kindergarten and beyond. Guides observe each child and support their natural development.",
  },
  {
    keywords: ["curriculum", "learn", "learning", "reading", "math", "literacy", "academic", "teach", "subjects"],
    reply:
      "Beyond practical life and early academics, children explore sensorial, language, math, and cultural studies through hands-on Montessori materials. Social skills, kindness, and independence are woven through each day.",
  },
  {
    keywords: ["montessori", "montessori method", "benefits", "independence", "practical life", "multi age", "multi-age", "work cycle"],
    reply:
      "Montessori supports children through prepared environments, sequenced materials, and guides who observe before they teach. Children develop independence, focus, and respect for themselves, others, and their community.",
  },
  {
    keywords: ["outdoor", "outside", "playground", "fresh air", "go outside", "play outside"],
    reply:
      "Children enjoy outdoor time as part of a balanced day — movement, fresh air, and play support healthy development alongside classroom work.",
  },
  {
    keywords: ["part time", "part-time", "full time", "full-time", "flexible", "days per week", "schedule options"],
    reply:
      "We offer schedule options by program — contact the office to learn what is currently available for Toddler and Preschool and to discuss the best fit for your family.",
  },
  {
    keywords: ["happy", "feedback", "review", "satisfied", "other families", "talk to parent", "reference", "recommend"],
    reply:
      "We welcome conversations with current families. Ask the office to connect you with a parent reference, or share your feedback directly — we value hearing from families.",
  },
  {
    keywords: ["location", "address", "where", "map", "directions", "plymouth", "find you"],
    reply: "We're at 105 Forestview Ln N, Plymouth, MN 55441. Open the Contact page for a map and directions.",
  },
  {
    keywords: ["phone", "call", "number", "text", "email", "contact", "reach", "speak", "office"],
    reply: {
      text: `Call ${OFFICE_PHONE_DISPLAY} or email ${OFFICE_EMAIL}. The Contact page has a form and map as well.`,
      phoneCta: true,
    },
  },
  {
    keywords: ["founded", "history", "how long", "established", "1994", "director", "preethi", "since"],
    reply: `We were founded in ${FOUNDED_YEAR} and have served Plymouth families for many years with consistent leadership and deep community trust.`,
  },
  {
    keywords: ["calendar", "holiday", "closed", "break", "mlk", "memorial", "notice", "closure"],
    reply:
      "Upcoming closures and important dates are listed in School notices (bell icon in the header). You can also check Admissions for calendar-related information.",
  },
  {
    keywords: ["allergy", "allergies", "medication", "medicine", "epipen", "emergency plan"],
    reply:
      "Allergies, medications, and emergency plans should be documented on required enrollment forms and kept up to date. Share any changes with the office and your child's guide right away.",
  },
];

const ENQUIRY_NO_REPLY_RE =
  /no (reply|response|email|confirmation|confirm)|didn'?t (receive|get)|haven'?t (received|heard|gotten)|not received|never (got|received)|waiting (for|on)|still waiting|follow[- ]?up|email back|confirmation mail/;
const ENQUIRY_TOUR_ADMISSION_RE =
  /tour|visit|admission|application|apply|enroll|enrollment|form|appointment|submit/;

function enquiryNormalizedTokens(text) {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, " ")
    .split(/\s+/)
    .filter(Boolean);
}

function enquiryNormalizeReply(reply) {
  if (!reply) return null;
  if (typeof reply === "string") return { text: reply };
  return reply;
}

function enquiryMatchSpecial(raw) {
  const t = raw.trim().toLowerCase();
  if (!t || !ENQUIRY_NO_REPLY_RE.test(t)) return null;

  if (ENQUIRY_TOUR_ADMISSION_RE.test(t)) {
    return {
      text: "If you submitted a tour request or admission application and have not received a confirmation email, please call our office directly — we can confirm your submission and help with next steps right away.",
      phoneCta: true,
    };
  }

  return {
    text: "If you have not received a reply from our office, please call us directly so we can assist you right away.",
    phoneCta: true,
  };
}

function enquiryMatchReply(raw) {
  const t = raw.trim().toLowerCase();
  if (!t) return null;
  const tokens = enquiryNormalizedTokens(raw);
  let best = null;
  let bestScore = 0;
  for (const row of ENQUIRY_FAQ) {
    let score = 0;
    for (const kw of row.keywords) {
      if (t.includes(kw)) score += 3;
      else if (tokens.some((w) => w.length > 2 && (w.includes(kw) || kw.includes(w)))) score += 1;
    }
    if (score > bestScore) {
      bestScore = score;
      best = row.reply;
    }
  }
  if (bestScore >= 2) return enquiryNormalizeReply(best);
  if (bestScore === 1 && tokens.length <= 4) return enquiryNormalizeReply(best);
  return null;
}

function EnquiryMessageText({ text }) {
  const phonePattern = /\+1 \(763\) 546-1421/g;
  const parts = text.split(phonePattern);
  if (parts.length === 1) {
    return <>{text}</>;
  }
  const nodes = [];
  parts.forEach((part, i) => {
    if (part) nodes.push(<span key={`t-${i}`}>{part}</span>);
    if (i < parts.length - 1) {
      nodes.push(
        <a key={`p-${i}`} href={OFFICE_PHONE_TEL} className="enquiryChat-inlineLink">
          {OFFICE_PHONE_DISPLAY}
        </a>,
      );
    }
  });
  return <>{nodes}</>;
}

function EnquiryChat() {
  const [open, setOpen] = useState(false);
  const [input, setInput] = useState("");
  const listRef = useRef(null);
  const inputRef = useRef(null);
  const [messages, setMessages] = useState(() => [{ role: "bot", text: ENQUIRY_INTRO }]);

  useEffect(() => {
    if (!open) return undefined;
    const onKey = (e) => {
      if (e.key === "Escape") setOpen(false);
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open]);

  useEffect(() => {
    if (!open) return undefined;
    inputRef.current?.focus({ preventScroll: true });
  }, [open]);

  useEffect(() => {
    const el = listRef.current;
    if (!el) return;
    el.scrollTop = el.scrollHeight;
  }, [messages, open]);

  const sendText = (raw) => {
    const text = String(raw ?? "").trim();
    if (!text) return;
    setMessages((prev) => [...prev, { role: "user", text }]);
    const hit =
      enquiryMatchSpecial(text) ??
      enquiryMatchReply(text) ?? {
        text: `I don't have a specific answer for that yet. For the best response, call ${OFFICE_PHONE_DISPLAY}, email ${OFFICE_EMAIL}, or use the Contact page — our office replies as soon as they can.`,
        phoneCta: true,
      };
    window.setTimeout(() => {
      setMessages((prev) => [...prev, { role: "bot", ...hit }]);
    }, 280);
    setInput("");
  };

  const quickPrompts = [
    { label: "Hours", text: "What are your hours?" },
    { label: "Programs", text: "What ages and programs do you offer?" },
    { label: "Tours", text: "How do I schedule a tour?" },
    { label: "Admission", text: "How do I apply for admission?" },
    { label: "Montessori", text: "What are the benefits of Montessori?" },
    { label: "Health & safety", text: "What is your illness policy?" },
    { label: "No email?", text: "I submitted a tour but didn't receive a confirmation email" },
    { label: "Contact", text: "How do I contact the office?" },
  ];

  const panel = open ? (
    <div
      className="enquiryChat-panel"
      id="enquiry-chat-panel"
      role="dialog"
      aria-modal="true"
      aria-labelledby="enquiry-chat-title"
      aria-describedby="enquiry-chat-desc"
    >
      <div className="enquiryChat-panelHeader">
        <div className="enquiryChat-panelTitleWrap">
          <h2 id="enquiry-chat-title" className="enquiryChat-panelTitle">
            Quick questions
          </h2>
          <p id="enquiry-chat-desc" className="enquiryChat-panelSub">
            Automated answers — not a live chat.
          </p>
        </div>
        <button type="button" className="enquiryChat-close" onClick={() => setOpen(false)} aria-label="Close chat">
          <X size={18} strokeWidth={2.5} aria-hidden />
        </button>
      </div>
      <div className="enquiryChat-messages" ref={listRef}>
        {messages.map((m, i) => (
          <div key={i} className={`enquiryChat-msg enquiryChat-msg--${m.role}`}>
            <span className="enquiryChat-msgLabel">{m.role === "bot" ? SCHOOL_SHORT : "You"}</span>
            <p className="enquiryChat-msgText">
              <EnquiryMessageText text={m.text} />
            </p>
            {m.phoneCta ? (
              <a href={OFFICE_PHONE_TEL} className="enquiryChat-phoneCta">
                <Phone size={16} strokeWidth={2} aria-hidden />
                Call {OFFICE_PHONE_DISPLAY}
              </a>
            ) : null}
          </div>
        ))}
      </div>
      <div className="enquiryChat-prompts" aria-label="Suggested questions">
        {quickPrompts.map((q) => (
          <button key={q.label} type="button" className="enquiryChat-chip" onClick={() => sendText(q.text)}>
            {q.label}
          </button>
        ))}
      </div>
      <form
        className="enquiryChat-form"
        onSubmit={(e) => {
          e.preventDefault();
          sendText(input);
        }}
      >
        <label className="enquiryChat-srOnly" htmlFor="enquiry-chat-input">
          Type your question
        </label>
        <input
          ref={inputRef}
          id="enquiry-chat-input"
          className="enquiryChat-input"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Ask a quick question…"
          autoComplete="off"
        />
        <button type="submit" className="enquiryChat-send" aria-label="Send">
          <Send size={18} strokeWidth={2} aria-hidden />
        </button>
      </form>
      <div className="enquiryChat-links">
        <a href="#/contact" onClick={() => setOpen(false)}>
          Contact page
        </a>
        <span aria-hidden className="enquiryChat-linksDot">
          ·
        </span>
        <a href={CONTACT_MAPS_URL} target="_blank" rel="noopener noreferrer">
          Map
        </a>
      </div>
    </div>
  ) : null;

  return createPortal(
    <div className="enquiryChat-root">
      {panel}
      <button
        type="button"
        className={`enquiryChat-fab${open ? " enquiryChat-fab--active" : ""}`}
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        aria-label={open ? "Close quick questions" : "Open quick questions"}
      >
        {open ? (
          <X size={22} strokeWidth={2.25} aria-hidden className="enquiryChat-fabIconOnly" />
        ) : (
          <>
            <MessageCircle size={22} strokeWidth={2} aria-hidden />
            <span className="enquiryChat-fabLabel">Questions</span>
          </>
        )}
      </button>
    </div>,
    document.body,
  );
}

function TourRequestPage() {
  const saturdayBounds = getTourSaturdayDateBounds();
  const [tourDateError, setTourDateError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [submitMessage, setSubmitMessage] = useState("");
  const [submitError, setSubmitError] = useState("");
  const mathChallenge = useMathChallenge();

  async function handleSubmit(e) {
    e.preventDefault();
    const form = e.currentTarget;
    const fd = new FormData(form);
    const parentName = String(fd.get("parentName") ?? "").trim();
    const childName = String(fd.get("childName") ?? "").trim();
    const childAge = String(fd.get("childAge") ?? "").trim();
    const tourDate = String(fd.get("tourDate") ?? "").trim();
    const phone = String(fd.get("phone") ?? "").trim();
    const email = String(fd.get("email") ?? "").trim();
    const message = String(fd.get("message") ?? "").trim();

    if (!parentName || !childName || !childAge || !tourDate || !phone || !email) return;
    if (!form.reportValidity()) return;
    if (!isSaturdayDateValue(tourDate)) {
      setTourDateError("Please choose a Saturday. Tours are held Saturdays, 10:00 AM – 12:00 PM.");
      return;
    }
    const fieldError = validateTourFields({ name: parentName, email, phone });
    if (fieldError) {
      setSubmitError(fieldError);
      return;
    }
    if (!mathChallenge.validate()) return;
    setTourDateError("");
    setSubmitting(true);
    setSubmitMessage("");
    setSubmitError("");

    try {
      const data = await postToApi("tour", {
        parentName,
        childName,
        childAge,
        tourDate,
        phone,
        email,
        message,
      });
      setSubmitMessage(data.message || "Tour request received.");
      form.reset();
      mathChallenge.reset();
    } catch (err) {
      setSubmitError(err.message || "Submission failed.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <main id="top" className="aboutPage tourPage">
      <div className="aboutPage-top">
        <SiteHeader />
      </div>

      <header className="tourPage-hero">
        <div className="aboutPage-inner tourPage-heroInner">
          <a href="#/" className="tourPage-back">
            ← Back to home
          </a>
          <p className="tourPage-badge">
            <CalendarDays size={18} strokeWidth={2} aria-hidden />
            Saturday · 10:00 AM – 12:00 PM
          </p>
          <p className="aboutPage-eyebrow tourPage-eyebrow">Book a visit</p>
          <h1 className="tourPage-title">Schedule your tour</h1>
          <p className="tourPage-lead">
            Tell us about your child and choose a Saturday. We&apos;ll email you to confirm your tour time.
          </p>
          <ol className="tourPage-steps">
            <li>Fill out the form</li>
            <li>We confirm your Saturday</li>
            <li>Visit us in Plymouth</li>
          </ol>
        </div>
      </header>

      <div className="tourPage-body">
        <div className="aboutPage-inner tourPage-inner">
          <form className="tourPage-form" onSubmit={handleSubmit}>
            <section className="tourPage-formSection" aria-labelledby="tour-form-family-h">
              <h2 id="tour-form-family-h" className="tourPage-formSectionTitle">
                Your family
              </h2>
              <div className="admissionForm-grid">
                <label className="admissionForm-field admissionForm-field--full">
                  <span className="admissionForm-label">Parent / guardian name</span>
                  <input
                    className="admissionForm-input"
                    type="text"
                    name="parentName"
                    autoComplete="name"
                    required
                    maxLength={120}
                  />
                </label>
                <label className="admissionForm-field">
                  <span className="admissionForm-label">Child&apos;s name</span>
                  <input className="admissionForm-input" type="text" name="childName" required maxLength={120} />
                </label>
                <label className="admissionForm-field">
                  <span className="admissionForm-label">Child&apos;s age</span>
                  <input
                    className="admissionForm-input"
                    type="text"
                    name="childAge"
                    required
                    maxLength={40}
                    placeholder="e.g. 2 years"
                  />
                </label>
              </div>
            </section>

            <section className="tourPage-formSection" aria-labelledby="tour-form-visit-h">
              <h2 id="tour-form-visit-h" className="tourPage-formSectionTitle">
                Visit details
              </h2>
              <div className="admissionForm-grid">
                <label className="admissionForm-field admissionForm-field--full">
                  <span className="admissionForm-label">Preferred Saturday</span>
                  <input
                    className={`admissionForm-input tourRequestForm-date${tourDateError ? " tourRequestForm-date--error" : ""}`}
                    type="date"
                    name="tourDate"
                    required
                    min={saturdayBounds.min}
                    max={saturdayBounds.max}
                    step={7}
                    defaultValue={saturdayBounds.min}
                    onChange={() => setTourDateError("")}
                  />
                  <span className="tourRequestForm-dateHint">Saturdays only · tours run 10:00 AM – 12:00 PM</span>
                  {tourDateError ? (
                    <span className="tourRequestForm-dateError" role="alert">
                      {tourDateError}
                    </span>
                  ) : null}
                </label>
                <label className="admissionForm-field">
                  <span className="admissionForm-label">Phone</span>
                  <input
                    className="admissionForm-input"
                    type="tel"
                    name="phone"
                    autoComplete="tel"
                    inputMode="tel"
                    required
                    maxLength={20}
                    pattern={PHONE_INPUT_PATTERN}
                    title="Enter a valid 10-digit phone number"
                    placeholder="(763) 555-0100"
                    onInput={handlePhoneInput}
                  />
                </label>
                <label className="admissionForm-field">
                  <span className="admissionForm-label">Email</span>
                  <input
                    className="admissionForm-input"
                    type="email"
                    name="email"
                    autoComplete="email"
                    required
                    maxLength={120}
                    pattern={EMAIL_INPUT_PATTERN}
                    title="Enter a valid email address (must include @)"
                    placeholder="name@example.com"
                  />
                </label>
                <label className="admissionForm-field admissionForm-field--full">
                  <span className="admissionForm-label">
                    Message <span className="admissionForm-labelHint">(optional)</span>
                  </span>
                  <textarea
                    className="admissionForm-input admissionForm-textarea"
                    name="message"
                    rows={4}
                    maxLength={4000}
                    placeholder="Questions, second child, or notes for your Saturday visit…"
                  />
                </label>
              </div>
            </section>

            <p className="tourPage-formNote">
              Submit sends your request to our office. Questions only? <a href="#/contact">Use Contact us</a> instead.
            </p>
            {submitMessage ? (
              <p className="formFeedback formFeedback--success" role="status">
                {submitMessage}
              </p>
            ) : null}
            {submitError ? (
              <p className="formFeedback formFeedback--error" role="alert">
                {submitError}
              </p>
            ) : null}
            <MathChallengeField
              idPrefix="tour-math"
              questionText={mathChallenge.questionText}
              answer={mathChallenge.answer}
              onAnswerChange={mathChallenge.setAnswer}
              error={mathChallenge.error}
            />
            <div className="admissionForm-actions tourPage-actions">
              <button type="submit" className="tourPage-submit" disabled={submitting}>
                {submitting ? "Sending…" : "Submit tour request"}
              </button>
            </div>
          </form>

          <div className="tourPage-infoStrip" aria-label="Location and office hours">
            <div className="tourPage-infoItem">
              <MapPin className="tourPage-infoIcon" size={20} strokeWidth={1.75} aria-hidden />
              <div className="tourPage-infoBody">
                <span className="tourPage-infoLabel">Location</span>
                <address>105 Forestview Ln N, Plymouth, MN 55441</address>
                <a href={CONTACT_MAPS_URL} target="_blank" rel="noopener noreferrer">
                  Directions
                </a>
              </div>
            </div>
            <div className="tourPage-infoItem">
              <Phone className="tourPage-infoIcon" size={20} strokeWidth={1.75} aria-hidden />
              <div className="tourPage-infoBody">
                <span className="tourPage-infoLabel">Call</span>
                <a href="tel:+17635461421">+1 (763) 546-1421</a>
              </div>
            </div>
            <div className="tourPage-infoItem">
              <Mail className="tourPage-infoIcon" size={20} strokeWidth={1.75} aria-hidden />
              <div className="tourPage-infoBody">
                <span className="tourPage-infoLabel">Email</span>
                <a href="mailto:info@forestviewmontessori.org">info@forestviewmontessori.org</a>
              </div>
            </div>
          </div>
        </div>
      </div>
      <SiteFooter />
    </main>
  );
}

function ContactPage() {
  const [submitting, setSubmitting] = useState(false);
  const [submitMessage, setSubmitMessage] = useState("");
  const [submitError, setSubmitError] = useState("");
  const mathChallenge = useMathChallenge();

  async function handleSubmit(e) {
    e.preventDefault();
    const form = e.currentTarget;
    const fd = new FormData(form);
    const name = String(fd.get("name") ?? "").trim();
    const email = String(fd.get("email") ?? "").trim();
    const phone = String(fd.get("phone") ?? "").trim();
    const message = String(fd.get("message") ?? "").trim();
    if (!name || !email || !phone || !message) return;
    if (!form.reportValidity()) return;
    const fieldError = validateContactFields({ name, email, phone });
    if (fieldError) {
      setSubmitError(fieldError);
      return;
    }
    if (!mathChallenge.validate()) return;

    setSubmitting(true);
    setSubmitMessage("");
    setSubmitError("");

    try {
      const data = await postToApi("contact", { name, email, phone, message });
      setSubmitMessage(data.message || "Message Received. We will contact you soon.");
      form.reset();
      mathChallenge.reset();
    } catch (err) {
      setSubmitError(err.message || "Submission failed.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <main id="top" className="aboutPage contactPage">
      <div className="aboutPage-top">
        <SiteHeader />
      </div>
      <header className="contactPage-hero">
        <div className="contactPage-heroMapHost" aria-hidden="true">
          <div className="contactPage-heroMapScroll">
            <iframe
              title={`Map: ${SCHOOL_NAME}, Plymouth, Minnesota`}
              src={CONTACT_MAP_EMBED_SRC}
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
              className="contactPage-heroIframe"
            />
          </div>
        </div>
        <div className="contactPage-heroTint" aria-hidden="true" />
        <div className="aboutPage-inner contactPage-inner contactPage-heroInner">
          <div className="contactPage-heroCopy">
            <p className="aboutPage-eyebrow blogPage-eyebrow">Get in touch</p>
            <h1 className="blogPage-title">Contact us</h1>
            <p className="blogPage-lead">
              Questions about Montessori child care, a tour, enrollment, or daily life in our Toddler &amp; Preschool
              classrooms? Call or email the office — or send a message and we&apos;ll get back as soon as we can.
            </p>
            <p className="contactPage-heroMapHint">
              <a href={CONTACT_MAPS_URL} target="_blank" rel="noopener noreferrer">
                Open map in Google Maps
              </a>
            </p>
          </div>
        </div>
      </header>
      <div className="contactPage-body">
        <div className="aboutPage-inner contactPage-inner">
          <div className="contactPage-layout">
            <div className="contactPage-aside">
              <div className="contactPage-card">
                <h2>Visit</h2>
                <div className="contactPage-cardRow">
                  <MapPin className="contactPage-cardIcon" size={22} strokeWidth={1.7} aria-hidden />
                  <address className="contactPage-cardText">
                    105 Forestview Ln N
                    <br />
                    Plymouth, MN 55441
                    <br />
                    United States
                  </address>
                </div>
                <a
                  className="contactPage-mapBtn"
                  href={CONTACT_MAPS_URL}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  Open in Google Maps
                </a>
              </div>
              <div className="contactPage-card">
                <h2>Call &amp; email</h2>
                <div className="contactPage-cardRow">
                  <Phone className="contactPage-cardIcon" size={22} strokeWidth={1.7} aria-hidden />
                  <p className="contactPage-cardText">
                    <a href="tel:+17635461421">+1 (763) 546-1421</a>
                  </p>
                </div>
                <div className="contactPage-cardRow contactPage-cardRow--offset">
                  <Mail className="contactPage-cardIcon" size={22} strokeWidth={1.7} aria-hidden />
                  <p className="contactPage-cardText">
                    <a href="mailto:info@forestviewmontessori.org">info@forestviewmontessori.org</a>
                  </p>
                </div>
              </div>
              <p className="contactPage-lead">
                For application forms and tuition details, see{" "}
                <a href="#/admissions">Admissions</a> or <a href="#/admission-form">Apply online</a>.
              </p>
            </div>
            <div>
              <form className="contactPage-formCard" onSubmit={handleSubmit}>
                <h2 className="contactPage-formTitle">Send a message</h2>
                <p className="contactPage-formNote">
                  Submit sends your message to our office. You can also email{" "}
                  <a href="mailto:info@forestviewmontessori.org">info@forestviewmontessori.org</a> directly.
                </p>
                <div className="admissionForm-grid">
                  <label className="admissionForm-field admissionForm-field--full">
                    <span className="admissionForm-label">Your name</span>
                    <input
                      className="admissionForm-input"
                      type="text"
                      name="name"
                      autoComplete="name"
                      required
                      maxLength={120}
                    />
                  </label>
                  <label className="admissionForm-field">
                    <span className="admissionForm-label">Email</span>
                    <input
                      className="admissionForm-input"
                      type="email"
                      name="email"
                      autoComplete="email"
                      required
                      maxLength={120}
                      pattern={EMAIL_INPUT_PATTERN}
                      title="Enter a valid email address (must include @)"
                      placeholder="name@example.com"
                    />
                  </label>
                  <label className="admissionForm-field">
                    <span className="admissionForm-label">Phone</span>
                    <input
                      className="admissionForm-input"
                      type="tel"
                      name="phone"
                      autoComplete="tel"
                      inputMode="tel"
                      required
                      maxLength={20}
                      pattern={PHONE_INPUT_PATTERN}
                      title="Enter a valid 10-digit phone number"
                      placeholder="(763) 555-0100"
                      onInput={handlePhoneInput}
                    />
                  </label>
                  <label className="admissionForm-field admissionForm-field--full">
                    <span className="admissionForm-label">Message</span>
                    <textarea
                      className="admissionForm-input admissionForm-textarea"
                      name="message"
                      rows={5}
                      required
                      maxLength={4000}
                    />
                  </label>
                </div>
                {submitMessage ? (
                  <p className="formFeedback formFeedback--success" role="status">
                    {submitMessage}
                  </p>
                ) : null}
                {submitError ? (
                  <p className="formFeedback formFeedback--error" role="alert">
                    {submitError}
                  </p>
                ) : null}
                <MathChallengeField
                  idPrefix="contact-math"
                  questionText={mathChallenge.questionText}
                  answer={mathChallenge.answer}
                  onAnswerChange={mathChallenge.setAnswer}
                  error={mathChallenge.error}
                />
                <div className="admissionForm-actions contactPage-actions">
                  <button type="submit" className="admissionForm-submit" disabled={submitting}>
                    {submitting ? "Sending…" : "Send message"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
      <SiteFooter />
    </main>
  );
}

const CAREERS_LOOKING_FOR = [
  "Is passionate about working with young children.",
  "Creates a warm, respectful, and engaging classroom environment.",
  "Supports each child's individual growth and development.",
  "Communicates effectively with families and colleagues.",
  "Is reliable, organized, and committed to providing high-quality early childhood education.",
];

const CAREERS_QUALIFICATIONS = [
  "Montessori certification — AMI, AMS, MACTE, IMS, or equivalent Montessori Primary (3–6 years) certification is preferred.",
  "Degree or coursework in Early Childhood Education, Montessori Education, or a related field is preferred.",
  "Previous preschool teaching experience is an asset but not required.",
  "Recent graduates and students completing their Montessori or Early Childhood Education programs are encouraged to apply.",
  "Must meet (or be eligible to meet) Minnesota licensing requirements for early childhood educators.",
];

function CareersPage() {
  return (
    <main id="top" className="aboutPage careersPage">
      <div className="aboutPage-top">
        <SiteHeader />
      </div>

      <header className="careersPage-hero">
        <div className="aboutPage-inner careersPage-heroInner">
          <p className="aboutPage-eyebrow careersPage-eyebrow">Join our team</p>
          <h1 className="careersPage-title">Montessori Preschool Teacher / Guide</h1>
          <dl className="careersPage-meta">
            <div className="careersPage-metaItem">
              <dt>
                <MapPin size={16} strokeWidth={2} aria-hidden />
                Location
              </dt>
              <dd>Plymouth, Minnesota</dd>
            </div>
            <div className="careersPage-metaItem">
              <dt>
                <CalendarDays size={16} strokeWidth={2} aria-hidden />
                Position type
              </dt>
              <dd>Full-Time (Monday–Friday)</dd>
            </div>
            <div className="careersPage-metaItem">
              <dt>
                <BadgeCheck size={16} strokeWidth={2} aria-hidden />
                Start date
              </dt>
              <dd>Immediate</dd>
            </div>
          </dl>
          <p className="careersPage-lead">
            At {SCHOOL_NAME}, we believe every child deserves a nurturing environment where they can develop
            confidence, independence, and a lifelong love of learning. We are seeking a caring, enthusiastic, and
            dedicated Montessori Teacher/Guide to join our Preschool program.
          </p>
        </div>
      </header>

      <article className="careersPage-body">
        <div className="aboutPage-inner careersPage-layout">
          <section className="rulesPage-card" aria-labelledby="careers-looking-h">
            <div className="rulesPage-cardHead">
              <span className="rulesPage-cardIndex" aria-hidden>
                01
              </span>
              <h2 id="careers-looking-h" className="rulesPage-cardTitle">
                What we&apos;re looking for
              </h2>
            </div>
            <p className="rulesPage-prose careersPage-sectionIntro">
              We are looking for an educator who:
            </p>
            <SyllabusPointList items={CAREERS_LOOKING_FOR} />
          </section>

          <section className="rulesPage-card" aria-labelledby="careers-qualifications-h">
            <div className="rulesPage-cardHead">
              <span className="rulesPage-cardIndex" aria-hidden>
                02
              </span>
              <h2 id="careers-qualifications-h" className="rulesPage-cardTitle">
                Qualifications
              </h2>
            </div>
            <SyllabusPointList items={CAREERS_QUALIFICATIONS} />
          </section>

          <section className="rulesPage-ctaPanel" aria-labelledby="careers-apply-h">
            <div className="rulesPage-ctaCopy">
              <p className="rulesPage-ctaKicker" id="careers-apply-h">
                How to apply
              </p>
              <p className="rulesPage-ctaLead">
                If you&apos;re passionate about helping children become confident, independent learners, we&apos;d love
                to hear from you. Please send your resume and a brief cover letter to{" "}
                <a href={`mailto:${OFFICE_EMAIL}`}>{OFFICE_EMAIL}</a>
              </p>
              <p className="careersPage-ctaNote">
                Questions? Call us at <a href={OFFICE_PHONE_TEL}>{OFFICE_PHONE_DISPLAY}</a>.
              </p>
            </div>
            <a href={`mailto:${OFFICE_EMAIL}?subject=${encodeURIComponent("Montessori Preschool Teacher / Guide Application")}`} className="rulesPage-ctaBtn">
              Email your application
            </a>
          </section>
        </div>
      </article>

      <SiteFooter />
    </main>
  );
}

function SiteHeader() {
  const [drawerOpen, setDrawerOpen] = useState(false);

  const closeDrawer = () => setDrawerOpen(false);

  // Escape key closes drawer
  useEffect(() => {
    if (!drawerOpen) return undefined;
    const onKey = (e) => { if (e.key === "Escape") closeDrawer(); };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [drawerOpen]);

  // Lock body scroll while drawer is open
  useEffect(() => {
    document.body.classList.toggle("navDrawer-bodyLock", drawerOpen);
    return () => document.body.classList.remove("navDrawer-bodyLock");
  }, [drawerOpen]);

  const NAV_LINKS = [
    { href: "#/", label: "Home" },
    { href: "#/about", label: "About Us" },
    { href: "#/syllabus", label: "Syllabus" },
    { href: "#/admissions", label: "Admissions" },
  ];

  const drawerPortal = createPortal(
    <>
      {/* Overlay – closes drawer when tapped */}
      <div
        className={`navDrawer-overlay ${drawerOpen ? "navDrawer-overlay--visible" : ""}`}
        aria-hidden="true"
        onClick={closeDrawer}
      />

      {/* Drawer panel – slides in from right */}
      <div
        id="navMobileDrawer"
        className={`navDrawer ${drawerOpen ? "navDrawer--open" : ""}`}
        aria-hidden={!drawerOpen}
      >
        <div className="navDrawer-header">
          <Logo />
          <button
            type="button"
            className="navDrawer-close"
            aria-label="Close menu"
            onClick={closeDrawer}
          >
            <X size={22} strokeWidth={2} aria-hidden />
          </button>
        </div>

        <nav className="navDrawer-nav" aria-label="Mobile navigation">
          {NAV_LINKS.map(({ href, label }) => (
            <a key={href} href={href} className="navDrawer-link" onClick={closeDrawer}>
              {label}
            </a>
          ))}
          <div className="navDrawer-group">
            <a href="#/contact" className="navDrawer-link" onClick={closeDrawer}>
              Contact
            </a>
            <a href="#/careers" className="navDrawer-sublink" onClick={closeDrawer}>
              Careers
            </a>
            <a href={SCHEDULE_TOUR_HREF} className="navDrawer-sublink" onClick={closeDrawer}>
              Book a Tour
            </a>
          </div>
        </nav>

        <div className="navDrawer-footer">
          <a href="#/admission-form" className="navDrawer-cta" onClick={closeDrawer}>
            Admissions open
          </a>
        </div>

        <div className="navDrawer-info">
          <p className="navDrawer-infoLabel">Get in touch</p>
          <a href="tel:+17635461421" className="navDrawer-infoLink">
            <Phone size={15} strokeWidth={2} aria-hidden />
            +1 (763) 546-1421
          </a>
          <a href="mailto:info@forestviewmontessori.org" className="navDrawer-infoLink">
            <Mail size={15} strokeWidth={2} aria-hidden />
            info@forestviewmontessori.org
          </a>
          <div className="navDrawer-infoAddr">
            <MapPin size={15} strokeWidth={2} aria-hidden />
            <address>105 Forestview Ln N, Plymouth, MN</address>
          </div>
          <SocialLinks className="navDrawer-socials" linkClassName="navDrawer-social" />
        </div>
      </div>
    </>,
    document.body,
  );

  return (
    <>
      <div className="siteHeader">
        <div className="siteLogo">
          <Logo />
        </div>

        <header className="nav" aria-label="Site navigation">
          <nav className="navDesktop" aria-label="Main navigation">
            {NAV_LINKS.map(({ href, label }) => (
              <a key={href} href={href}>
                {label}
              </a>
            ))}
            <NavContactMenu />
          </nav>

          <div className="navRight">
            <a href="#/admission-form" className="navAdmissionCta">
              Admissions open
            </a>
            <div className="navTools">
              <NavNoticesPopover />
              <NavLoginDropdown />
            </div>

            <button
              type="button"
              className="navHamburger"
              aria-label={drawerOpen ? "Close menu" : "Open menu"}
              aria-expanded={drawerOpen}
              aria-controls="navMobileDrawer"
              onClick={() => setDrawerOpen((v) => !v)}
            >
              {drawerOpen
                ? <X size={24} strokeWidth={2} aria-hidden />
                : <Menu size={24} strokeWidth={2} aria-hidden />}
            </button>
          </div>
        </header>
      </div>

      {drawerPortal}
    </>
  );
}

function scrollToHomeInPageHash() {
  if (typeof window === "undefined") return;
  const route = getRouteFromHash();
  if (route !== "home") return;
  const raw = window.location.hash.slice(1);
  if (!raw || raw.startsWith("/")) return;

  const sectionId = decodeURIComponent(raw);

  const el = document.getElementById(sectionId);
  if (!el) return;
  const instant = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  el.scrollIntoView({ behavior: instant ? "auto" : "smooth", block: "start" });
}

function SiteFooter() {
  return (
    <footer id="support">
      <div className="footerInner">
        <div className="footerLogo">
          <Logo light />
        </div>
        <address className="footerAddress">
          <span className="footerAddress-lines">
            105 Forestview Ln N
            <br />
            Plymouth, MN 55441
            <br />
            United States
          </span>
          <span className="footerAddress-contact">
            <span className="footerAddress-label">phone:</span>{" "}
            <a href="tel:+17635461421">+1 (763) 546-1421</a>
            <br />
            <a href="mailto:info@forestviewmontessori.org">info@forestviewmontessori.org</a>
          </span>
        </address>
        <nav className="footerLinks" aria-label="Footer">
          <a href="#top">Home</a>
          <a href="#/about">About Us</a>
          <a href="#/syllabus">Syllabus</a>
          <a href="#/admissions">Admissions</a>
          <a href="#/contact">Contact</a>
          <a href="#/careers">Careers</a>
          <a href={SCHEDULE_TOUR_HREF}>Book a Tour</a>
        </nav>
        <div className="footerAbout">
          <p>
            Founded in 1994 by director Preethi Nugawila after 20 years of Montessori teaching and training in Sri
            Lanka - we pursue excellence with genuine care for every child and family.
          </p>
          <SocialLinks />
        </div>
        <a className="topLink" href="#top">
          <span className="topLink-arrow" aria-hidden="true">
            ↑
          </span>
          <span>Top</span>
        </a>
      </div>
      <div className="legal">
        <div className="legalCopyright">
          © {SCHOOL_NAME} · Powered by{" "}
          <a href="https://nekdigital.nl/" target="_blank" rel="noopener noreferrer">
            NEK Digital
          </a>
        </div>
        <nav className="legalLinks" aria-label="Legal links">
          <a href="#/rules">Rules and Regulations</a>
          <a href="#site-map">Site Map</a>
          <a href="#privacy">Privacy Policy</a>
        </nav>
      </div>
    </footer>
  );
}

function AboutPage() {
  const yearsOperating = getYearsOperating();
  const yearsStat =
    yearsOperating > 0 ? `${yearsOperating} years` : `Since ${FOUNDED_YEAR}`;

  return (
    <main id="top" className="aboutPage">
      <div className="aboutPage-top">
        <SiteHeader />
      </div>

      <header className="aboutPage-hero">
        <div className="aboutPage-heroLayout">
          <div className="aboutPage-heroMedia">
            <figure className="aboutPage-heroFigure">
              <img src={classroomPhoto} alt="Children working in a Montessori classroom" />
              <figcaption className="aboutPage-heroCaption">
                <span className="aboutPage-heroCaptionMark">Est. {FOUNDED_YEAR}</span>
                <span>Plymouth, Minnesota</span>
              </figcaption>
            </figure>
          </div>
          <div className="aboutPage-heroContent">
            <p className="aboutPage-heroKicker">About us</p>
            <h1 className="aboutPage-title">{SCHOOL_NAME}</h1>
            <p className="aboutPage-heroLead">
              {CHILD_CARE_TAGLINE} — {PROGRAMS_LABEL} with trained guides, prepared classrooms, and a community that stays
              small enough to know your child well.
            </p>
            <dl className="aboutPage-heroStats">
              <div className="aboutPage-heroStat">
                <dt>Ages</dt>
                <dd>16 mo – 6 yr</dd>
              </div>
              <div className="aboutPage-heroStat">
                <dt>Community</dt>
                <dd>{yearsStat}</dd>
              </div>
              <div className="aboutPage-heroStat">
                <dt>Approach</dt>
                <dd>Authentic Montessori</dd>
              </div>
            </dl>
            <div className="aboutPage-heroActions">
              <a href="#programs" className="aboutPage-heroCta aboutPage-heroCta--primary">
                See programs
              </a>
              <a href="#/admissions" className="aboutPage-heroCta aboutPage-heroCta--secondary">
                Tuition &amp; admissions
              </a>
            </div>
          </div>
        </div>
      </header>

      <section className="aboutPage-traits" aria-labelledby="about-traits-h">
        <div className="aboutPage-inner">
          <h2 id="about-traits-h" className="aboutPage-sectionTitle">
            What we nurture in every child
          </h2>
          <p className="aboutPage-sectionLead">
            Montessori practice meets a warm school culture - so students grow academically, socially, and emotionally.
          </p>
          <ul className="aboutPage-traitGrid">
            <li className="aboutPage-trait aboutPage-trait--deep">
              <h3>Curious learners</h3>
              <p>They ask questions, try materials, and build understanding at their own pace.</p>
            </li>
            <li className="aboutPage-trait aboutPage-trait--yellow">
              <h3>Confident explorers</h3>
              <p>They choose work, practice independence, and learn from purposeful activity.</p>
            </li>
            <li className="aboutPage-trait aboutPage-trait--orange">
              <h3>Kind community members</h3>
              <p>They care for the room, for peers, and for the wider school family.</p>
            </li>
          </ul>
        </div>
      </section>

      <section className="aboutPage-missionVision" aria-labelledby="about-mv-h">
        <div className="aboutPage-inner aboutPage-mvInner">
          <p className="aboutPage-eyebrow aboutPage-mvEyebrow">Our school</p>
          <h2 id="about-mv-h" className="aboutPage-mvHeading">
            Mission &amp; vision
          </h2>
          <p className="aboutPage-mvLead">
            What we do each day - and what we hope every child carries forward.
          </p>
          <div className="aboutPage-mvStack">
            <article className="aboutPage-mvBlock">
              <h3>Mission</h3>
              <p>
                To offer authentic Montessori child care for {PROGRAMS_LABEL} in Plymouth: prepared classrooms, trained
                guides, and sincere collaboration with families - so each child can focus, move with purpose, and feel
                deeply known.
              </p>
            </article>
            <article className="aboutPage-mvBlock">
              <h3>Vision</h3>
              <p>
                A community where young learners grow into confident, caring people - ready for the next classroom and for
                life - with habits of concentration, respect, and curiosity that began here with us.
              </p>
            </article>
          </div>
        </div>
      </section>

      <section className="aboutPage-whyUs" aria-labelledby="about-why-h">
        <div className="aboutPage-inner aboutPage-whyUsInner">
          <p className="aboutPage-eyebrow aboutPage-whyUsEyebrow">Why us</p>
          <h2 id="about-why-h" className="aboutPage-whyUsHeading">
            Why families choose us
          </h2>
          <p className="aboutPage-whyUsLead">
            Choosing early education is a big decision. Here’s what draws Plymouth families - and what they tell us keeps them with us year after year.
          </p>
          <ul className="aboutPage-whyUsGrid">
            {ABOUT_WHY_US.map(({ Icon, title, text }) => (
              <li key={title} className="aboutPage-whyUsCard">
                <Icon className="aboutPage-whyUsIcon" size={24} strokeWidth={1.65} aria-hidden />
                <h3>{title}</h3>
                <p>{text}</p>
              </li>
            ))}
          </ul>
        </div>
      </section>

      <section className="aboutPage-ctaStrip" aria-labelledby="about-cta-h">
        <div className="aboutPage-inner aboutPage-ctaInner">
          <h2 id="about-cta-h">Plan a visit</h2>
          <p>See the classrooms and ask questions - we&apos;d love to meet you.</p>
          <a href="#/admissions" className="aboutPage-ctaBtn">
            Tuition &amp; admissions
          </a>
        </div>
      </section>

      <section className="aboutPage-more" aria-labelledby="about-more-h">
        <div className="aboutPage-inner">
          <h2 id="about-more-h" className="aboutPage-moreHeading">
            Continue exploring
          </h2>
          <p className="aboutPage-moreLead">{PROGRAMS_LABEL} child care, community highlights, and ways to reach us.</p>
          <div className="aboutPage-moreGrid">
            <a href="#programs" className="aboutPage-moreCard">
              <img src={classroomPhoto} alt="" />
              <span>Programs</span>
            </a>
            <a href="#highlights" className="aboutPage-moreCard">
              <img src={signPhoto} alt="" />
              <span>Community highlights</span>
            </a>
            <a href="#/contact" className="aboutPage-moreCard">
              <img src={heroPhoto} alt="" />
              <span>Contact</span>
            </a>
          </div>
        </div>
      </section>

      <SiteFooter />
    </main>
  );
}

function SyllabusPointList({ items }) {
  return (
    <ul className="syllabusPage-list">
      {items.map((item) => (
        <li key={item} className="syllabusPage-listItem">
          {item}
        </li>
      ))}
    </ul>
  );
}

function SyllabusLearningArea({ area }) {
  return (
    <article className="syllabusPage-area">
      <h4 className="syllabusPage-areaTitle">{area.title}</h4>
      {area.intro ? <p className="syllabusPage-areaIntro">{area.intro}</p> : null}
      {area.items ? <SyllabusPointList items={area.items} /> : null}
      {area.blocks?.map((block) => (
        <div key={`${area.title}-${block.label}`} className="syllabusPage-areaBlock">
          <p className="syllabusPage-areaLabel">{block.label}</p>
          <SyllabusPointList items={block.items} />
        </div>
      ))}
    </article>
  );
}

function SyllabusProgramSection({ program }) {
  return (
    <section className="syllabusPage-section" id={program.id} aria-labelledby={`${program.id}-h`}>
      <header className="syllabusPage-sectionHead">
        <h2 id={`${program.id}-h`} className="syllabusPage-sectionTitle">
          {program.title}
        </h2>
        <p className="syllabusPage-sectionAge">{program.age}</p>
      </header>
      <div className="syllabusPage-card">
        <p className="syllabusPage-cardLabel">Program goals</p>
        <p className="syllabusPage-cardIntro">{program.goalsIntro}</p>
        <SyllabusPointList items={program.goals} />
      </div>
      <h3 className="syllabusPage-areasHeading">{program.areasTitle}</h3>
      <div className="syllabusPage-areas">
        {program.areas.map((area) => (
          <SyllabusLearningArea key={area.title} area={area} />
        ))}
      </div>
    </section>
  );
}

function SyllabusPage() {
  useEffect(() => {
    const scrollToSectionFromHash = () => {
      const raw = window.location.hash.replace(/^#\/?/, "").split("?")[0];
      const parts = raw.split("/").filter(Boolean);
      let sectionId = null;
      if (parts[0] === "syllabus" && parts[1]) {
        sectionId = decodeURIComponent(parts[1]);
      } else if (parts[0]?.startsWith("syllabus-")) {
        sectionId = parts[0];
      }
      if (!sectionId || !SYLLABUS_TOC.some((x) => x.id === sectionId)) return;
      const el = document.getElementById(sectionId);
      if (!el) return;
      const instant = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
      requestAnimationFrame(() => {
        el.scrollIntoView({ behavior: instant ? "auto" : "smooth", block: "start" });
      });
    };

    scrollToSectionFromHash();
    window.addEventListener("hashchange", scrollToSectionFromHash);
    return () => window.removeEventListener("hashchange", scrollToSectionFromHash);
  }, []);

  return (
    <main id="top" className="aboutPage syllabusPage">
      <div className="aboutPage-top">
        <SiteHeader />
      </div>

      <header className="syllabusPage-hero">
        <div className="aboutPage-inner syllabusPage-heroInner">
          <p className="aboutPage-eyebrow syllabusPage-eyebrow">Curriculum</p>
          <h1 className="syllabusPage-title">{PROGRAMS_LABEL} syllabus</h1>
          <p className="syllabusPage-lead">
            How we nurture independence, curiosity, and whole-child growth through Montessori child care for{" "}
            {PROGRAMS_LABEL} at {SCHOOL_NAME}.
          </p>
        </div>
      </header>

      <div className="syllabusPage-body">
        <div className="aboutPage-inner syllabusPage-layout">
          <nav className="syllabusPage-toc" aria-label="On this page">
            <p className="syllabusPage-tocTitle">On this page</p>
            <ul className="syllabusPage-tocList">
              {SYLLABUS_TOC.map(({ id, label }) => (
                <li key={id}>
                  <a className="syllabusPage-tocLink" href={`#/syllabus/${id}`}>
                    {label}
                  </a>
                </li>
              ))}
            </ul>
          </nav>

          <div className="syllabusPage-main">
            <section className="syllabusPage-section" id={SYLLABUS_SCHEDULE.id} aria-labelledby="syllabus-schedule-h">
              <h2 id="syllabus-schedule-h" className="syllabusPage-sectionTitle">
                {SYLLABUS_SCHEDULE.title}
              </h2>
              <div className="syllabusPage-scheduleGrid">
                {SYLLABUS_SCHEDULE.programs.map((prog) => (
                  <div key={prog.name} className="syllabusPage-card">
                    <h3 className="syllabusPage-cardTitle">{prog.name}</h3>
                    <SyllabusPointList items={prog.items} />
                  </div>
                ))}
              </div>
            </section>

            <section className="syllabusPage-section" id="syllabus-philosophy" aria-labelledby="syllabus-philosophy-h">
              <h2 id="syllabus-philosophy-h" className="syllabusPage-sectionTitle">
                {SYLLABUS_PHILOSOPHY.title}
              </h2>
              <div className="syllabusPage-card">
                {SYLLABUS_PHILOSOPHY.paragraphs.map((p) => (
                  <p key={p} className="syllabusPage-prose">
                    {p}
                  </p>
                ))}
              </div>
            </section>

            <SyllabusProgramSection program={SYLLABUS_TODDLER} />
            <SyllabusProgramSection program={SYLLABUS_PRESCHOOL} />

            <section
              className="syllabusPage-section"
              id={SYLLABUS_ASSESSMENT.id}
              aria-labelledby="syllabus-assessment-h"
            >
              <h2 id="syllabus-assessment-h" className="syllabusPage-sectionTitle">
                {SYLLABUS_ASSESSMENT.title}
              </h2>
              <div className="syllabusPage-card">
                <p className="syllabusPage-prose">{SYLLABUS_ASSESSMENT.intro}</p>
                <SyllabusPointList items={SYLLABUS_ASSESSMENT.items} />
              </div>
            </section>

            <section className="syllabusPage-section" id={SYLLABUS_OFFERINGS.id} aria-labelledby="syllabus-offerings-h">
              <h2 id="syllabus-offerings-h" className="syllabusPage-sectionTitle">
                {SYLLABUS_OFFERINGS.title}
              </h2>
              <div className="syllabusPage-card">
                <p className="syllabusPage-prose">{SYLLABUS_OFFERINGS.intro}</p>
                <SyllabusPointList items={SYLLABUS_OFFERINGS.included} />
              </div>
              <div className="syllabusPage-card syllabusPage-card--accent">
                <h3 className="syllabusPage-cardTitle">{SYLLABUS_OFFERINGS.commitment.title}</h3>
                {SYLLABUS_OFFERINGS.commitment.paragraphs.map((p) => (
                  <p key={p} className="syllabusPage-prose">
                    {p}
                  </p>
                ))}
              </div>
            </section>

            <section className="syllabusPage-section" id={SYLLABUS_FAMILIES.id} aria-labelledby="syllabus-families-h">
              <h2 id="syllabus-families-h" className="syllabusPage-sectionTitle">
                {SYLLABUS_FAMILIES.title}
              </h2>
              <p className="syllabusPage-prose syllabusPage-prose--lead">{SYLLABUS_FAMILIES.intro}</p>
              {SYLLABUS_FAMILIES.sections.map((block) => (
                <div key={block.title} className="syllabusPage-card">
                  <h3 className="syllabusPage-cardTitle">{block.title}</h3>
                  {block.paragraphs?.map((p) => (
                    <p key={p} className="syllabusPage-prose">
                      {p}
                    </p>
                  ))}
                  {block.intro ? <p className="syllabusPage-prose">{block.intro}</p> : null}
                  {block.items?.length ? <SyllabusPointList items={block.items} /> : null}
                </div>
              ))}
            </section>

            <section className="syllabusPage-section" id={SYLLABUS_VALUES.id} aria-labelledby="syllabus-values-h">
              <h2 id="syllabus-values-h" className="syllabusPage-sectionTitle">
                {SYLLABUS_VALUES.title}
              </h2>
              <div className="syllabusPage-card syllabusPage-card--accent">
                <p className="syllabusPage-prose">{SYLLABUS_VALUES.intro}</p>
                <SyllabusPointList items={SYLLABUS_VALUES.items} />
                <p className="syllabusPage-prose syllabusPage-prose--closing">{SYLLABUS_VALUES.closing}</p>
              </div>
            </section>
          </div>
        </div>
      </div>

      <SiteFooter />
    </main>
  );
}

function RulesRegulationsPage() {
  const [activeSection, setActiveSection] = useState(RULES_TOC_LINKS[0].sectionId);

  useEffect(() => {
    const elements = RULES_TOC_LINKS.map(({ sectionId }) => document.getElementById(sectionId)).filter(
      (el) => el instanceof HTMLElement
    );
    if (!elements.length) return undefined;

    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((e) => e.isIntersecting)
          .sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top);
        if (visible.length) setActiveSection(visible[0].target.id);
      },
      { root: null, rootMargin: "-100px 0px -48% 0px", threshold: [0, 0.05, 0.1, 0.2] }
    );
    elements.forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    const scrollToSectionFromHash = () => {
      const raw = window.location.hash.replace(/^#\/?/, "").split("?")[0];
      const parts = raw.split("/").filter(Boolean);
      if (parts[0] !== "rules") return;
      const sub = parts[1];
      if (!sub || !RULES_TOC_LINKS.some((x) => x.sectionId === sub)) return;
      setActiveSection(sub);
      const el = document.getElementById(sub);
      if (!el) return;
      const instant = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
      requestAnimationFrame(() => {
        el.scrollIntoView({ behavior: instant ? "auto" : "smooth", block: "start" });
      });
    };

    scrollToSectionFromHash();
    window.addEventListener("hashchange", scrollToSectionFromHash);
    return () => window.removeEventListener("hashchange", scrollToSectionFromHash);
  }, []);

  return (
    <main id="top" className="aboutPage rulesPage">
      <div className="aboutPage-top">
        <SiteHeader />
      </div>

      <header className="rulesPage-hero">
        <div className="aboutPage-inner rulesPage-heroInner">
          <p className="aboutPage-eyebrow rulesPage-eyebrow">Families</p>
          <h1 className="rulesPage-title">Rules and regulations</h1>
          <p className="rulesPage-lead">
            Expectations for enrollment, attendance, health, and community life. This page is an overview;
            your signed enrollment packet and parent handbook take precedence if wording differs.
          </p>
        </div>
      </header>

      <article className="rulesPage-body">
        <div className="aboutPage-inner rulesPage-layout">
          <nav className="rulesPage-toc" aria-label="On this page">
            <p className="rulesPage-tocTitle">On this page</p>
            <ul className="rulesPage-tocList">
              {RULES_TOC_LINKS.map(({ sectionId, label }) => (
                <li key={sectionId}>
                  <a
                    className={`rulesPage-tocLink ${activeSection === sectionId ? "rulesPage-tocLink--active" : ""}`}
                    href={`#/rules/${sectionId}`}
                    aria-current={activeSection === sectionId ? "location" : undefined}
                  >
                    {label}
                  </a>
                </li>
              ))}
            </ul>
          </nav>

          <div className="rulesPage-main">
            <div className="rulesPage-notice" role="note">
              <ShieldCheck className="rulesPage-noticeIcon" size={22} strokeWidth={1.65} aria-hidden />
              <p>
                Not sure how a rule applies to your situation? Call or email the office - we&apos;ll point you to the right
                paperwork or answer before you sign.
              </p>
            </div>

            <section className="rulesPage-card" id="rules-enrollment" aria-labelledby="rules-enrollment-h">
              <div className="rulesPage-cardHead">
                <span className="rulesPage-cardIndex" aria-hidden>
                  01
                </span>
                <h2 id="rules-enrollment-h" className="rulesPage-cardTitle">
                  Enrollment and tuition
                </h2>
              </div>
              <ul className="rulesPage-points">
                <li className="rulesPage-point">
                  <span className="rulesPage-pointMark" aria-hidden>
                    <Check size={16} strokeWidth={2.5} />
                  </span>
                  <span className="rulesPage-pointText">
                    Placement offers depend on program space, balanced classrooms, and the school&apos;s judgment of fit.
                  </span>
                </li>
                <li className="rulesPage-point">
                  <span className="rulesPage-pointMark" aria-hidden>
                    <Check size={16} strokeWidth={2.5} />
                  </span>
                  <span className="rulesPage-pointText">
                    Tuition and fees follow your signed agreement; late payment may affect continued enrollment.
                  </span>
                </li>
                <li className="rulesPage-point">
                  <span className="rulesPage-pointMark" aria-hidden>
                    <Check size={16} strokeWidth={2.5} />
                  </span>
                  <span className="rulesPage-pointText">
                    Schedule changes need advance notice and office approval when space allows.
                  </span>
                </li>
              </ul>
            </section>

            <section className="rulesPage-card" id="rules-attendance" aria-labelledby="rules-attendance-h">
              <div className="rulesPage-cardHead">
                <span className="rulesPage-cardIndex" aria-hidden>
                  02
                </span>
                <h2 id="rules-attendance-h" className="rulesPage-cardTitle">
                  Attendance and hours
                </h2>
              </div>
              <ul className="rulesPage-points">
                <li className="rulesPage-point">
                  <span className="rulesPage-pointMark" aria-hidden>
                    <Check size={16} strokeWidth={2.5} />
                  </span>
                  <span className="rulesPage-pointText">
                    Arrival and pickup stay within published hours unless the office approves something different.
                  </span>
                </li>
                <li className="rulesPage-point">
                  <span className="rulesPage-pointMark" aria-hidden>
                    <Check size={16} strokeWidth={2.5} />
                  </span>
                  <span className="rulesPage-pointText">
                    Steady attendance supports the class community; let guides know about longer absences when you can.
                  </span>
                </li>
                <li className="rulesPage-point">
                  <span className="rulesPage-pointMark" aria-hidden>
                    <Check size={16} strokeWidth={2.5} />
                  </span>
                  <span className="rulesPage-pointText">
                    Pickup authorization stays current - only adults you approve may take your child from school.
                  </span>
                </li>
              </ul>
            </section>

            <section className="rulesPage-card" id="rules-health" aria-labelledby="rules-health-h">
              <div className="rulesPage-cardHead">
                <span className="rulesPage-cardIndex" aria-hidden>
                  03
                </span>
                <h2 id="rules-health-h" className="rulesPage-cardTitle">
                  Health and safety
                </h2>
              </div>
              <ul className="rulesPage-points">
                <li className="rulesPage-point">
                  <span className="rulesPage-pointMark" aria-hidden>
                    <Check size={16} strokeWidth={2.5} />
                  </span>
                  <span className="rulesPage-pointText">
                    Children join class when they are well enough to participate; illness policies protect everyone.
                  </span>
                </li>
                <li className="rulesPage-point">
                  <span className="rulesPage-pointMark" aria-hidden>
                    <Check size={16} strokeWidth={2.5} />
                  </span>
                  <span className="rulesPage-pointText">
                    Allergies, medications, and emergency plans belong on required forms and should stay up to date.
                  </span>
                </li>
                <li className="rulesPage-point">
                  <span className="rulesPage-pointMark" aria-hidden>
                    <Check size={16} strokeWidth={2.5} />
                  </span>
                  <span className="rulesPage-pointText">
                    We may exclude a child temporarily when licensing, health, or safety rules require it.
                  </span>
                </li>
              </ul>
            </section>

            <section className="rulesPage-card" id="rules-conduct" aria-labelledby="rules-conduct-h">
              <div className="rulesPage-cardHead">
                <span className="rulesPage-cardIndex" aria-hidden>
                  04
                </span>
                <h2 id="rules-conduct-h" className="rulesPage-cardTitle">
                  Conduct and community
                </h2>
              </div>
              <ul className="rulesPage-points">
                <li className="rulesPage-point">
                  <span className="rulesPage-pointMark" aria-hidden>
                    <Check size={16} strokeWidth={2.5} />
                  </span>
                  <span className="rulesPage-pointText">
                    Adults model respect in the building and on the grounds; bring concerns to staff, not through children.
                  </span>
                </li>
                <li className="rulesPage-point">
                  <span className="rulesPage-pointMark" aria-hidden>
                    <Check size={16} strokeWidth={2.5} />
                  </span>
                  <span className="rulesPage-pointText">
                    Classroom materials stay for guide-led use at school unless staff arrange otherwise.
                  </span>
                </li>
                <li className="rulesPage-point">
                  <span className="rulesPage-pointMark" aria-hidden>
                    <Check size={16} strokeWidth={2.5} />
                  </span>
                  <span className="rulesPage-pointText">
                    Harassment, discrimination, or threats are not tolerated and may result in dismissal.
                  </span>
                </li>
              </ul>
            </section>

            <section className="rulesPage-card rulesPage-card--prose" id="rules-changes" aria-labelledby="rules-changes-h">
              <div className="rulesPage-cardHead">
                <span className="rulesPage-cardIndex" aria-hidden>
                  05
                </span>
                <h2 id="rules-changes-h" className="rulesPage-cardTitle">
                  Policy updates
                </h2>
              </div>
              <p className="rulesPage-prose">
                We may refresh these summaries as programs, licensing, or best practices change. When updates
                matter, the office will tell you. If this page and your family&apos;s handbook disagree, the handbook and
                enrollment documents for your year control.
              </p>
            </section>

            <div className="rulesPage-ctaPanel">
              <div className="rulesPage-ctaCopy">
                <p className="rulesPage-ctaKicker">Questions?</p>
                <p className="rulesPage-ctaLead">
                  <a href="tel:+17635461421">(763) 546-1421</a>
                  <span className="rulesPage-ctaSep" aria-hidden>
                    ·
                  </span>
                  <a href="mailto:info@forestviewmontessori.org">info@forestviewmontessori.org</a>
                </p>
              </div>
              <a href="#/admission-form" className="rulesPage-ctaBtn">
                Start application
              </a>
            </div>
          </div>
        </div>
      </article>

      <SiteFooter />
    </main>
  );
}

function AdmissionFormPage() {
  const [submitting, setSubmitting] = useState(false);
  const [submitMessage, setSubmitMessage] = useState("");
  const [submitError, setSubmitError] = useState("");
  const mathChallenge = useMathChallenge();

  async function handleSubmit(e) {
    e.preventDefault();
    const form = e.currentTarget;
    const data = new FormData(form);
    const get = (k) => (data.get(k) ?? "").toString().trim();

    const payload = {
        parentName: get("parentName"),
        parentRelation: get("parentRelation"),
        phone: get("phone"),
        email: get("email"),
        addressLine: get("addressLine"),
        city: get("city"),
        state: get("state"),
        zip: get("zip"),
        secondaryName: get("secondaryName"),
        secondaryEmail: get("secondaryEmail"),
        secondaryPhone: get("secondaryPhone"),
        childLegalName: get("childLegalName"),
        childPreferredName: get("childPreferredName"),
        childDob: get("childDob"),
        currentCare: get("currentCare"),
        program: get("program"),
        schedulePref: get("schedulePref"),
        start: get("start"),
        siblingAtSchool: get("siblingAtSchool"),
        siblingNames: get("siblingNames"),
        referralSource: get("referralSource"),
        referralDetail: get("referralDetail"),
        healthNotes: get("healthNotes"),
        learningNotes: get("learningNotes"),
        message: get("message"),
      };

    if (!form.reportValidity()) return;
    const fieldError = validateAdmissionFields({
      name: payload.parentName,
      email: payload.email,
      phone: payload.phone,
      secondaryEmail: payload.secondaryEmail,
      secondaryPhone: payload.secondaryPhone,
    });
    if (fieldError) {
      setSubmitError(fieldError);
      return;
    }
    if (!mathChallenge.validate()) return;

    setSubmitting(true);
    setSubmitMessage("");
    setSubmitError("");

    try {
      const result = await postToApi("admission", payload);
      setSubmitMessage(result.message || "Application received. We will follow up with next steps.");
      form.reset();
      mathChallenge.reset();
    } catch (err) {
      setSubmitError(err.message || "Submission failed.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <main id="top" className="aboutPage admissionFormPage">
      <div className="aboutPage-top">
        <SiteHeader />
      </div>

      <header className="admissionForm-hero">
        <div className="aboutPage-inner admissionForm-heroInner">
          <a href="#/admissions" className="admissionForm-back">
            ← Back to admissions
          </a>
          <p className="aboutPage-eyebrow admissionForm-eyebrow">Apply online</p>
          <h1 className="admissionForm-title">Admission application</h1>
          <p className="admissionForm-lead">
            Apply for Montessori child care in our {PROGRAMS_LABEL} program. Complete the sections below and submit —
            our office will follow up with next steps.
          </p>
          <div className="admissionForm-rulesRow">
            <a href="#/rules" className="admissionForm-rulesBtn">
              Rules &amp; regulations
            </a>
            <span className="admissionForm-rulesMention">
              Review enrollment, attendance, and community expectations before you apply.
            </span>
          </div>
        </div>
      </header>

      <div className="admissionForm-body">
        <div className="aboutPage-inner">
          <form className="admissionForm" onSubmit={handleSubmit}>
            <section className="admissionForm-section" aria-labelledby="admissionForm-guardian-h">
              <h2 id="admissionForm-guardian-h" className="admissionForm-sectionTitle">
                Primary guardian
              </h2>
              <div className="admissionForm-grid">
                <label className="admissionForm-field admissionForm-field--full">
                  <span className="admissionForm-label">Full name</span>
                  <input className="admissionForm-input" type="text" name="parentName" autoComplete="name" required />
                </label>
                <label className="admissionForm-field">
                  <span className="admissionForm-label">Relationship to child</span>
                  <select className="admissionForm-input admissionForm-select" name="parentRelation" defaultValue="" required>
                    <option value="">Choose…</option>
                    <option value="Parent">Parent</option>
                    <option value="Legal guardian">Legal guardian</option>
                    <option value="Stepparent">Stepparent</option>
                    <option value="Grandparent">Grandparent</option>
                    <option value="Other">Other</option>
                  </select>
                </label>
                <label className="admissionForm-field">
                  <span className="admissionForm-label">Best phone</span>
                  <input
                    className="admissionForm-input"
                    type="tel"
                    name="phone"
                    autoComplete="tel"
                    inputMode="tel"
                    required
                    maxLength={20}
                    pattern={PHONE_INPUT_PATTERN}
                    title="Enter a valid 10-digit phone number"
                    placeholder="(763) 555-0100"
                    onInput={handlePhoneInput}
                  />
                </label>
                <label className="admissionForm-field admissionForm-field--full">
                  <span className="admissionForm-label">Email</span>
                  <input
                    className="admissionForm-input"
                    type="email"
                    name="email"
                    autoComplete="email"
                    required
                    maxLength={120}
                    pattern={EMAIL_INPUT_PATTERN}
                    title="Enter a valid email address (must include @)"
                    placeholder="name@example.com"
                  />
                </label>
              </div>
            </section>

            <section className="admissionForm-section" aria-labelledby="admissionForm-address-h">
              <h2 id="admissionForm-address-h" className="admissionForm-sectionTitle">
                Home address
              </h2>
              <div className="admissionForm-grid">
                <label className="admissionForm-field admissionForm-field--full">
                  <span className="admissionForm-label">Street address</span>
                  <input className="admissionForm-input" type="text" name="addressLine" autoComplete="street-address" required />
                </label>
                <label className="admissionForm-field">
                  <span className="admissionForm-label">City</span>
                  <input className="admissionForm-input" type="text" name="city" autoComplete="address-level2" required />
                </label>
                <label className="admissionForm-field">
                  <span className="admissionForm-label">State</span>
                  <input
                    className="admissionForm-input"
                    type="text"
                    name="state"
                    autoComplete="address-level1"
                    placeholder="MN"
                    maxLength={2}
                    required
                  />
                </label>
                <label className="admissionForm-field">
                  <span className="admissionForm-label">ZIP</span>
                  <input className="admissionForm-input" type="text" name="zip" autoComplete="postal-code" inputMode="numeric" required />
                </label>
              </div>
            </section>

            <section className="admissionForm-section" aria-labelledby="admissionForm-second-h">
              <h2 id="admissionForm-second-h" className="admissionForm-sectionTitle">
                Second parent or guardian <span className="admissionForm-labelHint">(optional)</span>
              </h2>
              <div className="admissionForm-grid">
                <label className="admissionForm-field admissionForm-field--full">
                  <span className="admissionForm-label">Name</span>
                  <input className="admissionForm-input" type="text" name="secondaryName" autoComplete="name" />
                </label>
                <label className="admissionForm-field">
                  <span className="admissionForm-label">Email</span>
                  <input
                    className="admissionForm-input"
                    type="email"
                    name="secondaryEmail"
                    autoComplete="email"
                    maxLength={120}
                    pattern={EMAIL_INPUT_PATTERN}
                    title="Enter a valid email address (must include @)"
                    placeholder="name@example.com"
                  />
                </label>
                <label className="admissionForm-field">
                  <span className="admissionForm-label">Phone</span>
                  <input
                    className="admissionForm-input"
                    type="tel"
                    name="secondaryPhone"
                    autoComplete="tel"
                    inputMode="tel"
                    maxLength={20}
                    title="Enter a valid 10-digit phone number"
                    placeholder="(763) 555-0100"
                    onInput={handlePhoneInput}
                  />
                </label>
              </div>
            </section>

            <section className="admissionForm-section" aria-labelledby="admissionForm-child-h">
              <h2 id="admissionForm-child-h" className="admissionForm-sectionTitle">
                Child
              </h2>
              <div className="admissionForm-grid">
                <label className="admissionForm-field">
                  <span className="admissionForm-label">Legal name</span>
                  <input className="admissionForm-input" type="text" name="childLegalName" autoComplete="name" required />
                </label>
                <label className="admissionForm-field">
                  <span className="admissionForm-label">
                    Preferred name / nickname <span className="admissionForm-labelHint">(optional)</span>
                  </span>
                  <input className="admissionForm-input" type="text" name="childPreferredName" />
                </label>
                <label className="admissionForm-field">
                  <span className="admissionForm-label">Date of birth</span>
                  <input className="admissionForm-input" type="date" name="childDob" required />
                </label>
                <label className="admissionForm-field admissionForm-field--full">
                  <span className="admissionForm-label">
                    Current care <span className="admissionForm-labelHint">(daycare, home, other school…)</span>
                  </span>
                  <textarea className="admissionForm-input admissionForm-textarea admissionForm-textarea--sm" name="currentCare" rows={2} />
                </label>
              </div>
            </section>

            <section className="admissionForm-section" aria-labelledby="admissionForm-enroll-h">
              <h2 id="admissionForm-enroll-h" className="admissionForm-sectionTitle">
                Enrollment preferences
              </h2>
              <div className="admissionForm-grid">
                <label className="admissionForm-field">
                  <span className="admissionForm-label">Program</span>
                  <select className="admissionForm-input admissionForm-select" name="program" defaultValue="" required>
                    <option value="">Choose…</option>
                    <option value="Toddler (16–33 mo)">Toddler (16–33 months)</option>
                    <option value="Preschool (33 mo–6 yr)">Preschool (33 months–6 years)</option>
                    <option value="Not sure - please advise">Not sure - please advise</option>
                  </select>
                </label>
                <label className="admissionForm-field">
                  <span className="admissionForm-label">Schedule interest</span>
                  <select className="admissionForm-input admissionForm-select" name="schedulePref" defaultValue="" required>
                    <option value="">Choose…</option>
                    <option value="Full days (5 days)">Full days (5 days)</option>
                    <option value="Full days (4 days or fewer)">Full days (4 days or fewer)</option>
                    <option value="Half days">Half days</option>
                    <option value="Flexible - discuss with office">Flexible - discuss with office</option>
                  </select>
                </label>
                <label className="admissionForm-field admissionForm-field--full">
                  <span className="admissionForm-label">Desired start</span>
                  <input
                    className="admissionForm-input"
                    type="text"
                    name="start"
                    placeholder="e.g. August 2026, or as soon as space allows"
                    required
                  />
                </label>
                <label className="admissionForm-field">
                  <span className="admissionForm-label">Sibling currently enrolled here?</span>
                  <select className="admissionForm-input admissionForm-select" name="siblingAtSchool" defaultValue="" required>
                    <option value="">Choose…</option>
                    <option value="Yes">Yes</option>
                    <option value="No">No</option>
                  </select>
                </label>
                <label className="admissionForm-field">
                  <span className="admissionForm-label">
                    Sibling name(s) <span className="admissionForm-labelHint">(if yes)</span>
                  </span>
                  <input className="admissionForm-input" type="text" name="siblingNames" />
                </label>
              </div>
            </section>

            <section className="admissionForm-section" aria-labelledby="admissionForm-referral-h">
              <h2 id="admissionForm-referral-h" className="admissionForm-sectionTitle">
                How did you hear about us?
              </h2>
              <div className="admissionForm-grid">
                <label className="admissionForm-field">
                  <span className="admissionForm-label">Source</span>
                  <select className="admissionForm-input admissionForm-select" name="referralSource" defaultValue="" required>
                    <option value="">Choose…</option>
                    <option value="Web search">Web search</option>
                    <option value="Friend or family">Friend or family</option>
                    <option value="Current / alumni family">Current / alumni family</option>
                    <option value="Drive or walk-by">Drive or walk-by</option>
                    <option value="Social media">Social media</option>
                    <option value="Child care referral">Child care referral</option>
                    <option value="Other">Other</option>
                  </select>
                </label>
                <label className="admissionForm-field admissionForm-field--full">
                  <span className="admissionForm-label">
                    Detail <span className="admissionForm-labelHint">(name, site, etc.)</span>
                  </span>
                  <input className="admissionForm-input" type="text" name="referralDetail" placeholder="Optional" />
                </label>
              </div>
            </section>

            <section className="admissionForm-section" aria-labelledby="admissionForm-health-h">
              <h2 id="admissionForm-health-h" className="admissionForm-sectionTitle">
                Health &amp; learning <span className="admissionForm-labelHint">(optional)</span>
              </h2>
              <div className="admissionForm-grid">
                <label className="admissionForm-field admissionForm-field--full">
                  <span className="admissionForm-label">Allergies, medications, or health notes</span>
                  <textarea className="admissionForm-input admissionForm-textarea" name="healthNotes" rows={3} />
                </label>
                <label className="admissionForm-field admissionForm-field--full">
                  <span className="admissionForm-label">IEP, 504, or learning support we should know about</span>
                  <textarea className="admissionForm-input admissionForm-textarea" name="learningNotes" rows={3} />
                </label>
              </div>
            </section>

            <section className="admissionForm-section" aria-labelledby="admissionForm-more-h">
              <h2 id="admissionForm-more-h" className="admissionForm-sectionTitle">
                Anything else?
              </h2>
              <label className="admissionForm-field admissionForm-field--full">
                <span className="admissionForm-label">
                  Goals, questions, or special circumstances <span className="admissionForm-labelHint">(optional)</span>
                </span>
                <textarea className="admissionForm-input admissionForm-textarea" name="message" rows={4} />
              </label>
            </section>

            {submitMessage ? (
              <p className="formFeedback formFeedback--success" role="status">
                {submitMessage}
              </p>
            ) : null}
            {submitError ? (
              <p className="formFeedback formFeedback--error" role="alert">
                {submitError}
              </p>
            ) : null}
            <MathChallengeField
              idPrefix="admission-math"
              questionText={mathChallenge.questionText}
              answer={mathChallenge.answer}
              onAnswerChange={mathChallenge.setAnswer}
              error={mathChallenge.error}
            />
            <div className="admissionForm-actions">
              <button type="submit" className="admissionForm-submit" disabled={submitting}>
                {submitting ? "Sending…" : "Submit application"}
              </button>
              <p className="admissionForm-note">
                Official paperwork may still be required after we respond. Questions?{" "}
                <a href="tel:+17635461421">(763) 546-1421</a>
                {" · "}
                <a href="mailto:info@forestviewmontessori.org">info@forestviewmontessori.org</a>
              </p>
            </div>
          </form>
        </div>
      </div>

      <SiteFooter />
    </main>
  );
}

function ParentsTestimonialsSlider() {
  const count = PARENT_TESTIMONIALS.length;
  const [active, setActive] = useState(0);

  function goPrev() {
    setActive((i) => (i - 1 + count) % count);
  }

  function goNext() {
    setActive((i) => (i + 1) % count);
  }

  const t = PARENT_TESTIMONIALS[active];

  return (
    <section
      className="admissionsTestimonials"
      id="admissions-testimonials"
      aria-labelledby="admissions-testimonials-h"
    >
      <div className="aboutPage-inner admissionsTestimonials-inner">
        <div className="admissionsTestimonials-shell">
          <div className="admissionsTestimonials-layout">
            <div className="admissionsTestimonials-intro">
              <p className="admissionsTestimonials-kicker">
                <HeartHandshake size={18} strokeWidth={1.75} aria-hidden className="admissionsTestimonials-kickerIcon" />
                From families like yours
              </p>
              <h2 id="admissions-testimonials-h" className="admissionsTestimonials-title">
                Testimonials
              </h2>
              <p className="admissionsTestimonials-lead">
                Themes we hear again and again - shortened and anonymized. On a tour, ask us to connect you with current
                parents if you’d like a direct conversation.
              </p>
            </div>

            <div className="admissionsTestimonials-stage">
              <div className="admissionsTestimonials-card" role="region" aria-label="Family perspectives">
                <blockquote key={active} className="admissionsTestimonials-quoteBlock" aria-live="polite">
                  <p className="admissionsTestimonials-quote">{t.quote}</p>
                  <footer className="admissionsTestimonials-attrib">
                    <cite className="admissionsTestimonials-cite">{t.attribution}</cite>
                  </footer>
                </blockquote>

                <div className="admissionsTestimonials-toolbar">
                  <p className="admissionsTestimonials-index" aria-live="polite">
                    <span className="admissionsTestimonials-indexNum">{active + 1}</span>
                    <span className="admissionsTestimonials-indexSep">/</span>
                    <span>{count}</span>
                  </p>

                  <div className="admissionsTestimonials-nav">
                    <button
                      type="button"
                      className="admissionsTestimonials-navBtn"
                      onClick={goPrev}
                      aria-label="Previous quote"
                    >
                      <ChevronLeft size={20} strokeWidth={2.25} aria-hidden />
                    </button>

                    <div className="admissionsTestimonials-dots">
                      {PARENT_TESTIMONIALS.map((_, i) => (
                        <button
                          key={i}
                          type="button"
                          aria-current={i === active ? "true" : undefined}
                          aria-label={`Quote ${i + 1} of ${count}`}
                          className={`admissionsTestimonials-dot ${i === active ? "is-active" : ""}`}
                          onClick={() => setActive(i)}
                        />
                      ))}
                    </div>

                    <button
                      type="button"
                      className="admissionsTestimonials-navBtn"
                      onClick={goNext}
                      aria-label="Next quote"
                    >
                      <ChevronRight size={20} strokeWidth={2.25} aria-hidden />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function AdmissionsPage() {
  useEffect(() => {
    const scrollFromHash = () => {
      const sectionId = getAdmissionsSectionIdFromHash();
      if (!sectionId) return;
      scrollToAdmissionsSection(sectionId);
    };

    scrollFromHash();
    window.addEventListener("hashchange", scrollFromHash);
    return () => window.removeEventListener("hashchange", scrollFromHash);
  }, []);

  return (
    <main id="top" className="aboutPage admissionsPage">
      <div className="aboutPage-top">
        <SiteHeader />
      </div>

      <header className="admissionsHero">
        <div className="admissionsHero-media" aria-hidden="true">
          <img src={classroomPhoto} alt="" />
          <div className="admissionsHero-overlay" />
        </div>
        <div className="admissionsHero-inner">
          <p className="admissionsHero-kicker">Child care admissions</p>
          <h1 className="admissionsHero-title">Admissions</h1>
          <p className="admissionsHero-lead">
            {CHILD_CARE_TAGLINE} — rolling enrollment for {PROGRAMS_LABEL}, personal guidance, and classrooms where your
            child is truly known. Start with a conversation; we&apos;ll walk with you through every step.
          </p>
          <div className="admissionsHero-actions">
            <a
              href="mailto:info@forestviewmontessori.org?subject=Forestview%20Montessori%20inquiry"
              className="admissionsHero-cta admissionsHero-cta--primary"
            >
              Email the office
            </a>
            <a href={ADMISSIONS_PROCESS_HREF} className="admissionsHero-cta admissionsHero-cta--ghost">
              See how enrollment works
            </a>
          </div>
        </div>
      </header>

      <ExperienceProgramsBlock extraClass="admissionsPage-experience" showVideo={false} />

      <section className="admissionsProcess" id="admissions-process" aria-labelledby="admissions-process-h">
        <div className="admissionsProcess-surface">
          <div className="aboutPage-inner">
            <header className="admissionsProcess-head">
              <p className="aboutPage-eyebrow admissionsProcess-eyebrow">The path</p>
              <h2 id="admissions-process-h" className="admissionsProcess-title">
                <a href={ADMISSIONS_APPLY_HREF} className="admissionsProcess-titleLink">
                  Your admission process
                </a>
              </h2>
              <p className="admissionsProcess-deck">
                We welcome {PROGRAMS_LABEL} families to our Montessori child care program throughout the year. Follow
                these steps - or call the office and we&apos;ll guide you personally from day one.
              </p>
            </header>

            <div className="admissionsProcess-layout">
              <div className="admissionsProcess-main">
                <div className="admissionsProcess-rolling">
                  <a href={ADMISSION_FORM_HREF} className="admissionsProcess-rollingLabel">
                    Rolling enrollment
                  </a>
                  <p>
                    {ADMISSION_ROLLING_OVERVIEW}{" "}
                    <a href={ADMISSION_FORM_HREF} className="admissionsProcess-inlineLink">
                      Start your application
                    </a>
                    .
                  </p>
                </div>

                <h3 className="admissionsProcess-stepsHeading">Six steps to enrollment</h3>
                <ol className="admissionsProcess-timeline">
                  {ADMISSION_PROCESS_STEPS.map((step, i) => (
                    <li key={step.label} className="admissionsProcess-timelineItem">
                      <div className="admissionsProcess-timelineAxis" aria-hidden="true">
                        <span className="admissionsProcess-stepIcon">
                          <step.Icon size={22} strokeWidth={1.65} aria-hidden />
                        </span>
                      </div>
                      <div className="admissionsProcess-stepCard">
                        <span className="admissionsProcess-stepMeta">Step {i + 1} of 6</span>
                        <h3 className="admissionsProcess-stepTitle">{step.label}</h3>
                        <p>{step.body}</p>
                      </div>
                    </li>
                  ))}
                </ol>
                <p className="admissionsProcess-legal">
                  <em>
                    {SCHOOL_NAME} admits children and families of any race, color, national and ethnic origin,
                    religion, disability, or sex to all rights and programs offered. We do not discriminate in the
                    administration of our educational or admissions policies.
                  </em>
                </p>
              </div>

              <aside className="admissionsProcess-aside" aria-label="Dates and contact">
                <div className="admissionsAside-card">
                  <div className="admissionsAside-cardHead">
                    <CalendarDays size={22} strokeWidth={1.6} className="admissionsAside-icon" aria-hidden />
                    <h2>Important dates</h2>
                  </div>
                  <ul>
                    <li>
                      <strong>Year-round</strong>
                      <span>Inquiries and tours as space allows.</span>
                    </li>
                    <li>
                      <strong>Fall enrollment</strong>
                      <span>Contact the office for current windows and wait lists for the next school year.</span>
                    </li>
                    <li>
                      <strong>Before your start</strong>
                      <span>Completed forms and registration fee are due prior to your child&apos;s first day.</span>
                    </li>
                  </ul>
                </div>
                <div className="admissionsAside-card admissionsAside-card--accent">
                  <div className="admissionsAside-cardHead">
                    <Phone size={22} strokeWidth={1.65} className="admissionsAside-icon" aria-hidden />
                    <h2>Reach the office</h2>
                  </div>
                  <p>We&apos;re happy to talk through child care schedules, rates, or classroom fit for Toddler &amp; Preschool.</p>
                  <a href="tel:+17635461421" className="admissionsAside-link">
                    (763) 546-1421
                  </a>
                  <a href="mailto:info@forestviewmontessori.org" className="admissionsAside-link">
                    info@forestviewmontessori.org
                  </a>
                </div>
              </aside>
            </div>
          </div>
        </div>
      </section>

      <section className="admissionsApply" id="admissions-apply" aria-labelledby="admissions-apply-h">
        <div className="aboutPage-inner">
          <div className="admissionsApply-layout">
            <div className="admissionsApply-main">
              <header className="admissionsApply-intro">
                <p className="aboutPage-eyebrow admissionsApply-eyebrow">Ready when you are</p>
                <h2 id="admissions-apply-h" className="admissionsApply-headline">
                  Start your application
                </h2>
                <p className="admissionsApply-lead">
                  When you&apos;re ready to enroll in Montessori child care for {PROGRAMS_LABEL}, contact us - we&apos;ll
                  send enrollment materials and walk you through every page.
                </p>
              </header>
              <ul className="admissionsApply-checklist">
                <li>
                  <span className="admissionsApply-checkIcon" aria-hidden>
                    <Check size={18} strokeWidth={2.5} />
                  </span>
                  <div className="admissionsApply-checkCopy">
                    <span className="admissionsApply-checkTitle">New families</span>
                    <p>Email or call to request an application and schedule a visit.</p>
                  </div>
                </li>
                <li>
                  <span className="admissionsApply-checkIcon" aria-hidden>
                    <Check size={18} strokeWidth={2.5} />
                  </span>
                  <div className="admissionsApply-checkCopy">
                    <span className="admissionsApply-checkTitle">Returning families</span>
                    <p>Contact the office for re-enrollment or sibling paperwork.</p>
                  </div>
                </li>
              </ul>
              <div className="admissionsApply-actions">
                <a
                  href="mailto:info@forestviewmontessori.org?subject=Forestview%20Montessori%20application"
                  className="admissionsApply-btn admissionsApply-btn--primary"
                >
                  Begin by email
                </a>
                <a href="#/admissions" className="admissionsApply-btn admissionsApply-btn--secondary">
                  Tuition &amp; schedule
                </a>
              </div>
            </div>
            <aside className="admissionsApply-aside" aria-label="Help with your application">
              <div className="admissionsApply-asideTop">
                <CircleHelp size={22} strokeWidth={1.65} className="admissionsApply-asideIcon" aria-hidden />
                <h3>Questions?</h3>
              </div>
              <p className="admissionsApply-asideText">
                If you&apos;re unsure which Toddler &amp; Preschool classroom fits your child&apos;s age or child care
                schedule, we&apos;ll help you choose the right path.
              </p>
              <div className="admissionsApply-asideActions">
                <a href={ADMISSION_FORM_HREF} className="admissionsApply-asideApply">
                  Apply now
                </a>
                <a href="#/contact" className="admissionsApply-asideCta">
                  Contact &amp; location
                </a>
              </div>
            </aside>
          </div>
        </div>
      </section>

      <ParentsTestimonialsSlider />

      <SiteFooter />
    </main>
  );
}

function HomeWhyChooseSection() {
  return (
    <section className="aboutPage-whyUs homeWhyChoose" id="why-choose" aria-labelledby="home-why-choose-h">
      <div className="aboutPage-inner aboutPage-whyUsInner">
        <p className="aboutPage-eyebrow aboutPage-whyUsEyebrow">Why choose us</p>
        <h2 id="home-why-choose-h" className="aboutPage-whyUsHeading homeWhyChoose-heading">
          Why Choose {SCHOOL_NAME}
        </h2>
        <p className="aboutPage-whyUsLead homeWhyChoose-lead">
          Choosing early child care is a big decision. Here&apos;s what draws Plymouth families - and what
          they tell us keeps them with us year after year.
        </p>
        <ul className="aboutPage-whyUsGrid homeWhyChoose-grid">
          {ABOUT_WHY_US.map(({ Icon, title, text }) => (
            <li key={title} className="aboutPage-whyUsCard homeWhyChoose-card">
              <Icon className="aboutPage-whyUsIcon" size={24} strokeWidth={1.65} aria-hidden />
              <h3>{title}</h3>
              <p>{text}</p>
            </li>
          ))}
        </ul>
        <div className="homeWhyChoose-actions">
          <a href={SCHEDULE_TOUR_HREF} className="ctaPrimary">
            Schedule a tour
          </a>
          <a href="#/about" className="ctaSecondary">
            Learn more about us
          </a>
        </div>
      </div>
    </section>
  );
}

function HomePage() {
  const mainRef = useRef(null);
  const yearsOperating = getYearsOperating();
  const featureCards = buildFeatureCards(yearsOperating);

  useLayoutEffect(() => {
    let cancelled = false;
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        if (!cancelled) scrollToHomeInPageHash();
      });
    });
    return () => {
      cancelled = true;
    };
  }, []);

  useLayoutEffect(() => {
    const root = mainRef.current;
    if (!root) return undefined;

    if (typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      return undefined;
    }

    const ctx = gsap.context(() => {
      const heroEase = "power3.out";

      gsap.timeline({ defaults: { ease: heroEase } })
        .from(".siteLogo", { y: -22, opacity: 0, duration: 0.65 }, 0)
        .from(".nav", { y: -14, opacity: 0, duration: 0.55 }, 0.06)
        .from(".heroText h1", { y: 34, opacity: 0, duration: 0.75 }, 0.14)
        .from(".heroText p", { y: 20, opacity: 0, duration: 0.6 }, 0.24)
        .from(".heroActions", { y: 18, opacity: 0, duration: 0.55 }, 0.32)
        .from(".heroPanel", { x: 48, opacity: 0, scale: 0.97, duration: 0.95 }, 0.12)
        .from(".heroBadge", { scale: 0.82, opacity: 0, duration: 0.55, ease: "back.out(1.5)" }, 0.55);

      gsap.from(".promise-lead", {
        scrollTrigger: { trigger: ".promise-lead", start: "top 86%", toggleActions: "play none none none" },
        y: 44,
        opacity: 0,
        duration: 0.85,
        ease: "power2.out",
      });

      gsap.from(".promise-sub", {
        scrollTrigger: { trigger: ".promise-sub", start: "top 88%", toggleActions: "play none none none" },
        y: 30,
        opacity: 0,
        duration: 0.75,
        ease: "power2.out",
      });

      gsap.from(".featureCard", {
        scrollTrigger: { trigger: ".cardGrid", start: "top 82%", toggleActions: "play none none none" },
        y: 56,
        opacity: 0,
        duration: 0.68,
        stagger: 0.055,
        ease: "power2.out",
      });

      gsap.from(".ctaBlock-animate", {
        scrollTrigger: { trigger: ".ctaBlock-animate", start: "top 86%", toggleActions: "play none none none" },
        y: 36,
        opacity: 0,
        duration: 0.75,
        ease: "power2.out",
      });

      gsap.from(".quoteText-inner", {
        scrollTrigger: { trigger: ".quoteBand", start: "top 72%", toggleActions: "play none none none" },
        y: 48,
        opacity: 0,
        duration: 0.9,
        ease: "power2.out",
      });

      const experienceVideoEl = document.querySelector(".experienceVideoBg");
      if (experienceVideoEl) {
        gsap.from(experienceVideoEl, {
          scrollTrigger: { trigger: ".experience", start: "top 82%", toggleActions: "play none none none" },
          opacity: 0,
          duration: 1,
          ease: "power2.out",
        });
      }

      const experienceInnerEl = document.querySelector(".experienceInner");
      if (experienceInnerEl) {
        gsap.from(".exp-right", {
          scrollTrigger: { trigger: experienceInnerEl, start: "top 76%", toggleActions: "play none none none" },
          y: 28,
          opacity: 0,
          duration: 0.85,
          ease: "power2.out",
        });
      }

      gsap.from(".homeWhyChoose-heading, .homeWhyChoose-lead", {
        scrollTrigger: { trigger: ".homeWhyChoose", start: "top 85%", toggleActions: "play none none none" },
        y: 28,
        opacity: 0,
        duration: 0.75,
        stagger: 0.1,
        ease: "power2.out",
      });

      gsap.from(".homeWhyChoose-card", {
        scrollTrigger: { trigger: ".homeWhyChoose-grid", start: "top 88%", toggleActions: "play none none none" },
        y: 44,
        opacity: 0,
        duration: 0.65,
        stagger: 0.08,
        ease: "power2.out",
      });

      gsap.from(".homeWhyChoose-actions", {
        scrollTrigger: { trigger: ".homeWhyChoose-actions", start: "top 92%", toggleActions: "play none none none" },
        y: 20,
        opacity: 0,
        duration: 0.6,
        ease: "power2.out",
      });

      gsap.from(".footerInner", {
        scrollTrigger: { trigger: "#support", start: "top 88%", toggleActions: "play none none none" },
        y: 32,
        opacity: 0,
        duration: 0.75,
        ease: "power2.out",
      });
    }, root);

    return () => {
      ctx.revert();
    };
  }, []);

  return (
    <main id="top" ref={mainRef}>
      <SiteChrome />
      <HomeTourPopup />
      <section className="hero">
        <SiteHeader />

        <div className="heroContent">
          <div className="heroText">
            <h1>{CHILD_CARE_TAGLINE}</h1>
            <p>{HERO_SUBHEADLINE}</p>
          </div>
          <div className="heroVisual">
            <div className="heroPanel">
              <HeroImageSlider />
            </div>
            <div className="heroBadge" aria-label="Serving Plymouth families since 1995">
              <span className="heroBadge-label">Since</span>
              <strong className="heroBadge-year">1995</strong>
            </div>
          </div>
          <div className="heroActions">
            <a href={homeSectionHref("programs")} className="ctaPrimary">
              Explore programs
            </a>
            <a href={SCHEDULE_TOUR_HREF} className="ctaSecondary">
              Schedule a tour
            </a>
          </div>
        </div>
      </section>

      <section className="promise" id="highlights">
        <div className="sectionInner">
          <h2 className="promise-lead">Respect, belonging, and growth - here in Plymouth.</h2>
          <p className="eyebrow promise-sub">
            {PROGRAMS_LABEL} child care: caring guides, calm classrooms, and families who feel part of one community.
          </p>
          <div className="cardGrid">
            {featureCards.map((item, index) => (
              <FeatureCard key={item.title ?? item.area} item={item} index={index} />
            ))}
          </div>
          <div className="ctaBlock ctaBlock-animate">
            <h2>
              Ready to <em>visit us?</em>
            </h2>
            <a href={homeSectionHref("programs")} className="ctaPrimary">
              See our programs
            </a>
          </div>
        </div>
      </section>

      <section className="quoteBand">
        <div className="quoteText">
          <div className="quoteText-inner">
            <h2 className="quoteTagline">Where children grow with confidence, curiosity, and care - in Plymouth.</h2>
            <p className="quoteLead">
              {PROGRAMS_LABEL} child care: calm classrooms, caring guides, and a community that knows your child by name.
            </p>
            <a href={homeSectionHref("programs")} className="quoteCta">
              View programs by age
            </a>
          </div>
        </div>
      </section>

      <ExperienceProgramsBlock programLayout="tabs" />

      <HomeWhyChooseSection />

      <SiteFooter />
    </main>
  );
}

function App() {
  const [route, setRoute] = useState(getRouteFromHash);

  useEffect(() => {
    redirectLegacyTourHash();
    const onHash = () => {
      redirectLegacyTourHash();
      setRoute(getRouteFromHash());
      requestAnimationFrame(() => requestAnimationFrame(scrollToHomeInPageHash));
    };
    window.addEventListener("hashchange", onHash);
    return () => window.removeEventListener("hashchange", onHash);
  }, []);

  useEffect(() => {
    if (route === "admissions" && getAdmissionsSectionIdFromHash()) return;
    if (
      route === "about" ||
      route === "admissions" ||
      route === "admission-form" ||
      route === "rules" ||
      route === "syllabus" ||
      route === "blog" ||
      route === "blog-post" ||
      route === "contact" ||
      route === "careers" ||
      route === "tour-request" ||
      route === "admin"
    )
      window.scrollTo(0, 0);
  }, [route]);

  if (route === "admin") {
    return <AdminPage />;
  }

  if (route === "tour-request") {
    return (
      <>
        <SiteChrome />
        <TourRequestPage />
      </>
    );
  }

  if (route === "contact") {
    return (
      <>
        <SiteChrome />
        <ContactPage />
      </>
    );
  }

  if (route === "careers") {
    return (
      <>
        <SiteChrome />
        <CareersPage />
      </>
    );
  }

  if (route === "blog") {
    return (
      <>
        <SiteChrome />
        <BlogPage />
      </>
    );
  }

  if (route === "blog-post") {
    return (
      <>
        <SiteChrome />
        <BlogPostPage />
      </>
    );
  }

  if (route === "about") {
    return (
      <>
        <SiteChrome />
        <AboutPage />
      </>
    );
  }

  if (route === "rules") {
    return (
      <>
        <SiteChrome />
        <RulesRegulationsPage />
      </>
    );
  }

  if (route === "syllabus") {
    return (
      <>
        <SiteChrome />
        <SyllabusPage />
      </>
    );
  }

  if (route === "admission-form") {
    return (
      <>
        <SiteChrome />
        <AdmissionFormPage />
      </>
    );
  }

  if (route === "admissions") {
    return (
      <>
        <SiteChrome />
        <AdmissionsPage />
      </>
    );
  }

  return <HomePage />;
}

export default App;
