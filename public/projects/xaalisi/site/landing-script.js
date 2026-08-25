(function() {

// DOMContentLoaded removed for React integration

    // Initialize Lucide Icons
    if (window.lucide) {
        lucide.createIcons();
    }

    /* ==========================================================================
       0. SLOW-MOTION PARALLAX SCROLL PHYSICS ENGINE
       ========================================================================== */
    let currentScrollY = window.scrollY;
    let targetScrollY = window.scrollY;
    const scrollPhysicsFactor = 0.08;

    window.addEventListener('scroll', () => {
        targetScrollY = window.scrollY;
    });

    function updateScrollPhysics() {
        currentScrollY += (targetScrollY - currentScrollY) * scrollPhysicsFactor;
        requestAnimationFrame(updateScrollPhysics);
    }
    updateScrollPhysics();


    /* ==========================================================================
       1. HERO SECTION: EDITORIAL HAND IMAGE WITH DYNAMIC 3D XAALISI CREDIT CARDS
       ========================================================================== */
    const cardHeroCanvas = document.getElementById('cardHeroCanvas');
    if (cardHeroCanvas) {
        const ctx = cardHeroCanvas.getContext('2d');
        let width = 0, height = 0;

        function resizeCardCanvas() {
            if (cardHeroCanvas.parentElement) {
                width = cardHeroCanvas.width = cardHeroCanvas.parentElement.offsetWidth || 800;
                height = cardHeroCanvas.height = cardHeroCanvas.parentElement.offsetHeight || 540;
            }
        }
        resizeCardCanvas();
        window.addEventListener('resize', resizeCardCanvas);

        let mouseX = 0, mouseY = 0;
        let targetMouseX = 0, targetMouseY = 0;

        const container = document.getElementById('card3dContainer');
        if (container) {
            container.addEventListener('mousemove', (e) => {
                const rect = container.getBoundingClientRect();
                targetMouseX = (e.clientX - rect.left - rect.width / 2) / (rect.width / 2);
                targetMouseY = (e.clientY - rect.top - rect.height / 2) / (rect.height / 2);
            });
            container.addEventListener('mouseleave', () => {
                targetMouseX = 0;
                targetMouseY = 0;
            });
        }

        // Load Editorial Hand Image
        const handImg = new Image();
        handImg.src = 'assets/hero_hand_lens.png';
        let handImgLoaded = false;
        handImg.onload = () => {
            handImgLoaded = true;
        };

        // Draw Pristine Glowing Card (Silver, Gold, or Black)
        function drawGlowingCard(ctx, type, cardW, cardH, isMain = false) {
            ctx.save();

            // Warm Golden Soft Drop Shadow & Glow
            // ctx.shadowColor = type === 'gold' ? 'rgba(255, 215, 0, 0.75)' : (type === 'black' ? 'rgba(255, 170, 0, 0.45)' : 'rgba(200, 220, 255, 0.45)');
            // ctx.shadowBlur = isMain ? 45 : 30;
            // ctx.shadowOffsetY = 12;

            // Card Base Gradient
            let cardGrad;
            if (type === 'gold') {
                cardGrad = ctx.createLinearGradient(-cardW / 2, -cardH / 2, cardW / 2, cardH / 2);
                cardGrad.addColorStop(0, '#FFE885');
                cardGrad.addColorStop(0.3, '#FFD700');
                cardGrad.addColorStop(0.7, '#D4AF37');
                cardGrad.addColorStop(1, '#7A5200');
            } else if (type === 'black') {
                cardGrad = ctx.createLinearGradient(-cardW / 2, -cardH / 2, cardW / 2, cardH / 2);
                cardGrad.addColorStop(0, '#2B2B33');
                cardGrad.addColorStop(0.5, '#121216');
                cardGrad.addColorStop(1, '#050507');
            } else { // Standard Silver
                cardGrad = ctx.createLinearGradient(-cardW / 2, -cardH / 2, cardW / 2, cardH / 2);
                cardGrad.addColorStop(0, '#F1F5F9');
                cardGrad.addColorStop(0.5, '#94A3B8');
                cardGrad.addColorStop(1, '#334155');
            }

            ctx.fillStyle = cardGrad;
            ctx.strokeStyle = type === 'gold' ? '#FFF' : (type === 'black' ? 'rgba(255, 215, 0, 0.7)' : '#F1F5F9');
            ctx.lineWidth = isMain ? 2 : 1;
            ctx.beginPath();
            ctx.roundRect(-cardW / 2, -cardH / 2, cardW, cardH, 16);
            ctx.fill();
            ctx.stroke();
            ctx.restore();

            // Metallic Sheen Light Reflection Sweep
            const sheenX = Math.sin(Date.now() * 0.002) * (cardW / 2);
            const sheenGrad = ctx.createLinearGradient(sheenX - 50, -cardH / 2, sheenX + 50, cardH / 2);
            sheenGrad.addColorStop(0, 'rgba(255, 255, 255, 0)');
            sheenGrad.addColorStop(0.5, 'rgba(255, 255, 255, 0.45)');
            sheenGrad.addColorStop(1, 'rgba(255, 255, 255, 0)');

            ctx.fillStyle = sheenGrad;
            ctx.beginPath();
            ctx.roundRect(-cardW / 2, -cardH / 2, cardW, cardH, 16);
            ctx.fill();

            // Gold Metallic Smart Chip
            const chipX = -cardW / 2 + 25;
            const chipY = -cardH / 2 + 36;
            const chipW = 34;
            const chipH = 24;

            const chipGrad = ctx.createLinearGradient(chipX, chipY, chipX + chipW, chipY + chipH);
            chipGrad.addColorStop(0, '#FFF5C0');
            chipGrad.addColorStop(1, '#AA7C11');
            ctx.fillStyle = chipGrad;
            ctx.beginPath();
            ctx.roundRect(chipX, chipY, chipW, chipH, 4);
            ctx.fill();

            // Card Text Details
            ctx.fillStyle = type === 'gold' ? '#070709' : '#FFFFFF';
            ctx.font = '800 13px "Plus Jakarta Sans", sans-serif';
            ctx.textAlign = 'right';
            ctx.fillText(type === 'gold' ? 'XAALISI GOLD' : (type === 'black' ? 'BUSINESS BLACK' : 'STANDARD SILVER'), cardW / 2 - 20, -cardH / 2 + 35);

            ctx.font = '600 13px "Fira Code", monospace';
            ctx.textAlign = 'left';
            ctx.fillText('4892  ••••  ••••  9123', -cardW / 2 + 25, 12);

            ctx.font = '700 10px "Plus Jakarta Sans", sans-serif';
            ctx.fillText('AMADOU SOW', -cardW / 2 + 25, 50);

            ctx.font = 'bold italic 16px "Plus Jakarta Sans", sans-serif';
            ctx.textAlign = 'right';
            ctx.fillText('VISA', cardW / 2 - 20, 52);
        }

        // Render Hero Visual Scene
        function renderScene() {
            if (width === 0 || height === 0) resizeCardCanvas();

            ctx.clearRect(0, 0, width, height);

            // Mouse Smoothing
            mouseX += (targetMouseX - mouseX) * 0.05;
            mouseY += (targetMouseY - mouseY) * 0.05;

            // Scroll-triggered slow-motion angle & frame progression
            const scrollProgress = Math.min(1, Math.max(0, currentScrollY / 400));

            const centerX = width / 2;
            const centerY = height / 2;

            // 1. Render Editorial Hand Image Background with Parallax
            if (handImgLoaded) {
                ctx.save();
                const imgAspect = handImg.width / handImg.height;
                const drawH = height * 1.1;
                const drawW = drawH * imgAspect;

                // Subtle parallax displacement
                const imgX = centerX - drawW / 2 + (mouseX * 12);
                const imgY = centerY - drawH / 2 + (mouseY * 12);

                ctx.drawImage(handImg, imgX, imgY, drawW, drawH);
                ctx.restore();
            }

            // 2. Warm Crimson & Golden Ambient Glow overlay around the lens center
            ctx.save();
            const glowGradient = ctx.createRadialGradient(centerX + 30, centerY - 20, 20, centerX + 30, centerY - 20, 260);
            glowGradient.addColorStop(0, 'rgba(255, 215, 0, 0.45)');
            glowGradient.addColorStop(0.4, 'rgba(255, 40, 0, 0.25)');
            glowGradient.addColorStop(1, 'rgba(0, 0, 0, 0)');

            ctx.fillStyle = glowGradient;
            ctx.beginPath();
            ctx.arc(centerX + 30, centerY - 20, 260, 0, Math.PI * 2);
            ctx.fill();
            ctx.restore();

            // 3. Render 3D XAALISI Credit Cards being held/reaching from the Hand
            const cardW = 265;
            const cardH = 158;

            // Card 1: Standard Silver Card (Fans out to Left on Scroll)
            ctx.save();
            const silverX = centerX + 40 - (scrollProgress * 125) + (mouseX * 18);
            const silverY = centerY + 10 - (scrollProgress * 35) + (mouseY * 18);
            const silverRot = -0.28 * scrollProgress + (mouseX * 0.08);
            ctx.translate(silverX, silverY);
            ctx.rotate(silverRot);
            drawGlowingCard(ctx, 'silver', cardW, cardH, false);
            ctx.restore();

            // Card 2: Business Black Card (Fans out to Right on Scroll)
            ctx.save();
            const blackX = centerX + 40 + (scrollProgress * 125) + (mouseX * 18);
            const blackY = centerY + 10 + (scrollProgress * 35) + (mouseY * 18);
            const blackRot = 0.28 * scrollProgress + (mouseX * 0.08);
            ctx.translate(blackX, blackY);
            ctx.rotate(blackRot);
            drawGlowingCard(ctx, 'black', cardW, cardH, false);
            ctx.restore();

            // Card 3: XAALISI Gold Credit Card (Held Front & Center by Hand Fingers)
            ctx.save();
            const goldX = centerX + 35 + (mouseX * 22);
            const goldY = centerY + 10 - (scrollProgress * 10) + (mouseY * 22);
            const goldRot = (mouseY * 0.06) + (scrollProgress * 0.03);
            ctx.translate(goldX, goldY);
            ctx.rotate(goldRot);
            drawGlowingCard(ctx, 'gold', cardW, cardH, true);
            ctx.restore();

            requestAnimationFrame(renderScene);
        }

        renderScene();
    }


    /* ==========================================================================
       2. SPEED & CONVENIENCE: APP UI MODALITY SWITCHER
       ========================================================================== */
    const appData = {
        virtual: {
            title: "Instant Virtual Card Generation",
            heading: "Instant Virtual Visa & Mastercard Creation",
            desc: "Create unlimited virtual Visa & Mastercard credit cards in seconds for safe online shopping, streaming subscriptions, and international payments.",
            stat1: "0.8s",
            desc1: "Card Provisioning Time",
            stat2: "0%",
            desc2: "Hidden Foreign Exchange Markup",
            appContent: `
                <div style="background: rgba(255,215,0,0.08); border: 1px solid var(--border-dark-gold); padding: 1.25rem; border-radius: 16px; margin-bottom: 1rem;">
                    <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 0.8rem;">
                        <span style="font-size: 0.85rem; font-weight: 700; color: var(--color-gold-bright);">Active Virtual Visa</span>
                        <span style="font-size: 0.75rem; background: #10B981; color: #000; padding: 0.1rem 0.5rem; border-radius: 999px; font-weight: 700;">ONLINE</span>
                    </div>
                    <div style="font-family: var(--font-mono); font-size: 1.05rem; letter-spacing: 0.1em; color: #FFF; margin-bottom: 0.6rem;">4912 •••• •••• 8840</div>
                    <div style="display: flex; justify-content: space-between; font-size: 0.78rem; color: #A1A1AA;">
                        <span>CVV: ***</span>
                        <span>EXP: 11/28</span>
                    </div>
                </div>
                <div style="font-size: 0.8rem; color: #A1A1AA; display: flex; align-items: center; gap: 0.5rem;">
                    <i data-lucide="shield-check" style="color: #10B981; width: 16px; height: 16px;"></i>
                    <span>3D Secure v2 OTP protection enabled</span>
                </div>
            `
        },
        qr: {
            title: "Contactless Merchant QR Checkout",
            heading: "Instant Merchant QR Code Scanning",
            desc: "Scan merchant QR codes in retail stores or generate your personal receive QR code for instant zero-contact settlement.",
            stat1: "0.4s",
            desc1: "QR Settlement Speed",
            stat2: "100%",
            desc2: "Contactless & Cashless",
            appContent: `
                <div style="text-align: center; padding: 1.5rem 1rem; background: rgba(255,215,0,0.05); border: 1px dashed var(--border-dark-gold); border-radius: 16px;">
                    <div style="width: 90px; height: 90px; margin: 0 auto 0.8rem auto; background: #FFF; padding: 0.5rem; border-radius: 12px; display: flex; align-items: center; justify-content: center;">
                        <i data-lucide="qr-code" style="width: 70px; height: 70px; color: #0A0A0A;"></i>
                    </div>
                    <span style="display: block; font-size: 0.9rem; font-weight: 700; color: var(--color-gold-bright);">Scan to Pay Merchant</span>
                    <span style="font-size: 0.75rem; color: #A1A1AA;">Auchan Supermarket • Dakar Terminal #04</span>
                </div>
            `
        },
        ussd: {
            title: "Offline USSD Banking (*999#)",
            heading: "Complete Banking via USSD Shortcodes",
            desc: "No internet or smartphone required. Dial *999# on any basic phone to transfer money, check balances, or pay bills anytime.",
            stat1: "100%",
            desc1: "Offline Network Coverage",
            stat2: "*999#",
            desc2: "Universal Shortcode",
            appContent: `
                <div style="background: #18181B; border: 1px solid var(--border-dark-gold); border-radius: 16px; padding: 1.25rem; font-family: var(--font-mono);">
                    <div style="color: var(--color-gold-bright); font-size: 0.85rem; margin-bottom: 0.8rem;">[XAALISI USSD MENU]</div>
                    <div style="font-size: 0.8rem; color: #ECECEE; line-height: 1.6;">
                        1. Check Balance<br>
                        2. Transfer Money<br>
                        3. Issue Virtual Card<br>
                        4. Cash-Out Token
                    </div>
                    <div style="margin-top: 1rem; padding-top: 0.8rem; border-top: 1px solid #27272A; color: #10B981; font-size: 0.78rem;">
                        Reply with option number...
                    </div>
                </div>
            `
        },
        remittance: {
            title: "Diaspora Remittance Corridor",
            heading: "Seamless Global Remittances to West Africa",
            desc: "Direct transfers from Europe (Paris, London), US (New York), into Mali and West African wallets in under 2 seconds with fees under 0.5%.",
            stat1: "< 1.8s",
            desc1: "Paris/NYC to Mali Speed",
            stat2: "0.5%",
            desc2: "Fixed Remittance Fee",
            appContent: `
                <div style="background: rgba(255,215,0,0.08); border: 1px solid var(--border-dark-gold); padding: 1.25rem; border-radius: 16px;">
                    <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 0.8rem;">
                        <span style="font-size: 0.8rem; color: #A1A1AA;">Incoming Transfer: Paris -> Bamako, Mali</span>
                        <span style="font-size: 0.75rem; color: #10B981; font-weight: 700;">SETTLED</span>
                    </div>
                    <div style="font-size: 1.4rem; font-weight: 800; color: var(--color-gold-bright); font-family: var(--font-mono); margin-bottom: 0.4rem;">+ 327,975 FCFA</div>
                    <div style="font-size: 0.78rem; color: #A1A1AA;">Sent: €500.00 EUR &bull; Receiver: Bamako Wallet</div>
                </div>
            `
        }
    };

    function updateAppSection(modality) {
        const data = appData[modality];
        if (!data) return;

        const titleEl = document.getElementById('featureDetailTitle');
        if (!titleEl) return;
        
        titleEl.textContent = data.heading;
        document.getElementById('featureDetailDesc').textContent = data.desc;
        document.getElementById('statValue1').textContent = data.stat1;
        document.querySelectorAll('.stat-desc')[0].textContent = data.desc1;
        document.getElementById('statValue2').textContent = data.stat2;
        document.querySelectorAll('.stat-desc')[1].textContent = data.desc2;

        const bodyContainer = document.getElementById('mobileAppDynamicBody');
        bodyContainer.innerHTML = data.appContent;
        if (window.lucide) lucide.createIcons();
    }

    updateAppSection('virtual');

    const badgeSelectorGroup = document.getElementById('badgeSelectorGroup');
    if (badgeSelectorGroup) {
        badgeSelectorGroup.addEventListener('click', (e) => {
            const btn = e.target.closest('.badge-tag-gold');
            if (!btn) return;
            document.querySelectorAll('.badge-tag-gold').forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            const modality = btn.getAttribute('data-modality');
            updateAppSection(modality);
        });
    }


    /* ==========================================================================
       3. GLOBAL REMITTANCE: GIANT 3D CONTINUOUS-MOTION GLOBE WITH MALI HUB
       ========================================================================== */
    /* ==========================================================================
       3. GLOBAL REMITTANCE: GIANT 3D CONTINUOUS-MOTION GLOBE WITH MALI HUB
       ========================================================================== */
    const globeCanvas = document.getElementById('globeCanvas'); console.log('DEBUG: globeCanvas is', globeCanvas); if(globeCanvas) { console.log('DEBUG: globeCanvas width', globeCanvas.parentElement?.offsetWidth); }
    if (globeCanvas) {
        const ctx = globeCanvas.getContext('2d');
        let width = 750;
        let height = 620;
        let rotationX = 0.2;
        let rotationY = 1.2;
        let isDragging = false;
        let lastMouseX, lastMouseY;

        function resizeGlobe() {
            const parent = globeCanvas.parentElement;
            const parentW = parent ? parent.offsetWidth : 0;
            width = globeCanvas.width = parentW > 50 ? parentW : 750;
            height = globeCanvas.height = 620;
        }
        // Delay first resize to ensure DOM is painted
        requestAnimationFrame(() => {
            resizeGlobe();
        });
        window.addEventListener('resize', resizeGlobe);

        // Giant Globe Radius (260px)
        const radius = 260;

        // Generate 3D Latitude and Longitude Grid Lines for realistic Earth Sphere structure
        const gridLines = [];
        // Parallels (Latitudes)
        for (let latDeg = -60; latDeg <= 60; latDeg += 30) {
            const line = [];
            const lat = (latDeg * Math.PI) / 180;
            for (let lonDeg = 0; lonDeg <= 360; lonDeg += 10) {
                const lon = (lonDeg * Math.PI) / 180;
                const x = radius * Math.cos(lat) * Math.sin(lon);
                const y = -radius * Math.sin(lat);
                const z = radius * Math.cos(lat) * Math.cos(lon);
                line.push({ x, y, z });
            }
            gridLines.push(line);
        }
        // Meridians (Longitudes)
        for (let lonDeg = 0; lonDeg < 360; lonDeg += 45) {
            const line = [];
            const lon = (lonDeg * Math.PI) / 180;
            for (let latDeg = -90; latDeg <= 90; latDeg += 10) {
                const lat = (latDeg * Math.PI) / 180;
                const x = radius * Math.cos(lat) * Math.sin(lon);
                const y = -radius * Math.sin(lat);
                const z = radius * Math.cos(lat) * Math.cos(lon);
                line.push({ x, y, z });
            }
            gridLines.push(line);
        }

        const continentRegions = [
            { latMin: -35, latMax: 37, lonMin: -18, lonMax: 50, density: 280, name: 'Africa' },
            { latMin: 36, latMax: 70, lonMin: -10, lonMax: 40, density: 160, name: 'Europe' },
            { latMin: 15, latMax: 72, lonMin: -165, lonMax: -52, density: 200, name: 'North America' },
            { latMin: -55, latMax: 12, lonMin: -82, lonMax: -34, density: 160, name: 'South America' },
            { latMin: 10, latMax: 75, lonMin: 45, lonMax: 145, density: 280, name: 'Asia' },
        ];

        const points = [];

        continentRegions.forEach(region => {
            for (let k = 0; k < region.density; k++) {
                const latDeg = region.latMin + Math.random() * (region.latMax - region.latMin);
                const lonDeg = region.lonMin + Math.random() * (region.lonMax - region.lonMin);

                const lat = (latDeg * Math.PI) / 180;
                const lon = (lonDeg * Math.PI) / 180;

                const x = radius * Math.cos(lat) * Math.sin(lon);
                const y = -radius * Math.sin(lat);
                const z = radius * Math.cos(lat) * Math.cos(lon);

                const isMali = (latDeg >= 10 && latDeg <= 20 && lonDeg >= -12 && lonDeg <= 2);

                points.push({ x, y, z, latDeg, lonDeg, isMali, region: region.name });
            }
        });

        // 50+ Global Financial Cities across Africa, Europe, North America, South America, Middle East, Asia & Australia
        const hubs = [
            { name: 'Mali (Bamako)', lat: 12.6, lon: -8.0, isMegaHub: true },
            { name: 'Senegal (Dakar)', lat: 14.7, lon: -17.4, isMegaHub: false },
            { name: 'Ivory Coast (Abidjan)', lat: 5.3, lon: -4.0, isMegaHub: false },
            { name: 'Morocco (Casablanca)', lat: 33.5, lon: -7.5, isMegaHub: false },
            { name: 'Nigeria (Lagos)', lat: 6.5, lon: 3.37, isMegaHub: false },
            { name: 'Ghana (Accra)', lat: 5.6, lon: -0.18, isMegaHub: false },
            { name: 'Guinea (Conakry)', lat: 9.6, lon: -13.5, isMegaHub: false },
            { name: 'South Africa (Johannesburg)', lat: -26.2, lon: 28.0, isMegaHub: false },
            { name: 'Kenya (Nairobi)', lat: -1.28, lon: 36.8, isMegaHub: false },
            { name: 'Egypt (Cairo)', lat: 30.0, lon: 31.2, isMegaHub: false },
            { name: 'Tunisia (Tunis)', lat: 36.8, lon: 10.1, isMegaHub: false },
            { name: 'Algeria (Algiers)', lat: 36.7, lon: 3.0, isMegaHub: false },
            { name: 'France (Paris)', lat: 48.8, lon: 2.3, isMegaHub: false },
            { name: 'UK (London)', lat: 51.5, lon: -0.1, isMegaHub: false },
            { name: 'Spain (Madrid)', lat: 40.4, lon: -3.7, isMegaHub: false },
            { name: 'Italy (Milan)', lat: 45.4, lon: 9.1, isMegaHub: false },
            { name: 'Germany (Frankfurt)', lat: 50.1, lon: 8.6, isMegaHub: false },
            { name: 'Switzerland (Geneva)', lat: 46.2, lon: 6.1, isMegaHub: false },
            { name: 'Netherlands (Amsterdam)', lat: 52.3, lon: 4.9, isMegaHub: false },
            { name: 'Belgium (Brussels)', lat: 50.8, lon: 4.3, isMegaHub: false },
            { name: 'Portugal (Lisbon)', lat: 38.7, lon: -9.1, isMegaHub: false },
            { name: 'Sweden (Stockholm)', lat: 59.3, lon: 18.0, isMegaHub: false },
            { name: 'Turkey (Istanbul)', lat: 41.0, lon: 28.9, isMegaHub: false },
            { name: 'USA (New York)', lat: 40.7, lon: -74.0, isMegaHub: false },
            { name: 'USA (Washington D.C.)', lat: 38.9, lon: -77.0, isMegaHub: false },
            { name: 'USA (Los Angeles)', lat: 34.0, lon: -118.2, isMegaHub: false },
            { name: 'USA (Chicago)', lat: 41.8, lon: -87.6, isMegaHub: false },
            { name: 'USA (Miami)', lat: 25.7, lon: -80.1, isMegaHub: false },
            { name: 'Canada (Montreal)', lat: 45.5, lon: -73.5, isMegaHub: false },
            { name: 'Canada (Toronto)', lat: 43.6, lon: -79.3, isMegaHub: false },
            { name: 'Brazil (Sao Paulo)', lat: -23.5, lon: -46.6, isMegaHub: false },
            { name: 'Argentina (Buenos Aires)', lat: -34.6, lon: -58.3, isMegaHub: false },
            { name: 'UAE (Dubai)', lat: 25.2, lon: 55.3, isMegaHub: false },
            { name: 'Saudi Arabia (Riyadh)', lat: 24.7, lon: 46.7, isMegaHub: false },
            { name: 'Qatar (Doha)', lat: 25.2, lon: 51.5, isMegaHub: false },
            { name: 'China (Guangzhou)', lat: 23.1, lon: 113.2, isMegaHub: false },
            { name: 'China (Shanghai)', lat: 31.2, lon: 121.4, isMegaHub: false },
            { name: 'Japan (Tokyo)', lat: 35.6, lon: 139.6, isMegaHub: false },
            { name: 'South Korea (Seoul)', lat: 37.5, lon: 126.9, isMegaHub: false },
            { name: 'Singapore', lat: 1.35, lon: 103.8, isMegaHub: false },
            { name: 'India (Mumbai)', lat: 19.0, lon: 72.8, isMegaHub: false },
            { name: 'Australia (Sydney)', lat: -33.8, lon: 151.2, isMegaHub: false },
            { name: 'Benin (Cotonou)', lat: 6.36, lon: 2.42, isMegaHub: false },
            { name: 'Togo (Lome)', lat: 6.13, lon: 1.22, isMegaHub: false },
            { name: 'Burkina Faso (Ouagadougou)', lat: 12.3, lon: -1.5, isMegaHub: false },
            { name: 'Niger (Niamey)', lat: 13.5, lon: 2.1, isMegaHub: false },
            { name: 'Cameroon (Douala)', lat: 4.05, lon: 9.7, isMegaHub: false },
            { name: 'Gabon (Libreville)', lat: 0.39, lon: 9.45, isMegaHub: false },
            { name: 'Congo (Brazzaville)', lat: -4.26, lon: 15.2, isMegaHub: false }
        ];

        // 50 Active Remittance Corridors (25 Connecting to Mali Hub + 25 Global Intercontinental Corridors)
        const corridors = [
            // Corridors Connecting directly to Mali (Bamako MegaHub)
            { from: 'France (Paris)', to: 'Mali (Bamako)' },
            { from: 'USA (New York)', to: 'Mali (Bamako)' },
            { from: 'Canada (Montreal)', to: 'Mali (Bamako)' },
            { from: 'UAE (Dubai)', to: 'Mali (Bamako)' },
            { from: 'Senegal (Dakar)', to: 'Mali (Bamako)' },
            { from: 'Ivory Coast (Abidjan)', to: 'Mali (Bamako)' },
            { from: 'Morocco (Casablanca)', to: 'Mali (Bamako)' },
            { from: 'Spain (Madrid)', to: 'Mali (Bamako)' },
            { from: 'Switzerland (Geneva)', to: 'Mali (Bamako)' },
            { from: 'UK (London)', to: 'Mali (Bamako)' },
            { from: 'Saudi Arabia (Riyadh)', to: 'Mali (Bamako)' },
            { from: 'Belgium (Brussels)', to: 'Mali (Bamako)' },
            { from: 'USA (Washington D.C.)', to: 'Mali (Bamako)' },
            { from: 'China (Guangzhou)', to: 'Mali (Bamako)' },
            { from: 'Nigeria (Lagos)', to: 'Mali (Bamako)' },
            { from: 'Burkina Faso (Ouagadougou)', to: 'Mali (Bamako)' },
            { from: 'Niger (Niamey)', to: 'Mali (Bamako)' },
            { from: 'Togo (Lome)', to: 'Mali (Bamako)' },
            { from: 'Benin (Cotonou)', to: 'Mali (Bamako)' },
            { from: 'Guinea (Conakry)', to: 'Mali (Bamako)' },
            { from: 'Cameroon (Douala)', to: 'Mali (Bamako)' },
            { from: 'Germany (Frankfurt)', to: 'Mali (Bamako)' },
            { from: 'Italy (Milan)', to: 'Mali (Bamako)' },
            { from: 'Netherlands (Amsterdam)', to: 'Mali (Bamako)' },
            { from: 'Turkey (Istanbul)', to: 'Mali (Bamako)' },

            // Intercontinental Worldwide Corridors
            { from: 'USA (New York)', to: 'UK (London)' },
            { from: 'France (Paris)', to: 'Morocco (Casablanca)' },
            { from: 'Canada (Montreal)', to: 'France (Paris)' },
            { from: 'UAE (Dubai)', to: 'India (Mumbai)' },
            { from: 'Japan (Tokyo)', to: 'Singapore' },
            { from: 'Australia (Sydney)', to: 'UK (London)' },
            { from: 'Brazil (Sao Paulo)', to: 'Spain (Madrid)' },
            { from: 'China (Shanghai)', to: 'UAE (Dubai)' },
            { from: 'South Africa (Johannesburg)', to: 'UK (London)' },
            { from: 'USA (Chicago)', to: 'Canada (Toronto)' },
            { from: 'USA (Los Angeles)', to: 'Japan (Tokyo)' },
            { from: 'Germany (Frankfurt)', to: 'UK (London)' },
            { from: 'Spain (Madrid)', to: 'Argentina (Buenos Aires)' },
            { from: 'Portugal (Lisbon)', to: 'Brazil (Sao Paulo)' },
            { from: 'Switzerland (Geneva)', to: 'UK (London)' },
            { from: 'Turkey (Istanbul)', to: 'Germany (Frankfurt)' },
            { from: 'Qatar (Doha)', to: 'Saudi Arabia (Riyadh)' },
            { from: 'USA (Miami)', to: 'Brazil (Sao Paulo)' },
            { from: 'UK (London)', to: 'Nigeria (Lagos)' },
            { from: 'France (Paris)', to: 'Algeria (Algiers)' },
            { from: 'France (Paris)', to: 'Tunisia (Tunis)' },
            { from: 'Netherlands (Amsterdam)', to: 'Belgium (Brussels)' },
            { from: 'South Korea (Seoul)', to: 'Japan (Tokyo)' },
            { from: 'UAE (Abu Dhabi)', to: 'Egypt (Cairo)' },
            { from: 'Singapore', to: 'China (Shanghai)' }
        ];

        // Real-Time Dynamic Remittance Feed Ticker
        const liveFeedContainer = document.getElementById('liveActivityFeedList');
        if (liveFeedContainer) {
            const feedTemplates = [
                { route: 'Paris → Bamako', val: '+ 327,975 FCFA' },
                { route: 'New York → Bamako', val: '+ $650.00 USD' },
                { route: 'Montreal → Bamako', val: '+ $480.00 CAD' },
                { route: 'Dubai → Bamako', val: '+ 1,850 AED' },
                { route: 'Dakar → Bamako', val: '+ 150,000 FCFA' },
                { route: 'Geneva → Bamako', val: '+ 420.00 CHF' },
                { route: 'Madrid → Casablanca', val: '+ 3,200 MAD' },
                { route: 'London → Lagos', val: '+ £350.00 GBP' },
                { route: 'Tokyo → Singapore', val: '+ ¥85,000 JPY' },
                { route: 'Riyadh → Bamako', val: '+ 950 SAR' }
            ];

            let feedIdx = 0;
            setInterval(() => {
                const item = feedTemplates[feedIdx % feedTemplates.length];
                feedIdx++;

                const newDiv = document.createElement('div');
                newDiv.className = 'activity-item';
                newDiv.style.animation = 'fadeInDown 0.4s ease forwards';
                newDiv.innerHTML = `
                    <span class="act-flag">&bull; ${item.route}</span>
                    <span class="act-amount">${item.val}</span>
                `;

                liveFeedContainer.prepend(newDiv);
                if (liveFeedContainer.children.length > 3) {
                    liveFeedContainer.removeChild(liveFeedContainer.lastChild);
                }
            }, 3000);
        }

        globeCanvas.addEventListener('mousedown', (e) => {
            isDragging = true;
            lastMouseX = e.clientX;
            lastMouseY = e.clientY;
        });

        window.addEventListener('mousemove', (e) => {
            if (!isDragging) return;
            const deltaX = e.clientX - lastMouseX;
            const deltaY = e.clientY - lastMouseY;
            rotationY += deltaX * 0.003;
            rotationX += deltaY * 0.003;
            lastMouseX = e.clientX;
            lastMouseY = e.clientY;
        });

        window.addEventListener('mouseup', () => { isDragging = false; });

        function drawGlobe() {
            // Ensure canvas is properly sized before rendering
            if (!width || width < 100) resizeGlobe();

            ctx.clearRect(0, 0, width, height);

            const centerX = width / 2;
            const centerY = height / 2;

            // Draw solid dark sphere base (always visible)
            const sphereGrad = ctx.createRadialGradient(
                centerX - radius * 0.25, centerY - radius * 0.25, radius * 0.1,
                centerX, centerY, radius
            );
            sphereGrad.addColorStop(0, 'rgba(25, 18, 5, 0.98)');
            sphereGrad.addColorStop(0.5, 'rgba(12, 9, 2, 0.98)');
            sphereGrad.addColorStop(1, 'rgba(4, 3, 1, 0.99)');
            ctx.save();
            ctx.beginPath();
            ctx.arc(centerX, centerY, radius, 0, Math.PI * 2);
            ctx.fillStyle = sphereGrad;
            ctx.fill();
            ctx.restore();

            // Draw glowing amber atmosphere ring
            ctx.save();
            ctx.beginPath();
            ctx.arc(centerX, centerY, radius + 2, 0, Math.PI * 2);
            ctx.strokeStyle = 'rgba(255, 180, 0, 0.35)';
            ctx.lineWidth = 3;
            // ctx.shadowColor = '#FFD700';
            // ctx.shadowBlur = 28;
            ctx.stroke();
            ctx.restore();

            // Slow cinematic rotation speed
            if (!isDragging) {
                rotationY += 0.0008 + (currentScrollY * 0.000001);
            }

            const cosX = Math.cos(rotationX);
            const sinX = Math.sin(rotationX);
            const cosY = Math.cos(rotationY);
            const sinY = Math.sin(rotationY);

            // Render 3D Lat/Long Sphere Wireframe Grid
            gridLines.forEach(line => {
                ctx.save();
                ctx.beginPath();
                let first = true;
                line.forEach(pt => {
                    let x1 = pt.x * cosY + pt.z * sinY;
                    let z1 = pt.z * cosY - pt.x * sinY;
                    let y2 = pt.y * cosX - z1 * sinX;
                    let z2 = z1 * cosX + pt.y * sinX;

                    if (z2 > -50) {
                        const px = x1 + centerX;
                        const py = y2 + centerY;
                        if (first) {
                            ctx.moveTo(px, py);
                            first = false;
                        } else {
                            ctx.lineTo(px, py);
                        }
                    } else {
                        first = true;
                    }
                });
                ctx.strokeStyle = 'rgba(255, 215, 0, 0.15)';
                ctx.lineWidth = 1.0;
                ctx.stroke();
                ctx.restore();
            });

            const projectedPoints = points.map(pt => {
                let x1 = pt.x * cosY + pt.z * sinY;
                let z1 = pt.z * cosY - pt.x * sinY;
                let y2 = pt.y * cosX - z1 * sinX;
                let z2 = z1 * cosX + pt.y * sinX;

                return {
                    x: x1 + centerX,
                    y: y2 + centerY,
                    z: z2,
                    isMali: pt.isMali
                };
            }).sort((a, b) => a.z - b.z);

            // Render Landmass Points (Gold & Amber Palette)
            projectedPoints.forEach(pt => {
                const alpha = (pt.z + radius) / (2 * radius);
                if (alpha < 0.08) return;

                ctx.save();
                if (pt.isMali && pt.z > 0) {
                    // ctx.shadowColor = '#FFD700';
                    // ctx.shadowBlur = 10;
                    ctx.fillStyle = '#FFD700';
                    ctx.beginPath();
                    ctx.arc(pt.x, pt.y, 3.2, 0, Math.PI * 2);
                    ctx.fill();
                } else {
                    ctx.fillStyle = `rgba(212, 175, 55, ${Math.max(0.12, alpha * 0.8)})`;
                    ctx.beginPath();
                    ctx.arc(pt.x, pt.y, 1.8, 0, Math.PI * 2);
                    ctx.fill();
                }
                ctx.restore();
            });

            const hubCoords = hubs.map(h => {
                const lat = (h.lat * Math.PI) / 180;
                const lon = (h.lon * Math.PI) / 180;

                const x = radius * Math.cos(lat) * Math.sin(lon);
                const y = -radius * Math.sin(lat);
                const z = radius * Math.cos(lat) * Math.cos(lon);

                let x1 = x * cosY + z * sinY;
                let z1 = z * cosY - x * sinY;
                let y2 = y * cosX - z1 * sinX;
                let z2 = z1 * cosX + y * sinX;

                return {
                    name: h.name,
                    x: x1 + centerX,
                    y: y2 + centerY,
                    z: z2,
                    isMegaHub: h.isMegaHub
                };
            });

            // Draw Smooth Non-Stop Continuous Remittance Arcs Between Global Corridor City Pairs
            const nowSec = Date.now() * 0.0008;

            corridors.forEach((corr, idx) => {
                const fromNode = hubCoords.find(n => n.name === corr.from);
                const toNode = hubCoords.find(n => n.name === corr.to);

                if (fromNode && toNode && fromNode.z > -80 && toNode.z > -80) {
                    ctx.save();

                    // Sleek Thin Arc stroke (Gold with soft blur)
                    ctx.strokeStyle = 'rgba(255, 215, 0, 0.55)';
                    ctx.lineWidth = 1.5;
                    // ctx.shadowColor = '#FFD700';
                    // ctx.shadowBlur = 8;

                    ctx.beginPath();
                    const midX = (fromNode.x + toNode.x) / 2;
                    const midY = (fromNode.y + toNode.y) / 2 - 50;
                    ctx.moveTo(fromNode.x, fromNode.y);
                    ctx.quadraticCurveTo(midX, midY, toNode.x, toNode.y);
                    ctx.stroke();

                    // Continuous Staggered Pulses (Sleek 2.5px Gold Tracers)
                    [0, 0.33, 0.66].forEach(offset => {
                        const t = (nowSec + (idx * 0.15) + offset) % 1;
                        const px = (1 - t) * (1 - t) * fromNode.x + 2 * (1 - t) * t * midX + t * t * toNode.x;
                        const py = (1 - t) * (1 - t) * fromNode.y + 2 * (1 - t) * t * midY + t * t * toNode.y;

                        // Glowing Amber-Gold Sleek Packet
                        ctx.fillStyle = '#FFD700';
                        // ctx.shadowColor = '#FF9900';
                        // ctx.shadowBlur = 10;
                        ctx.beginPath();
                        ctx.arc(px, py, 2.5, 0, Math.PI * 2);
                        ctx.fill();
                    });

                    ctx.restore();
                }
            });

            // Draw Hub City Node Dots (Sleek Micro Dots)
            hubCoords.forEach(h => {
                if (h.z > -40) {
                    ctx.save();
                    if (h.isMegaHub) {
                        const pulseR = 5 + Math.sin(Date.now() * 0.004) * 2;
                        // ctx.shadowColor = '#FFD700';
                        // ctx.shadowBlur = 20;
                        ctx.fillStyle = '#FFD700';
                        ctx.beginPath();
                        ctx.arc(h.x, h.y, pulseR, 0, Math.PI * 2);
                        ctx.fill();

                        ctx.font = '800 12px "Plus Jakarta Sans", sans-serif';
                        ctx.fillStyle = '#FFD700';
                        ctx.fillText('MALI (HUB)', h.x + 12, h.y + 4);
                    } else {
                        // ctx.shadowColor = '#FF9900';
                        // ctx.shadowBlur = 8;
                        ctx.fillStyle = '#FFD700';
                        ctx.beginPath();
                        ctx.arc(h.x, h.y, 2.6, 0, Math.PI * 2);
                        ctx.fill();

                        ctx.font = '600 10px "Plus Jakarta Sans", sans-serif';
                        ctx.fillStyle = 'rgba(255, 215, 0, 0.8)';
                        ctx.fillText(h.name, h.x + 6, h.y + 3);
                    }
                    ctx.restore();
                }
            });

            requestAnimationFrame(drawGlobe);
        }

        // Small delay to ensure proper sizing before first frame
        setTimeout(() => {
            resizeGlobe();
            drawGlobe();
        }, 50);
    }


    /* ==========================================================================
       4. INTERACTIVE BANKING PLAYGROUND DEMO CONSOLE
       ========================================================================== */
    const consoleInteractiveView = document.getElementById('consoleInteractiveView');
    const playgroundTabs = document.getElementById('playgroundTabs');

    let activeTab = 'virtual';

    const tabViews = {
        virtual: `
            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 2rem; align-items: center;">
                <div>
                    <h3 style="font-size: 1.2rem; color: #FFF; margin-bottom: 0.5rem;">Virtual Card Provisioning Simulator</h3>
                    <p style="font-size: 0.88rem; color: #A1A1AA; margin-bottom: 1.2rem;">Type cardholder name to generate live Visa card instantly.</p>
                    
                    <div style="margin-bottom: 1rem;">
                        <label style="display: block; font-size: 0.8rem; color: var(--color-gold-bright); margin-bottom: 0.3rem;">Cardholder Name:</label>
                        <input type="text" id="inputCardName" value="Amadou Sow" style="width: 100%; background: #18181B; border: 1px solid var(--border-dark-gold); padding: 0.6rem 0.9rem; border-radius: 8px; color: #FFF; font-size: 0.9rem; outline: none;">
                    </div>

                    <button class="btn-gold-pill btn-full" id="btnGenCard">Generate New Card Number</button>
                </div>

                <div style="background: var(--gradient-gold-card); border: 2px solid var(--color-gold-bright); border-radius: 16px; padding: 1.5rem; color: #FFF; box-shadow: 0 10px 25px rgba(212, 175, 55, 0.25);">
                    <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 1.5rem;">
                        <span style="font-size: 0.85rem; font-weight: 800; color: var(--color-gold-bright);">XAALISI VIRTUAL</span>
                        <span style="font-size: 0.75rem; font-family: var(--font-mono); color: #10B981;">STATUS: ACTIVE</span>
                    </div>
                    <div id="simCardNumber" style="font-family: var(--font-mono); font-size: 1.15rem; letter-spacing: 0.1em; color: #FFF; margin-bottom: 1.2rem;">4892 •••• •••• 9123</div>
                    <div style="display: flex; justify-content: space-between; font-size: 0.8rem; color: #A1A1AA;">
                        <span id="simCardHolder">AMADOU SOW</span>
                        <span>CVV: <strong style="color: var(--color-gold-bright);" id="simCvv">842</strong></span>
                    </div>
                </div>
            </div>
        `,
        qr: `
            <div style="text-align: center; max-width: 450px; margin: 0 auto;">
                <h3 style="font-size: 1.2rem; color: #FFF; margin-bottom: 0.5rem;">Merchant Instant QR Checkout</h3>
                <p style="font-size: 0.88rem; color: #A1A1AA; margin-bottom: 1.5rem;">Simulate scanning a store checkout QR code for 12,500 FCFA purchase.</p>
                <div style="background: rgba(255,215,0,0.05); border: 1px solid var(--border-dark-gold); padding: 1.5rem; border-radius: 16px; margin-bottom: 1.2rem;">
                    <div style="font-size: 1.5rem; font-weight: 800; color: var(--color-gold-bright); font-family: var(--font-mono); margin-bottom: 0.4rem;">12,500 FCFA</div>
                    <div style="font-size: 0.85rem; color: #A1A1AA;">Merchant: City Pharmacy Dakar / Bamako</div>
                </div>
                <button class="btn-gold-pill btn-full" id="btnApproveQr">Approve Payment</button>
            </div>
        `,
        transfer: `
            <div style="max-width: 500px; margin: 0 auto;">
                <h3 style="font-size: 1.2rem; color: #FFF; margin-bottom: 0.5rem; text-align: center;">Diaspora Remittance Calculator</h3>
                <p style="font-size: 0.88rem; color: #A1A1AA; margin-bottom: 1.5rem; text-align: center;">Convert EUR/USD to XOF (FCFA) at official zero-markup rates.</p>

                <div style="display: flex; gap: 1rem; margin-bottom: 1rem;">
                    <input type="number" id="sendEurVal" value="100" style="flex: 1; background: #18181B; border: 1px solid var(--border-dark-gold); padding: 0.75rem; border-radius: 8px; color: #FFF; font-size: 1rem; outline: none;">
                    <span style="display: flex; align-items: center; color: var(--color-gold-bright); font-weight: 700;">EUR (€)</span>
                </div>

                <div style="text-align: center; margin: 0.5rem 0; color: #A1A1AA; font-size: 0.85rem;">equals approximately</div>

                <div style="background: rgba(212, 175, 55, 0.12); border: 1px solid var(--border-dark-gold); padding: 1rem; border-radius: 12px; text-align: center; margin-bottom: 1.5rem;">
                    <span id="receiveXofVal" style="font-size: 1.8rem; font-weight: 800; color: var(--color-gold-bright); font-family: var(--font-mono);">65,595 FCFA</span>
                    <span style="display: block; font-size: 0.75rem; color: #10B981; margin-top: 0.2rem;">Zero Fee &bull; Delivered to Mali / West Africa</span>
                </div>
            </div>
        `,
        ussd: `
            <div style="text-align: center; max-width: 380px; margin: 0 auto;">
                <h3 style="font-size: 1.2rem; color: #FFF; margin-bottom: 0.5rem;">Offline USSD Dialer (*999#)</h3>
                <p style="font-size: 0.88rem; color: #A1A1AA; margin-bottom: 1.2rem;">Click Dial to initiate offline USSD session.</p>

                <div style="background: #18181B; border: 1px solid var(--border-dark-gold); border-radius: 16px; padding: 1.25rem; font-family: var(--font-mono); text-align: left; margin-bottom: 1.2rem;">
                    <div style="color: var(--color-gold-bright); font-size: 0.9rem; margin-bottom: 0.5rem;" id="ussdScreenHeader">*999# Dialed...</div>
                    <div style="font-size: 0.85rem; color: #FFF;" id="ussdScreenContent">
                        1. Check Balance<br>2. Send Money<br>3. Virtual Card
                    </div>
                </div>

                <button class="btn-gold-pill btn-full" id="btnDialUssd">Dial *999# Now</button>
            </div>
        `
    };

    function attachConsoleListeners(tab) {
        if (tab === 'virtual') {
            const nameInput = document.getElementById('inputCardName');
            const btnGen = document.getElementById('btnGenCard');

            if (nameInput) {
                nameInput.addEventListener('input', () => {
                    const val = nameInput.value.trim().toUpperCase() || 'AMADOU SOW';
                    document.getElementById('simCardHolder').textContent = val;
                });
            }

            if (btnGen) {
                btnGen.addEventListener('click', () => {
                    const random4 = Math.floor(1000 + Math.random() * 9000);
                    document.getElementById('simCardNumber').textContent = `4892 •••• •••• ${random4}`;
                    document.getElementById('simCvv').textContent = Math.floor(100 + Math.random() * 900);
                });
            }
        } else if (tab === 'qr') {
            const btnQr = document.getElementById('btnApproveQr');
            if (btnQr) {
                btnQr.addEventListener('click', () => {
                    alert('Payment Authorized! 12,500 FCFA settled instantly via XAALISI Wallet.');
                });
            }
        } else if (tab === 'transfer') {
            const sendInput = document.getElementById('sendEurVal');
            const receiveXof = document.getElementById('receiveXofVal');
            if (sendInput && receiveXof) {
                sendInput.addEventListener('input', () => {
                    const eur = parseFloat(sendInput.value) || 0;
                    const xof = Math.round(eur * 655.95);
                    receiveXof.textContent = `${xof.toLocaleString()} FCFA`;
                });
            }
        } else if (tab === 'ussd') {
            const btnDial = document.getElementById('btnDialUssd');
            if (btnDial) {
                btnDial.addEventListener('click', () => {
                    document.getElementById('ussdScreenHeader').textContent = "USSD Connected:";
                    document.getElementById('ussdScreenContent').textContent = "Welcome Amadou! Your balance is 2,450,000 FCFA.";
                });
            }
        }
    }

    function renderTabView(tab) {
        if (!consoleInteractiveView) return;
        consoleInteractiveView.innerHTML = tabViews[tab];
        attachConsoleListeners(tab);
        if (window.lucide) lucide.createIcons();
    }

    renderTabView('virtual');

    if (playgroundTabs) {
        playgroundTabs.addEventListener('click', (e) => {
            const btn = e.target.closest('.tab-btn-gold');
            if (!btn) return;
            document.querySelectorAll('#playgroundTabs .tab-btn-gold').forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            activeTab = btn.getAttribute('data-tab');
            renderTabView(activeTab);
        });
    }


    /* ==========================================================================
       5. FAQ ACCORDION LOGIC
       ========================================================================== */
    const faqWrapper = document.querySelector('.faq-accordion-wrapper');
    if (faqWrapper) {
        faqWrapper.addEventListener('click', (e) => {
            const item = e.target.closest('.faq-item');
            const trigger = e.target.closest('.faq-trigger');
            if (!item || !trigger) return;

            const isActive = item.classList.contains('active');
            document.querySelectorAll('.faq-item').forEach(i => i.classList.remove('active'));
            if (!isActive) {
                item.classList.add('active');
            }
        });
    }

    /* ==========================================================================
       6. SCROLL REVEAL ENTRANCE ANIMATION OBSERVER
       ========================================================================== */
    const revealTargets = document.querySelectorAll(`
        .section-title,
        .section-subtitle,
        .hero-title,
        .hero-subtitle,
        .hero-badge-gold,
        .category-badge-gold,
        .hero-cta-group,
        .btn-gold-pill,
        .btn-secondary-gold-pill,
        .stat-box-gold,
        .highlight-card-gold,
        .bento-card-gold,
        .uc-card-gold,
        .pricing-card-gold,
        .faq-item,
        .cta-banner-card-gold,
        .globe-glass-overlay-right,
        .showcase-content-left,
        .showcase-mockup-wrapper,
        .app-annotation,
        .reveal-element
    `);

    revealTargets.forEach((el, index) => {
        if (!el.classList.contains('reveal-element')) {
            el.classList.add('reveal-element');
            const stagger = (index % 4) + 1;
            el.classList.add(`delay-${stagger}`);
        }
    });

    const observerOptions = {
        root: null,
        rootMargin: '0px 0px -50px 0px',
        threshold: 0.05
    };

    const revealObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('is-revealed');
            }
        });
    }, observerOptions);

    revealTargets.forEach(el => revealObserver.observe(el));

    revealTargets.forEach(el => revealObserver.observe(el));

    /* ==========================================================================
       7. HERO VIDEO PLAYBACK & ANIMATED REVEAL CONTROLLER
       ========================================================================== */
    const heroHandVid = document.getElementById('heroHandVideo');
    const heroSectionEl = document.getElementById('hero');

    function triggerVideoEndReveals() {
        const revealTargets = document.querySelectorAll('.reveal-on-video-end');
        revealTargets.forEach(el => el.classList.add('video-finished'));
    }

    function resetVideoEndReveals() {
        const revealTargets = document.querySelectorAll('.reveal-on-video-end');
        revealTargets.forEach(el => el.classList.remove('video-finished'));
    }

    if (heroHandVid) {
        // Set speed to 1.1x (smooth playback)
        heroHandVid.playbackRate = 1.1;

        // When video reaches the end, freeze on the last frame and reveal split text + buttons!
        heroHandVid.addEventListener('ended', () => {
            heroHandVid.pause();
            triggerVideoEndReveals();
        });

        // Backup safety check: if video is close to finish, trigger reveals
        heroHandVid.addEventListener('timeupdate', () => {
            if (heroHandVid.duration && heroHandVid.currentTime >= heroHandVid.duration - 0.4) {
                triggerVideoEndReveals();
            }
        });

        // Immediate/fallback safety trigger after 1.5s
        setTimeout(triggerVideoEndReveals, 1500);
    } else {
        triggerVideoEndReveals();
    }

    // When scrolling down past Hero, pause video.
    // When scrolling back UP into Hero, restart and play from beginning!
    if (heroSectionEl) {
        let hasLeftView = false;
        const heroObserver = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    if (hasLeftView) {
                        resetVideoEndReveals();
                        heroHandVid.currentTime = 0;
                        heroHandVid.play().catch(() => { });
                    }
                } else {
                    hasLeftView = true;
                    heroHandVid.pause();
                }
            });
        }, { threshold: 0.15 });

        heroObserver.observe(heroSectionEl);
    }

    /* ==========================================================================
       8. SMART NAVBAR CONTROLLER (Hide on Scroll Down, Show on Scroll Up)
       ========================================================================== */
    let lastScrollY = window.scrollY;
const navbarWrapper = document.querySelector('.navbar-wrapper');

if (navbarWrapper) {
    window.addEventListener('scroll', () => {
        const currentScrollY = window.scrollY;
        if (currentScrollY > lastScrollY && currentScrollY > 80) {
            navbarWrapper.classList.add('nav-hidden');
        } else {
            navbarWrapper.classList.remove('nav-hidden');
        }
        lastScrollY = currentScrollY;
    }, { passive: true });
}

// End of script

})();
