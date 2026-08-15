// ================================================================
// BDANOW - Application Data Store
// ================================================================

const APP_DATA = {
    testimonials: [
        {
            id: 1,
            name: "Ahmed Alami",
            role: "Développeur Full Stack",
            text: "Grâce à BDANOW, j'ai trouvé une formation en développement web rapidement. Aujourd'hui, je travaille en freelance !",
            avatar: "https://ui-avatars.com/api/?name=Ahmed+Alami&background=1E3A8A&color=fff&size=100&font-size=0.4&bold=true"
        },
        {
            id: 2,
            name: "Sara Alaoui",
            role: "Marketeuse Digitale",
            text: "Une plateforme très intuitive. J'ai pu comparer les prix et choisir la meilleure école de marketing à Casa.",
            avatar: "https://ui-avatars.com/api/?name=Sara+Alaoui&background=3B82F6&color=fff&size=100&font-size=0.4&bold=true"
        },
        {
            id: 3,
            name: "Omar Kabbaj",
            role: "Étudiant en Data Science",
            text: "Le support est très réactif. J'ai eu un problème pour m'inscrire et ils m'ont aidé en 5 minutes.",
            avatar: "https://ui-avatars.com/api/?name=Omar+Kabbaj&background=60A5FA&color=fff&size=100&font-size=0.4&bold=true"
        },
        {
            id: 4,
            name: "Fatima Zahra",
            role: "UI/UX Designer",
            text: "Les formations sont de qualité et les instructeurs sont très compétents. Je recommande BDANOW à tous !",
            avatar: "https://ui-avatars.com/api/?name=Fatima+Zahra&background=7C3AED&color=fff&size=100&font-size=0.4&bold=true"
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
                "Créer des campagnes publicitaires sur les réseaux sociaux",
                "Optimiser le référencement naturel (SEO)",
                "Mettre en place le marketing par email",
                "Analyser les données avec Google Analytics",
                "Développer une stratégie de contenu efficace"
            ],
            curriculum: [
                { title: "Fondamentaux du marketing digital", duration: "6h", lessons: 10 },
                { title: "SEO et référencement", duration: "8h", lessons: 12 },
                { title: "Marketing sur les réseaux sociaux", duration: "10h", lessons: 15 },
                { title: "Email marketing", duration: "6h", lessons: 10 },
                { title: "Google Analytics", duration: "7h", lessons: 12 },
                { title: "Stratégie de contenu", duration: "8h", lessons: 12 }
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
            fullDescription: "Apprenez les principes du design d'interface utilisateur (UI) et de l'expérience utilisateur (UX) avec cette formation pratique. Vous maîtriserez Figma, Adobe XD, les tests utilisateurs, les wireframes, les prototypes et les design systems.",
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
            fullDescription: "Devenez un chef de projet Agile certifié avec cette formation complète. Apprenez Scrum, Kanban, les rituels Agile, la gestion des backlogs, les estimations, et les métriques de performance.",
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

    chatResponses: {
        default: "Merci pour votre message ! Notre équipe vous répondra sous peu. En attendant, n'hésitez pas à explorer notre catalogue de formations.",
        greeting: "Bonjour !  Comment puis-je vous aider aujourd'hui ? Vous pouvez me poser des questions sur nos formations, les inscriptions ou le paiement.",
        formation: "Nous proposons plus de 20 formations certifiantes dans les domaines du développement web, data science, marketing digital, cybersécurité et plus encore. Consultez notre catalogue pour découvrir toutes nos offres !",
        price: "Nos formations sont à partir de 599 DH. Nous proposons aussi des facilités de paiement et des bourses pour les étudiants. Contactez-nous pour plus de détails.",
        contact: "Vous pouvez nous joindre par email à contact@bdanow.ma ou par téléphone au +212 6 00 00 00 00. Nous sommes disponibles du lundi au vendredi de 9h à 18h."
    }
};
