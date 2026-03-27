import { readFileSync, writeFileSync } from 'fs';

const env = readFileSync('.env', 'utf8');
const line = env.split('\n').find(l => l.startsWith('DATABASE_URL='));
const url = line.split('=')[1].replace(/"/g, '');
const p = url.split('?api_key=')[1];
const padded = p + '='.repeat((4 - (p.length % 4)) % 4);
const d = Buffer.from(padded, 'base64url').toString('utf8');
const dbUrl = JSON.parse(d).databaseUrl;
const updated = env.replace(/DIRECT_DATABASE_URL=".*?"/, `DIRECT_DATABASE_URL="${dbUrl}"`);
writeFileSync('.env', updated);
console.log('Updated DIRECT_DATABASE_URL to:', dbUrl);
