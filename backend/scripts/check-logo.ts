// backend/scripts/check-logo.js
const fs = require('fs');
const path = require('path');

const candidates = [
  path.resolve(process.cwd(), 'src/assets/brand/logo-odc.png'),
  path.resolve(process.cwd(), 'assets/brand/logo-odc.png'),
  path.resolve(process.cwd(), 'public/images/brand/logo-odc.png'),
  path.resolve(process.cwd(), '../frontend/public/images/brand/logo-odc.png'),
  'E:\\Dossier\\odc-platform\\frontend\\public\\images\\brand\\logo-odc.png',
];

console.log('\n📂 CWD :', process.cwd(), '\n');
let found = 0;

for (const p of candidates) {
  const exists = fs.existsSync(p);
  console.log(exists ? '✅' : '❌', p);
  if (exists) {
    found++;
    const stat = fs.statSync(p);
    const base64 = fs.readFileSync(p).toString('base64');
    console.log('   ↳ Taille :', stat.size, 'octets');
    console.log('   ↳ Data URL :', `data:image/png;base64,${base64}`.length, 'chars\n');
  }
}

console.log(found > 0 ? `\n✅ ${found} logo(s) trouvé(s)\n` : '\n❌ Aucun logo\n');