// Testing auth endpoints
import jwt from "jsonwebtoken";
import { config } from 'dotenv';
config();

const BASE_URL = 'http://localhost:3000/api/auth';
const testEmail = 'test_user_' + Date.now() + '@example.com';
const testContact = '1234' + Date.now().toString().slice(-6);
const testPassword = 'Password123!';

async function runTests() {
  try {
    // 1. Register
    console.log("\\n--- Testing /register ---");
    const registerRes = await fetch(BASE_URL + '/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        fullname: "Test User",
        email: testEmail,
        contact: testContact,
        password: testPassword
      })
    });
    const registerData = await registerRes.json();
    console.log("Register Response:", registerData);
    if (!registerData.success) throw new Error("Register failed");

    // 2. Login (should fail because not verified)
    console.log("\\n--- Testing /login (unverified) ---");
    const loginFailRes = await fetch(BASE_URL + '/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: testEmail, password: testPassword })
    });
    const loginFailData = await loginFailRes.json();
    console.log("Login Unverified Response:", loginFailData);
    if (loginFailData.success) throw new Error("Login should have failed");

    const jwtSecret = process.env.JWT_SECRET;
    const verifyToken = jwt.sign({ email: testEmail }, jwtSecret, { expiresIn: "1h" });
    
    console.log("\\n--- Testing /verify-email ---");
    const verifyRes = await fetch(BASE_URL + '/verify-email?token=' + verifyToken);
    const verifyData = await verifyRes.json();
    console.log("Verify Email Response:", verifyData);
    if (!verifyData.success) throw new Error("Verify email failed");

    // 3. Login (should succeed now)
    console.log("\\n--- Testing /login (verified) ---");
    const loginRes = await fetch(BASE_URL + '/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: testEmail, password: testPassword })
    });
    const loginData = await loginRes.json();
    console.log("Login Verified Response:", loginData);
    if (!loginData.success) throw new Error("Login failed");

    // Extract cookie for authenticated requests
    const cookies = loginRes.headers.get('set-cookie');
    console.log("Set-Cookie:", cookies);

    // 4. Get Me
    console.log("\\n--- Testing /get-me ---");
    const getMeRes = await fetch(BASE_URL + '/get-me', {
      headers: { 'Cookie': cookies }
    });
    const getMeData = await getMeRes.json();
    console.log("Get Me Response:", getMeData);
    if (!getMeData.success) throw new Error("Get Me failed");

    // 5. Resend Verification
    console.log("\\n--- Testing /resend-verification (already verified) ---");
    const resendRes = await fetch(BASE_URL + '/resend-verification', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: testEmail })
    });
    const resendData = await resendRes.json();
    console.log("Resend Verification Response:", resendData);
    if (resendData.success) throw new Error("Resend Verification should have failed because user is already verified");

    // 6. Logout
    console.log("\\n--- Testing /logout ---");
    const logoutRes = await fetch(BASE_URL + '/logout', {
      headers: { 'Cookie': cookies }
    });
    const logoutData = await logoutRes.json();
    console.log("Logout Response:", logoutData);
    if (!logoutData.success) throw new Error("Logout failed");

    console.log("\\n✅ All API tests passed successfully!");
  } catch (err) {
    console.error("❌ Test failed:", err.message);
  }
}

runTests();
