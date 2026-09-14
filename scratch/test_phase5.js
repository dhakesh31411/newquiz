async function testPhase5() {
  console.log('🧪 Starting Phase 5 End-to-End Test Suite...\n');

  try {
    // 1. Check GET /api/settings
    console.log('1️⃣ Testing GET /api/settings...');
    const settingsRes = await fetch('http://localhost:5000/api/settings');
    const settingsData = await settingsRes.json();
    console.log('   Settings Result:', settingsData);
    if (!settingsData.success) throw new Error('GET /api/settings failed');

    // 2. Admin Login
    console.log('\n2️⃣ Logging in as Admin...');
    const loginRes = await fetch('http://localhost:5000/api/admin/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username: 'admin', password: 'sri ganesh' })
    });
    const loginData = await loginRes.json();
    if (!loginData.success) throw new Error('Admin login failed');
    const token = loginData.token;
    console.log('   Admin login successful, token received.');

    // 3. Update Website Name via POST /api/admin/settings
    console.log('\n3️⃣ Updating Website Name to "Cine Challenge"...');
    const updateNameRes = await fetch('http://localhost:5000/api/admin/settings', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({ website_name: 'Cine Challenge' })
    });
    const updateNameData = await updateNameRes.json();
    console.log('   Update Website Name Result:', updateNameData);
    if (!updateNameData.success || updateNameData.websiteName !== 'Cine Challenge') {
      throw new Error('POST /api/admin/settings failed to update website name');
    }

    // 4. Create Multi-Image Question
    console.log('\n4️⃣ Creating Multi-Image Question...');
    const createQRes = await fetch('http://localhost:5000/api/admin/questions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({
        quiz_id: 1,
        category: 'Movies',
        type: 'image',
        question_text: 'Identify the movie from these 2 scene frames!',
        images: JSON.stringify(['/movie1.jpg', '/movie2.jpg']),
        image: '/movie1.jpg',
        option_a: 'Inception',
        option_b: 'Interstellar',
        option_c: 'The Dark Knight',
        option_d: 'Tenet',
        correct_option: 'A',
        explanation: 'Inception scene sequence',
        difficulty: 'Medium'
      })
    });
    const createQData = await createQRes.json();
    console.log('   Create Question Result:', createQData);
    if (!createQData.success) throw new Error('Failed to create multi-image question');

    // 5. Verify Multi-Image Question parsing in Admin Questions API
    console.log('\n5️⃣ Fetching Admin Question Bank & Verifying Multi-Image parsing...');
    const questionsRes = await fetch('http://localhost:5000/api/admin/questions', {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    const questionsData = await questionsRes.json();
    const multiImgQ = questionsData.questions.find(q => Array.isArray(q.images) && q.images.length > 1);
    console.log('   Multi-image question verified in Admin Question Bank:', multiImgQ ? { id: multiImgQ.id, images: multiImgQ.images } : 'Not found');
    if (!multiImgQ) throw new Error('Multi-image question images array was not parsed properly');

    // 6. Create Scheduled Quiz
    console.log('\n6️⃣ Creating Scheduled Live Quiz...');
    const createQuizRes = await fetch('http://localhost:5000/api/admin/quizzes', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({
        title: 'Upcoming Grand Movie Quiz',
        category: 'Movies',
        description: 'Exclusive scheduled live quiz challenge',
        image: '/movie2.jpg',
        time_limit_seconds: 600,
        total_questions: 10,
        difficulty: 'Hard',
        max_attempts: 1,
        is_active: 1,
        is_quiz_of_day: 0,
        is_scheduled: 1,
        schedule_start_time: '2026-12-01 18:00:00',
        schedule_end_time: '2026-12-01 20:00:00'
      })
    });
    const createQuizData = await createQuizRes.json();
    console.log('   Create Scheduled Quiz Result:', createQuizData);
    if (!createQuizData.success) throw new Error('Failed to create scheduled quiz');

    // 7. Verify scheduled quiz in public API
    console.log('\n7️⃣ Verifying Scheduled Quiz in GET /api/quizzes...');
    const quizzesRes = await fetch('http://localhost:5000/api/quizzes');
    const quizzesData = await quizzesRes.json();
    const scheduledQ = quizzesData.quizzes.find(q => q.title === 'Upcoming Grand Movie Quiz');
    console.log('   Scheduled Quiz in Public List:', scheduledQ ? { title: scheduledQ.title, is_scheduled: scheduledQ.is_scheduled, start: scheduledQ.schedule_start_time } : 'Not found');
    if (!scheduledQ || scheduledQ.is_scheduled !== 1) throw new Error('Scheduled quiz not found or is_scheduled flag missing');

    console.log('\n✅ ALL PHASE 5 END-TO-END TESTS PASSED SUCCESSFULLY! 🎉');

  } catch (err) {
    console.error('\n❌ Phase 5 Test Suite Failed:', err.message);
    process.exit(1);
  }
}

testPhase5();
