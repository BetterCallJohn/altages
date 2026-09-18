import {cp, mkdir, copyFile, writeFile} from 'node:fs/promises';
import {legalPages, renderLegalPage} from './legal-layout.mjs';
const analyticsId = (process.env.GA_MEASUREMENT_ID || '').trim();
if (analyticsId && !/^G-[A-Z0-9]+$/.test(analyticsId)) throw new Error('GA_MEASUREMENT_ID doit être un identifiant GA4 de type G-XXXXXXXXXX.');
await mkdir('dist', {recursive:true});
await cp('public', 'dist', {recursive:true});
for (const file of ['index.html','styles.css','app.js','cookies.js']) await copyFile(file, `dist/${file}`);
await writeFile('dist/analytics-config.js', `window.ALTAGES_ANALYTICS_ID = ${JSON.stringify(analyticsId)};\n`);
for (const slug of Object.keys(legalPages)) {
  await mkdir(`dist/${slug}`, {recursive: true});
  await writeFile(`dist/${slug}/index.html`, await renderLegalPage(slug));
}
console.log('Altages: site prêt dans dist/');
