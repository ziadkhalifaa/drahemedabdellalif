async function testUrl(url) {
  console.log('\n--- Fetching:', url);
  try {
    const res = await fetch(url);
    console.log('Status:', res.status);
    console.log('Headers:');
    for (const [key, val] of res.headers.entries()) {
      if (key.includes('ratelimit') || key.includes('retry') || key === 'content-type') {
        console.log(`  ${key}: ${val}`);
      }
    }
    const text = await res.text();
    console.log('Response body snippet:', text.slice(0, 200));
  } catch (err) {
    console.error('Fetch error:', err);
  }
}

async function main() {
  // Test both endpoints
  await testUrl('https://api.drahmedabdellatif.com/api/clinics');
  await testUrl('https://api.drahmedabdellatif.com/api/clinics/clinic-october/available-slots?date=2026-05-30');
}
main();
