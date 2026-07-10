/**
 * E2E Test: Full flow - Register → Upload → AI Analysis → Get Results → History
 */
const http = require('http');
const fs = require('fs');
const path = require('path');

const BASE = 'http://localhost:5000/api';

function request(method, urlPath, body, headers = {}) {
  return new Promise((resolve, reject) => {
    const url = new URL(BASE + urlPath);
    const opts = {
      hostname: url.hostname,
      port: url.port,
      path: url.pathname + url.search,
      method,
      headers: { 'Content-Type': 'application/json', ...headers }
    };
    const req = http.request(opts, (res) => {
      let data = '';
      res.on('data', c => data += c);
      res.on('end', () => {
        try { resolve({ status: res.statusCode, data: JSON.parse(data) }); }
        catch { resolve({ status: res.statusCode, data }); }
      });
    });
    req.on('error', reject);
    if (body) req.write(JSON.stringify(body));
    req.end();
  });
}

function uploadFile(filePath, token) {
  return new Promise((resolve, reject) => {
    const boundary = '----TestBoundary' + Date.now();
    const fileName = path.basename(filePath);
    const fileContent = fs.readFileSync(filePath);
    const header = `--${boundary}\r\nContent-Disposition: form-data; name="resume"; filename="${fileName}"\r\nContent-Type: application/pdf\r\n\r\n`;
    const footer = `\r\n--${boundary}--\r\n`;
    const body = Buffer.concat([Buffer.from(header), fileContent, Buffer.from(footer)]);
    const opts = {
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
    const req = http.request(opts, (res) => {
      let data = '';
      res.on('data', c => data += c);
      res.on('end', () => {
        try { resolve({ status: res.statusCode, data: JSON.parse(data) }); }
        catch { resolve({ status: res.statusCode, data }); }
      });
    });
    req.on('error', reject);
    req.write(body);
    req.end();
  });
}

function createTestPdf(filePath) {
  const stream = [
    'BT', '/F1 14 Tf', '50 740 Td',
    '(John Smith - Full Stack Developer) Tj',
    '/F1 10 Tf', '0 -20 Td',
    '(Email: john.smith@email.com | Phone: 555-0123 | LinkedIn: linkedin.com/in/johnsmith) Tj',
    '0 -30 Td', '(PROFESSIONAL SUMMARY) Tj', '0 -18 Td',
    '(Experienced Full Stack Developer with 5 plus years building scalable web applications) Tj',
    '0 -16 Td', '(using React and Node.js and Python. Proven track record of delivering high quality software.) Tj',
    '0 -26 Td', '(TECHNICAL SKILLS) Tj', '0 -18 Td',
    '(JavaScript, TypeScript, React, Node.js, Express, Python, Django, SQL, PostgreSQL, MongoDB) Tj',
    '0 -16 Td', '(AWS, Docker, Kubernetes, Git, REST APIs, GraphQL, CI/CD, Agile, Scrum) Tj',
    '0 -26 Td', '(WORK EXPERIENCE) Tj', '0 -18 Td',
    '(Senior Developer at TechCorp Inc - January 2021 to Present) Tj',
    '0 -16 Td', '(Built scalable microservices architecture serving 1M plus daily active users.) Tj',
    '0 -16 Td', '(Led team of 5 developers and mentored 3 junior engineers.) Tj',
    '0 -18 Td', '(Junior Developer at StartupXYZ - June 2019 to December 2020) Tj',
    '0 -16 Td', '(Developed React frontend and Node.js backend for e-commerce platform.) Tj',
    '0 -26 Td', '(EDUCATION) Tj', '0 -18 Td',
    '(Bachelor of Science in Computer Science - MIT - 2019 - GPA 3.8) Tj',
    'ET'
  ].join('\n');
  const sb = Buffer.byteLength(stream);
  const o1 = '1 0 obj\n<< /Type /Catalog /Pages 2 0 R >>\nendobj\n';
  const o2 = '2 0 obj\n<< /Type /Pages /Kids [3 0 R] /Count 1 >>\nendobj\n';
  const o3 = '3 0 obj\n<< /Type /Page /Parent 2 0 R /MediaBox [0 0 612 792] /Contents 4 0 R /Resources << /Font << /F1 5 0 R >> >> >>\nendobj\n';
  const o4 = `4 0 obj\n<< /Length ${sb} >>\nstream\n${stream}\nendstream\nendobj\n`;
  const o5 = '5 0 obj\n<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>\nendobj\n';
  const hd = '%PDF-1.4\n';
  const f1 = Buffer.byteLength(hd);
  const f2 = f1 + Buffer.byteLength(o1);
  const f3 = f2 + Buffer.byteLength(o2);
  const f4 = f3 + Buffer.byteLength(o3);
  const f5 = f4 + Buffer.byteLength(o4);
  const xo = f5 + Buffer.byteLength(o5);
  const p = n => String(n).padStart(10, '0');
  const xr = 'xref\n0 6\n' +
    p(0) + ' 65535 f \r\n' +
    p(f1) + ' 00000 n \r\n' +
    p(f2) + ' 00000 n \r\n' +
    p(f3) + ' 00000 n \r\n' +
    p(f4) + ' 00000 n \r\n' +
    p(f5) + ' 00000 n \r\n';
  const tr = `trailer\n<< /Size 6 /Root 1 0 R >>\nstartxref\n${xo}\n%%EOF`;
  fs.writeFileSync(filePath, hd + o1 + o2 + o3 + o4 + o5 + xr + tr, 'binary');
}

let passed = 0;
let failed = 0;
function log(test, ok, details = '') {
  const icon = ok ? '✅' : '❌';
  console.log(`  ${icon} ${test}${details ? ' — ' + details : ''}`);
  if (ok) passed++; else failed++;
}

async function run() {
  console.log('\n╔═══════════════════════════════════════════════╗');
  console.log('║   E2E Test: Full Analysis Flow                ║');
  console.log('╚═══════════════════════════════════════════════╝\n');

  // 1. Register
  console.log('🔐 Auth');
  const email = `e2e_${Date.now()}@test.com`;
  const reg = await request('POST', '/auth/register', { name: 'E2E Tester', email, password: 'testpass123' });
  log('Register new user', reg.status === 201 && reg.data.success, `Status: ${reg.status}`);
  const TOKEN = reg.data.data.token;

  // 2. Create and upload test PDF
  console.log('\n📤 Upload');
  const pdfPath = path.join(__dirname, 'uploads', 'e2e-test.pdf');
  createTestPdf(pdfPath);
  log('Create test PDF', true);

  const up = await uploadFile(pdfPath, TOKEN);
  log('Upload resume', up.status === 201 && up.data.success, `Status: ${up.status}`);

  if (up.status !== 201) {
    console.log('   Upload failed:', up.data.message || JSON.stringify(up.data).substring(0, 200));
    cleanup(pdfPath);
    return printSummary();
  }
  const resumeId = up.data.data.resume.id;
  log('Resume ID returned', !!resumeId, `ID: ${resumeId}`);

  // 3. Get resume before analysis
  const getResume = await request('GET', `/resumes/${resumeId}`, null, { Authorization: `Bearer ${TOKEN}` });
  log('Get uploaded resume', getResume.status === 200 && getResume.data.success, `Status: ${getResume.status}`);

  // 4. Get analysis (should be 404)
  console.log('\n🧠 AI Analysis');
  const noAnalysis = await request('GET', `/analysis/${resumeId}`, null, { Authorization: `Bearer ${TOKEN}` });
  log('No analysis yet (404)', noAnalysis.status === 404, `Status: ${noAnalysis.status}`);

  // 5. Trigger AI analysis
  console.log('   ⏳ Triggering AI analysis (may take 15-30s)...');
  const analyze = await request('POST', `/analysis/${resumeId}`, null, { Authorization: `Bearer ${TOKEN}` });
  log('Trigger AI analysis', analyze.status === 201 && analyze.data.success, `Status: ${analyze.status}`);

  if (analyze.data.data?.analysis) {
    const a = analyze.data.data.analysis;
    console.log(`   📊 ATS Score: ${a.ats_score}`);
    console.log(`   📝 Summary: ${(a.summary || '').substring(0, 120)}...`);
    console.log(`   ⚡ Processing: ${analyze.data.data.processing_time_ms}ms`);
    log('ATS score returned', typeof a.ats_score === 'number' && a.ats_score >= 0, `Score: ${a.ats_score}`);
    log('Summary returned', !!a.summary, `Length: ${(a.summary || '').length}`);
    log('Technical skills returned', Array.isArray(a.technical_skills) && a.technical_skills.length > 0, `Count: ${a.technical_skills?.length}`);
  }

  // 6. Get analysis results
  console.log('\n📋 Retrieval');
  const getAnalysis = await request('GET', `/analysis/${resumeId}`, null, { Authorization: `Bearer ${TOKEN}` });
  log('Get analysis results', getAnalysis.status === 200 && getAnalysis.data.success, `Status: ${getAnalysis.status}`);

  // 7. Get history
  const history = await request('GET', '/analysis/history/all', null, { Authorization: `Bearer ${TOKEN}` });
  log('Get history', history.status === 200 && history.data.success, `Status: ${history.status}`);
  log('History has entries', history.data.data?.analyses?.length > 0, `Count: ${history.data.data?.analyses?.length}`);

  // 8. List resumes
  const listResumes = await request('GET', '/resumes', null, { Authorization: `Bearer ${TOKEN}` });
  log('List resumes', listResumes.status === 200 && listResumes.data.success, `Count: ${listResumes.data.data?.resumes?.length}`);

  // 9. Re-analyze
  console.log('\n🔄 Re-analysis');
  console.log('   ⏳ Re-analyzing (may take 15-30s)...');
  const reanalyze = await request('POST', `/analysis/${resumeId}/reanalyze`, null, { Authorization: `Bearer ${TOKEN}` });
  log('Re-analyze resume', reanalyze.status === 201 && reanalyze.data.success, `Status: ${reanalyze.status}`);

  // 10. Delete resume
  console.log('\n🗑️ Cleanup');
  const del = await request('DELETE', `/resumes/${resumeId}`, null, { Authorization: `Bearer ${TOKEN}` });
  log('Delete resume', del.status === 200 && del.data.success, `Status: ${del.status}`);

  // Verify deletion
  const afterDel = await request('GET', `/resumes/${resumeId}`, null, { Authorization: `Bearer ${TOKEN}` });
  log('Resume deleted (404)', afterDel.status === 404, `Status: ${afterDel.status}`);

  cleanup(pdfPath);
  printSummary();
}

function cleanup(pdfPath) {
  try { if (fs.existsSync(pdfPath)) fs.unlinkSync(pdfPath); } catch {}
}

function printSummary() {
  const total = passed + failed;
  console.log('\n═══════════════════════════════════════════');
  console.log(`📊 Results: ${passed}/${total} passed, ${failed} failed`);
  console.log('═══════════════════════════════════════════');
  if (failed === 0) console.log('🎉 All E2E tests passed!\n');
  else console.log('⚠️  Some tests failed.\n');
  process.exit(failed > 0 ? 1 : 0);
}

run().catch(err => { console.error('E2E Error:', err); process.exit(1); });
