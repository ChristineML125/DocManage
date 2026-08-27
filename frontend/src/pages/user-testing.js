import { LitElement, html, css } from 'lit';
import { customElement } from 'lit/decorators.js';

const WEB_APP_URL = 'https://docmanage-1.onrender.com';
const APK_URL = '#';
const FEEDBACK_URL = 'https://docs.google.com/forms/d/e/1FAIpQLSd0DA5J7-rNHUH13-Dyvl4eQaenOt4zB9-Tfh1LgH_FNVYcHQ/viewform?usp=publish-editor';

@customElement('user-testing-page')
export class UserTestingPage extends LitElement {

  static styles = css`

    :host {
      display: block;
      font-family: 'Manrope', sans-serif;
      color: #0b1c30;
      background: #f7f9fb;
    }

    .material-symbols-outlined {
      font-family: 'Material Symbols Outlined';
      font-variation-settings: 'FILL' 0, 'wght' 400, 'GRAD' 0, 'opsz' 24;
    }

    /* ===== NAV ===== */
    .nav {
      position: fixed; top: 0; left: 0; right: 0; z-index: 100;
      display: flex; align-items: center; justify-content: space-between;
      height: 64px; padding: 0 clamp(20px, 5vw, 72px);
      background: rgba(255,255,255,0.85);
      backdrop-filter: blur(12px);
      border-bottom: 1px solid #e5e7eb;
    }
    .nav-brand {
      display: flex; align-items: center; gap: 10px;
      font-size: 20px; font-weight: 800; color: #00685f;
      text-decoration: none;
    }
    .nav-brand img { height: 36px; width: auto; }
    .nav-links { display: flex; gap: 8px; }
    .nav-links a {
      padding: 8px 18px; border-radius: 8px;
      font-size: 14px; font-weight: 600; text-decoration: none;
      transition: all 0.15s;
    }
    .nav-links .nav-outline {
      border: 1.5px solid #d1d5db; color: #374151;
    }
    .nav-links .nav-outline:hover { background: #f3f4f6; }
    .nav-links .nav-primary {
      background: #00685f; color: #fff; border: 1.5px solid #00685f;
    }
    .nav-links .nav-primary:hover { background: #00554d; }

    /* ===== HERO ===== */
    .hero {
      margin-top: 64px;
      padding: clamp(56px, 10vw, 112px) clamp(20px, 5vw, 72px);
      background: linear-gradient(135deg, #00685f 0%, #004d46 50%, #091426 100%);
      text-align: center; color: #fff;
    }
    .hero-logo { height: 56px; margin-bottom: 20px; }
    .hero h1 {
      font-size: clamp(32px, 5vw, 56px); font-weight: 800;
      margin: 0 0 8px; letter-spacing: -0.5px;
    }
    .hero-sub {
      font-size: clamp(16px, 2.5vw, 22px); font-weight: 500;
      color: rgba(255,255,255,0.85); margin: 0 0 40px; max-width: 600px;
      margin-left: auto; margin-right: auto; line-height: 1.5;
    }
    .hero-badge {
      display: inline-flex; align-items: center; gap: 8px;
      padding: 6px 16px; border-radius: 999px;
      background: rgba(255,255,255,0.15);
      font-size: 13px; font-weight: 700; color: #fff;
      margin-bottom: 36px; backdrop-filter: blur(4px);
    }
    .hero-badge .dot {
      width: 8px; height: 8px; border-radius: 50%;
      background: #34d399; animation: pulse 2s infinite;
    }
    @keyframes pulse {
      0%, 100% { opacity: 1; }
      50% { opacity: 0.4; }
    }
    .hero-actions { display: flex; gap: 14px; justify-content: center; flex-wrap: wrap; }
    .hero-btn {
      display: inline-flex; align-items: center; gap: 8px;
      height: 50px; padding: 0 28px; border-radius: 10px;
      font-family: inherit; font-size: 15px; font-weight: 700;
      text-decoration: none; cursor: pointer; border: none;
      transition: all 0.15s;
    }
    .hero-btn-web {
      background: #fff; color: #00685f;
    }
    .hero-btn-web:hover { background: #e6f5f3; transform: translateY(-1px); }
    .hero-btn-apk {
      background: rgba(255,255,255,0.15); color: #fff;
      border: 1.5px solid rgba(255,255,255,0.4);
    }
    .hero-btn-apk:hover { background: rgba(255,255,255,0.25); }
    .hero-btn .material-symbols-outlined { font-size: 19px; }

    /* ===== SECTION ===== */
    .section {
      padding: clamp(48px, 8vw, 88px) clamp(20px, 5vw, 72px);
      max-width: 1080px; margin: 0 auto;
    }
    .section-label {
      font-size: 13px; font-weight: 700; color: #00685f;
      text-transform: uppercase; letter-spacing: 1.5px;
      margin: 0 0 10px;
    }
    .section-title {
      font-size: clamp(24px, 3.5vw, 36px); font-weight: 800;
      margin: 0 0 12px; color: #0b1c30;
    }
    .section-desc {
      font-size: 16px; line-height: 1.7; color: #5a6b65;
      max-width: 620px; margin: 0;
    }

    /* ===== FEATURES GRID ===== */
    .features-grid {
      display: grid; grid-template-columns: repeat(2, 1fr); gap: 20px;
      margin-top: 40px;
    }
    .feature-card {
      padding: 28px 24px; border-radius: 14px;
      background: #ffffff; border: 1px solid #e5e7eb;
      transition: box-shadow 0.2s, transform 0.15s;
    }
    .feature-card:hover {
      box-shadow: 0 6px 20px rgba(0,0,0,0.06);
      transform: translateY(-2px);
    }
    .feature-card-icon {
      width: 44px; height: 44px; border-radius: 10px;
      background: #e6f5f3; color: #00685f;
      display: flex; align-items: center; justify-content: center;
      margin-bottom: 16px;
    }
    .feature-card-icon .material-symbols-outlined { font-size: 22px; }
    .feature-card h3 {
      font-size: 16px; font-weight: 700; margin: 0 0 6px; color: #0b1c30;
    }
    .feature-card p {
      font-size: 14px; line-height: 1.6; color: #5a6b65; margin: 0;
    }

    /* ===== AUDIENCE ===== */
    .audience-grid {
      display: grid; grid-template-columns: repeat(3, 1fr); gap: 20px;
      margin-top: 40px;
    }
    .audience-card {
      padding: 28px 24px; border-radius: 14px;
      background: #ffffff; border: 1px solid #e5e7eb;
      text-align: center;
      transition: box-shadow 0.2s, transform 0.15s;
    }
    .audience-card:hover {
      box-shadow: 0 6px 20px rgba(0,0,0,0.06);
      transform: translateY(-2px);
    }
    .audience-icon {
      width: 52px; height: 52px; border-radius: 50%;
      background: #e6f5f3; color: #00685f;
      display: flex; align-items: center; justify-content: center;
      margin: 0 auto 16px;
    }
    .audience-icon .material-symbols-outlined { font-size: 24px; }
    .audience-card h3 {
      font-size: 16px; font-weight: 700; margin: 0 0 8px; color: #0b1c30;
    }
    .audience-card p {
      font-size: 14px; line-height: 1.6; color: #5a6b65; margin: 0;
    }

    /* ===== TRY DOCLY ===== */
    .try-grid {
      display: grid; grid-template-columns: repeat(2, 1fr); gap: 20px;
      margin-top: 40px;
    }
    .try-card {
      padding: 32px 28px; border-radius: 14px;
      background: #ffffff; border: 1px solid #e5e7eb;
      text-align: center;
    }
    .try-card-icon {
      width: 56px; height: 56px; border-radius: 14px;
      display: flex; align-items: center; justify-content: center;
      margin: 0 auto 18px;
    }
    .try-card-icon.web { background: #e6f5f3; color: #00685f; }
    .try-card-icon.android { background: #ede9fe; color: #6d28d9; }
    .try-card-icon .material-symbols-outlined { font-size: 26px; }
    .try-card h3 {
      font-size: 18px; font-weight: 700; margin: 0 0 6px; color: #0b1c30;
    }
    .try-card p {
      font-size: 14px; line-height: 1.6; color: #5a6b65; margin: 0 0 24px;
    }
    .try-card-btn {
      display: inline-flex; align-items: center; gap: 8px;
      height: 46px; padding: 0 28px; border-radius: 10px;
      font-family: inherit; font-size: 15px; font-weight: 700;
      text-decoration: none; cursor: pointer; border: none;
      transition: all 0.15s;
    }
    .try-card-btn.web {
      background: #00685f; color: #fff;
    }
    .try-card-btn.web:hover { background: #00554d; }
    .try-card-btn.android {
      background: #6d28d9; color: #fff;
    }
    .try-card-btn.android:hover { background: #5b21b6; }
    .try-card-btn .material-symbols-outlined { font-size: 18px; }

    /* ===== CHECKLIST ===== */
    .checklist {
      display: grid; grid-template-columns: repeat(3, 1fr); gap: 12px 24px;
      margin-top: 36px;
    }
    .checklist-item {
      display: flex; align-items: center; gap: 10px;
      font-size: 15px; font-weight: 500; color: #374151;
    }
    .checklist-item .material-symbols-outlined {
      font-size: 18px; color: #00685f;
    }

    /* ===== NOTICE ===== */
    .notice {
      margin-top: 0; padding: 32px 28px; border-radius: 14px;
      background: #fef3cd; border: 1px solid #fbbf24;
      max-width: 640px;
    }
    .notice-title {
      display: flex; align-items: center; gap: 8px;
      font-size: 16px; font-weight: 700; color: #92400e; margin: 0 0 10px;
    }
    .notice-title .material-symbols-outlined { font-size: 20px; }
    .notice p {
      font-size: 14px; line-height: 1.7; color: #78350f; margin: 0 0 6px;
    }
    .notice p:last-child { margin-bottom: 0; }

    /* ===== FEEDBACK ===== */
    .feedback-section {
      padding: clamp(48px, 8vw, 88px) clamp(20px, 5vw, 72px);
      background: #00685f; color: #fff; text-align: center;
    }
    .feedback-section h2 {
      font-size: clamp(24px, 3.5vw, 36px); font-weight: 800;
      margin: 0 0 12px;
    }
    .feedback-section p {
      font-size: 16px; line-height: 1.7; color: rgba(255,255,255,0.85);
      max-width: 520px; margin: 0 auto 10px;
    }
    .feedback-section .sub {
      font-size: 15px; color: rgba(255,255,255,0.75); margin-bottom: 32px;
    }
    .feedback-btn {
      display: inline-flex; align-items: center; gap: 8px;
      height: 50px; padding: 0 30px; border-radius: 10px;
      background: #fff; color: #00685f; border: none;
      font-family: inherit; font-size: 16px; font-weight: 700;
      text-decoration: none; cursor: pointer;
      transition: all 0.15s;
    }
    .feedback-btn:hover { background: #e6f5f3; transform: translateY(-1px); }
    .feedback-btn .material-symbols-outlined { font-size: 20px; }

    /* ===== FOOTER ===== */
    .footer {
      padding: 24px clamp(20px, 5vw, 72px);
      text-align: center; font-size: 13px; color: #9ca3af;
      background: #f7f9fb; border-top: 1px solid #e5e7eb;
    }

    /* ===== RESPONSIVE ===== */
    @media (max-width: 768px) {
      .nav-links { display: none; }
      .features-grid { grid-template-columns: 1fr; }
      .audience-grid { grid-template-columns: 1fr; }
      .try-grid { grid-template-columns: 1fr; }
      .checklist { grid-template-columns: repeat(2, 1fr); }
    }

    @media (max-width: 480px) {
      .checklist { grid-template-columns: 1fr; }
      .hero-actions { flex-direction: column; align-items: center; }
      .hero-btn { width: 100%; max-width: 280px; justify-content: center; }
    }
  `;

  render() {
    return html`

      <!-- NAV -->
      <nav class="nav">
        <a class="nav-brand" href="/">
          <img src="https://lh3.googleusercontent.com/aida-public/AB6AXuCcAyGyDga-rQyBFfH9X_WgWBO5cp-YZudDaN5XRWOcnivlP-Pc_vUiR3d6sjBr8WhzBsfnAAxj0nAYocyOHrCKVyrzvdCSm8XxrU7H5PmUiydC6UlrqbjjUCUfxiW4qSHeb3C1JLyen6RgeU9NR-zwhEoSIOK_NbxkaW02zL4L6JIZeLaJjzqQvlkv2c5N4BTAJ5J21lx8ZFPWyIc0OHg5tmFTdTOtzENIEzPZBSZMZ0LS0W4rSucdQZdAzxj285Iw0w" alt="Docly">
          <span>Docly</span>
        </a>
        <div class="nav-links">
          <a class="nav-outline" href="/login">Sign In</a>
          <a class="nav-primary" href="/register">Register</a>
        </div>
      </nav>

      <!-- HERO -->
      <section class="hero">
        <img class="hero-logo" src="https://lh3.googleusercontent.com/aida-public/AB6AXuCcAyGyDga-rQyBFfH9X_WgWBO5cp-YZudDaN5XRWOcnivlP-Pc_vUiR3d6sjBr8WhzBsfnAAxj0nAYocyOHrCKVyrzvdCSm8XxrU7H5PmUiydC6UlrqbjjUCUfxiW4qSHeb3C1JLyen6RgeU9NR-zwhEoSIOK_NbxkaW02zL4L6JIZeLaJjzqQvlkv2c5N4BTAJ5J21lx8ZFPWyIc0OHg5tmFTdTOtzENIEzPZBSZMZ0LS0W4rSucdQZdAzxj285Iw0w" alt="Docly">
        <h1>Public Beta Testing</h1>
        <p class="hero-sub">
          A simple way to organize, manage,<br>and understand your documents.
        </p>
        <div class="hero-badge">
          <span class="dot"></span>
          Public Beta
        </div>
        <div class="hero-actions">
          <a class="hero-btn hero-btn-web" href="${WEB_APP_URL}" target="_blank" rel="noopener">
            <span class="material-symbols-outlined">language</span>
            Try Web App
          </a>
          <a class="hero-btn hero-btn-apk" href="${APK_URL}" target="_blank" rel="noopener">
            <span class="material-symbols-outlined">android</span>
            Download Android App
          </a>
        </div>
      </section>

      <!-- WHAT IS DOCLY -->
      <section class="section">
        <p class="section-label">About</p>
        <h2 class="section-title">What is Docly?</h2>
        <p class="section-desc">
          Docly is a document management platform designed to help individuals and
          organizations organize, access, and manage their documents in one place.
        </p>

        <div class="features-grid">
          <div class="feature-card">
            <div class="feature-card-icon">
              <span class="material-symbols-outlined">folder</span>
            </div>
            <h3>Document Management</h3>
            <p>Organize and manage your documents.</p>
          </div>
          <div class="feature-card">
            <div class="feature-card-icon">
              <span class="material-symbols-outlined">search</span>
            </div>
            <h3>Search & Categories</h3>
            <p>Find documents quickly and easily.</p>
          </div>
          <div class="feature-card">
            <div class="feature-card-icon">
              <span class="material-symbols-outlined">psychology</span>
            </div>
            <h3>AI Summary</h3>
            <p>Understand documents faster with AI-powered summaries.</p>
          </div>
          <div class="feature-card">
            <div class="feature-card-icon">
              <span class="material-symbols-outlined">history</span>
            </div>
            <h3>Version Management</h3>
            <p>Keep track of different versions of your documents.</p>
          </div>
        </div>
      </section>

      <!-- WHO IS DOCLY FOR -->
      <section class="section" style="padding-top: 0;">
        <p class="section-label">Audience</p>
        <h2 class="section-title">Who is Docly for?</h2>
        <p class="section-desc">
          Whether you work alone or with a team, Docly adapts to how you manage documents.
        </p>

        <div class="audience-grid">
          <div class="audience-card">
            <div class="audience-icon">
              <span class="material-symbols-outlined">person</span>
            </div>
            <h3>Personal Users</h3>
            <p>Manage study, work, project and personal documents.</p>
          </div>
          <div class="audience-card">
            <div class="audience-icon">
              <span class="material-symbols-outlined">apartment</span>
            </div>
            <h3>Organizations</h3>
            <p>Manage company documents, departments, users and document versions.</p>
          </div>
          <div class="audience-card">
            <div class="audience-icon">
              <span class="material-symbols-outlined">palette</span>
            </div>
            <h3>Freelancers & Creatives</h3>
            <p>Keep project briefs, guidelines and project documents organized.</p>
          </div>
        </div>
      </section>

      <!-- TRY DOCLY -->
      <section class="section" style="padding-top: 0;">
        <p class="section-label">Get Started</p>
        <h2 class="section-title">Try Docly</h2>
        <p class="section-desc">
          Choose a platform to start testing.
        </p>

        <div class="try-grid">
          <div class="try-card">
            <div class="try-card-icon web">
              <span class="material-symbols-outlined">language</span>
            </div>
            <h3>Web Application</h3>
            <p>Test Docly directly in your browser.</p>
            <a class="try-card-btn web" href="${WEB_APP_URL}" target="_blank" rel="noopener">
              <span class="material-symbols-outlined">open_in_new</span>
              Try Web App
            </a>
          </div>
          <div class="try-card">
            <div class="try-card-icon android">
              <span class="material-symbols-outlined">android</span>
            </div>
            <h3>Android Application</h3>
            <p>Download the latest Android beta version.</p>
            <a class="try-card-btn android" href="${APK_URL}" target="_blank" rel="noopener">
              <span class="material-symbols-outlined">download</span>
              Download APK
            </a>
          </div>
        </div>
      </section>

      <!-- WHAT CAN YOU TEST -->
      <section class="section" style="padding-top: 0;">
        <p class="section-label">Testing</p>
        <h2 class="section-title">What can you test?</h2>

        <div class="checklist">
          <div class="checklist-item">
            <span class="material-symbols-outlined">check_circle</span>
            Registration & Login
          </div>
          <div class="checklist-item">
            <span class="material-symbols-outlined">check_circle</span>
            Personal Account
          </div>
          <div class="checklist-item">
            <span class="material-symbols-outlined">check_circle</span>
            Company Account
          </div>
          <div class="checklist-item">
            <span class="material-symbols-outlined">check_circle</span>
            Document Upload
          </div>
          <div class="checklist-item">
            <span class="material-symbols-outlined">check_circle</span>
            Document Preview
          </div>
          <div class="checklist-item">
            <span class="material-symbols-outlined">check_circle</span>
            Search & Categories
          </div>
          <div class="checklist-item">
            <span class="material-symbols-outlined">check_circle</span>
            Version Management
          </div>
          <div class="checklist-item">
            <span class="material-symbols-outlined">check_circle</span>
            AI Summary
          </div>
          <div class="checklist-item">
            <span class="material-symbols-outlined">check_circle</span>
            Mobile Application
          </div>
        </div>
      </section>

      <!-- TESTING NOTICE -->
      <section class="section" style="padding-top: 0;">
        <div class="notice">
          <div class="notice-title">
            <span class="material-symbols-outlined">warning</span>
            Testing Notice
          </div>
          <p>Docly is currently a public beta version.</p>
          <p>Please use sample or non-sensitive documents when testing the application.</p>
          <p>Do not upload confidential, medical, financial, or sensitive personal information.</p>
        </div>
      </section>

      <!-- FEEDBACK -->
      <section class="feedback-section">
        <h2>Your Feedback Matters</h2>
        <p>Have you found a bug? Was anything confusing?<br>Do you have an idea for improvement?</p>
        <p class="sub">Your feedback will help us improve Docly.</p>
        <a class="feedback-btn" href="${FEEDBACK_URL}" target="_blank" rel="noopener">
          <span class="material-symbols-outlined">edit_note</span>
          Give Feedback
        </a>
      </section>

      <!-- FOOTER -->
      <div class="footer">
        Docly Public Beta &mdash; &copy; ${new Date().getFullYear()} Docly
      </div>

    `;
  }
}
