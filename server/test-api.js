/**
 * AI Resume Analyzer - API Test Suite
 * Run: node test-api.js
 */
const http = require('http');
const https = require('https');
const fs = require('fs');
const path = require('path');

const BASE_URL = 'http://localhost:5000/api';
let TOKEN = '';
let RESUME_ID = null;

// Simple HTTP request helper
function request(method, path, body = null, headers = {}) {
  return new Promise((resolve, reject) => {
    const url = new URL(BASE_URL + path);
    const options = {
      hostname: url.hostname,
      port: url.port,
      path: url.pathname + url.search,
      method,
      headers: {
        'Content-Type': 'application/json',
        ...headers
      }
    };

    const req = http.request(options, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try {
          resolve({ status: res.statusCode, data: JSON.parse(data) });
        } catch {
          resolve({ status: res.statusCode, data });
        }
      });
    });

    req.on('error', reject);
    if (body) req.write(typeof body === 'string' ? body : JSON.stringify(body));
    req.end();
  });
}

// Multipart upload helper
function uploadFile(filePath, token) {
  return new Promise((resolve, reject) => {
    const boundary = '----TestBoundary' + Date.now();
    const fileName = path.basename(filePath);
    const fileContent = fs.readFileSync(filePath);

    const header = `--${boundary}\r\nContent-Disposition: form-data; name="resume"; filename="${fileName}"\r\nContent-Type: application/pdf\r\n\r\n`;
    const footer = `\r\n--${boundary}--\r\n`;
    const body = Buffer.concat([Buffer.from(header), fileContent, Buffer.from(footer)]);

    const options = {
      hostname: 'localhost',
      port: 5000,
      path: '/api/resumes/upload',
      method: 'POST',
      headers: {
        'Content-Type': `multipart/form-data; boundary=${boundary}`,
        'Content-Length': body.length,
        'Authorization': `Bearer ${token}`
      }
    };

    const req = http.request(options, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try {
          resolve({ status: res.statusCode, data: JSON.parse(data) });
        } catch {
          resolve({ status: res.statusCode, data });
        }
      });
    });

    req.on('error', reject);
    req.write(body);
    req.end();
  });
}

// Test runner
const results = [];
function log(test, passed, details = '') {
  const icon = passed ? '✅' : '❌';
  console.log(`  ${icon} ${test}${details ? ' — ' + details : ''}`);
  results.push({ test, passed, details });
}

async function runTests() {
  console.log('\n╔═════════════════════════════════════════════╗');
  console.log('║   AI Resume Analyzer — API Test Suite       ║');
  console.log('╚═════════════════════════════════════════════╝\n');

  // ============================
  // 1. Health Check
  // ============================
  console.log('📡 Health Check');
  try {
    const res = await request('GET', '/health');
    log('GET /api/health', res.status === 200 && res.data.status === 'ok', `Status: ${res.status}`);
  } catch (e) {
    log('GET /api/health', false, e.message);
  }

  // ============================
  // 2. Auth — Register
  // ============================
  console.log('\n🔐 Authentication');
  const testEmail = `tester_${Date.now()}@test.com`;
  try {
    const res = await request('POST', '/auth/register', {
      name: 'Test Runner',
      email: testEmail,
      password: 'testpass123'
    });
    const passed = res.status === 201 && res.data.success && res.data.data.token;
    if (passed) TOKEN = res.data.data.token;
    log('POST /api/auth/register', passed, `Status: ${res.status}`);
  } catch (e) {
    log('POST /api/auth/register', false, e.message);
  }

  // 3. Auth — Register duplicate
  try {
    const res = await request('POST', '/auth/register', {
      name: 'Test Runner',
      email: testEmail,
      password: 'testpass123'
    });
    log('POST /api/auth/register (duplicate)', res.status === 409, `Status: ${res.status}`);
  } catch (e) {
    log('POST /api/auth/register (duplicate)', false, e.message);
  }

  // 4. Auth — Register validation
  try {
    const res = await request('POST', '/auth/register', { name: '', email: '', password: '' });
    log('POST /api/auth/register (validation)', res.status === 400, `Status: ${res.status}`);
  } catch (e) {
    log('POST /api/auth/register (validation)', false, e.message);
  }

  // 5. Auth — Login
  try {
    const res = await request('POST', '/auth/login', {
      email: testEmail,
      password: 'testpass123'
    });
    const passed = res.status === 200 && res.data.success && res.data.data.token;
    if (passed) TOKEN = res.data.data.token;
    log('POST /api/auth/login', passed, `Status: ${res.status}`);
  } catch (e) {
    log('POST /api/auth/login', false, e.message);
  }

  // 6. Auth — Login wrong password
  try {
    const res = await request('POST', '/auth/login', {
      email: testEmail,
      password: 'wrongpass'
    });
    log('POST /api/auth/login (wrong password)', res.status === 401, `Status: ${res.status}`);
  } catch (e) {
    log('POST /api/auth/login (wrong password)', false, e.message);
  }

  // 7. Auth — Get Me
  try {
    const res = await request('GET', '/auth/me', null, { Authorization: `Bearer ${TOKEN}` });
    log('GET /api/auth/me', res.status === 200 && res.data.success, `Status: ${res.status}, User: ${res.data.data?.user?.name || 'N/A'}`);
  } catch (e) {
    log('GET /api/auth/me', false, e.message);
  }

  // 8. Auth — Get Me without token
  try {
    const res = await request('GET', '/auth/me');
    log('GET /api/auth/me (no token)', res.status === 401, `Status: ${res.status}`);
  } catch (e) {
    log('GET /api/auth/me (no token)', false, e.message);
  }

  // ============================
  // 9. Resumes — List (empty)
  // ============================
  console.log('\n📄 Resume Operations');
  try {
    const res = await request('GET', '/resumes', null, { Authorization: `Bearer ${TOKEN}` });
    log('GET /api/resumes (empty list)', res.status === 200 && res.data.success, `Status: ${res.status}, Count: ${res.data.data?.resumes?.length || 0}`);
  } catch (e) {
    log('GET /api/resumes', false, e.message);
  }

  // 10. Resume Upload — Create a tiny test PDF
  console.log('\n📤 Upload & Analysis');
  const testPdfPath = path.join(__dirname, 'uploads', 'test-resume.pdf');
  try {
    // Create a valid PDF with correct structure for pdf-parse extraction
    const stream = [
      'BT',
      '/F1 14 Tf',
      '50 740 Td',
      '(John Smith - Full Stack Developer) Tj',
      '/F1 10 Tf',
      '0 -20 Td',
      '(Email: john.smith@email.com | Phone: 555-0123 | LinkedIn: linkedin.com/in/johnsmith) Tj',
      '0 -30 Td',
      '(PROFESSIONAL SUMMARY) Tj',
      '0 -18 Td',
      '(Experienced Full Stack Developer with 5 plus years building scalable web applications) Tj',
      '0 -16 Td',
      '(using React and Node.js and Python. Proven track record of delivering high quality software.) Tj',
      '0 -26 Td',
      '(TECHNICAL SKILLS) Tj',
      '0 -18 Td',
      '(JavaScript, TypeScript, React, Node.js, Express, Python, Django, SQL, PostgreSQL, MongoDB) Tj',
      '0 -16 Td',
      '(AWS, Docker, Kubernetes, Git, REST APIs, GraphQL, CI/CD, Agile, Scrum) Tj',
      '0 -26 Td',
      '(WORK EXPERIENCE) Tj',
      '0 -18 Td',
      '(Senior Developer at TechCorp Inc - January 2021 to Present) Tj',
      '0 -16 Td',
      '(Built scalable microservices architecture serving 1M plus daily active users.) Tj',
      '0 -16 Td',
      '(Led team of 5 developers and mentored 3 junior engineers.) Tj',
      '0 -18 Td',
      '(Junior Developer at StartupXYZ - June 2019 to December 2020) Tj',
      '0 -16 Td',
      '(Developed React frontend and Node.js backend for e-commerce platform.) Tj',
      '0 -26 Td',
      '(EDUCATION) Tj',
      '0 -18 Td',
      '(Bachelor of Science in Computer Science - MIT - 2019 - GPA 3.8) Tj',
      'ET',
    ].join('\n');
    const streamBytes = Buffer.byteLength(stream);

    const obj1 = '1 0 obj\n<< /Type /Catalog /Pages 2 0 R >>\nendobj\n';
    const obj2 = '2 0 obj\n<< /Type /Pages /Kids [3 0 R] /Count 1 >>\nendobj\n';
    const obj3 = '3 0 obj\n<< /Type /Page /Parent 2 0 R /MediaBox [0 0 612 792] /Contents 4 0 R /Resources << /Font << /F1 5 0 R >> >> >>\nendobj\n';
    const obj4 = `4 0 obj\n<< /Length ${streamBytes} >>\nstream\n${stream}\nendstream\nendobj\n`;
    const obj5 = '5 0 obj\n<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>\nendobj\n';

    const header = '%PDF-1.4\n';
    const off1 = Buffer.byteLength(header);
    const off2 = off1 + Buffer.byteLength(obj1);
    const off3 = off2 + Buffer.byteLength(obj2);
    const off4 = off3 + Buffer.byteLength(obj3);
    const off5 = off4 + Buffer.byteLength(obj4);
    const xrefOffset = off5 + Buffer.byteLength(obj5);

    const pad = (n) => String(n).padStart(10, '0');
    // PDF spec: each xref entry is exactly 20 bytes with \r\n termination
    const xref = 'xref\n0 6\n' +
      `${pad(0)} 65535 f \r\n` +
      `${pad(off1)} 00000 n \r\n` +
      `${pad(off2)} 00000 n \r\n` +
      `${pad(off3)} 00000 n \r\n` +
      `${pad(off4)} 00000 n \r\n` +
      `${pad(off5)} 00000 n \r\n`;

    const trailer = `trailer\n<< /Size 6 /Root 1 0 R >>\nstartxref\n${xrefOffset}\n%%EOF`;
    const pdfContent = header + obj1 + obj2 + obj3 + obj4 + obj5 + xref + trailer;
    fs.writeFileSync(testPdfPath, pdfContent, 'binary');
    log('Create test PDF', true, 'test-resume.pdf created');
  } catch (e) {
    log('Create test PDF', false, e.message);
  }

  // 11. Upload the test PDF
  try {
    const res = await uploadFile(testPdfPath, TOKEN);
    const passed = res.status === 201 && res.data.success;
    if (passed) RESUME_ID = res.data.data.resume.id;
    log('POST /api/resumes/upload', passed, `Status: ${res.status}, Resume ID: ${RESUME_ID || 'N/A'}`);
  } catch (e) {
    log('POST /api/resumes/upload', false, e.message);
  }

  // 12. Get uploaded resume
  if (RESUME_ID) {
    try {
      const res = await request('GET', `/resumes/${RESUME_ID}`, null, { Authorization: `Bearer ${TOKEN}` });
      log('GET /api/resumes/:id', res.status === 200 && res.data.success, `Status: ${res.status}`);
    } catch (e) {
      log('GET /api/resumes/:id', false, e.message);
    }
  }

  // 13. List resumes (should have 1)
  try {
    const res = await request('GET', '/resumes', null, { Authorization: `Bearer ${TOKEN}` });
    log('GET /api/resumes (with data)', res.status === 200 && res.data.data.resumes.length > 0, `Count: ${res.data.data?.resumes?.length || 0}`);
  } catch (e) {
    log('GET /api/resumes (with data)', false, e.message);
  }

  // 14. Analysis — Get (should be 404 before analysis)
  if (RESUME_ID) {
    console.log('\n🧠 AI Analysis');
    try {
      const res = await request('GET', `/analysis/${RESUME_ID}`, null, { Authorization: `Bearer ${TOKEN}` });
      log('GET /api/analysis/:id (before analysis)', res.status === 404, `Status: ${res.status}`);
    } catch (e) {
      log('GET /api/analysis/:id (before analysis)', false, e.message);
    }
  }

  // 15. 404 for unknown routes
  console.log('\n🚫 Error Handling');
  try {
    const res = await request('GET', '/unknown-route');
    log('GET /api/unknown-route (404)', res.status === 404, `Status: ${res.status}`);
  } catch (e) {
    log('GET /api/unknown-route', false, e.message);
  }

  // Clean up test PDF
  try {
    if (fs.existsSync(testPdfPath)) fs.unlinkSync(testPdfPath);
  } catch {}

  // ============================
  // Summary
  // ============================
  const passed = results.filter(r => r.passed).length;
  const failed = results.filter(r => !r.passed).length;
  const total = results.length;

  console.log('\n═══════════════════════════════════════════');
  console.log(`📊 Results: ${passed}/${total} passed, ${failed} failed`);
  console.log('═══════════════════════════════════════════');

  if (failed === 0) {
    console.log('🎉 All tests passed!\n');
  } else {
    console.log('⚠️  Some tests failed. Review the output above.\n');
  }

  process.exit(failed > 0 ? 1 : 0);
}

runTests().catch(err => {
  console.error('Test runner failed:', err);
  process.exit(1);
});
