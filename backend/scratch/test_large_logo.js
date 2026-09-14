const fs = require('fs');

async function testLargeLogo() {
  // Generate a ~500KB base64 string to simulate uploaded photo
  const fakeLargeBase64 = 'data:image/png;base64,' + 'A'.repeat(500000);

  // Login as admin first
  const loginRes = await fetch('http://localhost:5000/api/admin/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username: 'admin', password: 'sri ganesh' })
  });
  const loginData = await loginRes.json();
  console.log('Admin login:', loginData.success);

  if (!loginData.success) return;

  // Post large logo to /api/admin/logo
  const logoRes = await fetch('http://localhost:5000/api/admin/logo', {
    method: 'POST',
    headers: { 
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${loginData.token}`
    },
    body: JSON.stringify({ logoUrl: fakeLargeBase64 })
  });

  console.log('Logo post status:', logoRes.status);
  const logoData = await logoRes.json();
  console.log('Logo post response:', logoData);
}

testLargeLogo().catch(console.error);
