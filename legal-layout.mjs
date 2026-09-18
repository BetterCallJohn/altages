import {readFile} from 'node:fs/promises';
export const legalPages = {'mentions-legales':'Mentions légales','confidentialite':'Politique de confidentialité','cookies':'Politique relative aux cookies'};
export async function renderLegalPage(slug) {
  if (!Object.hasOwn(legalPages, slug)) throw new Error('Page inconnue');
  const [home, content] = await Promise.all([readFile(new URL('./index.html', import.meta.url), 'utf8'), readFile(new URL(`./pages/${slug}.html`, import.meta.url), 'utf8')]);
  const head = home.match(/<head>[\s\S]*?<\/head>/)[0].replace(/<title>.*?<\/title>/, `<title>${legalPages[slug]} — Altages</title>`).replace(/<meta name="description"[^>]*>/, `<meta name="description" content="${legalPages[slug]} du site Altages : informations sur l’éditeur, vos données et vos choix.">`);
  const header = home.match(/<header[\s\S]*?<\/header>/)[0];
  const footer = home.match(/<footer[\s\S]*?<\/footer>/)[0];
  const filters = home.match(/<svg id="brand-filters"[\s\S]*?<\/svg>/)[0];
  return `<!doctype html><html lang="fr">${head}<body class="legal-page">${filters}<a class="skip" href="#contenu">Aller au contenu</a>${header.replaceAll('href="#', 'href="/#')}<main id="contenu" class="legal-content wrap"><a class="legal-back" href="/">← Retour à l’accueil</a><p class="eyebrow">Informations & transparence</p><h1>${legalPages[slug]}</h1><p class="legal-updated">Mise à jour : 17 septembre 2026</p>${content}</main>${footer.replaceAll('href="#', 'href="/#')}</body></html>`
    .replaceAll('href="styles.css"','href="/styles.css"').replaceAll('src="app.js"','src="/app.js"').replaceAll('src="assets/','src="/assets/').replaceAll('href="plaquette-altages.pdf"','href="/plaquette-altages.pdf"');
}
