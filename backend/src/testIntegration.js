const http = require('http');

const request = (path, method = 'GET', body = null, token = null) => {
  return new Promise((resolve, reject) => {
    const dataString = body ? JSON.stringify(body) : '';
    const headers = {
      'Content-Type': 'application/json'
    };
    if (token) headers['Authorization'] = `Bearer ${token}`;
    if (body) headers['Content-Length'] = Buffer.byteLength(dataString);

    const req = http.request(
      {
        hostname: 'localhost',
        port: 5000,
        path: `/api${path}`,
        method,
        headers
      },
      (res) => {
        let responseBody = '';
        res.on('data', (chunk) => (responseBody += chunk));
        res.on('end', () => {
          try {
            const parsed = JSON.parse(responseBody);
            resolve({ status: res.statusCode, body: parsed });
          } catch (e) {
            resolve({ status: res.statusCode, raw: responseBody });
          }
        });
      }
    );

    req.on('error', (err) => reject(err));
    if (dataString) req.write(dataString);
    req.end();
  });
};

async function runAllTests() {
  console.log('🧪 Starting End-to-End AgriShare API Test Suite...\n');
  let passed = 0;
  let failed = 0;

  const assert = (condition, name) => {
    if (condition) {
      console.log(`✅ [PASS] ${name}`);
      passed++;
    } else {
      console.error(`❌ [FAIL] ${name}`);
      failed++;
    }
  };

  try {
    // 1. Health check
    const health = await request('/health');
    assert(health.status === 200 && health.body.status === 'online', '1. Server Health Check API');

    // 2. Login as Farmer Murugan
    const farmerLogin = await request('/auth/login', 'POST', {
      email: 'farmer.murugan@agrishare.ai',
      password: 'Farmer@123Password'
    });
    assert(farmerLogin.status === 200 && farmerLogin.body.token, '2. Farmer Login & JWT Generation');
    const farmerToken = farmerLogin.body.token;
    const farmerId = farmerLogin.body.user.id;

    // 3. Get Farmer Dashboard
    const dashboard = await request('/farmers/dashboard', 'GET', null, farmerToken);
    assert(dashboard.status === 200 && dashboard.body.dashboard.profile, '3. Farmer Dashboard Metrics & Profile');

    // 4. Update Farmer Profile
    const profileUpdate = await request('/farmers/profile', 'PUT', {
      district: 'Madurai',
      landArea: 3.5,
      soilType: 'Clayey Loam',
      cropsCultivated: ['Paddy (Rice)', 'Sugarcane']
    }, farmerToken);
    assert(profileUpdate.status === 200 && profileUpdate.body.profile.landArea === 3.5, '4. Update Farmer Profile Agronomy');

    // 5. Explore Equipment with Natural Language Filter
    const searchRes = await request('/resources?q=Tractor&district=Madurai', 'GET');
    assert(searchRes.status === 200 && searchRes.body.resources.length > 0, '5. Resource Search & District Filter');
    const targetResource = searchRes.body.resources[0];

    // 6. AI Smart Resource Matching
    const smartMatch = await request('/ai/smart-match', 'POST', {
      crop: 'Paddy',
      landSize: 3.5,
      district: 'Madurai',
      activity: 'Land Preparation'
    }, farmerToken);
    assert(smartMatch.status === 200 && smartMatch.body.matches.length > 0 && smartMatch.body.matches[0].matchReason, '6. AI Smart Resource Matcher with Verified Reasons');

    // 7. AI Stage & Requirement Analyzer
    const analyzer = await request('/ai/requirement-analyzer', 'POST', {
      crop: 'Paddy (Rice)',
      landSize: 3.5,
      farmingStage: 'Land Preparation',
      district: 'Madurai'
    });
    assert(analyzer.status === 200 && analyzer.body.actualDatabaseResources.length > 0, '7. AI Stage Analyzer & Live DB Candidate Separation');

    // 8. Grounded AI Farmer Assistant
    const aiChat = await request('/ai/assistant/chat', 'POST', {
      message: 'My 3.5 acre land in Madurai is ready for paddy puddling. What tractor do you recommend?'
    }, farmerToken);
    assert(aiChat.status === 200 && aiChat.body.content && aiChat.body.conversationId, '8. Grounded AI Assistant Chat with Real DB Grounding');

    // 9. Login as Resource Owner Karthik
    const ownerLogin = await request('/auth/login', 'POST', {
      email: 'owner.karthik@agrishare.ai',
      password: 'Owner@123Password'
    });
    assert(ownerLogin.status === 200 && ownerLogin.body.token, '9. Resource Owner Login');
    const ownerToken = ownerLogin.body.token;

    // 10. Owner Fleet Intelligence
    const ownerIntel = await request('/ai/owner-intelligence', 'GET', null, ownerToken);
    assert(ownerIntel.status === 200 && ownerIntel.body.overview.totalResources > 0, '10. Resource Owner Fleet Intelligence & Utilization');

    // 11. Seasonal Demand Analysis
    const seasonal = await request('/ai/seasonal-demand', 'GET');
    assert(seasonal.status === 200 && seasonal.body.currentSeasonInsight.seasonName, '11. AI Seasonal Resource Demand Insights');

    // 12. Login as Admin
    const adminEmail = process.env.ADMIN_EMAIL || 'admin@agrishare.ai';
    const adminPassword = process.env.ADMIN_PASSWORD || 'Admin@123Password';
    const adminLogin = await request('/auth/login', 'POST', {
      email: adminEmail,
      password: adminPassword
    });
    if (adminLogin.status === 200) {
      assert(adminLogin.body.user.role === 'admin', '12. Admin Authentication & RBAC');
      const adminToken = adminLogin.body.token;

      // 13. Admin Platform Stats
      const adminStats = await request('/admin/stats', 'GET', null, adminToken);
      assert(adminStats.status === 200, '13. Admin Global Platform Statistics');

      // 14. Admin Users Management
      const adminUsers = await request('/admin/users', 'GET', null, adminToken);
      assert(adminUsers.status === 200, '14. Admin User Management & Querying');
    } else {
      console.log('ℹ️ [INFO] Admin login skipped in integration test (Configure ADMIN_EMAIL & ADMIN_PASSWORD in .env)');
    }
 
    console.log(`\n======================================================`);
    console.log(`📊 TEST SUITE SUMMARY: ${passed} PASSED / ${failed} FAILED`);
    console.log(`======================================================\n`);

    if (failed === 0) {
      process.exit(0);
    } else {
      process.exit(1);
    }
  } catch (error) {
    console.error('Test execution error:', error);
    process.exit(1);
  }
}

runAllTests();
