import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';
import './Landing.css';

const Landing = () => {
  useEffect(() => {
    const lucideScript = document.createElement('script');
    lucideScript.src = 'https://unpkg.com/lucide@latest';
    lucideScript.async = false;
    document.head.appendChild(lucideScript);

    const script = document.createElement('script');
    script.src = `./landing-script.js?v=${Date.now()}`;
    script.async = false;
    document.body.appendChild(script);

    lucideScript.onload = () => {
      if ((window as any).lucide) {
        (window as any).lucide.createIcons();
      }
    };

    return () => {
      if (document.head.contains(lucideScript)) {
        document.head.removeChild(lucideScript);
      }
      if (document.body.contains(script)) {
        document.body.removeChild(script);
      }
    };
  }, []);

  return (
    <div className="landing-page-container">
      

    {/*  STICKY TOP NAVIGATION (Logo Left, Pill Nav Center, Actions Right)  */}
    <header className="navbar-wrapper">
        <div className="navbar-container">
            {/*  1. Standalone Brand Logo (Far Left, No Border)  */}
            <a href="#" className="brand-logo-left">
                <svg className="xaalisi-wallet-logo" width="34" height="34" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M 32 26 L 70 12 C 72 11 74 13 74 15 V 26 Z" fill="url(#goldGradLogo)"/>
                    <path d="M 12 34 C 12 29 16 26 22 26 H 90 C 95 26 98 29 98 34 V 46 H 32 C 22 46 12 34 12 34 Z" fill="url(#goldGradLogo)"/>
                    <path d="M 2 56 C 2 51 6 48 12 48 H 48 C 42 54 36 60 30 66 H 12 C 6 66 2 62 2 56 Z" fill="url(#goldGradLogo)"/>
                    <path d="M 24 78 C 24 73 28 68 34 68 H 90 C 95 68 98 71 98 76 V 78 C 98 83 95 86 90 86 H 34 C 28 86 24 82 24 78 Z" fill="url(#goldGradLogo)"/>
                    <rect x="26" y="26" width="66" height="54" rx="10" fill="url(#goldGradLogo)"/>
                    <rect x="66" y="44" width="28" height="20" rx="6" fill="#0A0A0B"/>
                    <circle cx="74" cy="54" r="4" fill="url(#goldGradLogo)"/>
                    <defs>
                        <linearGradient id="goldGradLogo" x1="0" y1="0" x2="100" y2="100" gradientUnits="userSpaceOnUse">
                            <stop offset="0%" stopColor="#FFFFFF"/>
                            <stop offset="40%" stopColor="#FFD700"/>
                            <stop offset="100%" stopColor="#FF9900"/>
                        </linearGradient>
                    </defs>
                </svg>
                <span className="logo-text-gold">XAALISI</span>
            </a>            {/*  2. Centered Glassmorphism Floating Pill Nav  */}
            <nav className="navbar-pill-center">
                <ul className="nav-links">
                    <li><a href="#app-showcase" className="nav-link">Features</a></li>
                    <li><a href="#bento-potential" className="nav-link">Virtual Cards</a></li>
                    <li><a href="#use-cases" className="nav-link">Use Cases</a></li>
                    <li><a href="#card-tiers" className="nav-link">Card Tiers</a></li>
                    <li><a href="#faq" className="nav-link">FAQ</a></li>
                </ul>
            </nav>
            <button className="mobile-toggle" id="mobileMenuToggle" aria-label="Toggle navigation menu">
                <i data-lucide="menu"></i>
            </button>

            {/*  3. Standalone Action Buttons (Far Right)  */}
            <div className="nav-actions-right">
                <Link to="/login" className="btn-text-gold">Log in</Link>
                <Link to="/signup" className="btn-gold-pill">Get Started</Link>
            </div>
        </div>
    </header>

    {/*  MAIN CONTENT CONTAINER  */}
    <main id="main-content">

        {/*  SECTION 1: HERO SECTION  */}
        <section className="section-hero theme-dark" id="hero">
            <video id="heroHandVideo" className="hero-bg-video" autoPlay muted playsInline>
                <source src="https://res.cloudinary.com/kidq4fqm/video/upload/v1785726942/Video_image_remover_-_Vmake_AI_ysfbsa.mp4" type="video/mp4" />
            </video>

            <div className="hero-video-overlay"></div>
            <div className="hero-bg-glow-gold"></div>

            <div className="container hero-container">
                <div className="hero-video-focus-space"></div>

                <div className="hero-bottom-content reveal-on-video-end">
                    <div className="hero-cta-group">
                        <Link to="/signup" className="btn-gold-pill btn-lg">
                            <i data-lucide="arrow-right"></i>
                            <span>Get Started Now</span></Link>
                        <a href="#app-showcase" className="btn-secondary-gold-pill btn-lg">
                            <i data-lucide="shield-check"></i>
                            <span>Explore Features</span>
                        </a>
                    </div>
                    <p className="hero-quick-desc">
                        Universal digital financial infrastructure powering instant zero-fee transfers, e-wallets, and virtual cards worldwide.
                    </p>
                </div>
            </div>
        </section>


        {/*  SECTION 2: THE NEXT-GEN XAALISI MOBILE EXPERIENCE (Dark Immersive Showcase)  */}
        <section className="section-app-showcase theme-dark" id="app-showcase">
            {/*  Glowing Aurora Aura & Grid Overlay  */}
            <div className="showcase-bg-aurora"></div>
            <div className="showcase-grid-overlay"></div>

            <div className="container showcase-container">
                {/*  Left Column: Large Bold Headline & Copy  */}
                <div className="showcase-content-left reveal-element">
                    <div className="category-badge-gold dark-badge-gold">
                        <i data-lucide="smartphone"></i>
                        <span>NEXT-GEN FINANCIAL INTERFACE</span>
                    </div>

                    <h2 className="showcase-headline">
                        Your Complete Financial Universe, <span className="text-gold-gradient">Right in Your Pocket</span>
                    </h2>

                    <p className="showcase-lead-text">
                        Experience liquid 24K gold aesthetics and real-time ledger synchronization. Manage FCFA balances, trigger one-tap transfers, issue virtual Visa & Mastercard, and complete identity verification in seconds.
                    </p>

                    {/*  Feature Badges Row  */}
                    <div className="showcase-metrics-grid">
                        <div className="metric-card-gold">
                            <span className="metric-value-gold">0.0s</span>
                            <span className="metric-label-gold">Instant Settlement</span>
                        </div>
                        <div className="metric-card-gold">
                            <span className="metric-value-gold">24K</span>
                            <span className="metric-label-gold">Liquid Gold Theme</span>
                        </div>
                        <div className="metric-card-gold">
                            <span className="metric-value-gold">100%</span>
                            <span className="metric-label-gold">BCEAO Compliant</span>
                        </div>
                    </div>

                    {/*  Store Action buttons (App Store & Google Play)  */}
                    <div className="showcase-actions-group">
                        <Link to="/signup" className="btn-store-pill btn-appstore">
                            <i data-lucide="apple" className="store-icon"></i>
                            <div className="store-btn-text">
                                <span className="store-subtitle">Download on the</span>
                                <span className="store-title">App Store</span></div></Link>
                        <Link to="/signup" className="btn-store-pill btn-googleplay">
                            <svg className="store-icon-svg" viewBox="0 0 24 24" width="20" height="20" fill="currentColor">
                                <path d="M3.6 1.8L15.3 12 3.6 22.2C3.2 21.8 3 21 3 20.1V3.9C3 3 3.2 2.2 3.6 1.8ZM16.7 10.8L19.8 12.5C20.6 13 20.6 13.9 19.8 14.4L16.7 16.1L14 13.4L16.7 10.8ZM4.8 23.3L15.4 14.7L12.8 12.1L4.8 23.3ZM4.8 0.7L12.8 11.9L15.4 9.3L4.8 0.7Z"/>
                            </svg>
                            <div className="store-btn-text">
                                <span className="store-subtitle">GET IT ON</span>
                                <span className="store-title">Google Play</span></div></Link>
                    </div>
                </div>

                {/*  Right Column: Prominent App Mockup + Glowing Radial Aura + Annotations  */}
                <div className="showcase-mockup-wrapper reveal-element delay-2">
                    {/*  Glowing Radial Gradient Aura behind phone  */}
                    <div className="showcase-radial-aura"></div>

                    {/*  Smartphone Mockup Image  */}
                    <div className="mockup-frame-container">
                        <img src="xaalisi_app_mockup.png" alt="XAALISI Mobile App UI Showcase" className="app-screenshot-img" />
                    </div>

                    {/*  MINIMALIST FLOATING ANNOTATIONS WITH VECTOR CROSSHAIRS  */}
                    {/*  Annotation 1: Top Left (Solde Principal)  */}
                    <div className="app-annotation annotation-top-left">
                        <div className="annotation-crosshair"><div className="crosshair-dot"></div></div>
                        <div className="annotation-card-glass">
                            <div className="annotation-badge-header">
                                <i data-lucide="wallet"></i>
                                <span>Solde Principal</span>
                            </div>
                            <p>Real-time FCFA balance tracking with instant top-up & IBAN display.</p>
                        </div>
                    </div>

                    {/*  Annotation 2: Middle Right (Actions Rapides)  */}
                    <div className="app-annotation annotation-mid-right">
                        <div className="annotation-crosshair"><div className="crosshair-dot"></div></div>
                        <div className="annotation-card-glass">
                            <div className="annotation-badge-header">
                                <i data-lucide="layout-grid"></i>
                                <span>Actions Rapides Grid</span>
                            </div>
                            <p>One-tap transfers, cards, cheques, QR scanner, support & merchants.</p>
                        </div>
                    </div>

                    {/*  Annotation 3: Bottom Left (Vérification KYC)  */}
                    <div className="app-annotation annotation-bot-left">
                        <div className="annotation-crosshair"><div className="crosshair-dot"></div></div>
                        <div className="annotation-card-glass">
                            <div className="annotation-badge-header">
                                <i data-lucide="user-check"></i>
                                <span>Vérification KYC (1/3)</span>
                            </div>
                            <p>Automated identity progress tracking for instant spending limit upgrades.</p>
                        </div>
                    </div>

                    {/*  Annotation 4: Bottom Right (Unified Navigation)  */}
                    <div className="app-annotation annotation-bot-right">
                        <div className="annotation-crosshair"><div className="crosshair-dot"></div></div>
                        <div className="annotation-card-glass">
                            <div className="annotation-badge-header">
                                <i data-lucide="compass"></i>
                                <span>Bottom Navigation Bar</span>
                            </div>
                            <p>Seamlessly toggle between Réseau, Transferts, Comptes & Paiements.</p>
                        </div>
                    </div>
                </div>

            </div>
        </section>


        {/*  SECTION 3: CORE POTENTIAL & BENTO GRID (Dark Mode)  */}
        <section className="section-bento theme-dark" id="bento-potential">
            <div className="container">
                <div className="section-header text-center">
                    <div className="category-badge-gold dark-badge-gold">BANKING ARCHITECTURE</div>
                    <h2 className="section-title">Unleash the Full Potential of Your Digital Account</h2>
                    <p className="section-subtitle">Engineered for complete liquidity, instant settlement, and sovereign financial security.</p>
                </div>

                {/*  TOP 2 HIGHLIGHT CARDS  */}
                <div className="top-highlights-grid">
                    <div className="highlight-card-gold">
                        <div className="card-content">
                            <div className="card-icon-badge-gold"><i data-lucide="credit-card"></i></div>
                            <h3>Instant Virtual Visa & Mastercard</h3>
                            <p>Provision virtual debit and credit cards directly linked to your XAALISI balance with 3D Secure v2 OTP protection.</p>
                        </div>
                        <div className="highlight-graphic graphic-card-preview">
                            <div className="mini-visa-card">
                                <div className="mini-card-chip"></div>
                                <div className="mini-card-number">•••• •••• •••• 4912</div>
                                <div className="mini-card-footer">
                                    <span>XAALISI GOLD</span>
                                    <span className="brand font-mono">VISA</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="highlight-card-gold">
                        <div className="card-content">
                            <div className="card-icon-badge-gold"><i data-lucide="shield-check"></i></div>
                            <h3>Military-Grade Financial Enclave</h3>
                            <p>Double-entry core ledger architecture with strict row-level database locking and real-time anti-fraud telemetry.</p>
                        </div>
                        <div className="highlight-graphic graphic-code">
                            <pre className="code-snippet"><code><span className="code-keyword">async function</span> settleLedger(tx) {'{'}
  <span className="code-keyword">await</span> db.ledger.lockRow(tx.accountId);
  <span className="code-keyword">return</span> tx.executeDoubleEntry({'{'}
    debit: tx.sender, credit: tx.receiver, amount: tx.fcfa
  {'}'});
{'}'}</code></pre>
                        </div>
                    </div>
                </div>

                {/*  BENTO GRID (5 CARDS)  */}
                <div className="bento-grid">
                    {/*  Bento Card 1  */}
                    <div className="bento-card-gold bento-card-large">
                        <div className="bento-header">
                            <div className="bento-icon-gold"><i data-lucide="lock"></i></div>
                            <h4>Military-Grade Security & Compliance</h4>
                        </div>
                        <p>Fully compliant with BCEAO regulations, PCI-DSS Level 1 certification, and double-entry immutable transaction logging.</p>
                        <div className="bento-visual">
                            <div className="security-badge-container">
                                <div className="sec-item-gold"><i data-lucide="check"></i> PCI-DSS Level 1</div>
                                <div className="sec-item-gold"><i data-lucide="check"></i> BCEAO Regulatory Approval</div>
                                <div className="sec-item-gold"><i data-lucide="check"></i> ISO 27001 Certified</div>
                                <div className="sec-item-gold"><i data-lucide="check"></i> 256-Bit SSL Enclave</div>
                            </div>
                        </div>
                    </div>

                    {/*  Bento Card 2  */}
                    <div className="bento-card-gold">
                        <div className="bento-header">
                            <div className="bento-icon-gold"><i data-lucide="qr-code"></i></div>
                            <h4>Contactless QR Code Payments</h4>
                        </div>
                        <p>Merchant QR scanning with zero POS hardware required. Instant push-notification payment confirmation.</p>
                        <div className="bento-visual">
                            <div className="qr-preview-box">
                                <i data-lucide="qr-code"></i>
                                <span>Scan to pay merchant</span>
                            </div>
                        </div>
                    </div>

                    {/*  Bento Card 3  */}
                    <div className="bento-card-gold">
                        <div className="bento-header">
                            <div className="bento-icon-gold"><i data-lucide="phone"></i></div>
                            <h4>USSD & SMS Offline Banking</h4>
                        </div>
                        <p>Dial <code>*999#</code> on any phone to check balances, transfer funds, or generate cash-out codes without internet.</p>
                        <div className="bento-visual">
                            <div className="ussd-pill-badge">
                                <span>Dial *999#</span>
                                <i data-lucide="phone-call"></i>
                            </div>
                        </div>
                    </div>

                    {/*  Bento Card 4  */}
                    <div className="bento-card-gold">
                        <div className="bento-header">
                            <div className="bento-icon-gold"><i data-lucide="refresh-cw"></i></div>
                            <h4>Multi-Currency Engine</h4>
                        </div>
                        <p>Instant zero-fee conversion across XOF (FCFA), EUR, USD, and GBP for international travel.</p>
                        <div className="bento-visual">
                            <div className="currency-fx-bar">
                                <span className="fx-item">1 EUR = 655.95 XOF</span>
                                <span className="fx-item">1 USD = 602.10 XOF</span>
                            </div>
                        </div>
                    </div>

                    {/*  Bento Card 5  */}
                    <div className="bento-card-gold bento-card-highlight-gold">
                        <div className="bento-header">
                            <div className="bento-icon-gold icon-gold-solid"><i data-lucide="sparkles"></i></div>
                            <h4>XAALISI Gold Privileges</h4>
                        </div>
                        <p>Unlock cash-back rewards, concierge assistance, and zero international ATM transaction surcharges.</p>
                        <div className="bento-visual">
                            <div className="gold-privilege-badge">
                                <span>2.5% Cashback on All Purchases</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </section>


        {/*  SECTION 4: GLOBAL REMITTANCE GLOBE (Dark Mode + Slow-Motion Scroll Physics)  */}
        <section className="section-globe theme-dark" id="global-remittance">
            <div className="globe-horizon-glow-gold"></div>
            <div className="container globe-section-container">
                <div className="section-header text-center">
                    <div className="category-badge-gold dark-badge-gold">DIASPORA & CROSS-BORDER TRANSFERS</div>
                    <h2 className="section-title">Connecting Local Economies with Diaspora Worldwide</h2>
                    <p className="section-subtitle">Send money from Europe, North America, or Asia straight into local African wallets in under 2 seconds at transparent near-zero fees.</p>
                </div>

                {/*  GIANT 3D GLOBE CONTAINER WITH RIGHT-SIDE TRANSPARENT GLASS OVERLAY  */}
                <div className="globe-main-wrapper">
                    <div className="globe-viewport-large">
                        <canvas id="globeCanvas" className="globe-canvas-large"></canvas>
                        <div className="globe-instructions-gold">
                            <i data-lucide="grab"></i>
                            <span>Drag or scroll to rotate 3D remittance network</span>
                        </div>
                    </div>

                    {/*  RIGHT SIDE TRANSPARENT GLASS OVERLAY CARD  */}
                    <div className="globe-glass-overlay-right">
                        <div className="glass-card-header">
                            <div className="badge-pulsing-dot-gold"></div>
                            <span className="glass-header-title">Live Diaspora Network</span>
                        </div>

                        <div className="glass-stat-box">
                            <div className="g-stat-num-gold">&lt; 1.8s</div>
                            <div className="g-stat-lbl">Settlement Speed (Paris &rarr; Bamako)</div>
                        </div>

                        <div className="glass-stat-box">
                            <div className="g-stat-num-gold">0.5%</div>
                            <div className="g-stat-lbl">Average Remittance Fee</div>
                        </div>

                        <div className="glass-stat-box">
                            <div className="g-stat-num-gold" id="diasporaCorridorsCount">50+ Corridors</div>
                            <div className="g-stat-lbl">Active Global Remittance Routes</div>
                        </div>

                        {/*  Live Remittance Activity Feed  */}
                        <div className="glass-activity-feed">
                            <div className="activity-feed-title">
                                <i data-lucide="activity" style={{ 'color': '#FF5500', 'width': '14px', 'height': '14px' }}></i>
                                <span>Real-Time Remittance Feed</span>
                            </div>
                            <div id="liveActivityFeedList">
                                <div className="activity-item">
                                    <span className="act-flag">&bull; Paris &rarr; Bamako</span>
                                    <span className="act-amount">+ 327,975 FCFA</span>
                                </div>
                                <div className="activity-item">
                                    <span className="act-flag">&bull; New York &rarr; Dakar</span>
                                    <span className="act-amount">+ $450.00 USD</span>
                                </div>
                                <div className="activity-item">
                                    <span className="act-flag">&bull; Dubai &rarr; Bamako</span>
                                    <span className="act-amount">+ 1,250 AED</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </section>


        {/*  SECTION 5: INTERACTIVE DEMO CONSOLE (Light Mode)  */}
        <section className="section-playground theme-light" id="interactive-demo">
            <div className="container">
                <div className="section-header text-center">
                    <div className="category-badge-gold">LIVE FINANCIAL CONSOLE</div>
                    <h2 className="section-title text-dark">Experience XAALISI Banking Services Live</h2>
                    <p className="section-subtitle text-dark-muted">Test virtual card issuing, QR checkout, and remittance transfers in real-time before opening your account.</p>
                </div>

                {/*  INTERACTIVE CONSOLE CONTAINER  */}
                <div className="playground-console-card-gold">
                    <div className="console-header-gold">
                        <div className="console-title">
                            <i data-lucide="wallet" className="icon-accent-gold"></i>
                            <span>XAALISI Interactive Banking Hub</span>
                        </div>
                        
                        <div className="preset-tabs" id="playgroundTabs">
                            <button className="tab-btn-gold active" data-tab="virtual">
                                <i data-lucide="credit-card"></i> Virtual Card Generator
                            </button>
                            <button className="tab-btn-gold" data-tab="qr">
                                <i data-lucide="qr-code"></i> Instant QR Payment
                            </button>
                            <button className="tab-btn-gold" data-tab="transfer">
                                <i data-lucide="send"></i> Money Transfer
                            </button>
                            <button className="tab-btn-gold" data-tab="ussd">
                                <i data-lucide="phone"></i> USSD Simulator
                            </button>
                        </div>
                    </div>

                    <div className="console-body-gold" id="consoleInteractiveView">
                        {/*  Dynamic View Injected by JavaScript  */}
                    </div>
                </div>
            </div>
        </section>


        {/*  SECTION 6: USE CASES & SOLUTIONS (Light Mode)  */}
        <section className="section-usecases theme-light" id="use-cases">
            <div className="container">
                <div className="section-header text-center">
                    <div className="category-badge-gold">VERSATILE FINANCIAL SOLUTIONS</div>
                    <h2 className="section-title text-dark">Tailored Financial Solutions for Every Sector</h2>
                    <p className="section-subtitle text-dark-muted">Empowering individuals, enterprises, agricultural networks, and community savings across emerging economies.</p>
                </div>

                <div className="usecases-grid">
                    {/*  Card 1  */}
                    <div className="uc-card-gold">
                        <div className="uc-icon-gold"><i data-lucide="user"></i></div>
                        <h3>Individuals & Families</h3>
                        <p>Personal e-wallet for seamless peer-to-peer money transfers, utility bill payments, and daily retail spending.</p>
                        <ul className="uc-bullets-gold">
                            <li><i data-lucide="check"></i> Instant free account opening</li>
                            <li><i data-lucide="check"></i> Zero fee P2P transfers</li>
                        </ul>
                    </div>

                    {/*  Card 2  */}
                    <div className="uc-card-gold">
                        <div className="uc-icon-gold"><i data-lucide="store"></i></div>
                        <h3>Merchants & E-Commerce</h3>
                        <p>Accept instant payments in-store via contactless QR codes or integrate XAALISI Checkout SDK on your website.</p>
                        <ul className="uc-bullets-gold">
                            <li><i data-lucide="check"></i> Low 0.5% merchant transaction fee</li>
                            <li><i data-lucide="check"></i> Instant T+0 bank settlement</li>
                        </ul>
                    </div>

                    {/*  Card 3  */}
                    <div className="uc-card-gold">
                        <div className="uc-icon-gold"><i data-lucide="briefcase"></i></div>
                        <h3>Corporates & Mining</h3>
                        <p>Distribute bulk cashless salary payouts directly to thousands of employee wallets in remote mining or factory sites.</p>
                        <ul className="uc-bullets-gold">
                            <li><i data-lucide="check"></i> Automated batch payroll processing</li>
                            <li><i data-lucide="check"></i> Complete audit trail reporting</li>
                        </ul>
                    </div>

                    {/*  Card 4  */}
                    <div className="uc-card-gold">
                        <div className="uc-icon-gold"><i data-lucide="wheat"></i></div>
                        <h3>Agriculture & Field Work</h3>
                        <p>USSD-based payout networks for remote agricultural cooperatives without smartphone requirement.</p>
                        <ul className="uc-bullets-gold">
                            <li><i data-lucide="check"></i> Offline SMS cash voucher issuing</li>
                            <li><i data-lucide="check"></i> Local agent cash-out integration</li>
                        </ul>
                    </div>

                    {/*  Card 5  */}
                    <div className="uc-card-gold">
                        <div className="uc-icon-gold"><i data-lucide="landmark"></i></div>
                        <h3>Social Welfare & Pensions</h3>
                        <p>Automated, biometric-verified distribution of government pensions and social subsidy disbursements.</p>
                        <ul className="uc-bullets-gold">
                            <li><i data-lucide="check"></i> Anti-fraud identity verification</li>
                            <li><i data-lucide="check"></i> Real-time disbursement analytics</li>
                        </ul>
                    </div>

                    {/*  Card 6  */}
                    <div className="uc-card-gold">
                        <div className="uc-icon-gold"><i data-lucide="users"></i></div>
                        <h3>Digital Tontines & Community</h3>
                        <p>Automated collective savings groups (Tontines) with scheduled pool payouts and credit scoring algorithms.</p>
                        <ul className="uc-bullets-gold">
                            <li><i data-lucide="check"></i> Smart contract automated turns</li>
                            <li><i data-lucide="check"></i> Transparent group audit logs</li>
                        </ul>
                    </div>
                </div>
            </div>
        </section>


        {/*  SECTION 7: XAALISI CARD TIERS & PRIVILEGES (Dark Mode)  */}
        <section className="section-pricing theme-dark" id="card-tiers">
            <div className="container">
                <div className="section-header text-center">
                    <div className="category-badge-gold dark-badge-gold">FLEXIBLE MEMBERSHIP TIERS</div>
                    <h2 className="section-title">Choose the Card Tier That Fits Your Financial Lifestyle</h2>
                    <p className="section-subtitle">Instant virtual cards or heavy metallic physical cards delivered directly to your doorstep.</p>
                </div>

                <div className="pricing-grid">
                    {/*  Tier 1  */}
                    <div className="pricing-card-gold">
                        <div className="plan-header">
                            <div className="plan-gpu-badge-gold">VIRTUAL ESSENTIAL</div>
                            <h3 className="plan-name">Standard Card</h3>
                            <p className="plan-desc">Perfect for everyday local transactions, bill payments, and P2P transfers.</p>
                        </div>
                        <div className="plan-price-box">
                            <span className="currency-gold">FCFA</span>
                            <span className="price-val">0</span>
                            <span className="period">/ forever free</span>
                        </div>
                        <ul className="plan-specs-list">
                            <li><i data-lucide="check"></i> Instant Virtual Card Creation</li>
                            <li><i data-lucide="check"></i> Daily Spending Limit: <strong>500,000 FCFA</strong></li>
                            <li><i data-lucide="check"></i> Local E-Commerce & USSD Access</li>
                            <li><i data-lucide="check"></i> Standard Security & Support</li>
                        </ul>
                        <Link to="/signup" className="btn-secondary-gold-pill btn-full">Issue Free Card</Link>
                    </div>

                    {/*  Tier 2 (Featured Gold)  */}
                    <div className="pricing-card-gold featured-card-gold">
                        <div className="popular-ribbon-gold">MOST POPULAR</div>
                        <div className="plan-header">
                            <div className="plan-gpu-badge-gold gold-badge-solid">METALLIC GOLD</div>
                            <h3 className="plan-name">Gold Card</h3>
                            <p className="plan-desc">For international online shopping, travel privileges, and premium cashback.</p>
                        </div>
                        <div className="plan-price-box">
                            <span className="currency-gold">FCFA</span>
                            <span className="price-val">5,000</span>
                            <span className="period">/ year</span>
                        </div>
                        <ul className="plan-specs-list">
                            <li><i data-lucide="check"></i> Global Visa & Mastercard Access</li>
                            <li><i data-lucide="check"></i> Increased Daily Limit: <strong>10,000,000 FCFA</strong></li>
                            <li><i data-lucide="check"></i> International Remittances & Netflix/Amazon Subscriptions</li>
                            <li><i data-lucide="check"></i> Heavy 18g Laser-Engraved Metallic Physical Card</li>
                            <li><i data-lucide="check"></i> Priority 24/7 Dedicated Concierge Support</li>
                        </ul>
                        <Link to="/signup" className="btn-gold-pill btn-full">Upgrade to Gold</Link>
                    </div>

                    {/*  Tier 3  */}
                    <div className="pricing-card-gold">
                        <div className="plan-header">
                            <div className="plan-gpu-badge-gold">ENTERPRISE TREASURY</div>
                            <h3 className="plan-name">Business Card</h3>
                            <p className="plan-desc">Custom financial architecture for corporations, merchants, and institutions.</p>
                        </div>
                        <div className="plan-price-box">
                            <span className="currency-gold">Custom</span>
                            <span className="price-val">SLA</span>
                            <span className="period">/ tailored plan</span>
                        </div>
                        <ul className="plan-specs-list">
                            <li><i data-lucide="check"></i> Unlimited Spending & Multi-Card Fleet</li>
                            <li><i data-lucide="check"></i> Bulk Salary Payout Integration & Merchant QR APIs</li>
                            <li><i data-lucide="check"></i> Multi-Currency Treasury Management</li>
                            <li><i data-lucide="check"></i> Dedicated Enterprise Account Manager</li>
                        </ul>
                        <a href="#faq" className="btn-secondary-gold-pill btn-full">Contact Enterprise Sales</a>
                    </div>
                </div>
            </div>
        </section>


        {/*  SECTION 8: FAQ & FINAL CTA BANNER (Dark Mode + Gold Glow)  */}
        <section className="section-faq theme-dark" id="faq">
            <div className="container">
                <div className="section-header text-center">
                    <div className="category-badge-gold dark-badge-gold">FREQUENTLY ASKED QUESTIONS</div>
                    <h2 className="section-title">Everything You Need to Know</h2>
                    <p className="section-subtitle">Answers to common questions regarding account opening, virtual card issuing, security, and USSD shortcodes.</p>
                </div>

                {/*  ACCORDION CONTAINER  */}
                <div className="faq-accordion-wrapper">
                    <div className="faq-item">
                        <button className="faq-trigger">
                            <span>How fast is virtual Visa or Mastercard issuing?</span>
                            <i data-lucide="chevron-down" className="faq-icon-gold"></i>
                        </button>
                        <div className="faq-content">
                            <p>Virtual card issuance is instant (&lt; 3 seconds). Once your identity is verified on the mobile app, click "Create Card" to immediately generate your 16-digit card number, expiration date, and CVV code for online payments.</p>
                        </div>
                    </div>

                    <div className="faq-item">
                        <button className="faq-trigger">
                            <span>How do I access XAALISI via USSD when offline?</span>
                            <i data-lucide="chevron-down" className="faq-icon-gold"></i>
                        </button>
                        <div className="faq-content">
                            <p>Simply dial <code>*999#</code> on any mobile phone connected to a local SIM network. You can check your account balance, initiate money transfers, purchase airtime, or generate withdrawal tokens even without internet connection.</p>
                        </div>
                    </div>

                    <div className="faq-item">
                        <button className="faq-trigger">
                            <span>What are the transaction limits and fees for cross-border remittances?</span>
                            <i data-lucide="chevron-down" className="faq-icon-gold"></i>
                        </button>
                        <div className="faq-content">
                            <p>Standard account transfers have zero hidden fees. Diaspora remittances from Europe or North America carry a transparent fee of approximately 0.5%, settled instantly into local wallet balances.</p>
                        </div>
                    </div>

                    <div className="faq-item">
                        <button className="faq-trigger">
                            <span>How is my money protected on XAALISI?</span>
                            <i data-lucide="chevron-down" className="faq-icon-gold"></i>
                        </button>
                        <div className="faq-content">
                            <p>XAALISI operates under strict BCEAO regulatory frameworks. Customer funds are held in ring-fenced central bank escrow accounts with double-entry accounting ledgers and 256-bit encryption.</p>
                        </div>
                    </div>
                </div>

                {/*  FINAL CTA BANNER WITH GOLD GLOW  */}
                <div className="cta-banner-card-gold">
                    <div className="cta-horizon-glow-gold"></div>
                    <div className="cta-inner-content">
                        <h2 className="cta-title">Ready to Experience Sovereign Digital Banking?</h2>
                        <p className="cta-subtitle">Join over 1,500,000 users managing their money faster, safer, and with zero border friction.</p>
                        
                        <div className="cta-actions">
                            <Link to="/signup" className="btn-gold-pill btn-lg">
                                <span>Create Your XAALISI Account Now</span><i data-lucide="arrow-right"></i></Link>
                            <span className="cta-note-gold"><i data-lucide="check"></i> 100% Free Account Opening &bull; No Monthly Maintenance Fees</span>
                        </div>
                    </div>
                </div>
            </div>
        </section>

    </main>

    {/*  SECTION 9: FOOTER (Dark Mode)  */}
    <footer className="footer-wrapper theme-dark">
        <div className="container">
            <div className="footer-top-grid">
                {/*  Brand Info  */}
                <div className="footer-brand-col">
                    <a href="#" className="brand-logo-left">
                        <svg className="xaalisi-wallet-logo" width="32" height="32" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path d="M 32 26 L 70 12 C 72 11 74 13 74 15 V 26 Z" fill="url(#goldGradLogoFooter)"/>
                            <path d="M 12 34 C 12 29 16 26 22 26 H 90 C 95 26 98 29 98 34 V 46 H 32 C 22 46 12 34 12 34 Z" fill="url(#goldGradLogoFooter)"/>
                            <path d="M 2 56 C 2 51 6 48 12 48 H 48 C 42 54 36 60 30 66 H 12 C 6 66 2 62 2 56 Z" fill="url(#goldGradLogoFooter)"/>
                            <path d="M 24 78 C 24 73 28 68 34 68 H 90 C 95 68 98 71 98 76 V 78 C 98 83 95 86 90 86 H 34 C 28 86 24 82 24 78 Z" fill="url(#goldGradLogoFooter)"/>
                            <rect x="26" y="26" width="66" height="54" rx="10" fill="url(#goldGradLogoFooter)"/>
                            <rect x="66" y="44" width="28" height="20" rx="6" fill="#0A0A0B"/>
                            <circle cx="74" cy="54" r="4" fill="url(#goldGradLogoFooter)"/>
                            <defs>
                                <linearGradient id="goldGradLogoFooter" x1="0" y1="0" x2="100" y2="100" gradientUnits="userSpaceOnUse">
                                    <stop offset="0%" stopColor="#FFFFFF"/>
                                    <stop offset="40%" stopColor="#FFD700"/>
                                    <stop offset="100%" stopColor="#FF9900"/>
                                </linearGradient>
                            </defs>
                        </svg>
                        <span className="logo-text-gold">XAALISI</span>
                    </a>
                    <p className="footer-mission">
                        Universal Digital Financial Infrastructure powering mobile e-wallets, virtual cards, contactless QR checkout, and instant global remittances.
                    </p>
                    <div className="social-links-gold">
                        <a href="#" aria-label="Twitter">
                            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 4s-.7 2.1-2 3.4c1.6 10-9.4 17.3-18 11.6 2.2.1 4.4-.6 6-2C3 15.5.5 9.6 3 5c2.2 2.6 5.6 4.1 9 4-.9-4.2 4-6.6 7-3.8 1.1 0 3-1.2 3-1.2z"/></svg>
                        </a>
                        <a href="#" aria-label="LinkedIn">
                            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z"/><rect width="4" height="12" x="2" y="9"/><circle cx="4" cy="4" r="2"/></svg>
                        </a>
                        <a href="#" aria-label="Facebook">
                            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"/></svg>
                        </a>
                        <a href="#" aria-label="Instagram">
                            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="20" height="20" x="2" y="2" rx="5" ry="5"/><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/><line x1="17.5" x2="17.51" y1="6.5" y2="6.5"/></svg>
                        </a>
                    </div>
                </div>

                {/*  Nav Col 1  */}
                <div className="footer-nav-col">
                    <h4 className="footer-heading-gold">Financial Products</h4>
                    <ul>
                        <li><a href="#speed-convenience">Mobile E-Wallet</a></li>
                        <li><a href="#bento-potential">Virtual Visa & Mastercard</a></li>
                        <li><a href="#speed-convenience">Contactless QR Payments</a></li>
                        <li><a href="#speed-convenience">USSD Offline Banking</a></li>
                        <li><a href="#global-remittance">Diaspora Remittances</a></li>
                    </ul>
                </div>

                {/*  Nav Col 2  */}
                <div className="footer-nav-col">
                    <h4 className="footer-heading-gold">Solutions</h4>
                    <ul>
                        <li><a href="#use-cases">For Individuals</a></li>
                        <li><a href="#use-cases">For E-Commerce & Retail</a></li>
                        <li><a href="#use-cases">Corporate Bulk Payroll</a></li>
                        <li><a href="#use-cases">Agricultural Networks</a></li>
                        <li><a href="#use-cases">Digital Tontines</a></li>
                    </ul>
                </div>

                {/*  Nav Col 3  */}
                <div className="footer-nav-col">
                    <h4 className="footer-heading-gold">Company & Legal</h4>
                    <ul>
                        <li><a href="#">About XAALISI</a></li>
                        <li><a href="#">BCEAO Compliance</a></li>
                        <li><a href="#">Security Statement</a></li>
                        <li><a href="#">Careers</a></li>
                        <li><a href="#">Partner Banks</a></li>
                    </ul>
                </div>

                {/*  Newsletter Col  */}
                <div className="footer-newsletter-col">
                    <h4 className="footer-heading-gold">Stay Updated</h4>
                    <p>Subscribe to our newsletter for product releases and financial news across West Africa.</p>
                    <form className="newsletter-form" id="newsletterForm" >
                        <div className="input-wrapper-gold">
                            <input type="email" placeholder="Enter your email address..." required />
                            <button type="submit" className="btn-gold-pill btn-sm">Subscribe</button>
                        </div>
                    </form>

                    {/*  Payment Partner Placeholders  */}
                    <div className="payment-partners-row">
                        <span className="partner-badge"><i data-lucide="shield-check"></i> VISA</span>
                        <span className="partner-badge"><i data-lucide="credit-card"></i> Mastercard</span>
                        <span className="partner-badge"><i data-lucide="landmark"></i> BCEAO</span>
                    </div>
                </div>
            </div>

            <div className="footer-bottom-bar">
                <div className="copyright-text">
                    &copy; 2026 XAALISI Financial Infrastructure Technologies Inc. All rights reserved.
                </div>
                <div className="legal-links">
                    <a href="#">Privacy Policy</a>
                    <a href="#">Terms of Service</a>
                    <a href="#">Security Protocol</a>
                    <a href="#">AML/KYC Policy</a>
                </div>
            </div>
        </div>
    </footer>

    {/*  Scripts  */}
    <script src="script.js"></script>
    <script>
        // Initialize Lucide icons
        lucide.createIcons();
    </script>

    </div>
  );
};

export default Landing;
