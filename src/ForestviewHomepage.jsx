import { useState, useEffect, useRef } from "react";
import schoolLogo from "./assets/forestviewschoollogo.png";

const LOGO_URL = schoolLogo;

const NAV_LINKS = ["Home", "About", "Programs", "Admissions", "Contact"];

const PROGRAMS = [
  {
    icon: "🌱",
    title: "Toddler Program",
    age: "18 months – 3 years",
    desc: "A warm, nurturing environment where the youngest learners explore the world through sensory play, language, and movement at their own pace.",
    color: "#e8f5e9",
    accent: "#2e7d32",
  },
  {
    icon: "🌿",
    title: "Preschool Program",
    age: "3 – 6 years",
    desc: "Child-led discovery using authentic Montessori materials that build independence, concentration, and a lifelong love of learning.",
    color: "#f1f8e9",
    accent: "#388e3c",
  },
  {
    icon: "🍃",
    title: "After-School Care",
    age: "3 – 6 years",
    desc: "Extended day options with enriching activities in art, music, and outdoor exploration in a safe, caring setting.",
    color: "#e8f5e9",
    accent: "#1b5e20",
  },
];

const STEPS = [
  { num: "01", title: "Inquire", desc: "Fill out our online inquiry form to start your family's Montessori journey with us." },
  { num: "02", title: "Tour", desc: "Schedule a personal school tour and meet our passionate, trained educators." },
  { num: "03", title: "Apply", desc: "Submit your application and supporting documents through our simple online portal." },
  { num: "04", title: "Enroll", desc: "Receive your acceptance and complete enrollment to secure your child's spot." },
];

export default function ForestviewHomepage() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const heroRef = useRef(null);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 60);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const scrollTo = (id) => {
    document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });
    setMenuOpen(false);
  };

  return (
    <div style={{ fontFamily: "'Cormorant Garamond', 'Georgia', serif", color: "#1b2e1b", background: "#fff", overflowX: "hidden" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;0,400;0,600;0,700;1,400&family=Jost:wght@300;400;500;600&display=swap');

        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

        html { scroll-behavior: smooth; }

        .nav-link {
          font-family: 'Jost', sans-serif;
          font-size: 11px;
          font-weight: 600;
          letter-spacing: 2.5px;
          text-transform: uppercase;
          color: #1b2e1b;
          text-decoration: none;
          cursor: pointer;
          position: relative;
          padding-bottom: 3px;
          transition: color 0.2s;
        }
        .nav-link::after {
          content: '';
          position: absolute;
          bottom: 0; left: 0;
          width: 0; height: 1.5px;
          background: #2e7d32;
          transition: width 0.3s;
        }
        .nav-link:hover { color: #2e7d32; }
        .nav-link:hover::after { width: 100%; }

        .nav-scrolled { background: rgba(255,255,255,0.97) !important; box-shadow: 0 2px 24px rgba(0,0,0,0.07) !important; }

        .enroll-btn {
          font-family: 'Jost', sans-serif;
          font-size: 10px;
          font-weight: 700;
          letter-spacing: 2.5px;
          text-transform: uppercase;
          background: #1b5e20;
          color: #fff;
          border: none;
          padding: 10px 22px;
          cursor: pointer;
          border-radius: 2px;
          transition: background 0.2s, transform 0.15s;
        }
        .enroll-btn:hover { background: #2e7d32; transform: translateY(-1px); }

        .hero-section {
          min-height: 100vh;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          background: linear-gradient(170deg, #f9fdf9 0%, #edf7ed 55%, #d8eed8 100%);
          position: relative;
          text-align: center;
          padding: 120px 24px 80px;
          overflow: hidden;
        }
        .hero-section::before {
          content: '';
          position: absolute;
          top: -80px; right: -80px;
          width: 500px; height: 500px;
          border-radius: 50%;
          background: radial-gradient(circle, rgba(76,175,80,0.08) 0%, transparent 70%);
          pointer-events: none;
        }
        .hero-section::after {
          content: '';
          position: absolute;
          bottom: -60px; left: -60px;
          width: 400px; height: 400px;
          border-radius: 50%;
          background: radial-gradient(circle, rgba(27,94,32,0.06) 0%, transparent 70%);
          pointer-events: none;
        }

        .hero-logo { width: min(340px, 80vw); animation: fadeUp 0.9s ease both; }

        .hero-tagline {
          font-family: 'Cormorant Garamond', serif;
          font-size: clamp(18px, 3.5vw, 26px);
          font-weight: 300;
          font-style: italic;
          color: #3a5c3a;
          margin-top: 18px;
          letter-spacing: 1px;
          animation: fadeUp 0.9s 0.2s ease both;
        }

        .hero-divider {
          width: 60px; height: 1.5px;
          background: #2e7d32;
          margin: 28px auto;
          animation: fadeUp 0.9s 0.35s ease both;
        }

        .hero-desc {
          font-family: 'Jost', sans-serif;
          font-size: clamp(14px, 2vw, 16px);
          font-weight: 300;
          color: #4a6a4a;
          max-width: 480px;
          line-height: 1.8;
          animation: fadeUp 0.9s 0.45s ease both;
        }

        .hero-cta-row {
          display: flex; gap: 16px; flex-wrap: wrap; justify-content: center;
          margin-top: 36px;
          animation: fadeUp 0.9s 0.6s ease both;
        }

        .cta-primary {
          font-family: 'Jost', sans-serif;
          font-size: 11px; font-weight: 700;
          letter-spacing: 2.5px; text-transform: uppercase;
          background: #1b5e20; color: #fff;
          border: none; padding: 14px 32px;
          cursor: pointer; border-radius: 2px;
          transition: background 0.2s, transform 0.15s, box-shadow 0.2s;
          box-shadow: 0 4px 18px rgba(27,94,32,0.25);
        }
        .cta-primary:hover { background: #2e7d32; transform: translateY(-2px); box-shadow: 0 8px 26px rgba(27,94,32,0.3); }

        .cta-secondary {
          font-family: 'Jost', sans-serif;
          font-size: 11px; font-weight: 600;
          letter-spacing: 2.5px; text-transform: uppercase;
          background: transparent; color: #1b5e20;
          border: 1.5px solid #1b5e20; padding: 14px 32px;
          cursor: pointer; border-radius: 2px;
          transition: background 0.2s, color 0.2s, transform 0.15s;
        }
        .cta-secondary:hover { background: #1b5e20; color: #fff; transform: translateY(-2px); }

        .leaf-row {
          display: flex; gap: 8px; justify-content: center;
          margin-top: 52px;
          animation: fadeUp 0.9s 0.75s ease both;
        }
        .leaf-dot {
          width: 8px; height: 8px; border-radius: 50%;
          background: #a5d6a7;
        }
        .leaf-dot:nth-child(2) { background: #66bb6a; }
        .leaf-dot:nth-child(3) { background: #2e7d32; }
        .leaf-dot:nth-child(4) { background: #66bb6a; }
        .leaf-dot:nth-child(5) { background: #a5d6a7; }

        .section { padding: 96px 24px; }

        .section-label {
          font-family: 'Jost', sans-serif;
          font-size: 10px; font-weight: 700;
          letter-spacing: 4px; text-transform: uppercase;
          color: #2e7d32; margin-bottom: 12px;
        }

        .section-title {
          font-family: 'Cormorant Garamond', serif;
          font-size: clamp(32px, 5vw, 52px);
          font-weight: 600;
          color: #1b2e1b;
          line-height: 1.15;
        }

        .section-body {
          font-family: 'Jost', sans-serif;
          font-size: 15px; font-weight: 300;
          line-height: 1.9; color: #4a5e4a;
        }

        .about-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 80px;
          align-items: center;
          max-width: 1100px;
          margin: 0 auto;
        }
        @media (max-width: 768px) {
          .about-grid { grid-template-columns: 1fr; gap: 40px; }
          .programs-grid { grid-template-columns: 1fr !important; }
          .steps-grid { grid-template-columns: 1fr 1fr !important; }
          .contact-grid { grid-template-columns: 1fr !important; }
          .nav-desktop { display: none !important; }
          .hamburger { display: flex !important; }
        }

        .about-image-box {
          position: relative;
        }
        .about-img-placeholder {
          width: 100%; aspect-ratio: 4/3;
          background: linear-gradient(135deg, #c8e6c9 0%, #a5d6a7 100%);
          border-radius: 4px;
          display: flex; align-items: center; justify-content: center;
          font-size: 80px;
          box-shadow: 0 20px 60px rgba(27,94,32,0.15);
        }
        .about-badge {
          position: absolute;
          bottom: -20px; right: -20px;
          background: #1b5e20; color: #fff;
          padding: 18px 22px;
          border-radius: 4px;
          text-align: center;
          box-shadow: 0 8px 28px rgba(27,94,32,0.3);
        }
        .about-badge-num {
          font-family: 'Cormorant Garamond', serif;
          font-size: 38px; font-weight: 700;
          line-height: 1;
        }
        .about-badge-text {
          font-family: 'Jost', sans-serif;
          font-size: 9px; font-weight: 600;
          letter-spacing: 2px; text-transform: uppercase;
          opacity: 0.85; margin-top: 4px;
        }

        .value-list { list-style: none; margin-top: 28px; display: flex; flex-direction: column; gap: 14px; }
        .value-item {
          display: flex; align-items: flex-start; gap: 12px;
          font-family: 'Jost', sans-serif;
          font-size: 14px; font-weight: 400; color: #3a5c3a;
        }
        .value-dot {
          width: 6px; height: 6px; border-radius: 50%;
          background: #2e7d32; margin-top: 6px; flex-shrink: 0;
        }

        .programs-section {
          background: #f4fbf4;
          padding: 96px 24px;
        }
        .programs-grid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 28px;
          max-width: 1100px;
          margin: 52px auto 0;
        }
        .program-card {
          background: #fff;
          border-radius: 4px;
          padding: 40px 32px;
          border: 1px solid #e8f5e9;
          transition: transform 0.25s, box-shadow 0.25s;
          cursor: default;
        }
        .program-card:hover { transform: translateY(-6px); box-shadow: 0 20px 50px rgba(27,94,32,0.12); }
        .program-icon { font-size: 38px; margin-bottom: 18px; }
        .program-title {
          font-family: 'Cormorant Garamond', serif;
          font-size: 24px; font-weight: 600; color: #1b2e1b;
          margin-bottom: 6px;
        }
        .program-age {
          font-family: 'Jost', sans-serif;
          font-size: 10px; font-weight: 700;
          letter-spacing: 2px; text-transform: uppercase;
          color: #2e7d32; margin-bottom: 16px;
        }
        .program-desc {
          font-family: 'Jost', sans-serif;
          font-size: 14px; font-weight: 300;
          line-height: 1.8; color: #4a5e4a;
        }

        .admissions-section {
          padding: 96px 24px;
          max-width: 1100px;
          margin: 0 auto;
        }
        .steps-grid {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 32px;
          margin-top: 52px;
        }
        .step-card {
          position: relative;
          padding: 32px 24px;
          border-top: 2px solid #e8f5e9;
          transition: border-color 0.2s;
        }
        .step-card:hover { border-color: #2e7d32; }
        .step-num {
          font-family: 'Cormorant Garamond', serif;
          font-size: 52px; font-weight: 700;
          color: #e8f5e9; line-height: 1;
          margin-bottom: 12px;
        }
        .step-title {
          font-family: 'Cormorant Garamond', serif;
          font-size: 22px; font-weight: 600;
          color: #1b2e1b; margin-bottom: 10px;
        }
        .step-desc {
          font-family: 'Jost', sans-serif;
          font-size: 13px; font-weight: 300;
          line-height: 1.75; color: #5a6e5a;
        }

        .admissions-cta-box {
          background: linear-gradient(135deg, #1b5e20 0%, #2e7d32 100%);
          border-radius: 6px;
          padding: 56px 48px;
          text-align: center;
          margin-top: 60px;
          box-shadow: 0 20px 60px rgba(27,94,32,0.25);
        }
        .admissions-cta-box h3 {
          font-family: 'Cormorant Garamond', serif;
          font-size: clamp(26px, 4vw, 38px);
          font-weight: 600;
          color: #fff;
          margin-bottom: 14px;
        }
        .admissions-cta-box p {
          font-family: 'Jost', sans-serif;
          font-size: 14px; font-weight: 300;
          color: rgba(255,255,255,0.8);
          max-width: 460px; margin: 0 auto 32px;
          line-height: 1.8;
        }
        .cta-white {
          font-family: 'Jost', sans-serif;
          font-size: 11px; font-weight: 700;
          letter-spacing: 2.5px; text-transform: uppercase;
          background: #fff; color: #1b5e20;
          border: none; padding: 14px 34px;
          cursor: pointer; border-radius: 2px;
          transition: background 0.2s, transform 0.15s;
        }
        .cta-white:hover { background: #f1f8e9; transform: translateY(-2px); }

        .contact-section {
          background: #f9fdf9;
          padding: 96px 24px;
        }
        .contact-inner {
          max-width: 1100px;
          margin: 0 auto;
        }
        .contact-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 64px;
          margin-top: 52px;
          align-items: start;
        }
        .contact-info-item {
          display: flex; gap: 16px; align-items: flex-start;
          margin-bottom: 30px;
        }
        .contact-icon {
          width: 42px; height: 42px;
          background: #e8f5e9;
          border-radius: 50%;
          display: flex; align-items: center; justify-content: center;
          font-size: 18px; flex-shrink: 0;
        }
        .contact-info-label {
          font-family: 'Jost', sans-serif;
          font-size: 10px; font-weight: 700;
          letter-spacing: 2.5px; text-transform: uppercase;
          color: #2e7d32; margin-bottom: 4px;
        }
        .contact-info-value {
          font-family: 'Cormorant Garamond', serif;
          font-size: 18px; color: #1b2e1b;
        }

        .form-field {
          width: 100%;
          font-family: 'Jost', sans-serif;
          font-size: 14px; font-weight: 300;
          color: #1b2e1b;
          background: #fff;
          border: 1px solid #c8e6c9;
          border-radius: 2px;
          padding: 13px 16px;
          outline: none;
          transition: border-color 0.2s;
          margin-bottom: 16px;
        }
        .form-field:focus { border-color: #2e7d32; }
        .form-field::placeholder { color: #9ab09a; }
        textarea.form-field { resize: vertical; min-height: 110px; }

        .footer {
          background: #0f2210;
          color: rgba(255,255,255,0.7);
          padding: 48px 24px 32px;
          text-align: center;
        }
        .footer-logo-text {
          font-family: 'Cormorant Garamond', serif;
          font-size: 22px; font-weight: 600;
          color: #fff; letter-spacing: 1px;
          margin-bottom: 6px;
        }
        .footer-sub {
          font-family: 'Jost', sans-serif;
          font-size: 10px; font-weight: 500;
          letter-spacing: 3px; text-transform: uppercase;
          color: #66bb6a; margin-bottom: 28px;
        }
        .footer-links {
          display: flex; gap: 28px; justify-content: center;
          flex-wrap: wrap; margin-bottom: 28px;
        }
        .footer-link {
          font-family: 'Jost', sans-serif;
          font-size: 10px; font-weight: 600;
          letter-spacing: 2px; text-transform: uppercase;
          color: rgba(255,255,255,0.5);
          cursor: pointer;
          transition: color 0.2s;
          text-decoration: none;
        }
        .footer-link:hover { color: #66bb6a; }
        .footer-copy {
          font-family: 'Jost', sans-serif;
          font-size: 11px; font-weight: 300;
          color: rgba(255,255,255,0.3);
          border-top: 1px solid rgba(255,255,255,0.08);
          padding-top: 24px; margin-top: 8px;
        }

        .hamburger {
          display: none;
          flex-direction: column; gap: 5px;
          cursor: pointer; background: none; border: none; padding: 4px;
        }
        .hamburger span {
          display: block; width: 22px; height: 1.5px;
          background: #1b2e1b; transition: all 0.3s;
        }

        .mobile-menu {
          position: fixed; top: 0; left: 0; right: 0;
          background: #fff;
          padding: 80px 32px 40px;
          z-index: 999;
          display: flex; flex-direction: column; gap: 28px;
          box-shadow: 0 10px 40px rgba(0,0,0,0.1);
          transform: translateY(-100%);
          transition: transform 0.35s cubic-bezier(0.4, 0, 0.2, 1);
        }
        .mobile-menu.open { transform: translateY(0); }
        .mobile-close {
          position: absolute; top: 20px; right: 24px;
          background: none; border: none; font-size: 24px;
          cursor: pointer; color: #1b2e1b;
        }

        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(22px); }
          to { opacity: 1; transform: translateY(0); }
        }

        .enrolling-banner {
          display: inline-flex; align-items: center; gap: 10px;
          background: #1b5e20; color: #fff;
          font-family: 'Jost', sans-serif;
          font-size: 10px; font-weight: 700;
          letter-spacing: 3px; text-transform: uppercase;
          padding: 9px 22px;
          border-radius: 2px;
          margin-bottom: 32px;
          animation: fadeUp 0.9s 0.1s ease both;
        }
        .enrolling-banner::before, .enrolling-banner::after {
          content: '»'; font-size: 12px; opacity: 0.7;
        }
      `}</style>

      {/* NAV */}
      <nav style={{
        position: "fixed", top: 0, left: 0, right: 0, zIndex: 100,
        padding: "0 40px",
        height: 68,
        display: "flex", alignItems: "center", justifyContent: "space-between",
        background: scrolled ? "rgba(255,255,255,0.97)" : "transparent",
        boxShadow: scrolled ? "0 2px 24px rgba(0,0,0,0.07)" : "none",
        transition: "background 0.3s, box-shadow 0.3s",
      }}>
        {/* Logo in nav */}
        <img src={LOGO_URL} alt="Forestview Montessori" style={{ height: 44, cursor: "pointer", display: "block", objectFit: "contain" }} onClick={() => scrollTo("hero")} />

        {/* Desktop links */}
        <div className="nav-desktop" style={{ display: "flex", gap: 36, alignItems: "center" }}>
          {NAV_LINKS.map(l => (
            <span key={l} className="nav-link" onClick={() => scrollTo(l.toLowerCase())}>{l}</span>
          ))}
          <button className="enroll-btn" onClick={() => scrollTo("admissions")}>Admissions Open</button>
        </div>

        {/* Hamburger */}
        <button className="hamburger" onClick={() => setMenuOpen(true)}>
          <span /><span /><span />
        </button>
      </nav>

      {/* Mobile Menu */}
      <div className={`mobile-menu ${menuOpen ? "open" : ""}`}>
        <button className="mobile-close" onClick={() => setMenuOpen(false)}>✕</button>
        {NAV_LINKS.map(l => (
          <span key={l} className="nav-link" style={{ fontSize: 13 }} onClick={() => scrollTo(l.toLowerCase())}>{l}</span>
        ))}
        <button className="enroll-btn" onClick={() => scrollTo("admissions")}>Admissions Open</button>
      </div>

      {/* HERO */}
      <section id="home" className="hero-section" ref={heroRef}>
        <div className="enrolling-banner">Now Enrolling</div>
        <img src={LOGO_URL} alt="Forestview Montessori" className="hero-logo" />
        <p className="hero-tagline">"Nurturing curious minds, one child at a time."</p>
        <div className="hero-divider" />
        <p className="hero-desc">
          A warm, child-centered Montessori environment where toddlers and preschoolers discover the joy of learning through independence, exploration, and wonder.
        </p>
        <div className="hero-cta-row">
          <button className="cta-primary" onClick={() => scrollTo("admissions")}>Apply Now</button>
          <button className="cta-secondary" onClick={() => scrollTo("about")}>Learn More</button>
        </div>
        <div className="leaf-row">
          {[1,2,3,4,5].map(i => <div key={i} className="leaf-dot" />)}
        </div>
      </section>

      {/* ABOUT */}
      <section id="about" className="section">
        <div className="about-grid">
          <div className="about-image-box">
            <div className="about-img-placeholder">🌳</div>
            <div className="about-badge">
              <div className="about-badge-num">15+</div>
              <div className="about-badge-text">Years of<br />Excellence</div>
            </div>
          </div>
          <div>
            <p className="section-label">Who We Are</p>
            <h2 className="section-title" style={{ marginBottom: 24 }}>
              Where Every Child<br />
              <em style={{ fontStyle: "italic", color: "#2e7d32" }}>Truly Belongs</em>
            </h2>
            <p className="section-body" style={{ marginBottom: 18 }}>
              At Forestview Montessori, we believe childhood is not a race — it is a journey. Founded on the timeless principles of Dr. Maria Montessori, our school offers a loving, prepared environment that honours each child's natural development.
            </p>
            <p className="section-body">
              Our trained educators act as guides, observing and responding to each child's unique pace and interests — fostering deep concentration, intrinsic motivation, and genuine joy in learning.
            </p>
            <ul className="value-list">
              {["Child-led, hands-on learning experiences", "Certified Montessori-trained educators", "Mixed-age classrooms that build community", "Low student-to-teacher ratios for personal attention"].map(v => (
                <li key={v} className="value-item"><span className="value-dot" />{v}</li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      {/* PROGRAMS */}
      <section id="programs" className="programs-section">
        <div style={{ maxWidth: 1100, margin: "0 auto", textAlign: "center" }}>
          <p className="section-label">What We Offer</p>
          <h2 className="section-title">Our Programs</h2>
          <p className="section-body" style={{ maxWidth: 560, margin: "16px auto 0" }}>
            Each program is carefully designed to meet children where they are developmentally, building skills that last a lifetime.
          </p>
        </div>
        <div className="programs-grid">
          {PROGRAMS.map(p => (
            <div key={p.title} className="program-card">
              <div className="program-icon">{p.icon}</div>
              <div className="program-title">{p.title}</div>
              <div className="program-age">{p.age}</div>
              <p className="program-desc">{p.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ADMISSIONS */}
      <section id="admissions" className="admissions-section">
        <div style={{ textAlign: "center" }}>
          <p className="section-label">Join Our Community</p>
          <h2 className="section-title">Admissions Process</h2>
          <p className="section-body" style={{ maxWidth: 520, margin: "16px auto 0" }}>
            We make enrollment simple and welcoming. Here's how to begin your family's Montessori journey with us.
          </p>
        </div>
        <div className="steps-grid">
          {STEPS.map(s => (
            <div key={s.num} className="step-card">
              <div className="step-num">{s.num}</div>
              <div className="step-title">{s.title}</div>
              <p className="step-desc">{s.desc}</p>
            </div>
          ))}
        </div>
        <div className="admissions-cta-box">
          <h3>Spaces Are Filling Fast</h3>
          <p>Limited enrollment spots are available for the upcoming academic year. Secure your child's place in our community today.</p>
          <button className="cta-white" onClick={() => scrollTo("contact")}>Schedule a Tour</button>
        </div>
      </section>

      {/* CONTACT */}
      <section id="contact" className="contact-section">
        <div className="contact-inner">
          <div style={{ textAlign: "center" }}>
            <p className="section-label">Get In Touch</p>
            <h2 className="section-title">We'd Love to Hear<br /><em style={{ fontStyle: "italic", color: "#2e7d32" }}>From You</em></h2>
          </div>
          <div className="contact-grid">
            <div>
              <div className="contact-info-item">
                <div className="contact-icon">📍</div>
                <div>
                  <div className="contact-info-label">Address</div>
                  <div className="contact-info-value">123 Forest Lane, Greenwood, ON M4B 1Z5</div>
                </div>
              </div>
              <div className="contact-info-item">
                <div className="contact-icon">📞</div>
                <div>
                  <div className="contact-info-label">Phone</div>
                  <div className="contact-info-value">(416) 555-0192</div>
                </div>
              </div>
              <div className="contact-info-item">
                <div className="contact-icon">✉️</div>
                <div>
                  <div className="contact-info-label">Email</div>
                  <div className="contact-info-value">hello@forestviewmontessori.com</div>
                </div>
              </div>
              <div className="contact-info-item">
                <div className="contact-icon">🕐</div>
                <div>
                  <div className="contact-info-label">Hours</div>
                  <div className="contact-info-value">Mon – Fri, 7:30 AM – 6:00 PM</div>
                </div>
              </div>
            </div>

            <div>
              <input className="form-field" placeholder="Your Name" />
              <input className="form-field" placeholder="Email Address" />
              <input className="form-field" placeholder="Phone Number" />
              <textarea className="form-field" placeholder="Your Message or Question…" />
              <button className="cta-primary" style={{ width: "100%" }}>Send Message</button>
            </div>
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="footer">
        <div className="footer-logo-text">Forestview Montessori</div>
        <div className="footer-sub">Toddler & Preschool</div>
        <div className="footer-links">
          {NAV_LINKS.map(l => (
            <span key={l} className="footer-link" onClick={() => scrollTo(l.toLowerCase())}>{l}</span>
          ))}
        </div>
        <div className="footer-copy">© {new Date().getFullYear()} Forestview Montessori. All rights reserved.</div>
      </footer>
    </div>
  );
}
