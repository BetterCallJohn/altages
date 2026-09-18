# Altages

Site vitrine en français, réalisé à partir de `plaquette.pdf`. Structure inspirée de https://getelya.com/ : accueil immersif, approche, expertises, engagements, publics accompagnés, FAQ et contact.

## Utilisation

- `npm run dev` : aperçu sur http://localhost:4173
- `npm run build` : génère le site statique dans `dist/`

Aucune dépendance à installer. Le site utilise HTML, CSS et JavaScript natif.

## Contenu et visuels

- Activités, publics, expérience, zone d’intervention et coordonnées : plaquette fournie.
- Logo : repris de la plaquette, PNG transparent bleu et or fourni. Le filtre SVG de présentation conserve le ruban doré et affiche les parties bleues en blanc sur les fonds sombres, sans modifier le fichier source.
- Visuel d’accueil et photographies des expertises/engagements : illustrations générées, ne représentant ni les équipes ni des réalisations attribuées à Altages.
- Typographies : DM Sans et Manrope hébergées localement dans `public/assets/fonts`, avec leurs licences OFL. Aucune requête Google Fonts à la visite.
- Les boutons de contact ouvrent la messagerie ou le téléphone du visiteur. Aucun formulaire de contact. Google Analytics est prévu, désactivé tant qu’aucun identifiant n’est configuré, puis soumis au consentement.

## Netlify

`netlify.toml` configure `npm run build`, le dossier publié `dist` et Node.js 22. La connexion au dépôt et la branche de production `main` sont configurées dans Netlify. Les pages légales sont générées comme de vraies pages statiques : `/mentions-legales/`, `/confidentialite/`, `/cookies/`.

## Google Analytics, après création de la propriété

1. Configurer la propriété GA4 : conservation des données individuelles à **2 mois**, désactiver le renouvellement à chaque activité, Google Signals, les fonctionnalités publicitaires et la mesure améliorée (éviter notamment l’envoi automatique des paramètres de recherche et liens contenant des données personnelles).
2. Vérifier les conditions de traitement et de transfert avec Google, et faire valider la politique de confidentialité et les durées de conservation par Altages.
3. Dans Netlify, ajouter la variable de build `GA_MEASUREMENT_ID` avec l’identifiant réel `G-…`, puis redéployer. Aucun secret n’est nécessaire ; cet identifiant devient public dans le navigateur. Ne pas ajouter une seconde balise Analytics dans Netlify, un autre gestionnaire ou le HTML.
4. Vérifier dans le navigateur : aucune requête Google avant accord ou après refus ; chargement après acceptation ; retrait via « Gérer mes cookies » et suppression des cookies GA. Les deux boutons ont le même style. Le choix dure 180 jours.

`analytics-config.js` est désactivé pour l’aperçu local. Le build génère la configuration réelle dans `dist/analytics-config.js`. `node --test tests/consent.test.mjs` vérifie les transitions de consentement sans appeler Google.

## Informations légales à confirmer

L’API officielle de l’Annuaire des entreprises, consultée le 17 septembre 2026, confirme Marion Nizri, entrepreneur individuel, nom commercial Altages, SIRET 51493096500025 et l’adresse fournie. La direction de publication est attribuée à Marion Nizri et reste à confirmer par l’éditrice.

Avant publication définitive, confirmer les éventuelles mentions d’immatriculation au RCS, le régime/numéro de TVA, et les durées effectivement appliquées aux e-mails et journaux d’hébergement. Le téléphone de l’hébergeur, demandé dans les mentions obligatoires, reste à obtenir auprès de Netlify : ses pages officielles consultées donnent une adresse et un e-mail, sans numéro vérifiable. Si Altages contracte avec des consommateurs, compléter les informations de médiation et les conditions applicables. Aucune référence de registre, TVA, médiateur ou autorisation professionnelle n’a été inventée. Les textes constituent une base à valider par l’éditrice ou un professionnel du droit, pas une certification de conformité.

Sources : [Service Public](https://entreprendre.service-public.gouv.fr/vosdroits/F31228), [CNIL](https://www.cnil.fr/fr/cookies-et-autres-traceurs/que-dit-la-loi), [Google : consentement](https://developers.google.com/tag-platform/security/guides/consent), [Google : conservation](https://support.google.com/analytics/answer/7667196?hl=fr), [Netlify : coordonnées](https://www.netlify.com/legal/terms-of-use/).
