async function testPhoneValidation() {
  console.log('🧪 Testing 10-digit Phone Validation...\n');

  try {
    // 1. Invalid phone number (less than 10 digits)
    console.log('1️⃣ Testing invalid short phone number ("12345")...');
    const invalidRes = await fetch('http://localhost:5000/api/users/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: 'Short Phone User', phone: '12345' })
    });
    const invalidData = await invalidRes.json();
    console.log('   Response:', invalidData);
    if (invalidRes.ok || invalidData.success) {
      throw new Error('Short phone number was incorrectly accepted');
    }
    console.log('   ✅ Short phone number rejected correctly.');

    // 2. Valid 10-digit phone number
    console.log('\n2️⃣ Testing valid 10-digit phone number ("9876543210")...');
    const validRes = await fetch('http://localhost:5000/api/users/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: 'Valid Phone User', phone: '9876543210' })
    });
    const validData = await validRes.json();
    console.log('   Response:', validData);
    if (!validRes.ok || !validData.success || validData.user.phone !== '9876543210') {
      throw new Error('Valid 10-digit phone number registration failed');
    }
    console.log('   ✅ Valid 10-digit phone number accepted correctly.');

    console.log('\n🎉 PHONE NUMBER VALIDATION TEST PASSED!');
  } catch (err) {
    console.error('\n❌ Phone Validation Test Failed:', err.message);
    process.exit(1);
  }
}

testPhoneValidation();
