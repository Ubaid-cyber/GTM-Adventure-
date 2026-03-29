try {
  console.log('Testing Express...');
  require('express');
  console.log('Testing Cors...');
  require('cors');
  console.log('Testing Dotenv...');
  require('dotenv/config');
  console.log('Testing Zod...');
  require('zod');
  console.log('Testing BcryptJS...');
  require('bcryptjs');
  console.log('Testing IoRedis...');
  require('ioredis');
  console.log('Testing PG...');
  require('pg');
  console.log('Testing @prisma/client...');
  const { PrismaClient } = require('@prisma/client');
  const p = new PrismaClient();
  console.log('Testing Gemini...');
  require('@google/generative-ai');
  console.log('All core modules imported successfully!');
} catch (e) {
  console.error('FAILED at a module import:');
  console.error(e);
  process.exit(1);
}
