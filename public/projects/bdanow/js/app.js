// ================================================================
// BDANOW - Main Application Engine
// ================================================================
// This file expects js/data.js to be loaded first (APP_DATA object)

(function () {
    'use strict';

    // ==================== APPLICATION STATE ====================
    const appState = {
        currentUser: null,
        cart: [],
        currentCourseDetail: null,
        chatMessages: [
            { sender: 'bot', text: "Bonjour ! Je suis Aya, votre assistante BDANOW. Comment puis-je vous aider aujourd'hui ?" }
        ]
    };

    // ==================== DOM CACHE ====================
    const $ = (sel) => document.querySelector(sel);
    const $$ = (sel) => document.querySelectorAll(sel);

    const DOM = {
        themeToggle: $('#themeToggle'),
        navLinks: $$('.nav-links a'),
        burger: $('#burger'),
        mobileNav: $('#navLinks'),
        cartIcon: $('#cartIcon'),
        cartModal: $('#cartModal'),
        closeCart: $('#closeCart'),
        cartItems: $('#cartItems'),
        cartCount: $('#cartCount'),
        cartTotal: $('#cartTotal'),
        checkoutBtn: $('#checkoutBtn'),
        userMenu: $('#userMenu'),
        userAvatar: $('#userAvatar'),
        userDropdown: $('#userDropdown'),
        authOverlay: $('#authOverlay'),
        closeAuth: $('#closeAuth'),
        loginTab: $('#loginTab'),
        registerTab: $('#registerTab'),
        loginForm: $('#loginForm'),
        registerForm: $('#registerForm'),
        authTitle: $('#authTitle'),
        pageContent: $('#pageContent'),
        homePage: $('#homePage'),
        dashboardPage: $('#dashboardPage'),
        coursesPage: $('#coursesPage'),
        courseDetailPage: $('#courseDetailPage'),
        eventsPage: $('#eventsPage'),
        contactPage: $('#contactPage'),
        featuredCourses: $('#featuredCourses'),
        allCoursesGrid: $('#allCoursesGrid'),
        viewAllCourses: $('#viewAllCourses'),
        eventsGrid: $('#eventsGrid'),
        allEventsGrid: $('#allEventsGrid'),
        userCourses: $('#userCourses'),
        userName: $('#userName'),
        coursesCount: $('#coursesCount'),
        hoursCount: $('#hoursCount'),
        certificatesCount: $('#certificatesCount'),
        progressPercentage: $('#progressPercentage'),
        contactForm: $('#contactForm'),
        searchInput: $('#searchInput'),
        courseDetailHeader: $('#courseDetailHeader'),
        courseTabs: $('#courseTabs'),
        testimonialTrack: $('#testimonialTrack'),
        testimonialNav: $('#testimonialNav'),
        chatButton: $('#chatButton'),
        chatContainer: $('#chatContainer'),
        chatClose: $('#chatClose'),
        chatMessages: $('#chatMessages'),
        chatInput: $('#chatInput'),
        chatSend: $('#chatSend'),
        countdownMessage: $('#countdownMessage'),
    };

    // ==================== UTILITY FUNCTIONS ====================
    function formatPrice(price) {
        return price.toLocaleString('fr-MA');
    }

    function saveToStorage(key, value) {
        try {
            localStorage.setItem(key, JSON.stringify(value));
        } catch (e) {
            console.warn('localStorage write failed:', e);
        }
    }

    function loadFromStorage(key) {
        try {
            const data = localStorage.getItem(key);
            return data ? JSON.parse(data) : null;
        } catch (e) {
            console.warn('localStorage read failed:', e);
            return null;
        }
    }

    function generateStars(rating) {
        const full = Math.floor(rating);
        const half = rating % 1 >= 0.3;
        let stars = '';
        for (let i = 0; i < full; i++) stars += '<i class="fas fa-star"></i>';
        if (half) stars += '<i class="fas fa-star-half-alt"></i>';
        const empty = 5 - full - (half ? 1 : 0);
        for (let i = 0; i < empty; i++) stars += '<i class="far fa-star"></i>';
        return stars;
    }

    // ==================== NOTIFICATION SYSTEM ====================
    function showNotification(message, type = 'success') {
        const existing = document.querySelector('.notification');
        if (existing) existing.remove();

        const notification = document.createElement('div');
        notification.className = `notification notification-${type}`;

        const icon = type === 'success' ? 'check-circle' : 'exclamation-triangle';
        notification.innerHTML = `
            <i class="fas fa-${icon}"></i>
            <span>${message}</span>
            <button aria-label="Fermer">&times;</button>
        `;

        document.body.appendChild(notification);
        requestAnimationFrame(() => {
            requestAnimationFrame(() => notification.classList.add('show'));
        });

        const dismiss = () => {
            notification.classList.remove('show');
            setTimeout(() => notification.remove(), 400);
        };

        notification.querySelector('button').addEventListener('click', dismiss);
        setTimeout(dismiss, 4500);
    }

    // ==================== THEME MANAGEMENT ====================
    function initTheme() {
        const saved = localStorage.getItem('bdanow-theme');
        if (saved === 'dark') document.body.classList.add('dark-theme');

        DOM.themeToggle?.addEventListener('click', () => {
            document.body.classList.toggle('dark-theme');
            const isDark = document.body.classList.contains('dark-theme');
            localStorage.setItem('bdanow-theme', isDark ? 'dark' : 'light');
        });
    }

    // ==================== USER MANAGEMENT ====================
    function saveUser(user) {
        saveToStorage('bdanow-user', user);
    }

    function loadUser() {
        const saved = loadFromStorage('bdanow-user');
        if (saved) {
            appState.currentUser = saved;
            updateUIForUser();
            return true;
        }
        return false;
    }

    function updateUIForUser() {
        if (appState.currentUser) {
            if (DOM.userAvatar) {
                DOM.userAvatar.innerHTML = `<img src="${appState.currentUser.avatar}" alt="${appState.currentUser.name}">`;
            }
            if (DOM.userName) {
                DOM.userName.textContent = appState.currentUser.name;
            }
        } else {
            if (DOM.userAvatar) {
                DOM.userAvatar.innerHTML = '<i class="fas fa-user"></i>';
            }
            if (DOM.userName) {
                DOM.userName.textContent = 'Utilisateur';
            }
        }
        updateAuthDropdown();
    }

    function updateAuthDropdown() {
        if (!DOM.userDropdown) return;

        if (!appState.currentUser) {
            DOM.userDropdown.innerHTML = `
                <a href="#" id="loginDropdownBtn"><i class="fas fa-sign-in-alt"></i> Connexion</a>
                <a href="#" id="registerDropdownBtn"><i class="fas fa-user-plus"></i> Inscription</a>
            `;

            setTimeout(() => {
                document.getElementById('loginDropdownBtn')?.addEventListener('click', (e) => {
                    e.preventDefault();
                    showAuthModal();
                    DOM.loginTab?.click();
                });
                document.getElementById('registerDropdownBtn')?.addEventListener('click', (e) => {
                    e.preventDefault();
                    showAuthModal();
                    DOM.registerTab?.click();
                });
            }, 50);
        } else {
            DOM.userDropdown.innerHTML = `
                <a href="#" data-page="dashboard" class="dropdown-link"><i class="fas fa-tachometer-alt"></i> Tableau de bord</a>
                <a href="#" data-page="profile" class="dropdown-link"><i class="fas fa-user-circle"></i> Mon profil</a>
                <a href="#" data-page="settings" class="dropdown-link"><i class="fas fa-cog"></i> Paramètres</a>
                <a href="#" id="logoutBtn" class="dropdown-link"><i class="fas fa-sign-out-alt"></i> Déconnexion</a>
            `;

            setTimeout(() => {
                document.getElementById('logoutBtn')?.addEventListener('click', (e) => {
                    e.preventDefault();
                    handleLogout();
                });

                document.querySelectorAll('.dropdown-link[data-page]').forEach(link => {
                    link.addEventListener('click', (e) => {
                        e.preventDefault();
                        showPage(link.getAttribute('data-page'));
                        DOM.userDropdown.classList.remove('active');
                    });
                });
            }, 50);
        }
    }

    function showAuthModal() {
        DOM.authOverlay?.classList.add('active');
    }

    function handleLogin(e) {
        e.preventDefault();
        const email = document.getElementById('loginEmail')?.value.trim();
        const password = document.getElementById('loginPassword')?.value.trim();

        if (!email || !password) {
            showNotification('Veuillez remplir tous les champs', 'warning');
            return;
        }
        if (!email.includes('@')) {
            showNotification('Email invalide', 'warning');
            return;
        }

        const name = email.split('@')[0];
        const user = {
            name: name.charAt(0).toUpperCase() + name.slice(1),
            email,
            avatar: `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=1E3A8A&color=fff&size=80&bold=true`
        };

        appState.currentUser = user;
        saveUser(user);
        updateUIForUser();
        DOM.authOverlay?.classList.remove('active');
        DOM.loginForm?.reset();
        showNotification('Connexion réussie ! Bienvenue sur BDANOW.', 'success');
    }

    function handleRegister(e) {
        e.preventDefault();
        const name = document.getElementById('registerName')?.value.trim();
        const email = document.getElementById('registerEmail')?.value.trim();
        const password = document.getElementById('registerPassword')?.value.trim();
        const confirm = document.getElementById('registerConfirm')?.value.trim();

        if (!name || !email || !password || !confirm) {
            showNotification('Tous les champs sont requis', 'warning');
            return;
        }
        if (password.length < 6) {
            showNotification('Le mot de passe doit contenir au moins 6 caractères', 'warning');
            return;
        }
        if (password !== confirm) {
            showNotification('Les mots de passe ne correspondent pas', 'warning');
            return;
        }
        if (!email.includes('@')) {
            showNotification('Email invalide', 'warning');
            return;
        }

        const user = {
            name,
            email,
            avatar: `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=1E3A8A&color=fff&size=80&bold=true`
        };

        appState.currentUser = user;
        saveUser(user);
        updateUIForUser();
        DOM.authOverlay?.classList.remove('active');
        DOM.registerForm?.reset();
        showNotification('Inscription réussie ! Bienvenue sur BDANOW.', 'success');
    }

    function handleLogout() {
        appState.currentUser = null;
        localStorage.removeItem('bdanow-user');
        updateUIForUser();
        showPage('home');
        showNotification('Vous avez été déconnecté.', 'success');
    }

    // ==================== CART MANAGEMENT ====================
    function loadCart() {
        const saved = loadFromStorage('bdanow-cart');
        if (saved && Array.isArray(saved)) {
            appState.cart = saved;
        }
        updateCartUI();
    }

    function saveCart() {
        saveToStorage('bdanow-cart', appState.cart);
    }

    function updateCartUI() {
        if (DOM.cartCount) DOM.cartCount.textContent = appState.cart.length;
        const total = appState.cart.reduce((sum, item) => sum + item.price, 0);
        if (DOM.cartTotal) DOM.cartTotal.textContent = formatPrice(total);
        renderCartItems();
    }

    function renderCartItems() {
        if (!DOM.cartItems) return;
        DOM.cartItems.innerHTML = '';

        if (appState.cart.length === 0) {
            DOM.cartItems.innerHTML = `
                <div style="text-align:center;padding:var(--space-10);color:var(--text-tertiary)">
                    <i class="fas fa-shopping-cart" style="font-size:2rem;margin-bottom:var(--space-4);display:block"></i>
                    <p>Votre panier est vide</p>
                </div>
            `;
            return;
        }

        appState.cart.forEach(item => {
            const el = document.createElement('div');
            el.className = 'cart-item';
            el.innerHTML = `
                <div class="cart-item-img"><img src="${item.image}" alt="${item.title}"></div>
                <div class="cart-item-details">
                    <div class="cart-item-title">${item.title}</div>
                    <div class="cart-item-price">${formatPrice(item.price)}</div>
                </div>
                <button class="remove-item" data-id="${item.id}" aria-label="Supprimer"><i class="fas fa-trash"></i></button>
            `;
            DOM.cartItems.appendChild(el);
        });

        DOM.cartItems.querySelectorAll('.remove-item').forEach(btn => {
            btn.addEventListener('click', function () {
                removeFromCart(parseInt(this.dataset.id));
            });
        });
    }

    function addToCart(course) {
        if (!appState.currentUser) {
            showAuthModal();
            return false;
        }

        if (appState.cart.some(item => item.id === course.id)) {
            showNotification(`"${course.title}" est déjà dans votre panier!`, 'warning');
            return false;
        }

        appState.cart.push({
            id: course.id,
            title: course.title,
            price: course.price,
            image: course.image,
            category: course.category || 'Formation',
            description: course.description || ''
        });

        saveCart();
        updateCartUI();
        showNotification(`"${course.title}" a été ajouté à votre panier!`, 'success');
        return true;
    }

    function removeFromCart(id) {
        appState.cart = appState.cart.filter(item => item.id !== id);
        saveCart();
        updateCartUI();
    }

    function handleCheckout() {
        if (!appState.currentUser) {
            showAuthModal();
            return;
        }
        if (appState.cart.length === 0) {
            showNotification('Votre panier est vide!', 'warning');
            return;
        }

        const checkoutData = {
            cart: appState.cart.map(item => {
                const full = APP_DATA.courses.find(c => c.id === item.id);
                return {
                    ...item,
                    fullDescription: full?.fullDescription || item.description,
                    duration: full?.duration || 'N/A',
                    level: full?.level || 'N/A',
                    language: full?.language || 'Français',
                    instructor: full?.instructor || 'N/A',
                    originalPrice: full?.originalPrice || item.price
                };
            }),
            total: appState.cart.reduce((sum, item) => sum + item.price, 0),
            user: appState.currentUser,
            timestamp: new Date().toISOString(),
            orderId: 'CMD-' + Date.now() + '-' + Math.random().toString(36).substr(2, 9).toUpperCase()
        };

        saveToStorage('checkoutData', checkoutData);
        saveToStorage('bdanow-checkout', checkoutData);

        try {
            sessionStorage.setItem('currentCheckout', JSON.stringify(checkoutData));
        } catch (e) {
            /* sessionStorage optional */
        }

        DOM.cartModal?.classList.remove('active');
        showNotification('Redirection vers la page de paiement...', 'success');

        setTimeout(() => {
            window.location.href = 'pay.html';
        }, 800);
    }

    // ==================== RENDERING ENGINE ====================
    function renderCourses(container, courses) {
        if (!container) return;
        container.innerHTML = '';

        if (courses.length === 0) {
            container.innerHTML = `
                <p style="text-align:center;color:var(--text-tertiary);grid-column:1/-1;padding:var(--space-12)">
                    <i class="fas fa-search" style="font-size:1.5rem;display:block;margin-bottom:var(--space-4)"></i>
                    Aucun cours ne correspond à votre recherche.
                </p>
            `;
            return;
        }

        courses.forEach((course, idx) => {
            const el = document.createElement('div');
            el.className = 'course-card fade-in';
            el.setAttribute('data-id', course.id);
            el.style.animationDelay = `${idx * 0.1}s`;
            el.innerHTML = `
                <div class="course-img">
                    <img src="${course.image}" alt="${course.title}" loading="lazy">
                    ${course.badge ? `<div class="badge badge-${course.badge}">${course.badge === 'new' ? 'Nouveau' : course.badge === 'popular' ? 'Populaire' : 'Certifié'}</div>` : ''}
                </div>
                <div class="course-content">
                    <span class="course-category">${course.category}</span>
                    <h3 class="course-title">${course.title}</h3>
                    <p class="course-description">${course.description}</p>
                    <div class="course-footer">
                        <div>
                            <div class="course-price">${formatPrice(course.price)} <span>${formatPrice(course.originalPrice)}</span></div>
                            <div class="course-rating">${generateStars(course.rating)}<span>${course.rating} (${course.students})</span></div>
                        </div>
                        <button class="btn-accent view-course-detail" data-id="${course.id}">Voir détails</button>
                    </div>
                </div>
            `;
            container.appendChild(el);
        });

        // Attach click handlers
        container.querySelectorAll('.view-course-detail').forEach(btn => {
            btn.addEventListener('click', function (e) {
                e.stopPropagation();
                showCourseDetail(parseInt(this.dataset.id));
            });
        });

        container.querySelectorAll('.course-card').forEach(card => {
            card.addEventListener('click', function () {
                showCourseDetail(parseInt(this.dataset.id));
            });
        });

        // Trigger fade-in animation
        setTimeout(() => {
            container.querySelectorAll('.fade-in').forEach(el => el.classList.add('visible'));
        }, 100);
    }

    function renderEvents(container, events) {
        if (!container) return;
        container.innerHTML = '';

        if (events.length === 0) {
            container.innerHTML = '<p style="text-align:center;color:var(--text-tertiary);grid-column:1/-1;padding:var(--space-12)">Aucun événement à venir.</p>';
            return;
        }

        events.forEach((event, idx) => {
            const el = document.createElement('div');
            el.className = 'event-card fade-in';
            el.style.animationDelay = `${idx * 0.1}s`;
            el.innerHTML = `
                <div class="event-banner">
                    <img src="${event.image}" alt="${event.title}" loading="lazy">
                    <div class="event-badge ${event.badge}">${event.badge === 'live' ? 'En Direct' : 'À Venir'}</div>
                </div>
                <div class="event-content">
                    <div class="event-date"><i class="far fa-calendar-alt"></i>${event.date} • ${event.time}</div>
                    <h3 class="event-title">${event.title}</h3>
                    <p class="event-description">${event.description}</p>
                    <div class="event-meta">
                        <div class="event-location"><i class="fas fa-map-marker-alt"></i>${event.location}</div>
                        <div class="event-price">${event.price || 'Gratuit'}</div>
                    </div>
                </div>
            `;
            container.appendChild(el);
        });

        setTimeout(() => {
            container.querySelectorAll('.fade-in').forEach(el => el.classList.add('visible'));
        }, 100);
    }

    function renderTestimonials() {
        if (!DOM.testimonialTrack || !DOM.testimonialNav) return;
        DOM.testimonialTrack.innerHTML = '';
        DOM.testimonialNav.innerHTML = '';

        APP_DATA.testimonials.forEach(t => {
            const slide = document.createElement('div');
            slide.className = 'testimonial-slide';
            slide.innerHTML = `
                <div class="testimonial-avatar"><img src="${t.avatar}" alt="${t.name}"></div>
                <p class="testimonial-text">"${t.text}"</p>
                <div class="testimonial-author">${t.name}</div>
                <div class="testimonial-role">${t.role}</div>
            `;
            DOM.testimonialTrack.appendChild(slide);
        });

        APP_DATA.testimonials.forEach((_, i) => {
            const dot = document.createElement('div');
            dot.className = 'testimonial-dot' + (i === 0 ? ' active' : '');
            dot.addEventListener('click', () => {
                currentTestimonialIdx = i;
                updateTestimonialSlider();
            });
            DOM.testimonialNav.appendChild(dot);
        });

        currentTestimonialIdx = 0;
        updateTestimonialSlider();

        if (window._testimonialInterval) clearInterval(window._testimonialInterval);
        window._testimonialInterval = setInterval(() => {
            currentTestimonialIdx = (currentTestimonialIdx + 1) % APP_DATA.testimonials.length;
            updateTestimonialSlider();
        }, 5000);
    }

    let currentTestimonialIdx = 0;
    function updateTestimonialSlider() {
        if (!DOM.testimonialTrack) return;
        DOM.testimonialTrack.style.transform = `translateX(-${currentTestimonialIdx * 100}%)`;
        document.querySelectorAll('.testimonial-dot').forEach((dot, i) => {
            dot.classList.toggle('active', i === currentTestimonialIdx);
        });
    }

    function renderUserCourses() {
        if (!DOM.userCourses) return;
        DOM.userCourses.innerHTML = '';

        APP_DATA.userCourses.forEach(course => {
            const el = document.createElement('div');
            el.className = 'course-progress-card';
            el.innerHTML = `
                <div class="course-progress-img"><img src="${course.image}" alt="${course.title}"></div>
                <div class="course-progress-info">
                    <h4>${course.title}</h4>
                    <div class="course-progress-bar"><div class="course-progress-fill" style="width:${course.progress}%"></div></div>
                    <p style="color:var(--text-tertiary);font-size:var(--text-sm)">${course.progress}% complété • Dernier accès: ${course.lastAccessed}</p>
                </div>
                <button class="btn-primary" style="padding:var(--space-2) var(--space-5);font-size:var(--text-sm)">Continuer</button>
            `;
            DOM.userCourses.appendChild(el);
        });
    }

    // ==================== COURSE DETAIL ====================
    function showCourseDetail(courseId) {
        const course = APP_DATA.courses.find(c => c.id === courseId);
        if (!course) return;

        appState.currentCourseDetail = course;

        if (DOM.courseDetailHeader) {
            DOM.courseDetailHeader.innerHTML = `
                <div class="course-detail-image"><img src="${course.image}" alt="${course.title}"></div>
                <div class="course-detail-info">
                    <h1>${course.title}</h1>
                    <div class="course-meta">
                        <div class="course-meta-item"><i class="fas fa-graduation-cap"></i><span>${course.category}</span></div>
                        <div class="course-meta-item"><i class="fas fa-clock"></i><span>${course.duration}</span></div>
                        <div class="course-meta-item"><i class="fas fa-language"></i><span>${course.language}</span></div>
                        <div class="course-meta-item"><i class="fas fa-signal"></i><span>${course.level}</span></div>
                    </div>
                    <div class="course-price-large">${formatPrice(course.price)}</div>
                    <div class="course-detail-cta">
                        <button class="btn-primary" id="addToCartBtn"><i class="fas fa-cart-plus"></i> Ajouter au panier</button>
                        <button class="btn-outline"><i class="far fa-heart"></i> Favoris</button>
                    </div>
                    <div class="course-rating">${generateStars(course.rating)}<span style="color:var(--text-tertiary);margin-left:8px">${course.rating} (${course.students} étudiants)</span></div>
                </div>
            `;
        }

        // Populate tabs
        const descEl = document.getElementById('courseFullDescription');
        if (descEl) descEl.textContent = course.fullDescription;

        const objEl = document.getElementById('courseObjectives');
        if (objEl) {
            objEl.innerHTML = '';
            course.objectives.forEach(obj => {
                const p = document.createElement('p');
                p.innerHTML = `<i class="fas fa-check-circle" style="color:var(--color-success);margin-right:var(--space-3)"></i>${obj}`;
                p.style.marginBottom = 'var(--space-3)';
                objEl.appendChild(p);
            });
        }

        const currEl = document.getElementById('curriculumList');
        if (currEl) {
            currEl.innerHTML = '';
            course.curriculum.forEach((item, i) => {
                const div = document.createElement('div');
                div.className = 'card';
                div.style.marginBottom = 'var(--space-4)';
                div.innerHTML = `
                    <div style="display:flex;justify-content:space-between;align-items:center">
                        <div style="display:flex;align-items:center;gap:var(--space-4)">
                            <div style="width:36px;height:36px;border-radius:var(--radius-full);background:var(--gradient-brand);color:white;display:flex;align-items:center;justify-content:center;font-weight:700;font-size:var(--text-sm)">${i + 1}</div>
                            <div>
                                <h4 style="font-size:var(--text-base)">${item.title}</h4>
                                <p style="color:var(--text-tertiary);font-size:var(--text-sm)">${item.lessons} leçons</p>
                            </div>
                        </div>
                        <span style="color:var(--text-tertiary);font-size:var(--text-sm)">${item.duration}</span>
                    </div>
                `;
                currEl.appendChild(div);
            });
        }

        const instrEl = document.getElementById('instructorInfo');
        if (instrEl && course.instructorInfo) {
            instrEl.innerHTML = `
                <div class="card" style="display:flex;gap:var(--space-6);align-items:flex-start">
                    <div style="width:80px;height:80px;border-radius:var(--radius-full);background:var(--gradient-brand);color:white;display:flex;align-items:center;justify-content:center;font-size:2rem;flex-shrink:0">
                        <i class="fas fa-chalkboard-teacher"></i>
                    </div>
                    <div>
                        <h4 style="font-size:var(--text-xl);margin-bottom:var(--space-3)">${course.instructorInfo.name}</h4>
                        <p style="color:var(--text-secondary);margin-bottom:var(--space-4)">${course.instructorInfo.bio}</p>
                        <div style="display:flex;gap:var(--space-6);color:var(--text-tertiary);font-size:var(--text-sm)">
                            <span><i class="fas fa-users"></i> ${course.instructorInfo.students} étudiants</span>
                            <span><i class="fas fa-book"></i> ${course.instructorInfo.courses} cours</span>
                            <span><i class="fas fa-star" style="color:#F59E0B"></i> ${course.instructorInfo.rating}</span>
                        </div>
                    </div>
                </div>
            `;
        }

        const revEl = document.getElementById('reviewsList');
        if (revEl && course.reviews) {
            revEl.innerHTML = '';
            course.reviews.forEach(rev => {
                const div = document.createElement('div');
                div.className = 'card';
                div.style.marginBottom = 'var(--space-4)';
                div.innerHTML = `
                    <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:var(--space-3)">
                        <div style="display:flex;align-items:center;gap:var(--space-3)">
                            <div style="width:40px;height:40px;border-radius:var(--radius-full);background:var(--brand-100);color:var(--brand-700);display:flex;align-items:center;justify-content:center;font-weight:700">${rev.name.charAt(0)}</div>
                            <span style="font-weight:600">${rev.name}</span>
                        </div>
                        <div class="course-rating">${generateStars(rev.rating)}</div>
                    </div>
                    <p style="color:var(--text-secondary)">${rev.comment}</p>
                `;
                revEl.appendChild(div);
            });
        }

        // Tab switching
        DOM.courseTabs?.querySelectorAll('.course-tab').forEach(tab => {
            tab.addEventListener('click', () => {
                DOM.courseTabs.querySelectorAll('.course-tab').forEach(t => t.classList.remove('active'));
                tab.classList.add('active');
                document.querySelectorAll('.tab-pane').forEach(p => p.classList.remove('active'));
                const tabId = tab.getAttribute('data-tab');
                document.getElementById(tabId + 'Tab')?.classList.add('active');
            });
        });

        showPage('courseDetail');
    }

    // ==================== COUNTDOWN TIMER ====================
    function updateCountdown() {
        const targetDate = new Date('2026-01-18T20:00:00+01:00');
        const now = new Date();
        const timeLeft = targetDate - now;

        const updateEl = (id, value) => {
            const el = document.getElementById(id);
            if (el) el.textContent = value.toString().padStart(2, '0');
        };

        if (timeLeft <= 0) {
            updateEl('days', 0); updateEl('hours', 0);
            updateEl('minutes', 0); updateEl('seconds', 0);
            updateEl('daysPage', 0); updateEl('hoursPage', 0);
            updateEl('minutesPage', 0); updateEl('secondsPage', 0);
            if (DOM.countdownMessage) {
                DOM.countdownMessage.textContent = "La CAN 2025 est terminée ! Félicitations aux Lions de l'Atlas !";
                DOM.countdownMessage.style.color = '#EF4444';
            }
            return;
        }

        const d = Math.floor(timeLeft / 86400000);
        const h = Math.floor((timeLeft % 86400000) / 3600000);
        const m = Math.floor((timeLeft % 3600000) / 60000);
        const s = Math.floor((timeLeft % 60000) / 1000);

        updateEl('days', d); updateEl('hours', h); updateEl('minutes', m); updateEl('seconds', s);
        updateEl('daysPage', d); updateEl('hoursPage', h); updateEl('minutesPage', m); updateEl('secondsPage', s);

        if (DOM.countdownMessage) {
            if (d < 7) {
                DOM.countdownMessage.textContent = "La finale approche à grands pas ! Préparez-vous !";
                DOM.countdownMessage.style.color = '#EF4444';
            } else if (d < 30) {
                DOM.countdownMessage.textContent = "Plus qu'un mois avant la finale !";
                DOM.countdownMessage.style.color = '#F59E0B';
            } else {
                DOM.countdownMessage.textContent = "La finale se jouera le 18 Janvier 2026 !";
                DOM.countdownMessage.style.color = '#FFD700';
            }
        }
    }

    // ==================== CHAT SYSTEM ====================
    function renderChat() {
        if (!DOM.chatMessages) return;
        DOM.chatMessages.innerHTML = '';
        appState.chatMessages.forEach(msg => {
            const el = document.createElement('div');
            el.className = `message ${msg.sender}`;
            el.textContent = msg.text;
            DOM.chatMessages.appendChild(el);
        });
        DOM.chatMessages.scrollTop = DOM.chatMessages.scrollHeight;
    }

    function handleChatSend() {
        const text = DOM.chatInput?.value.trim();
        if (!text) return;

        appState.chatMessages.push({ sender: 'user', text });

        // Smart response based on keywords
        const lowerText = text.toLowerCase();
        let response = APP_DATA.chatResponses.default;
        if (lowerText.match(/bonjour|salut|hello|hi|hey/)) {
            response = APP_DATA.chatResponses.greeting;
        } else if (lowerText.match(/formation|cours|apprendre|programme/)) {
            response = APP_DATA.chatResponses.formation;
        } else if (lowerText.match(/prix|coût|tarif|combien|payer/)) {
            response = APP_DATA.chatResponses.price;
        } else if (lowerText.match(/contact|email|téléphone|adresse/)) {
            response = APP_DATA.chatResponses.contact;
        }

        appState.chatMessages.push({ sender: 'bot', text: response });
        renderChat();
        DOM.chatInput.value = '';
    }

    // ==================== SEARCH ====================
    function handleSearch(searchTerm) {
        const filtered = APP_DATA.courses.filter(c =>
            c.title.toLowerCase().includes(searchTerm) ||
            c.description.toLowerCase().includes(searchTerm) ||
            c.category.toLowerCase().includes(searchTerm)
        );

        if (DOM.homePage?.classList.contains('active')) {
            renderCourses(DOM.featuredCourses, searchTerm ? filtered.slice(0, 3) : APP_DATA.courses.slice(0, 3));
        } else if (DOM.coursesPage?.classList.contains('active')) {
            renderCourses(DOM.allCoursesGrid, searchTerm ? filtered : APP_DATA.courses);
        }
    }

    // ==================== PAGE MANAGEMENT ====================
    function showPage(pageName) {
        if (pageName === 'dashboard' && !appState.currentUser) {
            showAuthModal();
            return;
        }

        // Hide all pages
        document.querySelectorAll('.page-content').forEach(page => {
            page.classList.remove('active');
            page.classList.add('hidden');
        });

        // Show target page
        const pageEl = document.getElementById(pageName + 'Page');
        if (pageEl) {
            pageEl.classList.remove('hidden');
            requestAnimationFrame(() => pageEl.classList.add('active'));
        }

        // Update nav
        DOM.navLinks.forEach(link => {
            link.classList.remove('active');
            if (link.getAttribute('data-page') === pageName) {
                link.classList.add('active');
            }
        });

        DOM.mobileNav?.classList.remove('active');
        window.location.hash = pageName;
        window.scrollTo({ top: 0, behavior: 'smooth' });

        // Page-specific rendering
        switch (pageName) {
            case 'home':
                renderCourses(DOM.featuredCourses, APP_DATA.courses.slice(0, 3));
                renderEvents(DOM.eventsGrid, APP_DATA.events.slice(0, 3));
                renderTestimonials();
                updateCountdown();
                break;
            case 'courses':
                renderCourses(DOM.allCoursesGrid, APP_DATA.courses);
                break;
            case 'events':
                renderEvents(DOM.allEventsGrid, APP_DATA.events);
                updateCountdown();
                break;
            case 'dashboard':
                renderUserCourses();
                if (DOM.coursesCount) DOM.coursesCount.textContent = APP_DATA.userCourses.length;
                if (DOM.hoursCount) DOM.hoursCount.textContent = APP_DATA.userCourses.reduce((s, c) => s + parseInt(c.duration), 0) + 'h';
                if (DOM.certificatesCount) DOM.certificatesCount.textContent = '0';
                if (DOM.progressPercentage) {
                    const total = APP_DATA.userCourses.reduce((s, c) => s + c.progress, 0);
                    DOM.progressPercentage.textContent = APP_DATA.userCourses.length ? Math.round(total / APP_DATA.userCourses.length) + '%' : '0%';
                }
                break;
            case 'courseDetail':
                setTimeout(() => {
                    document.getElementById('addToCartBtn')?.addEventListener('click', () => {
                        if (appState.currentCourseDetail) addToCart(appState.currentCourseDetail);
                    });
                }, 100);
                break;
            case 'profile':
                renderProfilePage();
                break;
            case 'settings':
                renderSettingsPage();
                break;
        }
    }

    function renderProfilePage() {
        if (!appState.currentUser) return;
        let page = document.getElementById('profilePage');
        if (!page) {
            page = document.createElement('section');
            page.id = 'profilePage';
            page.className = 'page-content hidden';
            DOM.pageContent?.appendChild(page);
        }
        page.innerHTML = `
            <section class="section-padding" style="padding-top:calc(var(--header-height) + var(--space-10))">
                <div class="container">
                    <div class="section-header"><h2>Mon Profil</h2><p>Gérez vos informations personnelles</p></div>
                    <div class="card" style="max-width:600px;margin:0 auto;text-align:center">
                        <div style="width:100px;height:100px;border-radius:var(--radius-full);background:var(--gradient-brand);margin:0 auto var(--space-5);overflow:hidden">
                            <img src="${appState.currentUser.avatar}" alt="${appState.currentUser.name}" style="width:100%;height:100%;object-fit:cover">
                        </div>
                        <h3>${appState.currentUser.name}</h3>
                        <p style="color:var(--text-secondary);margin-bottom:var(--space-6)">${appState.currentUser.email}</p>
                        <button class="btn-primary" style="margin-bottom:var(--space-4)">Modifier le profil</button>
                        <br><button class="btn-outline" onclick="window.dispatchEvent(new CustomEvent('navigate',{detail:'dashboard'}))">Retour au tableau de bord</button>
                    </div>
                </div>
            </section>
        `;
        page.classList.remove('hidden');
        requestAnimationFrame(() => page.classList.add('active'));
    }

    function renderSettingsPage() {
        let page = document.getElementById('settingsPage');
        if (!page) {
            page = document.createElement('section');
            page.id = 'settingsPage';
            page.className = 'page-content hidden';
            DOM.pageContent?.appendChild(page);
        }
        page.innerHTML = `
            <section class="section-padding" style="padding-top:calc(var(--header-height) + var(--space-10))">
                <div class="container">
                    <div class="section-header"><h2>Paramètres</h2><p>Personnalisez votre expérience</p></div>
                    <div class="card" style="max-width:600px;margin:0 auto">
                        <h3 style="margin-bottom:var(--space-6)">Préférences</h3>
                        <div class="form-group" style="margin-bottom:var(--space-6)">
                            <label style="font-weight:600">Thème</label>
                            <select id="settingsThemeSelect"><option value="light">Clair</option><option value="dark">Sombre</option></select>
                        </div>
                        <div style="margin-bottom:var(--space-6)">
                            <label style="display:block;margin-bottom:var(--space-3);font-weight:600">Notifications</label>
                            <label style="display:flex;align-items:center;gap:var(--space-3);margin-bottom:var(--space-2)"><input type="checkbox" checked> Notifications par email</label>
                            <label style="display:flex;align-items:center;gap:var(--space-3)"><input type="checkbox" checked> Notifications push</label>
                        </div>
                        <div style="text-align:center">
                            <button class="btn-primary" style="margin-bottom:var(--space-4)" onclick="alert('Paramètres sauvegardés')">Sauvegarder</button>
                            <br><button class="btn-outline" onclick="window.dispatchEvent(new CustomEvent('navigate',{detail:'dashboard'}))">Retour</button>
                        </div>
                    </div>
                </div>
            </section>
        `;
        page.classList.remove('hidden');
        requestAnimationFrame(() => page.classList.add('active'));
    }

    // ==================== EVENT LISTENERS ====================
    function bindEvents() {
        // Navigation
        DOM.navLinks.forEach(link => {
            link.addEventListener('click', (e) => {
                e.preventDefault();
                const page = link.getAttribute('data-page');
                if (page) showPage(page);
            });
        });

        // Burger menu
        DOM.burger?.addEventListener('click', () => DOM.mobileNav?.classList.toggle('active'));

        // Cart
        DOM.cartIcon?.addEventListener('click', () => DOM.cartModal?.classList.add('active'));
        DOM.closeCart?.addEventListener('click', () => DOM.cartModal?.classList.remove('active'));
        DOM.checkoutBtn?.addEventListener('click', handleCheckout);

        // User menu
        DOM.userMenu?.addEventListener('click', (e) => {
            e.stopPropagation();
            DOM.userDropdown?.classList.toggle('active');
        });

        DOM.userAvatar?.addEventListener('click', (e) => {
            if (!appState.currentUser) {
                e.stopPropagation();
                showAuthModal();
            }
        });

        document.addEventListener('click', (e) => {
            if (DOM.userMenu && !DOM.userMenu.contains(e.target)) {
                DOM.userDropdown?.classList.remove('active');
            }
        });

        // Auth
        DOM.loginTab?.addEventListener('click', () => {
            DOM.loginTab.classList.add('active');
            DOM.registerTab?.classList.remove('active');
            DOM.loginForm?.classList.remove('hidden');
            DOM.registerForm?.classList.add('hidden');
            if (DOM.authTitle) DOM.authTitle.textContent = 'Connexion';
        });

        DOM.registerTab?.addEventListener('click', () => {
            DOM.registerTab.classList.add('active');
            DOM.loginTab?.classList.remove('active');
            DOM.registerForm?.classList.remove('hidden');
            DOM.loginForm?.classList.add('hidden');
            if (DOM.authTitle) DOM.authTitle.textContent = 'Inscription';
        });

        DOM.closeAuth?.addEventListener('click', () => DOM.authOverlay?.classList.remove('active'));
        DOM.loginForm?.addEventListener('submit', handleLogin);
        DOM.registerForm?.addEventListener('submit', handleRegister);

        // Chat
        DOM.chatButton?.addEventListener('click', () => DOM.chatContainer?.classList.toggle('active'));
        DOM.chatClose?.addEventListener('click', () => DOM.chatContainer?.classList.remove('active'));
        DOM.chatSend?.addEventListener('click', handleChatSend);
        DOM.chatInput?.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') handleChatSend();
        });

        // Search
        DOM.searchInput?.addEventListener('input', (e) => handleSearch(e.target.value.toLowerCase()));

        // Contact form
        DOM.contactForm?.addEventListener('submit', (e) => {
            e.preventDefault();
            showNotification('Message envoyé avec succès ! Nous vous répondrons bientôt.', 'success');
            DOM.contactForm.reset();
        });

        // View all courses
        DOM.viewAllCourses?.addEventListener('click', (e) => {
            e.preventDefault();
            showPage('courses');
        });

        // Footer links with data-page
        document.querySelectorAll('[data-page]').forEach(link => {
            if (!link.closest('.nav-links')) {
                link.addEventListener('click', (e) => {
                    e.preventDefault();
                    showPage(link.getAttribute('data-page'));
                });
            }
        });

        // Header scroll effect
        window.addEventListener('scroll', () => {
            const header = document.querySelector('header');
            if (header) {
                header.classList.toggle('scrolled', window.scrollY > 20);
            }
        });

        // Navigate custom event (for dynamic page buttons)
        window.addEventListener('navigate', (e) => showPage(e.detail));
    }

    // ==================== INITIALIZATION ====================
    function initApp() {
        initTheme();
        loadUser();
        loadCart();
        renderChat();
        updateAuthDropdown();
        bindEvents();

        // Countdown timer
        setInterval(updateCountdown, 1000);
        updateCountdown();

        // Progress bars animation
        setTimeout(() => {
            document.querySelectorAll('.progress-fill').forEach(bar => {
                const width = bar.getAttribute('data-width');
                if (width) bar.style.width = width + '%';
            });
        }, 500);

        // Route from URL hash
        const hash = window.location.hash.substring(1) || 'home';
        if (hash.startsWith('course-')) {
            showCourseDetail(parseInt(hash.split('-')[1]));
        } else {
            showPage(hash);
        }

        // Initial render
        if (DOM.featuredCourses) renderCourses(DOM.featuredCourses, APP_DATA.courses.slice(0, 3));
        if (DOM.eventsGrid) renderEvents(DOM.eventsGrid, APP_DATA.events.slice(0, 3));
        renderTestimonials();
    }

    // Boot
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initApp);
    } else {
        initApp();
    }
})();
