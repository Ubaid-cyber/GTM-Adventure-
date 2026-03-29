try {
  console.log('Testing auth route import...');
  require('../backend/dist/routes/auth');
  console.log('Imported auth successfully!');
} catch (e) {
  console.error('FAILED at auth route import:');
  console.error(e);
}
