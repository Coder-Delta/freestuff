const baseUrl = (process.env.API_URL || `http://127.0.0.1:${process.env.PORT || 5000}`).replace(/\/$/, '');
const stamp = `${Date.now()}-${Math.random().toString(16).slice(2, 8)}`;
const testEmail = `api-test-${stamp}@example.com`;
let createdUserId;
let createdProductId;
let adminToken;
let moderatorToken;
let userToken;
let passed = 0;
let failed = 0;

async function request(method, path, { token, body } = {}) {
  const response = await fetch(`${baseUrl}${path}`, {
    method,
    headers: {
      ...(body ? { 'Content-Type': 'application/json' } : {}),
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    ...(body ? { body: JSON.stringify(body) } : {}),
  });
  let data = {};
  try { data = await response.json(); } catch {}
  return { status: response.status, data };
}

async function check(number, title, fn) {
  try {
    const result = await fn();
    if (!result || result.ok !== true) throw new Error(result && result.message || 'Unexpected response');
    passed += 1;
    console.log(`✓ ${String(number).padStart(2, '0')} ${title}`);
  } catch (error) {
    failed += 1;
    console.error(`✗ ${String(number).padStart(2, '0')} ${title}: ${error.message}`);
  }
}

const expectStatus = (result, status) => ({ ok: result.status === status, message: `Expected ${status}, received ${result.status}` });
const login = async (email, password) => request('POST', '/api/auth/login', { body: { email, password } });

async function main() {
  const credentials = {
    admin: ['admin@example.com', 'AdminPassword123!'],
    moderator: ['moderator@example.com', 'ModPassword123!'],
    user: ['user@example.com', 'UserPassword123!'],
  };
  const logins = await Promise.all(Object.values(credentials).map(([email, password]) => login(email, password)));
  if (logins.some((item) => item.status !== 200)) {
    throw new Error('Could not log in seeded demo accounts. Run `npm run seed:import` on a disposable database first.');
  }
  [adminToken, moderatorToken, userToken] = logins.map((item) => item.data.token);

  await check(1, 'API discovery directory', async () => expectStatus(await request('GET', '/'), 200));
  await check(2, 'System health check', async () => expectStatus(await request('GET', '/api/health'), 200));
  await check(3, 'Missing required registration fields', async () => expectStatus(await request('POST', '/api/auth/register', { body: {} }), 400));
  await check(4, 'Register standard user', async () => {
    const result = await request('POST', '/api/auth/register', { body: { name: 'API Test User', email: testEmail, password: 'TestPassword123!' } });
    if (result.status === 201) createdUserId = result.data.data.id;
    return expectStatus(result, 201);
  });
  await check(5, 'Duplicate email blocked', async () => expectStatus(await request('POST', '/api/auth/register', { body: { name: 'Duplicate', email: testEmail, password: 'TestPassword123!' } }), 409));
  await check(6, 'Seeded moderator can log in', async () => expectStatus(await login(...credentials.moderator), 200));
  await check(7, 'Seeded administrator can log in', async () => expectStatus(await login(...credentials.admin), 200));
  await check(8, 'Wrong password rejected', async () => expectStatus(await login(...credentials.user.slice(0, 1), 'incorrect-password'), 401));
  await check(9, 'Valid login issues a token', async () => {
    const result = await login(...credentials.user);
    if (result.status === 200) userToken = result.data.token;
    return expectStatus(result, 200);
  });
  await check(10, 'Get user profile', async () => expectStatus(await request('GET', '/api/auth/me', { token: userToken }), 200));
  await check(11, 'Protected profile rejects missing token', async () => expectStatus(await request('GET', '/api/auth/me'), 401));
  await check(12, 'Update profile details', async () => expectStatus(await request('PUT', '/api/auth/updatedetails', { token: userToken, body: { name: 'Updated API Test User' } }), 200));
  await check(13, 'Regular user blocked from admin routes', async () => expectStatus(await request('GET', '/api/users', { token: userToken }), 403));
  await check(14, 'Administrator can list users', async () => expectStatus(await request('GET', '/api/users', { token: adminToken }), 200));
  await check(15, 'Public product catalog browsing', async () => expectStatus(await request('GET', '/api/products'), 200));
  await check(16, 'Regular user cannot create product', async () => expectStatus(await request('POST', '/api/products', { token: userToken, body: { name: 'Forbidden test product', price: 1 } }), 403));
  await check(17, 'Moderator can create product', async () => {
    const result = await request('POST', '/api/products', { token: moderatorToken, body: { name: `API Test Product ${stamp}`, price: 1, category: 'other' } });
    if (result.status === 201) createdProductId = result.data.data._id;
    return expectStatus(result, 201);
  });
  await check(18, 'Fetch product by ID publicly', async () => createdProductId
    ? expectStatus(await request('GET', `/api/products/${createdProductId}`), 200)
    : { ok: false, message: 'Product creation did not succeed' });
  await check(19, 'Moderator cannot delete product', async () => createdProductId
    ? expectStatus(await request('DELETE', `/api/products/${createdProductId}`, { token: moderatorToken }), 403)
    : { ok: false, message: 'Product creation did not succeed' });
  await check(20, 'Administrator can delete product', async () => createdProductId
    ? expectStatus(await request('DELETE', `/api/products/${createdProductId}`, { token: adminToken }), 200)
    : { ok: false, message: 'Product creation did not succeed' });
  await check(21, 'Undefined route returns 404', async () => expectStatus(await request('GET', '/api/undefined-route'), 404));

  if (createdUserId) {
    try { await request('DELETE', `/api/users/${createdUserId}`, { token: adminToken }); }
    catch (error) { console.error(`Cleanup warning: ${error.message}`); }
  }
  console.log(`\n${passed}/21 passed; ${failed} failed.`);
  if (failed) process.exitCode = 1;
}

main().catch((error) => {
  console.error(error.message);
  process.exitCode = 1;
});
