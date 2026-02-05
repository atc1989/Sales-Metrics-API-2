const fs = require('fs');
const path = require('path');

const { SUPABASE_URL, SUPABASE_ANON_KEY } = process.env;

if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
  console.error('Missing SUPABASE_URL or SUPABASE_ANON_KEY environment variables.');
  process.exit(1);
}

const configContents = `window.__APP_CONFIG__ = {
  SUPABASE_URL: '${SUPABASE_URL}',
  SUPABASE_ANON_KEY: '${SUPABASE_ANON_KEY}'
};
`;

const outputPath = path.join(__dirname, '..', 'public', 'config.js');
fs.writeFileSync(outputPath, configContents, 'utf8');
console.log(`Wrote ${outputPath}`);
