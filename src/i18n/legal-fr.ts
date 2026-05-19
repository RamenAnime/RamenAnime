import type { LegalDocumentContent } from "./legal-types";

export const privacy: LegalDocumentContent = {
  quickSummaryTitle: "Résumé rapide",
  quickSummaryBody:
    "Nous collectons uniquement les données minimales nécessaires au fonctionnement de nos Services. Nous ne vendons pas vos données personnelles. Nous utilisons un chiffrement conforme aux normes du secteur. Vous disposez de droits d'accès, de rectification et de suppression de vos données. Nous conservons les données pendant {{dataRetentionDays}} jours maximum.",
  lastUpdated: "2 mai 2025",
  sections: [
    {
      id: "privacy-1",
      title: "1. Introduction et champ d'application",
      paragraphs: [
        'La présente Politique de confidentialité décrit comment Ramen Anime (« nous », « notre » ou « nos ») collecte, utilise, stocke, partage et protège vos informations personnelles lorsque vous utilisez notre site web, nos applications mobiles, notre place de marché, notre forum social et les services associés (collectivement, les « Services »).',
        "La présente Politique est conforme à {{privacyLaw}} et s'applique à tous les utilisateurs dans le monde entier. Selon votre lieu de résidence, vous pouvez bénéficier de droits supplémentaires décrits à la Section 10.",
        "En utilisant nos Services, vous consentez aux pratiques décrites dans la présente Politique. Si vous n'êtes pas d'accord, veuillez ne pas utiliser les Services.",
      ],
    },
    {
      id: "privacy-2",
      title: "2. Informations que nous collectons",
      paragraphs: [
        "<p><strong>2.1 Informations que vous fournissez directement :</strong></p>",
        '<ul class="list-disc pl-5 space-y-1"><li><strong>Informations de compte :</strong> Nom d\'utilisateur, adresse e-mail, mot de passe (stocké sous forme de hash bcrypt avec un facteur de coût 12)</li><li><strong>Informations de profil :</strong> Nom affiché, biographie, avatar, localisation, centres d\'intérêt (tous facultatifs)</li><li><strong>Informations de la place de marché :</strong> Adresses de livraison, jetons de moyens de paiement (traités par Stripe/PayPal ; nous ne stockons jamais les numéros complets de carte)</li><li><strong>Contenu du forum :</strong> Publications, commentaires et messages que vous créez</li><li><strong>Communications :</strong> Demandes d\'assistance client, retours d\'expérience</li><li><strong>Vérification de l\'âge :</strong> Confirmation d\'âge, vérification d\'identité facultative pour le contenu soumis à limite d\'âge</li></ul>',
        "<p><strong>2.2 Informations collectées automatiquement :</strong></p>",
        '<ul class="list-disc pl-5 space-y-1"><li><strong>Informations sur l\'appareil :</strong> Adresse IP, type de navigateur, système d\'exploitation, identifiants d\'appareil</li><li><strong>Données d\'utilisation :</strong> Pages visitées, fonctionnalités utilisées, temps passé, schémas de clics</li><li><strong>Géolocalisation :</strong> Pays dérivé de l\'adresse IP à des fins de conformité (calcul de la TVA, vérification de l\'âge, contrôles à l\'exportation)</li><li><strong>Cookies et technologies similaires :</strong> Voir la Section 8 (Politique relative aux cookies)</li></ul>',
        "<p><strong>2.3 Informations provenant de tiers :</strong></p>",
        '<ul class="list-disc pl-5 space-y-1"><li>Processeurs de paiement (Stripe, PayPal) : confirmation de transaction, 4 derniers chiffres de la carte</li><li>Services d\'authentification (en cas d\'utilisation d\'OAuth)</li><li>Services de prévention de la fraude</li></ul>',
      ],
    },
    {
      id: "privacy-3",
      title: "3. Comment nous utilisons vos informations",
      paragraphs: [
        "Nous utilisons vos données personnelles aux fins suivantes :",
        '<table class="w-full text-xs border-collapse my-4"><thead><tr class="border-b"><th class="text-left py-2">Finalité</th><th class="text-left py-2">Base juridique (RGPD)</th><th class="text-left py-2">Données utilisées</th></tr></thead><tbody class="space-y-2"><tr class="border-b border-border/50"><td class="py-2">Création et gestion de compte</td><td>Exécution du contrat</td><td>Nom d\'utilisateur, e-mail, hash du mot de passe</td></tr><tr class="border-b border-border/50"><td class="py-2">Fourniture du service</td><td>Exécution du contrat</td><td>Données de profil, publications du forum, préférences</td></tr><tr class="border-b border-border/50"><td class="py-2">Traitement des paiements</td><td>Exécution du contrat</td><td>Jetons de paiement, historique des transactions</td></tr><tr class="border-b border-border/50"><td class="py-2">Conformité fiscale</td><td>Obligation légale</td><td>Données de transaction, pays, registres de TVA</td></tr><tr class="border-b border-border/50"><td class="py-2">Sécurité et prévention de la fraude</td><td>Intérêt légitime</td><td>Adresse IP, informations sur l\'appareil, schémas d\'utilisation</td></tr><tr class="border-b border-border/50"><td class="py-2">Vérification de l\'âge</td><td>Obligation légale</td><td>Déclaration d\'âge, pièces d\'identité facultatives</td></tr><tr class="border-b border-border/50"><td class="py-2">Conformité légale (contrôles à l\'exportation, sanctions)</td><td>Obligation légale</td><td>Pays, détails des transactions</td></tr><tr class="border-b border-border/50"><td class="py-2">Amélioration du service</td><td>Intérêt légitime</td><td>Analyses d\'utilisation agrégées</td></tr><tr class="border-b border-border/50"><td class="py-2">Assistance client</td><td>Exécution du contrat</td><td>Données de compte, historique des communications</td></tr><tr><td class="py-2">Marketing (avec consentement uniquement)</td><td>Consentement</td><td>E-mail, préférences</td></tr></tbody></table>',
      ],
    },
    {
      id: "privacy-4",
      title: "4. Comment nous partageons vos informations",
      paragraphs: [
        "Nous ne vendons pas vos données personnelles. Nous ne partageons les données que dans les circonstances suivantes :",
        '<ul class="list-disc pl-5 space-y-2"><li><strong>Prestataires de services :</strong> Processeurs de paiement (Stripe, PayPal), hébergeurs (Render), services de messagerie, fournisseurs d\'analyses. Tous sont liés par des accords de traitement des données.</li><li><strong>Autres utilisateurs :</strong> Vos informations de profil et publications du forum sont visibles par d\'autres utilisateurs conformément à la conception du service.</li><li><strong>Exigences légales :</strong> Lorsque la loi, une ordonnance judiciaire ou une autorité gouvernementale l\'exige. Nous vous informerons sauf interdiction.</li><li><strong>Transferts d\'entreprise :</strong> Dans le cadre d\'une fusion, acquisition ou cession d\'actifs, avec notification aux utilisateurs.</li><li><strong>Avec votre consentement :</strong> Pour toute finalité que vous autorisez expressément.</li></ul>',
      ],
    },
    {
      id: "privacy-5",
      title: "5. Conservation et suppression des données",
      paragraphs: [
        "Nous conservons les données personnelles aussi longtemps que nécessaire pour atteindre les finalités décrites dans la présente Politique :",
        '<ul class="list-disc pl-5 space-y-1"><li><strong>Données de compte :</strong> Jusqu\'à la suppression du compte ou {{dataRetentionDays}} jours d\'inactivité</li><li><strong>Registres de transactions :</strong> {{transactionRetentionDays}} jours (exigences fiscales et légales)</li><li><strong>Publications du forum :</strong> Jusqu\'à suppression par l\'utilisateur ou fermeture du compte</li><li><strong>Fichiers journaux :</strong> 90 jours</li><li><strong>Registres de consentement aux cookies :</strong> 2 ans</li></ul>',
        "À la suite d'une demande de suppression de compte, nous supprimons ou anonymisons vos données personnelles dans un délai de 30 jours, sauf lorsque la loi exige leur conservation (registres de transactions à des fins fiscales).",
      ],
    },
    {
      id: "privacy-6",
      title: "6. Sécurité des données",
      paragraphs: [
        "Nous mettons en œuvre des mesures de sécurité conformes aux normes du secteur :",
        '<ul class="list-disc pl-5 space-y-1"><li><strong>Chiffrement :</strong> TLS 1.3 pour toutes les données en transit ; AES-256 pour les données au repos</li><li><strong>Mots de passe :</strong> Hachage bcrypt avec facteur de coût 12 (sortie 64 octets/512 bits)</li><li><strong>Authentification :</strong> Jetons JWT avec cookies httpOnly ; expiration de session après 1 an</li><li><strong>Contrôles d\'accès :</strong> Accès basé sur les rôles (utilisateur/administrateur) ; principe du moindre privilège</li><li><strong>Surveillance :</strong> Journalisation automatisée des tentatives d\'accès ; détection d\'anomalies</li><li><strong>Réponse aux violations :</strong> En cas de violation de données, nous informerons les utilisateurs concernés dans un délai de {{breachNotificationHours}} heures conformément à {{privacyLaw}}.</li></ul>',
      ],
    },
    {
      id: "privacy-7",
      title: "7. Transferts internationaux de données",
      paragraphs: [
        "Vos données sont stockées sur des serveurs situés aux États-Unis. Pour les utilisateurs de l'UE/EEE, du Royaume-Uni et d'autres juridictions exigeant des protections pour les transferts :",
        '<ul class="list-disc pl-5 space-y-1"><li>Nous utilisons les Clauses Contractuelles Types (CCT) approuvées par la Commission européenne</li><li>Pour les transferts vers le Royaume-Uni, nous respectons l\'Addendum britannique aux CCT</li><li>Nous surveillons les décisions d\'adéquation et les évolutions juridiques affectant les transferts</li><li>Tous les transferts sont protégés par un chiffrement en transit (TLS 1.3)</li></ul>',
      ],
    },
    {
      id: "privacy-8",
      title: "8. Politique relative aux cookies",
      paragraphs: [
        "Nous utilisons des cookies et des technologies similaires comme suit :",
        '<table class="w-full text-xs border-collapse my-4"><thead><tr class="border-b"><th class="text-left py-2">Catégorie</th><th class="text-left py-2">Finalité</th><th class="text-left py-2">Durée</th><th class="text-left py-2">Obligatoire ?</th></tr></thead><tbody><tr class="border-b border-border/50"><td class="py-2">Essentiels</td><td>Authentification, sécurité, gestion de session</td><td>Session - 1 an</td><td>Oui (impossible à désactiver)</td></tr><tr class="border-b border-border/50"><td class="py-2">Préférences</td><td>Sélection de la langue, thème, paramètres d\'affichage</td><td>1 an</td><td>Non</td></tr><tr class="border-b border-border/50"><td class="py-2">Analytiques</td><td>Amélioration du service, statistiques d\'utilisation</td><td>1 an</td><td>Non</td></tr><tr><td class="py-2">Marketing</td><td>Recommandations personnalisées (si consentement)</td><td>1 an</td><td>Non</td></tr></tbody></table>',
        "{{cookieConsentNote}}",
      ],
    },
    {
      id: "privacy-9",
      title: "9. Confidentialité des enfants",
      paragraphs: [
        "Nous respectons la COPPA (États-Unis), les exigences du RGPD relatives aux enfants (UE) et les lois équivalentes dans le monde. Nos Services ne s'adressent pas aux enfants de moins de 13 ans.",
        "Nous ne collectons pas sciemment d'informations personnelles auprès d'enfants de moins de {{ageOfConsent}} ans sans {{parentalConsentPhrase}}. Si vous êtes parent ou tuteur et pensez que votre enfant a fourni des informations personnelles sans consentement, contactez-nous immédiatement et nous supprimerons ces informations.",
        "Les sections de nos Services soumises à limite d'âge (forum social, place de marché) exigent que les utilisateurs confirment avoir au moins 18 ans.",
      ],
    },
    {
      id: "privacy-10",
      title: "10. Vos droits en matière de confidentialité",
      paragraphs: [
        "Selon votre lieu de résidence, vous pouvez disposer des droits suivants :",
        '<table class="w-full text-xs border-collapse my-4"><thead><tr class="border-b"><th class="text-left py-2">Droit</th><th class="text-left py-2">Description</th><th class="text-left py-2">Disponible dans</th></tr></thead><tbody><tr class="border-b border-border/50"><td class="py-2">Accès</td><td>Demander une copie de vos données personnelles</td><td>Toutes les juridictions</td></tr><tr class="border-b border-border/50"><td class="py-2">Rectification</td><td>Demander la correction de données inexactes</td><td>Toutes les juridictions</td></tr><tr class="border-b border-border/50"><td class="py-2">Effacement (droit à l\'oubli)</td><td>Demander la suppression de vos données</td><td>{{rightToBeForgottenDetail}}</td></tr><tr class="border-b border-border/50"><td class="py-2">Portabilité</td><td>Recevoir les données dans un format structuré et lisible par machine</td><td>{{dataPortabilityDetail}}</td></tr><tr class="border-b border-border/50"><td class="py-2">Opposition</td><td>S\'opposer au traitement fondé sur des intérêts légitimes</td><td>UE, Royaume-Uni, Brésil, Corée du Sud</td></tr><tr class="border-b border-border/50"><td class="py-2">Limitation</td><td>Demander la limitation du traitement</td><td>UE, Royaume-Uni, Brésil</td></tr><tr class="border-b border-border/50"><td class="py-2">Retrait du consentement</td><td>Retirer votre consentement à tout moment</td><td>Toutes les juridictions (lorsque le consentement est la base)</td></tr><tr><td class="py-2">Réclamation</td><td>Déposer une plainte auprès de l\'autorité de contrôle</td><td>UE, Royaume-Uni, Brésil, Corée du Sud</td></tr></tbody></table>',
        "Pour exercer l'un de ces droits, écrivez-nous à privacy@ramenanime.app. Nous répondons dans un délai de 30 jours.",
      ],
    },
    {
      id: "privacy-11",
      title: "11. Décisions automatisées et profilage",
      paragraphs: [
        "Nous n'effectuons pas de profilage ni de prise de décision automatisée produisant des effets juridiques vous concernant, sauf pour :",
        '<ul class="list-disc pl-5 space-y-1"><li>Algorithmes de détection et de prévention de la fraude</li><li>Automatisation des filtres anti-spam/contenu pour les publications du forum</li><li>Contrôle d\'accès et calcul fiscal basés sur la géolocalisation</li></ul>',
        "Ces systèmes n'entraînent pas de décisions automatisées affectant significativement vos droits légaux. Un examen humain est disponible pour les décisions contestées.",
      ],
    },
    {
      id: "privacy-12",
      title: "12. Modifications de la présente Politique",
      paragraphs: [
        'Nous pouvons mettre à jour la présente Politique de confidentialité périodiquement. Les modifications substantielles seront notifiées par e-mail ou avis visible au moins 30 jours avant leur entrée en vigueur. L\'utilisation continue après les modifications vaut acceptation. La date « Dernière mise à jour » en haut indique la révision la plus récente.',
      ],
    },
    {
      id: "privacy-13",
      title: "13. Nous contacter",
      paragraphs: [
        "<p><strong>Délégué à la protection des données :</strong> dpo@ramenanime.app</p>",
        "<p><strong>Demandes relatives à la confidentialité :</strong> privacy@ramenanime.app</p>",
        "<p><strong>Adresse postale :</strong><br />Ramen Anime Privacy Office<br />123 Anime Street<br />Los Angeles, CA 90001<br />United States</p>",
        "<p><strong>Autorités de contrôle de l'UE :</strong> Vous avez le droit de déposer une plainte auprès de votre autorité locale de protection des données. La liste est disponible sur : https://edpb.europa.eu/about-edpb/board/members</p>",
      ],
    },
  ],
};

export const terms: LegalDocumentContent = {
  quickSummaryTitle: "",
  quickSummaryBody: "",
  lastUpdated: "2 mai 2025",
  sections: [
    {
      id: "terms-1",
      title: "1. Acceptation des Conditions",
      paragraphs: [
        'En accédant ou en utilisant Ramen Anime (« Ramen Anime », « nous », « notre » ou « nos »), y compris notre site web, nos applications mobiles, notre place de marché, notre forum social et tout service associé (collectivement, les « Services »), vous acceptez d\'être lié par les présentes Conditions d\'utilisation (« Conditions »). Si vous n\'acceptez pas ces Conditions, vous ne devez pas accéder aux Services ni les utiliser.',
        "Les présentes Conditions constituent un accord juridiquement contraignant entre vous et Ramen Anime. Nous nous réservons le droit de modifier ces Conditions à tout moment. Les modifications prennent effet immédiatement après leur publication. Votre utilisation continue des Services après les modifications vaut acceptation des Conditions révisées. Nous vous informerons des modifications substantielles par e-mail ou avis visible sur les Services au moins 30 jours avant leur entrée en vigueur, conformément aux lois applicables de protection des consommateurs.",
        "Si vous accédez aux Services depuis l'Union européenne, les présentes Conditions sont complétées par nos dispositions spécifiques à l'UE. Si vous résidez en Californie, vos droits en vertu du California Consumer Privacy Act (CCPA) et du California Privacy Rights Act (CPRA) sont préservés et ne sont pas limités par les présentes Conditions.",
      ],
    },
    {
      id: "terms-2",
      title: "2. Éligibilité et inscription au compte",
      paragraphs: [
        "<p><strong>2.1 Exigences d'âge.</strong> Vous devez avoir au moins 18 ans pour créer un compte et utiliser l'ensemble des Services, y compris la place de marché et le forum social de Ramen Anime. Si vous avez moins de 18 ans, vous ne pouvez utiliser les Services qu'avec la participation et le consentement d'un parent ou tuteur légal, et uniquement les fonctionnalités générales de la boutique qui n'impliquent pas d'interaction entre utilisateurs. En créant un compte, vous déclarez et garantissez que vous remplissez ces conditions d'âge.</p>",
        "<p><strong>2.2 Consentement parental.</strong> En vertu de {{privacyLaw}}, si vous avez moins de {{ageOfConsent}} ans, un consentement parental vérifiable est requis avant que nous collections, utilisions ou divulguions vos informations personnelles. Nous utilisons la vérification par e-mail avec confirmation de suivi comme mécanisme de consentement parental, conformément à la COPPA (si vous êtes aux États-Unis) et aux cadres équivalents.</p>",
        "<p><strong>2.3 Sécurité du compte.</strong> Vous êtes responsable du maintien de la confidentialité de vos identifiants de compte et de toutes les activités effectuées sous votre compte. Vous devez nous informer immédiatement de toute utilisation non autorisée. Nous mettons en œuvre des mesures de sécurité conformes aux normes du secteur, notamment le hachage bcrypt des mots de passe avec facteur de coût 12, le chiffrement HTTPS/TLS 1.3 pour toutes les données en transit et la gestion de session basée sur JWT avec cookies httpOnly.</p>",
        "<p><strong>2.4 Résiliation du compte.</strong> Nous nous réservons le droit de suspendre ou résilier votre compte à notre seule discrétion en cas de violation des présentes Conditions, d'activité illégale ou pour la protection de notre communauté. Dans l'UE, vous avez le droit de résilier votre compte à tout moment et de demander la suppression des données en vertu de l'article 17 du RGPD.</p>",
      ],
    },
    {
      id: "terms-3",
      title: "3. Confidentialité et protection des données",
      paragraphs: [
        "Votre confidentialité est régie par notre Politique de confidentialité, incorporée aux présentes Conditions par référence. Nos pratiques en matière de données sont conformes à {{privacyLaw}}.",
        "<p><strong>3.1 Collecte de données.</strong> Nous collectons : (a) les informations de compte (nom d'utilisateur, e-mail, hash du mot de passe) ; (b) les informations de profil que vous fournissez volontairement ; (c) les données de transaction pour les achats sur la place de marché ; (d) les publications et commentaires du forum ; (e) l'adresse IP et les informations sur l'appareil pour la sécurité et la conformité géographique ; (f) les cookies et technologies similaires détaillés dans notre Politique relative aux cookies.</p>",
        "<p><strong>3.2 Base juridique du traitement (RGPD/LGPD).</strong> Pour les utilisateurs dans les juridictions exigeant une base juridique, nous traitons les données personnelles sur les bases suivantes : (a) exécution du contrat (fourniture des Services) ; (b) intérêts légitimes (sécurité, prévention de la fraude) ; (c) obligation légale (déclarations fiscales, demandes des autorités) ; (d) consentement (communications marketing, fonctionnalités facultatives).</p>",
        "<p><strong>3.3 Vos droits.</strong> Selon votre juridiction, vous pouvez avoir le droit de : accéder à vos données, rectifier les inexactitudes, supprimer votre compte et vos données (droit à l'oubli), vous opposer au traitement, à la portabilité des données, retirer votre consentement et déposer des plaintes auprès des autorités de contrôle. Pour exercer ces droits, contactez-nous à l'adresse indiquée à la Section 16.</p>",
        "<p><strong>3.4 Conservation des données.</strong> Nous conservons vos données personnelles pendant {{dataRetentionDays}} jours, ou aussi longtemps que nécessaire pour atteindre les finalités pour lesquelles elles ont été collectées, respecter les obligations légales, résoudre les litiges et faire respecter nos accords. Après cette période, les données sont supprimées ou anonymisées de manière sécurisée.</p>",
        "<p><strong>3.5 Transferts internationaux.</strong> Vos données peuvent être transférées et traitées dans des pays autres que votre pays de résidence, y compris les États-Unis où se trouvent nos serveurs. Pour les transferts depuis l'UE/EEE, le Royaume-Uni ou d'autres juridictions exigeant des protections d'adéquation, nous mettons en œuvre les Clauses Contractuelles Types (CCT) approuvées par la Commission européenne.</p>",
      ],
    },
    {
      id: "terms-4",
      title: "4. Conditions de la place de marché",
      paragraphs: [
        "<p><strong>4.1 Nature de la place de marché.</strong> La place de marché Ramen Anime est une plateforme qui met en relation acheteurs et vendeurs de marchandises liées à l'anime. Nous ne sommes pas partie aux transactions entre utilisateurs. Nous n'acquérons pas la propriété des articles vendus et ne garantissons pas la qualité, la sécurité ou la légalité des articles répertoriés.</p>",
        "<p><strong>4.2 Obligations du vendeur.</strong> Les vendeurs doivent : (a) décrire les articles avec exactitude ; (b) respecter toutes les lois applicables relatives à la vente de biens ; (c) ne pas vendre d'articles interdits, notamment des contrefaçons, des armes, des substances réglementées ou des articles portant atteinte aux droits de propriété intellectuelle ; (d) expédier les articles dans le délai spécifié ; (e) percevoir et reverser tous les impôts applicables conformément à leur juridiction.</p>",
        "<p><strong>4.3 Obligations de l'acheteur.</strong> Les acheteurs doivent : (a) payer les articles rapidement ; (b) ne pas effectuer de rétrofacturations frauduleuses ; (c) signaler les problèmes dans les 30 jours suivant la livraison. Les acheteurs sont responsables de comprendre les restrictions d'importation et les droits de douane dans leur pays.</p>",
        "<p><strong>4.4 Articles interdits.</strong> Il est interdit de vendre : des contrefaçons, des armes ou répliques d'armes, du contenu pour adultes, des articles promouvant la haine ou la violence, des biens volés, des articles soumis à des contrôles à l'exportation (militaires/double usage) et tout article interdit par les lois locales de l'acheteur ou du vendeur.</p>",
        "<p><strong>4.5 Résolution des litiges.</strong> Pour les litiges entre acheteurs et vendeurs, les deux parties doivent d'abord tenter une résolution par notre processus interne de litiges. En l'absence de résolution dans les 14 jours, les litiges peuvent être soumis à la médiation. Les utilisateurs de l'UE peuvent également utiliser la plateforme européenne de règlement en ligne des litiges (RLL).</p>",
        "<p><strong>4.6 Conformité fiscale.</strong> Les prix affichés sur Ramen Anime peuvent inclure ou non la TVA/les taxes selon votre localisation. Nous calculons et affichons automatiquement les taxes applicables selon le pays de l'acheteur via notre moteur fiscal. Les vendeurs sont responsables du reversement des taxes perçues aux autorités fiscales locales. Nous fournissons des registres de transactions pour faciliter les déclarations fiscales.</p>",
        "<p><strong>4.7 Frais de plateforme.</strong> Nous facturons des frais de plateforme sur les transactions conclues. Frais actuels : 8 % du prix de l'article pour les vendeurs standard, 5 % pour les vendeurs vérifiés. Les frais peuvent être modifiés avec un préavis de 30 jours.</p>",
      ],
    },
    {
      id: "terms-5",
      title: "5. TVA, TPS et conformité fiscale",
      paragraphs: [
        "<p><strong>5.1 Perception des taxes.</strong> Ramen Anime agit en tant qu'intermédiaire de place de marché dans les juridictions exigeant la perception fiscale sur les places de marché. Nous calculons, percevons et reversons automatiquement les taxes applicables, notamment la TVA (UE/Royaume-Uni), la TPS (Australie, Canada, Singapour), la taxe à la consommation (Japon) et la taxe de vente d'État (États-Unis) lorsque la loi l'exige.</p>",
        "<p><strong>5.2 TVA de l'UE.</strong> Pour les acheteurs dans les États membres de l'UE, la TVA est facturée au taux applicable dans le pays de résidence de l'acheteur. Cela suit les règles de commerce électronique TVA de l'UE (directive du Conseil 2017/2455 et 2019/1995). Les vendeurs n'ont pas besoin de s'enregistrer séparément à la TVA pour les ventes sur la place de marché dans l'UE.</p>",
        "<p><strong>5.3 TVA du Royaume-Uni.</strong> Pour les acheteurs au Royaume-Uni, la TVA britannique à 20 % s'applique aux services numériques et aux biens concernés. Cela suit la réglementation britannique sur le commerce électronique TVA post-Brexit.</p>",
        "<p><strong>5.4 Taxe de vente aux États-Unis.</strong> Nous percevons la taxe de vente dans les États américains où nous avons un lien économique ou où s'appliquent les lois sur les intermédiaires de place de marché. Les acheteurs dans les États sans taxe de vente ne seront pas facturés.</p>",
        "<p><strong>5.5 Taxe sur les services numériques.</strong> Dans les juridictions disposant d'une taxe sur les services numériques (TNS), les taxes applicables sont incluses dans le calcul des frais de plateforme et reversées selon les exigences.</p>",
        "<p><strong>5.6 Registres fiscaux.</strong> Nous fournissons des rapports fiscaux au niveau des transactions aux vendeurs. Les acheteurs reçoivent des factures fiscales lorsque requis. Nous conservons les registres fiscaux pendant {{taxRecordRetentionYears}} ans conformément aux lois fiscales applicables.</p>",
        "<p><strong>5.7 Droits d'exportation.</strong> Pour les expéditions internationales, les acheteurs sont responsables des droits d'importation, frais de douane ou tarifs imposés dans leur pays. Ceux-ci ne sont pas inclus dans le prix d'achat sauf indication expresse.</p>",
      ],
    },
    {
      id: "terms-6",
      title: "6. Forum social et contenu utilisateur",
      paragraphs: [
        "<p><strong>6.1 Propriété du contenu.</strong> Vous conservez la propriété du contenu que vous publiez sur le forum, votre profil et vos commentaires. En publiant, vous nous accordez une licence mondiale, non exclusive et libre de redevances pour utiliser, reproduire, modifier, adapter, publier et afficher ce contenu aux fins d'exploitation et de promotion des Services.</p>",
        "<p><strong>6.2 Normes de contenu.</strong> Vous ne pouvez pas publier de contenu qui : (a) est illégal, nuisible, menaçant, abusif, harcelant, diffamatoire ou portant atteinte à la vie privée ; (b) porte atteinte aux droits de propriété intellectuelle ; (c) contient des logiciels malveillants ou du code nuisible ; (d) promeut des activités illégales ; (e) contient du contenu sexuel explicite (notre plateforme s'adresse au grand public avec du contenu lié à l'anime) ; (f) constitue du spam ou de la publicité non autorisée.</p>",
        "<p><strong>6.3 Modération du contenu.</strong> Nous nous réservons le droit de supprimer le contenu violant les présentes Conditions. Nous employons des systèmes automatisés et des modérateurs humains. Nos décisions de modération sont définitives. En vertu du Digital Services Act (DSA) de l'UE, vous avez le droit de contester les décisions de modération.</p>",
        "<p><strong>6.4 Contenu soumis à limite d'âge.</strong> Certaines sections du forum exigent une vérification de l'âge. Vous ne devez pas tenter de contourner les systèmes de vérification de l'âge. Fournir de fausses informations sur l'âge constitue un motif de résiliation immédiate du compte.</p>",
      ],
    },
    {
      id: "terms-7",
      title: "7. Propriété intellectuelle",
      paragraphs: [
        "<p><strong>7.1 Notre PI.</strong> Les Services, y compris tous les logiciels, designs, logos, marques et contenus que nous fournissons, sont la propriété de Ramen Anime ou de nos concédants de licence et sont protégés par les lois sur le droit d'auteur, les marques et autres droits de propriété intellectuelle. Vous ne pouvez pas utiliser nos marques sans consentement écrit préalable.</p>",
        "<p><strong>7.2 DMCA / notification et retrait.</strong> Nous respectons le Digital Millennium Copyright Act (DMCA) et les procédures équivalentes de notification et retrait dans d'autres juridictions. Si vous pensez qu'un contenu porte atteinte à vos droits d'auteur, soumettez une notification de retrait au contact de la Section 16 avec : (a) vos coordonnées ; (b) l'identification de l'œuvre protégée ; (c) l'identification du matériel contrefaisant ; (d) une déclaration de conviction de bonne foi ; (e) une déclaration sous peine de parjure ; (f) votre signature électronique.</p>",
        "<p><strong>7.3 Contre-notification.</strong> Si votre contenu a été retiré suite à une notification DMCA, vous pouvez soumettre une contre-notification. Nous la transmettrons au plaignant initial et rétablirons le contenu après 10 jours ouvrables sauf si une action en justice est engagée.</p>",
      ],
    },
    {
      id: "terms-8",
      title: "8. Traitement des paiements",
      paragraphs: [
        "Les paiements sont traités par des processeurs de paiement tiers (Stripe, PayPal). En effectuant un achat, vous acceptez leurs conditions. Nous ne stockons pas les numéros complets de cartes de paiement. La conformité PCI DSS est maintenue par nos processeurs de paiement.",
        "Les remboursements sont traités conformément à notre Politique de remboursement : (a) biens numériques : pas de remboursement après téléchargement ; (b) biens physiques : délai de retour de 14 jours en vertu de la directive européenne sur les droits des consommateurs ; (c) articles de la place de marché : soumis à la politique de retour du vendeur avec médiation de la plateforme disponible.",
      ],
    },
    {
      id: "terms-9",
      title: "9. Conduite interdite",
      paragraphs: [
        "Vous ne pouvez pas : (a) utiliser les Services à des fins illégales ; (b) tenter d'obtenir un accès non autorisé à une partie des Services ; (c) interférer avec ou perturber les Services ; (d) utiliser des systèmes automatisés (bots, scrapers) sans autorisation ; (e) collecter des données d'utilisateurs ; (f) usurper l'identité d'une personne ou entité ; (g) contourner la géolocalisation ou la vérification de l'âge ; (h) vous livrer au blanchiment d'argent ou au financement du terrorisme ; (i) violer les lois sur le contrôle des exportations ; (j) revendre ou exploiter commercialement les Services sans autorisation.",
      ],
    },
    {
      id: "terms-10",
      title: "10. Limitation de responsabilité",
      paragraphs: [
        '<p><strong>10.1 Clause de non-responsabilité.</strong> LES SERVICES SONT FOURNIS « EN L\'ÉTAT » ET « SELON DISPONIBILITÉ » SANS GARANTIE D\'AUCUNE SORTE, EXPRESSE OU IMPLICITE, Y COMPRIS, SANS S\'Y LIMITER, LES GARANTIES DE QUALITÉ MARCHANDE, D\'ADÉQUATION À UN USAGE PARTICULIER ET DE NON-CONTREFAÇON.</p>',
        "<p><strong>10.2 Plafond de responsabilité.</strong> Dans la mesure maximale permise par la loi, notre responsabilité totale ne dépassera pas le montant que vous nous avez payé au cours des 12 mois précédant la réclamation, ou 100 USD, selon le montant le plus élevé. Cette limitation ne s'applique pas à : (a) la négligence grave ou la faute intentionnelle ; (b) le décès ou les blessures corporelles ; (c) la fraude ; (d) lorsque les lois de protection des consommateurs l'interdisent.</p>",
        "<p><strong>10.3 Exception pour les consommateurs de l'UE.</strong> Si vous êtes consommateur dans l'UE, les droits légaux des consommateurs en vertu du droit de l'UE ne sont pas affectés par ces limitations, y compris les droits en vertu de la directive sur la vente et les garanties aux consommateurs.</p>",
        "<p><strong>10.4 Force majeure.</strong> Nous ne sommes pas responsables des défaillances causées par des circonstances indépendantes de notre volonté raisonnable, notamment catastrophes naturelles, guerres, terrorisme, émeutes, embargos, actes des autorités civiles ou militaires, incendies, inondations, accidents, grèves ou pénuries de transport, installations, carburant, énergie, main-d'œuvre ou matériaux.</p>",
      ],
    },
    {
      id: "terms-11",
      title: "11. Règlement des litiges et droit applicable",
      paragraphs: [
        "<p><strong>11.1 Droit applicable.</strong> Les présentes Conditions sont régies par les lois de l'État de Californie, États-Unis, sans égard aux principes de conflit de lois, sauf lorsque les lois impératives de protection des consommateurs de votre pays de résidence prévalent.</p>",
        "<p><strong>11.2 Utilisateurs de l'UE.</strong> Si vous êtes consommateur dans l'UE, vous bénéficiez en outre des lois impératives de protection des consommateurs de votre État membre de l'UE. Tout litige peut être porté devant les tribunaux de votre lieu de résidence.</p>",
        "<p><strong>11.3 Arbitrage (utilisateurs aux États-Unis).</strong> Pour les utilisateurs aux États-Unis, tout litige sera d'abord tenté d'être résolu par négociation de bonne foi. En l'absence de résolution dans les 30 jours, l'une ou l'autre partie peut engager un arbitrage contraignant selon les Règles d'arbitrage commercial de l'American Arbitration Association (AAA). L'arbitrage se tiendra à Los Angeles, Californie.</p>",
        "<p><strong>11.4 Renonciation aux actions collectives.</strong> DANS LA MESURE PERMISE PAR LA LOI, VOUS ACCEPTEZ QUE TOUTE PROCÉDURE SOIT CONDUITE UNIQUEMENT À TITRE INDIVIDUEL ET NON DANS LE CADRE D'UNE ACTION COLLECTIVE, CONSOLIDÉE OU REPRÉSENTATIVE. Cette renonciation ne s'applique pas aux réclamations fondées sur des lois de protection des consommateurs interdisant les renonciations aux actions collectives.</p>",
        "<p><strong>11.5 Plateforme RLL.</strong> Les consommateurs de l'UE peuvent utiliser la plateforme de règlement en ligne des litiges de la Commission européenne : https://ec.europa.eu/odr</p>",
      ],
    },
    {
      id: "terms-12",
      title: "12. Contrôles à l'exportation et sanctions",
      paragraphs: [
        "Vous ne pouvez pas utiliser les Services pour exporter, réexporter ou transférer des articles en violation des lois applicables sur le contrôle des exportations, notamment les Export Administration Regulations (EAR) des États-Unis, le règlement européen sur les biens à double usage 2021/821 ou les sanctions du Conseil de sécurité de l'ONU. Les articles interdits comprennent les biens militaires, les articles à double usage et les articles destinés à des pays ou entités sanctionnés.",
      ],
    },
    {
      id: "terms-13",
      title: "13. Confidentialité des enfants (conformité COPPA)",
      paragraphs: [
        "Nous respectons la Children's Online Privacy Protection Act (COPPA) et les lois équivalentes dans le monde. Nous ne collectons pas sciemment d'informations personnelles auprès d'enfants de moins de 13 ans sans consentement parental vérifiable. Si nous apprenons avoir collecté des informations personnelles auprès d'un enfant de moins de 13 ans sans consentement parental, nous supprimerons ces informations immédiatement.",
        "Les parents ou tuteurs qui pensent que leur enfant nous a fourni des informations personnelles peuvent nous contacter pour demander leur suppression.",
      ],
    },
    {
      id: "terms-14",
      title: "14. Résiliation",
      paragraphs: [
        "Vous pouvez résilier votre compte à tout moment via les paramètres du compte ou en nous contactant. Nous pouvons résilier ou suspendre votre compte immédiatement en cas de violation des présentes Conditions. À la résiliation, votre droit d'utiliser les Services cesse immédiatement. Les dispositions qui, de par leur nature, doivent survivre à la résiliation survivront.",
        "En vertu de l'article 17 du RGPD, vous avez le droit de demander l'effacement de vos données personnelles. Nous nous conformerons dans un délai de 30 jours sauf si des obligations légales exigent leur conservation.",
      ],
    },
    {
      id: "terms-15",
      title: "15. Géolocalisation et disponibilité du service",
      paragraphs: [
        "Nous utilisons la technologie de géolocalisation pour déterminer votre pays d'accès. Les Services ne sont disponibles que dans les pays que nous avons configurés pour l'accès. Cela est nécessaire pour la conformité légale, notamment les contrôles à l'exportation, les exigences de vérification de l'âge et les obligations fiscales.",
        "Nous pouvons restreindre l'accès depuis certains pays ou régions en raison d'exigences légales, de sanctions ou d'autres considérations de conformité. Tenter de contourner les restrictions de géolocalisation constitue une violation des présentes Conditions.",
      ],
    },
    {
      id: "terms-16",
      title: "16. Coordonnées",
      paragraphs: [
        "Pour les avis juridiques, demandes de confidentialité, retraits DMCA ou demandes générales :",
        "<p><strong>Service juridique de Ramen Anime</strong><br />E-mail : legal@ramenanime.app<br />Adresse : Ramen Anime, 123 Anime Street, Los Angeles, CA 90001, USA</p>",
        "<p><strong>Délégué à la protection des données (UE/Royaume-Uni) :</strong><br />E-mail : dpo@ramenanime.app</p>",
        "<p><strong>Autorité de contrôle (UE) :</strong><br />Vous avez le droit de déposer une plainte auprès de votre autorité locale de protection des données.</p>",
      ],
    },
  ],
};

export const legalFr = {
  legalPrivacy: privacy,
  legalTerms: terms,
};
