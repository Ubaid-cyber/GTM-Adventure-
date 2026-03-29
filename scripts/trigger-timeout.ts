import 'dotenv/config';

async function triggerCron() {
  console.log('\n⏳ Initiating manual Cron trigger for /api/cron/release-spots...\n');

  const secret = process.env.CRON_SECRET;
  if (!secret) {
    console.error('❌ CRON_SECRET not found in .env');
    process.exit(1);
  }

  try {
    const res = await fetch('http://localhost:3000/api/cron/release-spots', {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${secret}`
      }
    });

    const data = await res.json();
    
    if (res.ok) {
      console.log('✅ Cron executed successfully.');
      console.log('Response:', data);
    } else {
      console.error('❌ Cron failed with status:', res.status);
      console.error('Message:', data);
    }
  } catch (err: any) {
    console.error('❌ Failed to reach frontend server. Is it running on port 3000?');
    console.error(err.message);
  }
}

triggerCron();
