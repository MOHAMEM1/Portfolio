// ==================== APPLICATION STATE ====================
        let appState = {
            currentUser: null,
            cart: [],
            currentCourseDetail: null,
            testimonials: [
                {
                    id: 1,
                    name: "Ahmed Alami",
                    role: "Développeur Full Stack",
                    text: "Grâce à BDANOW, j'ai trouvé une formation en développement web rapidement. Aujourd'hui, je travaille en freelance !",
                    avatar: "https://ui-avatars.com/api/?name=Ahmed+Alami&background=1E3A8A&color=fff"
                },
                {
                    id: 2,
                    name: "Sara Alaoui",
                    role: "Marketeuse Digitale",
                    text: "Une plateforme très intuitive. J'ai pu comparer les prix et choisir la meilleure école de marketing à Casa.",
                    avatar: "https://ui-avatars.com/api/?name=Sara+Alaoui&background=3B82F6&color=fff"
                },
                {
                    id: 3,
                    name: "Omar Kabbaj",
                    role: "Étudiant en Data Science",
                    text: "Le support est très réactif. J'ai eu un problème pour m'inscrire et ils m'ont aidé en 5 minutes.",
                    avatar: "https://ui-avatars.com/api/?name=Omar+Kabbaj&background=60A5FA&color=fff"
                },
                {
                    id: 4,
                    name: "Fatima Zahra",
                    role: "UI/UX Designer",
                    text: "Les formations sont de qualité et les instructeurs sont très compétents. Je recommande BDANOW à tous !",
                    avatar: "https://ui-avatars.com/api/?name=Fatima+Zahra&background=1E3A8A&color=fff"
                }
            ],
            courses: [
                {
                    id: 1,
                    title: "Développeur Full Stack",
                    description: "Maîtrisez le développement web frontend et backend avec les technologies modernes.",
                    fullDescription: "Cette formation complète vous prépare à devenir un développeur Full Stack professionnel. Vous apprendrez les technologies essentielles comme HTML5, CSS3, JavaScript (ES6+), React, Node.js, Express et MongoDB. Le programme inclut des projets pratiques, des études de cas réelles et une préparation aux entretiens techniques.",
                    category: "Développement Web",
                    price: 1699,
                    originalPrice: 3999,
                    rating: 4.8,
                    students: 1245,
                    duration: "60h",
                    level: "Intermédiaire",
                    language: "Français",
                    instructor: "Dr. Karim Benjelloun",
                    image: "https://images.unsplash.com/photo-1498050108023-c5249f4df085?q=80&w=600&auto=format&fit=crop",
                    badge: "popular",
                    carouselImages: [
                        "https://images.unsplash.com/photo-1555066931-4365d14bab8c?q=80&w=600&auto=format&fit=crop",
                        "https://images.unsplash.com/photo-1547658719-da2b51169166?q=80&w=600&auto=format&fit=crop",
                        "https://images.unsplash.com/photo-1551650975-87deedd944c3?q=80&w=600&auto=format&fit=crop"
                    ],
                    objectives: [
                        "Maîtriser HTML5, CSS3 et JavaScript moderne",
                        "Développer des applications avec React et Node.js",
                        "Créer et interroger des bases de données MongoDB",
                        "Déployer des applications sur des serveurs cloud",
                        "Mettre en place l'authentification et la sécurité"
                    ],
                    curriculum: [
                        { title: "Introduction au développement web", duration: "4h", lessons: 8 },
                        { title: "HTML5 et CSS3 avancés", duration: "10h", lessons: 15 },
                        { title: "JavaScript moderne (ES6+)", duration: "12h", lessons: 20 },
                        { title: "React et Redux", duration: "15h", lessons: 25 },
                        { title: "Node.js et Express", duration: "12h", lessons: 18 },
                        { title: "Bases de données MongoDB", duration: "7h", lessons: 12 }
                    ],
                    instructorInfo: {
                        name: "Dr. Karim Benjelloun",
                        bio: "Docteur en informatique avec 10 ans d'expérience dans le développement web. Ancien lead developer chez Google, il a formé plus de 5000 étudiants.",
                        students: 5000,
                        courses: 12,
                        rating: 4.9
                    },
                    reviews: [
                        { name: "Mohamed", rating: 5, comment: "Excellente formation, très complète !" },
                        { name: "Amina", rating: 4, comment: "Le contenu est riche et bien structuré." },
                        { name: "Youssef", rating: 5, comment: "L'instructeur est très pédagogue." }
                    ]
                },
                {
                    id: 2,
                    title: "Data Science & Machine Learning",
                    description: "Apprenez à analyser des données et créer des modèles de machine learning avec Python.",
                    fullDescription: "Plongez dans le monde de la data science et du machine learning. Cette formation vous enseignera Python, Pandas, NumPy, Scikit-learn, TensorFlow et les techniques d'analyse de données. Vous travaillerez sur des projets concrets incluant la prédiction, la classification et le traitement du langage naturel.",
                    category: "Data Science",
                    price: 1599,
                    originalPrice: 4499,
                    rating: 4.9,
                    students: 876,
                    duration: "80h",
                    level: "Avancé",
                    language: "Français",
                    instructor: "Prof. Leila Mansouri",
                    image: "https://images.unsplash.com/photo-1551288049-bebda4e38f71?q=80&w=600&auto=format&fit=crop",
                    badge: "new",
                    carouselImages: [
                        "https://images.unsplash.com/photo-1555949963-aa79dcee981c?q=80&w=600&auto=format&fit=crop",
                        "https://images.unsplash.com/photo-1555255707-c07966088b7b?q=80&w=600&auto=format&fit=crop",
                        "https://images.unsplash.com/photo-1551288049-bebda4e38f71?q=80&w=600&auto=format&fit=crop"
                    ],
                    objectives: [
                        "Maîtriser Python pour la data science",
                        "Analyser et visualiser des données complexes",
                        "Implémenter des algorithmes de machine learning",
                        "Créer des modèles de deep learning",
                        "Déployer des modèles en production"
                    ],
                    curriculum: [
                        { title: "Python pour la data science", duration: "10h", lessons: 15 },
                        { title: "Pandas et NumPy", duration: "12h", lessons: 18 },
                        { title: "Visualisation avec Matplotlib", duration: "8h", lessons: 12 },
                        { title: "Machine Learning avec Scikit-learn", duration: "20h", lessons: 30 },
                        { title: "Deep Learning avec TensorFlow", duration: "15h", lessons: 22 },
                        { title: "Projets pratiques", duration: "15h", lessons: 20 }
                    ],
                    instructorInfo: {
                        name: "Prof. Leila Mansouri",
                        bio: "PhD en Intelligence Artificielle, chercheuse à l'INRIA et experte en machine learning avec 8 ans d'expérience dans l'industrie.",
                        students: 3200,
                        courses: 8,
                        rating: 4.8
                    },
                    reviews: [
                        { name: "Hassan", rating: 5, comment: "Formation exceptionnelle !" },
                        { name: "Nadia", rating: 4, comment: "Contenu très technique mais bien expliqué." },
                        { name: "Karim", rating: 5, comment: "Les projets sont très intéressants." }
                    ]
                },
                {
                    id: 3,
                    title: "Marketing Digital Avancé",
                    description: "Stratégies avancées de marketing digital pour booster votre entreprise en ligne.",
                    fullDescription: "Devenez un expert en marketing digital avec cette formation complète. Apprenez à créer des campagnes publicitaires efficaces sur les réseaux sociaux, optimiser le référencement (SEO), mettre en place le marketing par email, analyser les données avec Google Analytics, et développer des stratégies de contenu gagnantes.",
                    category: "Marketing",
                    price: 1199,
                    originalPrice: 3299,
                    rating: 4.6,
                    students: 2103,
                    duration: "45h",
                    level: "Débutant",
                    language: "Français",
                    instructor: "Sofia El Amrani",
                    image: "https://images.unsplash.com/photo-1552664730-d307ca884978?q=80&w=600&auto=format&fit=crop",
                    badge: "certified",
                    carouselImages: [
                        "https://images.unsplash.com/photo-1460925895917-afdab827c52f?q=80&w=600&auto=format&fit=crop",
                        "https://images.unsplash.com/photo-1551650975-87deedd944c3?q=80&w=600&auto=format&fit=crop",
                        "https://images.unsplash.com/photo-1552664730-d307ca884978?q=80&w=600&auto=format&fit=crop"
                    ],
                    objectives: [
                        "Maîtriser les publicités Facebook et Instagram",
                        "Optimiser le référencement naturel (SEO)",
                        "Créer des campagnes email efficaces",
                        "Analyser les données avec Google Analytics",
                        "Développer une stratégie de contenu"
                    ],
                    curriculum: [
                        { title: "Fondamentaux du marketing digital", duration: "6h", lessons: 10 },
                        { title: "Publicités sur réseaux sociaux", duration: "10h", lessons: 15 },
                        { title: "SEO et référencement naturel", duration: "8h", lessons: 12 },
                        { title: "Marketing par email", duration: "6h", lessons: 10 },
                        { title: "Google Analytics", duration: "5h", lessons: 8 },
                        { title: "Stratégie de contenu", duration: "10h", lessons: 15 }
                    ],
                    instructorInfo: {
                        name: "Sofia El Amrani",
                        bio: "Consultante en marketing digital avec 7 ans d'expérience, ayant travaillé avec des marques internationales et des startups locales.",
                        students: 4500,
                        courses: 10,
                        rating: 4.7
                    },
                    reviews: [
                        { name: "Rachid", rating: 5, comment: "Très pratique et utile pour mon business !" },
                        { name: "Laila", rating: 4, comment: "Les études de cas sont pertinentes." },
                        { name: "Mehdi", rating: 5, comment: "Instructrice passionnante." }
                    ]
                },
                {
                    id: 4,
                    title: "Cybersécurité Fondamentale",
                    description: "Protégez les systèmes et réseaux contre les cybermenaces avec les meilleures pratiques.",
                    fullDescription: "Cette formation vous initie aux fondamentaux de la cybersécurité. Vous apprendrez à sécuriser les réseaux, détecter les vulnérabilités, implémenter des pare-feux, gérer les identités et accès, et répondre aux incidents de sécurité. Le cours inclut des simulations d'attaques et des exercices pratiques.",
                    category: "Sécurité",
                    price: 1899,
                    originalPrice: 4999,
                    rating: 4.7,
                    students: 543,
                    duration: "70h",
                    level: "Intermédiaire",
                    language: "Français",
                    instructor: "Commandant Reda Chakir",
                    image: "https://images.unsplash.com/photo-1550751827-4bd374c3f58b?q=80&w=600&auto=format&fit=crop",
                    badge: "popular",
                    carouselImages: [
                        "https://images.unsplash.com/photo-1550751827-4bd374c3f58b?q=80&w=600&auto=format&fit=crop",
                        "https://images.unsplash.com/photo-1563013544-824ae1b704d3?q=80&w=600&auto=format&fit=crop",
                        "https://images.unsplash.com/photo-1555949963-aa79dcee981c?q=80&w=600&auto=format&fit=crop"
                    ],
                    objectives: [
                        "Comprendre les concepts de base de la cybersécurité",
                        "Sécuriser les réseaux et systèmes",
                        "Détecter et prévenir les attaques",
                        "Implémenter des politiques de sécurité",
                        "Répondre aux incidents de sécurité"
                    ],
                    curriculum: [
                        { title: "Introduction à la cybersécurité", duration: "8h", lessons: 12 },
                        { title: "Sécurité des réseaux", duration: "15h", lessons: 22 },
                        { title: "Cryptographie appliquée", duration: "10h", lessons: 15 },
                        { title: "Tests d'intrusion", duration: "12h", lessons: 18 },
                        { title: "Gestion des incidents", duration: "10h", lessons: 15 },
                        { title: "Conformité et réglementation", duration: "15h", lessons: 20 }
                    ],
                    instructorInfo: {
                        name: "Commandant Reda Chakir",
                        bio: "Ancien officier des forces spéciales en cybersécurité, consultant pour les institutions gouvernementales avec 12 ans d'expérience.",
                        students: 1800,
                        courses: 6,
                        rating: 4.9
                    },
                    reviews: [
                        { name: "Khalid", rating: 5, comment: "Formation très technique et complète." },
                        { name: "Samira", rating: 4, comment: "Le formateur est très compétent." },
                        { name: "Adil", rating: 5, comment: "Exercices pratiques très réalistes." }
                    ]
                },
                {
                    id: 5,
                    title: "UI/UX Design Professionnel",
                    description: "Concevez des interfaces utilisateur intuitives et des expériences utilisateur mémorables.",
                    fullDescription: "Apprenez les principes du design d'interface utilisateur (UI) et de l'expérience utilisateur (UX) avec cette formation pratique. Vous maîtriserez Figma, Adobe XD, les tests utilisateurs, les wireframes, les prototypes et les design systems. Le programme inclut des projets réels pour votre portfolio.",
                    category: "Design",
                    price: 1100,
                    originalPrice: 3599,
                    rating: 4.5,
                    students: 987,
                    duration: "50h",
                    level: "Débutant",
                    language: "Français",
                    instructor: "Yasmine Belkhayat",
                    image: "https://images.unsplash.com/photo-1561070791-2526d30994b5?q=80&w=600&auto=format&fit=crop",
                    badge: null,
                    carouselImages: [
                        "https://images.unsplash.com/photo-1561070791-2526d30994b5?q=80&w=600&auto=format&fit=crop",
                        "https://images.unsplash.com/photo-1551650975-87deedd944c3?q=80&w=600&auto=format&fit=crop",
                        "https://images.unsplash.com/photo-1545235617-9465d2a55698?q=80&w=600&auto=format&fit=crop"
                    ],
                    objectives: [
                        "Maîtriser Figma et Adobe XD",
                        "Créer des wireframes et prototypes",
                        "Concevoir des interfaces utilisables",
                        "Réaliser des tests utilisateurs",
                        "Développer un design system"
                    ],
                    curriculum: [
                        { title: "Principes du design UI/UX", duration: "6h", lessons: 10 },
                        { title: "Figma pour débutants", duration: "10h", lessons: 15 },
                        { title: "Wireframing et prototypage", duration: "8h", lessons: 12 },
                        { title: "Tests utilisateurs", duration: "6h", lessons: 10 },
                        { title: "Design systems", duration: "10h", lessons: 15 },
                        { title: "Portfolio design", duration: "10h", lessons: 15 }
                    ],
                    instructorInfo: {
                        name: "Yasmine Belkhayat",
                        bio: "Designer UI/UX senior avec 8 ans d'expérience, ayant travaillé pour des startups et grandes entreprises internationales.",
                        students: 2800,
                        courses: 7,
                        rating: 4.6
                    },
                    reviews: [
                        { name: "Salma", rating: 5, comment: "Parfait pour débuter en design !" },
                        { name: "Anas", rating: 4, comment: "Les projets sont créatifs." },
                        { name: "Imane", rating: 5, comment: "Très bonne pédagogie." }
                    ]
                },
                {
                    id: 6,
                    title: "Gestion de Projet Agile",
                    description: "Maîtrisez les méthodologies Agile pour gérer efficacement vos projets informatiques.",
                    fullDescription: "Devenez un chef de projet Agile certifié avec cette formation complète. Apprenez Scrum, Kanban, les rituels Agile, la gestion des backlogs, les estimations, et les métriques de performance. Le cours prépare à la certification PMI-ACP et inclut des simulations réelles de projets.",
                    category: "Management",
                    price: 599,
                    originalPrice: 2999,
                    rating: 4.4,
                    students: 765,
                    duration: "40h",
                    level: "Intermédiaire",
                    language: "Français",
                    instructor: "Dr. Mehdi El Fassi",
                    image: "https://images.unsplash.com/photo-1552664730-d307ca884978?q=80&w=600&auto=format&fit=crop",
                    badge: "certified",
                    carouselImages: [
                        "https://images.unsplash.com/photo-1545235617-9465d2a55698?q=80&w=600&auto=format&fit=crop",
                        "https://images.unsplash.com/photo-1551650975-87deedd944c3?q=80&w=600&auto=format&fit=crop",
                        "https://images.unsplash.com/photo-1552664730-d307ca884978?q=80&w=600&auto=format&fit=crop"
                    ],
                    objectives: [
                        "Maîtriser Scrum et Kanban",
                        "Animer les rituels Agile",
                        "Gérer les backlogs produit",
                        "Estimer et planifier les sprints",
                        "Mesurer la performance des équipes"
                    ],
                    curriculum: [
                        { title: "Fondamentaux Agile", duration: "6h", lessons: 10 },
                        { title: "Scrum en profondeur", duration: "10h", lessons: 15 },
                        { title: "Kanban et flux continu", duration: "6h", lessons: 10 },
                        { title: "Gestion des backlogs", duration: "6h", lessons: 10 },
                        { title: "Estimation et planification", duration: "6h", lessons: 10 },
                        { title: "Préparation certification", duration: "6h", lessons: 10 }
                    ],
                    instructorInfo: {
                        name: "Dr. Mehdi El Fassi",
                        bio: "PhD en gestion de projet, coach Agile certifié avec 10 ans d'expérience dans l'accompagnement d'équipes IT.",
                        students: 2200,
                        courses: 9,
                        rating: 4.5
                    },
                    reviews: [
                        { name: "Hamid", rating: 5, comment: "Excellent pour la certification." },
                        { name: "Sanaa", rating: 4, comment: "Exercices pratiques très utiles." },
                        { name: "Mourad", rating: 5, comment: "Le formateur est très expérimenté." }
                    ]
                }
            ],
            events: [
                {
                    id: 2,
                    title: "Forum de l'Emploi Digital",
                    description: "Rencontrez les recruteurs des plus grandes entreprises tech du Maroc. Plus de 50 entreprises présentes avec des offres d'emploi.",
                    date: "25 Avril 2025",
                    time: "09:00 - 18:00",
                    location: "Technopark, Casablanca",
                    type: "career",
                    badge: "upcoming",
                    image: "https://images.unsplash.com/photo-1553877522-43269d4ea984?q=80&w=800&auto=format&fit=crop",
                    price: "Gratuit"
                },
                {
                    id: 3,
                    title: "Atelier Data Science",
                    description: "Initiation pratique aux bases de la data science avec Python. Apportez votre ordinateur portable pour les exercices pratiques.",
                    date: "15 Mai 2025",
                    time: "14:00 - 17:00",
                    location: "Espace Coworking, Rabat",
                    type: "workshop",
                    badge: "upcoming",
                    image: "https://images.unsplash.com/photo-1555949963-aa79dcee981c?q=80&w=800&auto=format&fit=crop",
                    price: "200 DH"
                },
                {
                    id: 4,
                    title: "Conférence IA & Avenir du Travail",
                    description: "Experts internationaux discutent de l'impact de l'intelligence artificielle sur le marché de l'emploi et les compétences de demain.",
                    date: "30 Mai 2025",
                    time: "10:00 - 16:00",
                    location: "Hotel Hyatt, Casablanca",
                    type: "conference",
                    badge: "upcoming",
                    image: "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?q=80&w=800&auto=format&fit=crop",
                    price: "500 DH"
                },
                {
                    id: 5,
                    title: "Hackathon Innovation Sociale",
                    description: "48 heures de développement pour créer des solutions tech aux défis sociaux du Maroc. Prix à gagner : 50,000 DH.",
                    date: "7-9 Juin 2025",
                    time: "18:00 (Vendredi) - 18:00 (Dimanche)",
                    location: "1337 School, Khouribga",
                    type: "hackathon",
                    badge: "upcoming",
                    image: "https://images.unsplash.com/photo-1558494949-ef010cbdcc31?q=80&w=800&auto=format&fit=crop",
                    price: "Gratuit"
                },
                {
                    id: 6,
                    title: "Networking Entrepreneurs",
                    description: "Soirée de networking dédiée aux entrepreneurs du digital. Venez échanger avec des investisseurs et partenaires potentiels.",
                    date: "20 Juin 2025",
                    time: "19:00 - 22:00",
                    location: "Rooftop, Marrakech",
                    type: "networking",
                    badge: "upcoming",
                    image: "https://images.unsplash.com/photo-1511578314322-379afb476865?q=80&w=800&auto=format&fit=crop",
                    price: "150 DH"
                }
            ],
            userCourses: [
                {
                    id: 1,
                    title: "Développeur Full Stack",
                    progress: 65,
                    lastAccessed: "2025-03-15",
                    duration: "60h",
                    image: "https://images.unsplash.com/photo-1498050108023-c5249f4df085?q=80&w=600&auto=format&fit=crop"
                },
                {
                    id: 2,
                    title: "Data Science & Machine Learning",
                    progress: 30,
                    lastAccessed: "2025-03-10",
                    duration: "80h",
                    image: "https://images.unsplash.com/photo-1551288049-bebda4e38f71?q=80&w=600&auto=format&fit=crop"
                }
            ],
            chatMessages: [
                { sender: "bot", text: "Bonjour ! Je suis Aya, votre assistante BDANOW. Comment puis-je vous aider aujourd'hui ?" }
            ]
        };

        // ==================== DOM ELEMENTS ====================
        const themeToggle = document.getElementById('themeToggle');
        const navLinks = document.querySelectorAll('.nav-links a');
        const burger = document.getElementById('burger');
        const mobileNav = document.getElementById('navLinks');
        const cartIcon = document.getElementById('cartIcon');
        const cartModal = document.getElementById('cartModal');
        const closeCart = document.getElementById('closeCart');
        const cartItems = document.getElementById('cartItems');
        const cartCount = document.getElementById('cartCount');
        const cartTotal = document.getElementById('cartTotal');
        const checkoutBtn = document.getElementById('checkoutBtn');
        const userMenu = document.getElementById('userMenu');
        const userAvatar = document.getElementById('userAvatar');
        const userDropdown = document.getElementById('userDropdown');
        const authOverlay = document.getElementById('authOverlay');
        const closeAuth = document.getElementById('closeAuth');
        const loginTab = document.getElementById('loginTab');
        const registerTab = document.getElementById('registerTab');
        const loginForm = document.getElementById('loginForm');
        const registerForm = document.getElementById('registerForm');
        const authTitle = document.getElementById('authTitle');
        const pageContent = document.getElementById('pageContent');
        const homePage = document.getElementById('homePage');
        const dashboardPage = document.getElementById('dashboardPage');
        const coursesPage = document.getElementById('coursesPage');
        const courseDetailPage = document.getElementById('courseDetailPage');
        const eventsPage = document.getElementById('eventsPage');
        const contactPage = document.getElementById('contactPage');
        const featuredCourses = document.getElementById('featuredCourses');
        const allCoursesGrid = document.getElementById('allCoursesGrid');
        const viewAllCourses = document.getElementById('viewAllCourses');
        const eventsGrid = document.getElementById('eventsGrid');
        const allEventsGrid = document.getElementById('allEventsGrid');
        const userCourses = document.getElementById('userCourses');
        const userName = document.getElementById('userName');
        const coursesCount = document.getElementById('coursesCount');
        const hoursCount = document.getElementById('hoursCount');
        const certificatesCount = document.getElementById('certificatesCount');
        const progressPercentage = document.getElementById('progressPercentage');
        const contactForm = document.getElementById('contactForm');
        const searchInput = document.getElementById('searchInput');
        const courseDetailHeader = document.getElementById('courseDetailHeader');
        const courseTabs = document.getElementById('courseTabs');
        const testimonialTrack = document.getElementById('testimonialTrack');
        const testimonialNav = document.getElementById('testimonialNav');
        const chatButton = document.getElementById('chatButton');
        const chatContainer = document.getElementById('chatContainer');
        const chatClose = document.getElementById('chatClose');
        const chatMessages = document.getElementById('chatMessages');
        const chatInput = document.getElementById('chatInput');
        const chatSend = document.getElementById('chatSend');
        const canCountdown = document.getElementById('canCountdown');
        const countdownMessage = document.getElementById('countdownMessage');

        // ==================== UTILITY FUNCTIONS ====================
        

        function formatPrice(price) {
            return price.toLocaleString('fr-MA') + ' DH';
        }

        function saveUserToStorage(user) {
            localStorage.setItem('bdanow-user', JSON.stringify(user));
        }

        function loadUserFromStorage() {
            const savedUser = localStorage.getItem('bdanow-user');
            if (savedUser) {
                try {
                    appState.currentUser = JSON.parse(savedUser);
                    updateUIForUser();
                    return true;
                } catch (e) {
                    console.error('Failed to parse saved user:', e);
                    localStorage.removeItem('bdanow-user');
                }
            }
            return false;
        }

        function updateUIForUser() {
            if (appState.currentUser) {
                userAvatar.innerHTML = `<img src="${appState.currentUser.avatar}" alt="${appState.currentUser.name}">`;
                userName.textContent = appState.currentUser.name;
                updateAuthDropdown();
            } else {
                userAvatar.innerHTML = '<i class="fas fa-user"></i>';
                userName.textContent = 'Utilisateur';
                updateAuthDropdown();
            }
        }

        function updateCartCount() {
            cartCount.textContent = appState.cart.length;
        }

        function updateCartTotal() {
            const total = appState.cart.reduce((sum, item) => sum + item.price, 0);
            cartTotal.textContent = formatPrice(total);
        }

        function renderCartItems() {
            cartItems.innerHTML = '';
            if (appState.cart.length === 0) {
                cartItems.innerHTML = '<p style="text-align: center; color: var(--text-light);">Votre panier est vide</p>';
                return;
            }
            appState.cart.forEach(item => {
                const cartItem = document.createElement('div');
                cartItem.className = 'cart-item';
                cartItem.innerHTML = `
                    <div class="cart-item-img">
                        <img src="${item.image}" alt="${item.title}">
                    </div>
                    <div class="cart-item-details">
                        <div class="cart-item-title">${item.title}</div>
                        <div class="cart-item-price">${formatPrice(item.price)}</div>
                    </div>
                    <button class="remove-item" data-id="${item.id}">
                        <i class="fas fa-trash"></i>
                    </button>
                `;
                cartItems.appendChild(cartItem);
            });
            document.querySelectorAll('.remove-item').forEach(button => {
                button.addEventListener('click', function() {
                    const id = parseInt(this.getAttribute('data-id'));
                    removeFromCart(id);
                });
            });
        }

        function renderCourses(container, courses) {
            container.innerHTML = '';
            if (courses.length === 0) {
                container.innerHTML = '<p style="text-align: center; color: var(--text-light); grid-column: 1 / -1; padding: 40px;">Aucun cours ne correspond à votre recherche.</p>';
                return;
            }
            courses.forEach(course => {
                const courseCard = document.createElement('div');
                courseCard.className = 'course-card fade-in';
                courseCard.setAttribute('data-id', course.id);
                courseCard.innerHTML = `
                    <div class="course-img">
                        <img src="${course.image}" alt="${course.title}">
                        ${course.badge ? `<div class="badge badge-${course.badge}">${course.badge === 'new' ? 'Nouveau' : course.badge === 'popular' ? 'Populaire' : 'Certifié'}</div>` : ''}
                    </div>
                    <div class="course-content">
                        <span class="course-category">${course.category}</span>
                        <h3 class="course-title">${course.title}</h3>
                        <p class="course-description">${course.description}</p>
                        <div class="course-footer">
                            <div>
                                <div class="course-price">${formatPrice(course.price)} <span>${formatPrice(course.originalPrice)}</span></div>
                                <div class="course-rating">
                                    <i class="fas fa-star"></i>
                                    <i class="fas fa-star"></i>
                                    <i class="fas fa-star"></i>
                                    <i class="fas fa-star"></i>
                                    <i class="fas fa-star-half-alt"></i>
                                    <span>${course.rating} (${course.students})</span>
                                </div>
                            </div>
                            <button class="btn-accent view-course-detail" data-id="${course.id}">Voir détails</button>
                        </div>
                    </div>
                `;
                container.appendChild(courseCard);
            });
            document.querySelectorAll('.view-course-detail').forEach(button => {
                button.addEventListener('click', function(e) {
                    e.stopPropagation();
                    const id = parseInt(this.getAttribute('data-id'));
                    showCourseDetail(id);
                });
            });
            document.querySelectorAll('.course-card').forEach(card => {
                card.addEventListener('click', function() {
                    const id = parseInt(this.getAttribute('data-id'));
                    showCourseDetail(id);
                });
            });
            setTimeout(() => {
                document.querySelectorAll('.fade-in').forEach(el => {
                    el.classList.add('visible');
                });
            }, 100);
        }

        function renderEvents(container, events) {
            container.innerHTML = '';
            if (events.length === 0) {
                container.innerHTML = '<p style="text-align: center; color: var(--text-light); grid-column: 1 / -1; padding: 40px;">Aucun événement à venir.</p>';
                return;
            }
            events.forEach(event => {
                const eventCard = document.createElement('div');
                eventCard.className = 'event-card fade-in';
                eventCard.innerHTML = `
                    <div class="event-banner">
                        <img src="${event.image}" alt="${event.title}">
                        <div class="event-badge ${event.badge}">${event.badge === 'live' ? 'En Direct' : 'À Venir'}</div>
                    </div>
                    <div class="event-content">
                        <div class="event-date">
                            <i class="far fa-calendar-alt"></i>
                            ${event.date} • ${event.time}
                        </div>
                        <h3 class="event-title">${event.title}</h3>
                        <p class="event-description">${event.description}</p>
                        <div class="event-meta">
                            <div class="event-location">
                                <i class="fas fa-map-marker-alt"></i>
                                ${event.location}
                            </div>
                            ${event.price ? `<div class="event-price">${event.price}</div>` : '<div class="event-price">Gratuit</div>'}
                        </div>
                    </div>
                `;
                container.appendChild(eventCard);
            });
            setTimeout(() => {
                document.querySelectorAll('.fade-in').forEach(el => {
                    el.classList.add('visible');
                });
            }, 100);
        }

        function renderTestimonials() {
            const allTestimonialsGrid = document.getElementById('allTestimonialsGrid');
            
            // Render on Home Page (Track) if it exists
            if (testimonialTrack) {
                testimonialTrack.innerHTML = '';
                if(typeof testimonialNav !== 'undefined' && testimonialNav) testimonialNav.innerHTML = '';
                // Only show first 3 on home page
                appState.testimonials.slice(0, 3).forEach((testimonial, index) => {
                    const slide = document.createElement('div');
                    slide.className = 'testimonial-slide' + (index === 0 ? ' active' : '');
                    slide.innerHTML = `
                        <div class="testimonial-avatar">
                            <img src="${testimonial.avatar}" alt="${testimonial.name}">
                        </div>
                        <p class="testimonial-text">"${testimonial.text}"</p>
                        <div class="testimonial-author">${testimonial.name}</div>
                        <div class="testimonial-role">${testimonial.role}</div>
                    `;
                    testimonialTrack.appendChild(slide);

                    if(typeof testimonialNav !== 'undefined' && testimonialNav) {
                        const dot = document.createElement('div');
                        dot.className = 'testimonial-dot' + (index === 0 ? ' active' : '');
                        dot.addEventListener('click', () => {
                            currentTestimonialIndex = index;
                            updateTestimonialSlider();
                        });
                        testimonialNav.appendChild(dot);
                    }
                });
            }

            // Render on Testimonials Page Grid
            if (allTestimonialsGrid) {
                allTestimonialsGrid.innerHTML = '';
                appState.testimonials.forEach(testimonial => {
                    const card = document.createElement('div');
                    card.className = 'course-card';
                    card.style.padding = '30px';
                    card.style.textAlign = 'center';
                    card.innerHTML = `
                        <div class="testimonial-avatar" style="margin-bottom: 20px;">
                            <img src="${testimonial.avatar}" alt="${testimonial.name}" style="width: 80px; height: 80px; border-radius: 50%; object-fit: cover; margin: 0 auto;">
                        </div>
                        <p class="testimonial-text" style="font-style: italic; color: var(--text-color); margin-bottom: 20px;">"${testimonial.text}"</p>
                        <h4 class="testimonial-author" style="color: var(--primary-color); font-weight: 600;">${testimonial.name}</h4>
                        <div class="testimonial-role" style="color: var(--text-light); font-size: 0.9rem;">${testimonial.role}</div>
                    `;
                    allTestimonialsGrid.appendChild(card);
                });
            }

            currentTestimonialIndex = 0;
            updateTestimonialSlider();

            if (window.testimonialInterval) clearInterval(window.testimonialInterval);
            window.testimonialInterval = setInterval(() => {
                currentTestimonialIndex = (currentTestimonialIndex + 1) % Math.min(3, appState.testimonials.length);
                updateTestimonialSlider();
            }, 5000);
        }

        let currentTestimonialIndex = 0;
        function updateTestimonialSlider() {
            testimonialTrack.style.transform = `translateX(-${currentTestimonialIndex * 100}%)`;
            document.querySelectorAll('.testimonial-dot').forEach((dot, index) => {
                dot.classList.toggle('active', index === currentTestimonialIndex);
            });
        }

        function updateCountdown() {
            const targetDate = new Date('2026-01-18T20:00:00+01:00');
            const now = new Date();
            const timeLeft = targetDate - now;

            if (timeLeft <= 0) {
                document.getElementById('days').textContent = '00';
                document.getElementById('hours').textContent = '00';
                document.getElementById('minutes').textContent = '00';
                document.getElementById('seconds').textContent = '00';
                countdownMessage.textContent = "La CAN 2025 est terminée ! Félicitations aux Lions de l'Atlas !";
                countdownMessage.style.color = "#EF4444";
                return;
            }

            const days = Math.floor(timeLeft / (1000 * 60 * 60 * 24));
            const hours = Math.floor((timeLeft % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
            const minutes = Math.floor((timeLeft % (1000 * 60 * 60)) / (1000 * 60));
            const seconds = Math.floor((timeLeft % (1000 * 60)) / 1000);

            document.getElementById('days').textContent = days.toString().padStart(2, '0');
            document.getElementById('hours').textContent = hours.toString().padStart(2, '0');
            document.getElementById('minutes').textContent = minutes.toString().padStart(2, '0');
            document.getElementById('seconds').textContent = seconds.toString().padStart(2, '0');

            if (days < 7) {
                countdownMessage.textContent = "La finale approche à grands pas ! Préparez-vous !";
                countdownMessage.style.color = "#EF4444";
            } else if (days < 30) {
                countdownMessage.textContent = "Plus qu'un mois avant la finale !";
                countdownMessage.style.color = "#F59E0B";
            } else {
                countdownMessage.textContent = "La finale se jouera le 18 Janvier 2026 !";
                countdownMessage.style.color = "#FFD700";
            }

            if (document.getElementById('daysPage')) {
                document.getElementById('daysPage').textContent = days.toString().padStart(2, '0');
                document.getElementById('hoursPage').textContent = hours.toString().padStart(2, '0');
                document.getElementById('minutesPage').textContent = minutes.toString().padStart(2, '0');
                document.getElementById('secondsPage').textContent = seconds.toString().padStart(2, '0');
            }
        }

        // Search functionality
        searchInput.addEventListener('input', (e) => {
            const searchTerm = e.target.value.toLowerCase();
            const filteredCourses = appState.courses.filter(course => 
                course.title.toLowerCase().includes(searchTerm) ||
                course.description.toLowerCase().includes(searchTerm) ||
                course.category.toLowerCase().includes(searchTerm)
            );
            
            if (homePage.classList.contains('active')) {
                renderCourses(featuredCourses, searchTerm ? filteredCourses.slice(0, 3) : appState.courses.slice(0, 3));
            } else if (coursesPage.classList.contains('active')) {
                renderCourses(allCoursesGrid, searchTerm ? filteredCourses : appState.courses);
            }
        });

        function renderUserCourses() {
            userCourses.innerHTML = '';
            appState.userCourses.forEach(course => {
                const progressCard = document.createElement('div');
                progressCard.className = 'course-progress-card';
                progressCard.innerHTML = `
                    <div class="course-progress-img">
                        <img src="${course.image}" alt="${course.title}">
                    </div>
                    <div class="course-progress-info">
                        <h4>${course.title}</h4>
                        <div class="course-progress-bar">
                            <div class="course-progress-fill" style="width: ${course.progress}%"></div>
                        </div>
                        <p style="color: var(--text-light); font-size: 0.9rem;">${course.progress}% complété • Dernier accès: ${course.lastAccessed}</p>
                    </div>
                    <button class="btn-primary" style="padding: 8px 16px; font-size: 0.9rem;">Continuer</button>
                `;
                userCourses.appendChild(progressCard);
            });
        }

        function removeFromCart(id) {
            appState.cart = appState.cart.filter(item => item.id !== id);
            updateCartCount();
            updateCartTotal();
            renderCartItems();
        }

        function showCourseDetail(courseId) {
            const course = appState.courses.find(c => c.id === courseId);
            if (!course) return;

            appState.currentCourseDetail = course;

            courseDetailHeader.innerHTML = `
                <div class="course-detail-image">
                    <img src="${course.image}" alt="${course.title}">
                </div>
                <div class="course-detail-info">
                    <h1>${course.title}</h1>
                    <div class="course-meta">
                        <div class="course-meta-item">
                            <i class="fas fa-graduation-cap"></i>
                            <span>${course.category}</span>
                        </div>
                        <div class="course-meta-item">
                            <i class="fas fa-clock"></i>
                            <span>${course.duration}</span>
                        </div>
                        <div class="course-meta-item">
                            <i class="fas fa-language"></i>
                            <span>${course.language}</span>
                        </div>
                        <div class="course-meta-item">
                            <i class="fas fa-signal"></i>
                            <span>${course.level}</span>
                        </div>
                    </div>
                    <div class="course-price-large">${formatPrice(course.price)}</div>
                    <div class="course-detail-cta">
                        <button class="btn-primary" id="addToCartBtn">Ajouter au panier</button>
                        <button class="btn-outline">Ajouter à mes favoris</button>
                    </div>
                    <div class="course-rating">
                        <i class="fas fa-star"></i>
                        <i class="fas fa-star"></i>
                        <i class="fas fa-star"></i>
                        <i class="fas fa-star"></i>
                        <i class="fas fa-star-half-alt"></i>
                        <span style="color: var(--text-light); margin-left: 8px;">${course.rating} (${course.students} étudiants)</span>
                    </div>
                </div>
            `;

            document.getElementById('courseFullDescription').textContent = course.fullDescription;

            const courseObjectives = document.getElementById('courseObjectives');
            if (courseObjectives) {
                courseObjectives.innerHTML = '';
                course.objectives.forEach(obj => {
                    const li = document.createElement('p');
                    li.innerHTML = `<i class="fas fa-check-circle" style="color: var(--success-color); margin-right: 10px;"></i> ${obj}`;
                    courseObjectives.appendChild(li);
                });
            }

            courseTabs.querySelectorAll('.course-tab').forEach(tab => {
                tab.addEventListener('click', () => {
                    courseTabs.querySelectorAll('.course-tab').forEach(t => t.classList.remove('active'));
                    tab.classList.add('active');
                    document.querySelectorAll('.tab-pane').forEach(p => p.classList.remove('active'));
                    const tabId = tab.getAttribute('data-tab');
                    document.getElementById(tabId + 'Tab').classList.add('active');
                });
            });

            showPage('courseDetail');
        }

        function renderChat() {
            chatMessages.innerHTML = '';
            appState.chatMessages.forEach(msg => {
                const msgEl = document.createElement('div');
                msgEl.className = `message ${msg.sender}`;
                msgEl.textContent = msg.text;
                chatMessages.appendChild(msgEl);
            });
            chatMessages.scrollTop = chatMessages.scrollHeight;
        }

        

        // ==================== AUTH HANDLERS ====================
        function handleLogin(e) {
            e.preventDefault();
            const email = document.getElementById('loginEmail').value.trim();
            const password = document.getElementById('loginPassword').value.trim();

            // Basic validation
            if (!email || !password) {
                showNotification('Veuillez remplir tous les champs', 'warning');
                return;
            }

            if (!email.includes('@')) {
                showNotification('Email invalide', 'warning');
                return;
            }

            const user = {
                name: email.split('@')[0],
                email: email,
                avatar: `https://ui-avatars.com/api/?name=${encodeURIComponent(email.split('@')[0])}&background=1E3A8A&color=fff&size=40`
            };

            appState.currentUser = user;
            saveUserToStorage(user);
            updateUIForUser();
            authOverlay.classList.remove('active');
            loginForm.reset();
            
            showNotification('Connexion réussie ! Bienvenue sur BDANOW.', 'success');
        }

        function handleRegister(e) {
            e.preventDefault();
            const name = document.getElementById('registerName').value.trim();
            const email = document.getElementById('registerEmail').value.trim();
            const password = document.getElementById('registerPassword').value.trim();
            const confirm = document.getElementById('registerConfirm').value.trim();

            // Validation
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
                name: name,
                email: email,
                avatar: `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=1E3A8A&color=fff&size=40`
            };

            appState.currentUser = user;
            saveUserToStorage(user);
            updateUIForUser();
            authOverlay.classList.remove('active');
            registerForm.reset();
            
            showNotification('Inscription réussie ! Bienvenue sur BDANOW.', 'success');
        }

        function handleLogout() {
            appState.currentUser = null;
            localStorage.removeItem('bdanow-user');
            updateUIForUser();
            showPage('home');
            showNotification('Vous avez été déconnecté.', 'success');
        }

        function showAuthModal() {
            authOverlay.classList.add('active');
        }

    // ==================== CART & CHECKOUT HANDLERS ====================
    function addToCart(course) {
        if (!appState.currentUser) {
            showAuthModal();
            return false;
        }

        const cartItem = {
            id: course.id,
            title: course.title,
            price: course.price,
            image: course.image,
            category: course.category || "Formation", // Add category
            description: course.description || "" // Add description
        };

        // Check if already in cart
        const exists = appState.cart.some(item => item.id === course.id);
        if (!exists) {
            appState.cart.push(cartItem);
            updateCartCount();
            updateCartTotal();
            renderCartItems();
            
            // Save cart to localStorage for persistence
            localStorage.setItem('bdanow-cart', JSON.stringify(appState.cart));
            
            showNotification(`"${course.title}" a été ajouté à votre panier!`, 'success');
            return true;
        } else {
            showNotification(`"${course.title}" est déjà dans votre panier!`, 'warning');
            return false;
        }
    }

    // REPLACE handleCheckout with this new function:
    function handleCheckoutRedirect() {
        if (!appState.currentUser) {
            showAuthModal();
            return;
        }
        
        if (appState.cart.length === 0) {
            showNotification('Votre panier est vide!', 'warning');
            return;
        }
        
        console.log('Cart items before checkout:', appState.cart); // Debug log
        
        // Prepare complete checkout data
        const checkoutData = {
            cart: appState.cart.map(item => {
                // Find the full course details from appState.courses
                const fullCourse = appState.courses.find(course => course.id === item.id);
                return {
                    ...item,
                    fullDescription: fullCourse?.fullDescription || item.description,
                    duration: fullCourse?.duration || 'N/A',
                    level: fullCourse?.level || 'N/A',
                    language: fullCourse?.language || 'Français',
                    instructor: fullCourse?.instructor || 'N/A',
                    originalPrice: fullCourse?.originalPrice || item.price
                };
            }),
            total: appState.cart.reduce((sum, item) => sum + item.price, 0),
            user: appState.currentUser,
            timestamp: new Date().toISOString(),
            orderId: 'CMD-' + Date.now() + '-' + Math.random().toString(36).substr(2, 9).toUpperCase()
        };
        
        console.log('Checkout data to save:', checkoutData); // Debug log
        
        // Save checkout data to localStorage (multiple keys for reliability)
        try {
            localStorage.setItem('checkoutData', JSON.stringify(checkoutData));
            localStorage.setItem('bdanow-checkout', JSON.stringify(checkoutData));
            sessionStorage.setItem('currentCheckout', JSON.stringify(checkoutData));
            console.log('Checkout data saved successfully');
        } catch (error) {
            console.error('Error saving checkout data:', error);
            showNotification('Erreur lors de la préparation du paiement', 'warning');
            return;
        }
        
        // Close cart modal
        cartModal.classList.remove('active');
        
        // Show loading notification
        showNotification('Redirection vers la page de paiement...', 'success');
        
        // Redirect to payment page after short delay
        setTimeout(() => {
            window.location.href = 'pay.html';
        }, 1000);
    }

    // Keep the old handleCheckout function for backward compatibility
    function handleCheckout() {
        if (!appState.currentUser) {
            showAuthModal();
            return;
        }
        
        if (appState.cart.length === 0) {
            showNotification('Votre panier est vide!', 'warning');
            return;
        }
        
        const total = appState.cart.reduce((sum, item) => sum + item.price, 0);
        showNotification(`Paiement de ${formatPrice(total)} effectué avec succès!`, 'success');
        
        // Clear cart
        appState.cart = [];
        updateCartCount();
        updateCartTotal();
        renderCartItems();
        
        // Save empty cart to localStorage
        localStorage.setItem('bdanow-cart', JSON.stringify([]));
        
        // Close cart modal
        cartModal.classList.remove('active');
    }

    // ==================== CLEAR CART FUNCTION ====================
    function clearCart() {
        appState.cart = [];
        updateCartCount();
        updateCartTotal();
        renderCartItems();
        // Save empty cart to localStorage
        localStorage.setItem('bdanow-cart', JSON.stringify([]));
        showNotification('Panier vidé avec succès', 'success');
    }
        // ==================== NOTIFICATION SYSTEM ====================
        function showNotification(message, type = 'success') {
            // Remove existing notification
            const existingNotification = document.querySelector('.notification');
            if (existingNotification) existingNotification.remove();
            
            // Create notification element
            const notification = document.createElement('div');
            notification.className = `notification notification-${type}`;
            notification.style.cssText = `
                position: fixed;
                top: 20px;
                right: 20px;
                background: ${type === 'success' ? '#10B981' : '#F59E0B'};
                color: white;
                padding: 15px 20px;
                border-radius: 10px;
                box-shadow: 0 5px 15px rgba(0,0,0,0.2);
                z-index: 9999;
                transform: translateX(400px);
                transition: transform 0.3s ease;
                display: flex;
                align-items: center;
                gap: 10px;
                max-width: 300px;
            `;
            
            notification.innerHTML = `
                <i class="fas fa-${type === 'success' ? 'check-circle' : 'exclamation-circle'}"></i>
                <span>${message}</span>
                <button style="margin-left: auto; background: none; border: none; color: white; cursor: pointer;">&times;</button>
            `;
            
            document.body.appendChild(notification);
            
            // Show notification
            setTimeout(() => {
                notification.style.transform = 'translateX(0)';
            }, 10);
            
            // Auto hide after 4 seconds
            setTimeout(() => {
                notification.style.transform = 'translateX(400px)';
                setTimeout(() => notification.remove(), 300);
            }, 4000);
            
            // Close button
            notification.querySelector('button').addEventListener('click', () => {
                notification.style.transform = 'translateX(400px)';
                setTimeout(() => notification.remove(), 300);
            });
        }

        // ==================== USER DROPDOWN MANAGEMENT ====================
        function updateAuthDropdown() {
            const userDropdown = document.getElementById('userDropdown');
            
            if (!appState.currentUser) {
                // Show auth options when not logged in
                userDropdown.innerHTML = `
                    <a href="#" id="loginDropdownBtn">
                        <i class="fas fa-sign-in-alt"></i> Connexion
                    </a>
                    <a href="#" id="registerDropdownBtn">
                        <i class="fas fa-user-plus"></i> Inscription
                    </a>
                `;
                
                // Add event listeners for dropdown auth buttons
                setTimeout(() => {
                    const loginBtn = document.getElementById('loginDropdownBtn');
                    const registerBtn = document.getElementById('registerDropdownBtn');
                    
                    if (loginBtn) {
                        loginBtn.addEventListener('click', (e) => {
                            e.preventDefault();
                            showAuthModal();
                            loginTab.click();
                        });
                    }
                    
                    if (registerBtn) {
                        registerBtn.addEventListener('click', (e) => {
                            e.preventDefault();
                            showAuthModal();
                            registerTab.click();
                        });
                    }
                }, 100);
            } else {
                // Show user menu when logged in
                userDropdown.innerHTML = `
                    <a href="#" data-page="dashboard" class="dropdown-link">
                        <i class="fas fa-tachometer-alt"></i> Tableau de bord
                    </a>
                    <a href="#" data-page="profile" class="dropdown-link">
                        <i class="fas fa-user-circle"></i> Mon profil
                    </a>
                    <a href="#" data-page="settings" class="dropdown-link">
                        <i class="fas fa-cog"></i> Paramètres
                    </a>
                    <a href="#" id="logoutBtn" class="dropdown-link">
                        <i class="fas fa-sign-out-alt"></i> Déconnexion
                    </a>
                `;
                
                // Re-attach event listeners for dropdown links
                setTimeout(() => {
                    const logoutBtn = document.getElementById('logoutBtn');
                    if (logoutBtn) {
                        logoutBtn.addEventListener('click', handleLogout);
                    }
                    
                    // Add click handlers for all dropdown links
                    document.querySelectorAll('.dropdown-link[data-page]').forEach(link => {
                        link.addEventListener('click', (e) => {
                            e.preventDefault();
                            const page = link.getAttribute('data-page');
                            if (page === 'dashboard' || page === 'profile' || page === 'settings') {
                                showPage(page);
                                // Close dropdown after clicking
                                userDropdown.classList.remove('active');
                            }
                        });
                    });
                }, 100);
            }
        }

        // ==================== PAGE MANAGEMENT ====================
        function showPage(pageName) {
            if (pageName === 'dashboard' && !appState.currentUser) {
                showAuthModal();
                return;
            }

            document.querySelectorAll('.page-content').forEach(page => {
                page.classList.remove('active');
                page.classList.add('hidden');
            });

            const pageElement = document.getElementById(pageName + 'Page');
            if (pageElement) {
                pageElement.classList.remove('hidden');
                setTimeout(() => pageElement.classList.add('active'), 50);
            }

            // Update active state in navigation
            navLinks.forEach(link => {
                link.classList.remove('active');
                if (link.getAttribute('data-page') === pageName) {
                    link.classList.add('active');
                }
            });

            mobileNav.classList.remove('active');
            window.location.hash = pageName;

            // Load content for each page
            if (pageName === 'home') {
                renderCourses(featuredCourses, appState.courses.slice(0, 3));
                renderEvents(eventsGrid, appState.events.filter(e => e.featured).slice(0, 3));
                renderTestimonials();
                updateCountdown();
            } else if (pageName === 'courses') {
                renderCourses(allCoursesGrid, appState.courses);
            } else if (pageName === 'events') {
                renderEvents(allEventsGrid, appState.events);
                updateCountdown();
            } else if (pageName === 'dashboard') {
                renderUserCourses();
                coursesCount.textContent = appState.userCourses.length;
                hoursCount.textContent = appState.userCourses.reduce((sum, c) => sum + parseInt(c.duration), 0) + 'h';
                certificatesCount.textContent = '0';
                const totalProgress = appState.userCourses.reduce((sum, c) => sum + c.progress, 0);
                progressPercentage.textContent = appState.userCourses.length ? Math.round(totalProgress / appState.userCourses.length) + '%' : '0%';
            } else if (pageName === 'courseDetail') {
                // Add to cart button for course detail page
                setTimeout(() => {
                    const addToCartBtn = document.getElementById('addToCartBtn');
                    if (addToCartBtn) {
                        addToCartBtn.addEventListener('click', () => {
                            if (appState.currentCourseDetail) {
                                addToCart(appState.currentCourseDetail);
                            }
                        });
                    }
                }, 100);
            } else if (pageName === 'profile') {
                // Show profile page content (simplified for now)
                if (!document.getElementById('profilePage')) {
                    const profilePage = document.createElement('section');
                    profilePage.id = 'profilePage';
                    profilePage.className = 'page-content hidden';
                    profilePage.innerHTML = `
                        <section class="section-padding" style="padding-top: 120px;">
                            <div class="container">
                                <div class="section-header">
                                    <h2>Mon Profil</h2>
                                    <p>Gérez vos informations personnelles</p>
                                </div>
                                <div class="card" style="max-width: 600px; margin: 0 auto;">
                                    <div style="text-align: center; margin-bottom: 30px;">
                                        <div style="width: 100px; height: 100px; border-radius: 50%; background: var(--light-color); margin: 0 auto 20px; overflow: hidden;">
                                            <img src="${appState.currentUser.avatar}" alt="${appState.currentUser.name}" style="width: 100%; height: 100%; object-fit: cover;">
                                        </div>
                                        <h3>${appState.currentUser.name}</h3>
                                        <p style="color: var(--text-light);">${appState.currentUser.email}</p>
                                    </div>
                                    <div style="text-align: center;">
                                        <button class="btn-primary" style="margin-bottom: 20px;">Modifier le profil</button>
                                        <br>
                                        <button class="btn-outline" onclick="showPage('dashboard')">Retour au tableau de bord</button>
                                    </div>
                                </div>
                            </div>
                        </section>
                    `;
                    pageContent.appendChild(profilePage);
                }
                document.getElementById('profilePage').classList.remove('hidden');
                setTimeout(() => document.getElementById('profilePage').classList.add('active'), 50);
            } else if (pageName === 'settings') {
                // Show settings page content (simplified for now)
                if (!document.getElementById('settingsPage')) {
                    const settingsPage = document.createElement('section');
                    settingsPage.id = 'settingsPage';
                    settingsPage.className = 'page-content hidden';
                    settingsPage.innerHTML = `
                        <section class="section-padding" style="padding-top: 120px;">
                            <div class="container">
                                <div class="section-header">
                                    <h2>Paramètres</h2>
                                    <p>Personnalisez votre expérience</p>
                                </div>
                                <div class="card" style="max-width: 600px; margin: 0 auto;">
                                    <h3 style="margin-bottom: 20px;">Préférences</h3>
                                    <div style="margin-bottom: 30px;">
                                        <label style="display: block; margin-bottom: 10px; font-weight: 600;">Thème</label>
                                        <select style="width: 100%; padding: 10px; border-radius: 5px; border: 1px solid var(--border-color);">
                                            <option value="light">Clair</option>
                                            <option value="dark">Sombre</option>
                                        </select>
                                    </div>
                                    <div style="margin-bottom: 30px;">
                                        <label style="display: block; margin-bottom: 10px; font-weight: 600;">Notifications</label>
                                        <div style="display: flex; flex-direction: column; gap: 10px;">
                                            <label><input type="checkbox" checked> Notifications par email</label>
                                            <label><input type="checkbox" checked> Notifications push</label>
                                        </div>
                                    </div>
                                    <div style="text-align: center;">
                                        <button class="btn-primary" style="margin-bottom: 20px;">Sauvegarder les modifications</button>
                                        <br>
                                        <button class="btn-outline" onclick="showPage('dashboard')">Retour au tableau de bord</button>
                                    </div>
                                </div>
                            </div>
                        </section>
                    `;
                    pageContent.appendChild(settingsPage);
                }
                document.getElementById('settingsPage').classList.remove('hidden');
                setTimeout(() => document.getElementById('settingsPage').classList.add('active'), 50);
            }
        }



        // ==================== PAGE MANAGEMENT ====================
        function showPage(pageName) {
            if (pageName === 'dashboard' && !appState.currentUser) {
                showAuthModal();
                return;
            }

            document.querySelectorAll('.page-content').forEach(page => {
                page.classList.remove('active');
                page.classList.add('hidden');
            });

            const pageElement = document.getElementById(pageName + 'Page');
            if (pageElement) {
                pageElement.classList.remove('hidden');
                setTimeout(() => pageElement.classList.add('active'), 50);
            }

            navLinks.forEach(link => {
                link.classList.remove('active');
                if (link.getAttribute('data-page') === pageName) {
                    link.classList.add('active');
                }
            });

            mobileNav.classList.remove('active');
            window.location.hash = pageName;

            if (pageName === 'home') {
                renderCourses(featuredCourses, appState.courses.slice(0, 3));
                renderEvents(eventsGrid, appState.events.filter(e => e.featured).slice(0, 3));
                renderTestimonials();
                updateCountdown();
            } else if (pageName === 'courses') {
                renderCourses(allCoursesGrid, appState.courses);
            } else if (pageName === 'events') {
                renderEvents(allEventsGrid, appState.events);
                updateCountdown();
            } else if (pageName === 'dashboard') {
                renderUserCourses();
                coursesCount.textContent = appState.userCourses.length;
                hoursCount.textContent = appState.userCourses.reduce((sum, c) => sum + parseInt(c.duration), 0) + 'h';
                certificatesCount.textContent = '0';
                const totalProgress = appState.userCourses.reduce((sum, c) => sum + c.progress, 0);
                progressPercentage.textContent = appState.userCourses.length ? Math.round(totalProgress / appState.userCourses.length) + '%' : '0%';
            } else if (pageName === 'courseDetail') {
                // Add to cart button for course detail page
                setTimeout(() => {
                    const addToCartBtn = document.getElementById('addToCartBtn');
                    if (addToCartBtn) {
                        addToCartBtn.addEventListener('click', () => {
                            if (appState.currentCourseDetail) {
                                addToCart(appState.currentCourseDetail);
                            }
                        });
                    }
                }, 100);
            }
        }

        // ==================== EVENT LISTENERS ====================
        themeToggle.addEventListener('click', () => {
            document.body.classList.toggle('dark-theme');
            localStorage.setItem('bdanow-theme', document.body.classList.contains('dark-theme') ? 'dark' : 'light');
        });

        burger.addEventListener('click', () => {
            mobileNav.classList.toggle('active');
        });

        cartIcon.addEventListener('click', () => {
            cartModal.classList.add('active');
        });

        closeCart.addEventListener('click', () => {
            cartModal.classList.remove('active');
        });

        userMenu.addEventListener('click', () => {
            userDropdown.classList.toggle('active');
        });

        // Fix: User avatar click shows auth modal when not logged in
        userAvatar.addEventListener('click', (e) => {
            if (!appState.currentUser) {
                e.stopPropagation();
                showAuthModal();
            }
        });

        document.addEventListener('click', (e) => {
            if (!userMenu.contains(e.target)) {
                userDropdown.classList.remove('active');
            }
        });

        loginTab.addEventListener('click', () => {
            loginTab.classList.add('active');
            registerTab.classList.remove('active');
            loginForm.classList.remove('hidden');
            registerForm.classList.add('hidden');
            authTitle.textContent = 'Connexion';
        });

        registerTab.addEventListener('click', () => {
            registerTab.classList.add('active');
            loginTab.classList.remove('active');
            registerForm.classList.remove('hidden');
            loginForm.classList.add('hidden');
            authTitle.textContent = 'Inscription';
        });

        closeAuth.addEventListener('click', () => {
            authOverlay.classList.remove('active');
        });

        loginForm.addEventListener('submit', handleLogin);
        registerForm.addEventListener('submit', handleRegister);

        // Checkout button listener
        // With this new checkout handler:
checkoutBtn.addEventListener('click', () => {
    if (!appState.currentUser) {
        showAuthModal();
        return;
    }
    
    if (appState.cart.length === 0) {
        showNotification('Votre panier est vide!', 'warning');
        return;
    }
    
    // Save cart data to localStorage for the payment page
    const checkoutData = {
        cart: appState.cart,
        total: appState.cart.reduce((sum, item) => sum + item.price, 0),
        user: appState.currentUser,
        timestamp: new Date().toISOString()
    };
    
    localStorage.setItem('checkoutData', JSON.stringify(checkoutData));
    
    // Redirect to payment page
    window.location.href = 'pay.html';
});

        navLinks.forEach(link => {
            link.addEventListener('click', (e) => {
                e.preventDefault();
                const page = link.getAttribute('data-page');
                if (page) {
                    showPage(page);
                }
            });
        });

        // Fix: Dashboard link in navigation
        document.querySelectorAll('a[href="dashboard.html"]').forEach(link => {
            link.addEventListener('click', (e) => {
                e.preventDefault();
                if (!appState.currentUser) {
                    showAuthModal();
                } else {
                    showPage('dashboard');
                }
            });
        });

        chatButton.addEventListener('click', () => {
            chatContainer.classList.toggle('active');
        });

        chatClose.addEventListener('click', () => {
            chatContainer.classList.remove('active');
        });

        chatSend.addEventListener('click', () => {
            const msg = chatInput.value.trim();
            if (msg) {
                appState.chatMessages.push({ sender: 'user', text: msg });
                appState.chatMessages.push({ sender: 'bot', text: "Merci pour votre message ! Notre équipe vous répondra bientôt." });
                renderChat();
                chatInput.value = '';
            }
        });

        chatInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                chatSend.click();
            }
        });

        // Contact form
        contactForm.addEventListener('submit', (e) => {
            e.preventDefault();
            showNotification('Message envoyé avec succès ! Nous vous répondrons bientôt.', 'success');
            contactForm.reset();
        });

        // View all courses button
        viewAllCourses.addEventListener('click', (e) => {
            e.preventDefault();
            showPage('courses');
        });

        // ==================== INITIALIZATION ====================
        function initApp() {
            // Load theme
            const savedTheme = localStorage.getItem('bdanow-theme');
            if (savedTheme === 'dark') {
                document.body.classList.add('dark-theme');
            }

            // Load user from storage
            loadUserFromStorage();
            
            // Initialize cart
            renderCartItems();
            updateCartCount();
            updateCartTotal();
            
            // Initialize chat
            renderChat();
            
            // Initialize auth dropdown
            updateAuthDropdown();
            
            // Initialize countdown
            setInterval(updateCountdown, 1000);
            updateCountdown();

            // Animate progress bars
            setTimeout(() => {
                document.querySelectorAll('.progress-fill').forEach(bar => {
                    const width = bar.getAttribute('data-width');
                    bar.style.width = width + '%';
                });
            }, 500);

            // Show appropriate page based on URL hash
            const hash = window.location.hash.substring(1) || 'home';
            if (hash.startsWith('course-')) {
                const courseId = parseInt(hash.split('-')[1]);
                showCourseDetail(courseId);
            } else {
                showPage(hash);
            }
            
            // Load initial data
            if (featuredCourses) {
                renderCourses(featuredCourses, appState.courses.slice(0, 3));
            }
            
            if (eventsGrid) {
                renderEvents(eventsGrid, appState.events.filter(e => e.featured).slice(0, 3));
            }
            
            renderTestimonials();
        }

        // Start the app
        initApp();