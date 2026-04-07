const bcrypt = require('bcryptjs');

const hash = '$2b$10$mSIGJAiT6/WM0FOvsE8B0O5.2fsnmwyPgTPuHvi41YZNU1SlPMIZ6';
const passwords = ['admin1', 'admin123', 'password123', 'user123', 'admin@123', 'gtm123'];

async function test() {
  for (const pw of passwords) {
    const match = await bcrypt.compare(pw, hash);
    console.log(`Password '${pw}': ${match ? 'MATCH' : 'FAIL'}`);
  }
}

test();
