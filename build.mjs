import {cp, mkdir, copyFile} from 'node:fs/promises';
await mkdir('dist', {recursive:true});
await cp('public', 'dist', {recursive:true});
for (const file of ['index.html','styles.css','app.js']) await copyFile(file, `dist/${file}`);
console.log('Altages: site prêt dans dist/');
