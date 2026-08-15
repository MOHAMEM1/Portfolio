export const indhKnowledgeBase = [
  {
    category: "general",
    keywords: ["indh", "initiative", "definition", "c'est quoi", "chno hiya", "chnou", "quoi"],
    response: "L'INDH (Initiative Nationale pour le Développement Humain) est une initiative royale lancée le 18 mai 2005 par Sa Majesté le Roi Mohammed VI.\n\nSon but est de lutter contre la pauvreté, la vulnérabilité et l'exclusion sociale au Maroc. Depuis son lancement, elle a mobilisé plus de 60 milliards de dirhams et bénéficié à plus de 12 millions de personnes."
  },
  {
    category: "soumission",
    keywords: ["soumettre", "proposer", "projet", "deposer", "n7et", "ndir projet", "kifach", "comment"],
    response: "Pour soumettre un projet, vous pouvez utiliser la page 'Proposer Votre Projet' de notre site. \n\nLes étapes sont :\n1. Fournir vos informations personnelles (CIN, Email, etc.)\n2. Décrire votre projet en détail\n3. Indiquer le budget et le nombre de bénéficiaires\n4. Joindre votre plan d'affaires (Business Plan)"
  },
  {
    category: "financement",
    keywords: ["budget", "argent", "financement", "flous", "ch7al", "montant", "combien"],
    response: "Le financement de l'INDH dépend du type de projet :\n\n- AGR (Activités Génératrices de Revenus) : le financement peut atteindre 300 000 DH.\n- Un apport personnel ou de votre association d'au moins 10% est généralement requis.\n- L'INDH finance les équipements et l'aménagement, mais pas les salaires ou les frais de fonctionnement récurrents."
  },
  {
    category: "eligibilite",
    keywords: ["condition", "eligibilite", "critere", "chourout", "qui peut", "wach n9der", "chkon"],
    response: "Les conditions principales pour bénéficier de l'INDH sont :\n\n- Être organisé en coopérative, association, ou TPE (Très Petite Entreprise).\n- Le projet doit répondre à un besoin local réel et cibler les populations vulnérables.\n- Le projet doit être techniquement et financièrement viable.\n- Les jeunes diplômés sans emploi et les femmes rurales sont prioritaires dans la Phase III."
  },
  {
    category: "phases",
    keywords: ["phase", "etape", "marahil", "historique", "2005", "2019"],
    response: "L'INDH s'est déroulée en 3 phases majeures :\n\n- Phase I (2005-2010) : Lutte contre la pauvreté avec un budget de 10 Milliards DH.\n- Phase II (2011-2018) : Mise à niveau territoriale avec un budget de 17 Milliards DH.\n- Phase III (2019-2023) : Axée sur le capital humain et l'inclusion économique des jeunes (18 Milliards DH)."
  },
  {
    category: "delais",
    keywords: ["delai", "temps", "wa9t", "ch7al dlw9t", "duree", "attendre", "reponse"],
    response: "Le traitement d'un dossier INDH prend généralement entre 3 et 6 mois.\n\nCela inclut l'étude technique, la visite sur le terrain, et la validation par les comités locaux et provinciaux (CPDH). Vous pouvez suivre l'état de votre demande directement auprès de la division d'action sociale (DAS) de votre préfecture."
  },
  {
    category: "documents",
    keywords: ["document", "papier", "wra9", "dossier", "milaf", "wata2i9"],
    response: "Le dossier type comprend :\n\n- Une demande adressée au Gouverneur\n- Les statuts de votre coopérative/association\n- Une étude de faisabilité ou un plan d'affaires (Business Plan)\n- Des devis estimatifs pour les équipements\n- Le PV de la dernière assemblée générale"
  },
  {
    category: "salutations",
    keywords: ["bonjour", "salam", "salut", "bonsoir", "slt", "ahlan", "mrhba"],
    response: "Salam ! Bonjour et bienvenue sur le portail de l'INDH. \n\nJe suis l'Intelligence Artificielle de la plateforme. Posez-moi n'importe quelle question sur les projets, les financements, ou les conditions de l'INDH !"
  },
  {
    category: "remerciements",
    keywords: ["merci", "chokran", "choukran", "thanks", "شكرا"],
    response: "De rien ! (L3afw). C'est un plaisir de vous aider. N'hésitez pas si vous avez d'autres questions."
  },
  {
    category: "contact",
    keywords: ["contact", "telephone", "adresse", "num", "appeler", "namra", "tassl", "email"],
    response: "Vous pouvez contacter l'INDH via :\n\n- La Division d'Action Sociale (DAS) de votre préfecture ou province (le moyen le plus direct).\n- Email : contact@indh.ma\n- Visitez la section 'Contact' du site pour envoyer un message direct."
  }
]

// Simple robust matching algorithm replacing fuse.js to avoid npm dependency issues
export function generateSmartResponse(input: string): string {
  const cleanInput = input.trim().toLowerCase();
  if (!cleanInput) return "Veuillez poser une question.";

  let bestMatch = null;
  let maxScore = 0;

  for (const item of indhKnowledgeBase) {
    let score = 0;
    
    // Exact word match checking
    for (const kw of item.keywords) {
      if (cleanInput.includes(kw.toLowerCase())) {
        // Longer keywords give more points
        score += kw.length;
      }
    }
    
    // Category match
    if (cleanInput.includes(item.category.toLowerCase())) {
      score += 5;
    }

    if (score > maxScore) {
      maxScore = score;
      bestMatch = item;
    }
  }

  // Threshold for matching
  if (bestMatch && maxScore > 2) {
    return bestMatch.response;
  }

  return "Je ne suis pas sûr de bien comprendre (mafhamtch mzyan). Pouvez-vous reformuler votre question ? \n\nVous pouvez me demander comment soumettre un projet, quels sont les documents nécessaires, ou quel est le montant du financement.";
}
