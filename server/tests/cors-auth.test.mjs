import assert from "node:assert/strict";
import { after, before, test } from "node:test";
import Activity from "../src/models/Activity.js";
import Notification from "../src/models/Notification.js";
import User from "../src/models/User.js";

process.env.JWT_SECRET = "test-only-jwt-secret";
process.env.NODE_ENV = "test";

const { default: app } = await import("../src/app.js");

const origin = "https://ramixaq-ai.vercel.app";
const user = {
  _id: "507f1f77bcf86cd799439011",
  name: "CORS Test",
  email: "cors-test@example.com",
  headline: "Student",
  bio: "",
  location: "",
  avatarUrl: "",
  github: "",
  linkedin: "",
  website: "",
  publicSlug: "cors-test",
  emailVerified: true,
  role: "student",
  xp: 0,
  level: 1,
  badges: [],
  matchPassword: async () => true,
  save: async function save() {
    return this;
  }
};

let server;
let baseUrl;

before(async () => {
  User.findOne = () => ({
    select: async () => user,
    then(resolve) {
      resolve(null);
    }
  });
  User.exists = async () => false;
  User.create = async (payload) => ({ ...user, ...payload });
  Activity.create = async () => ({});
  Notification.create = async () => ({});

  await new Promise((resolve) => {
    server = app.listen(0, "127.0.0.1", () => {
      const address = server.address();
      baseUrl = `http://127.0.0.1:${address.port}`;
      resolve();
    });
  });
});

after(async () => {
  await new Promise((resolve) => server.close(resolve));
});

test("auth preflight reflects a Vercel origin", async () => {
  const response = await fetch(`${baseUrl}/api/auth/register`, {
    method: "OPTIONS",
    headers: {
      Origin: origin,
      "Access-Control-Request-Method": "POST",
      "Access-Control-Request-Headers": "content-type,authorization"
    }
  });

  assert.equal(response.status, 204);
  assert.equal(response.headers.get("access-control-allow-origin"), origin);
  assert.equal(response.headers.get("access-control-allow-credentials"), "true");
  assert.match(response.headers.get("access-control-allow-methods"), /POST/);
});

test("registration accepts JSON from a Vercel origin", async () => {
  const response = await fetch(`${baseUrl}/api/auth/register`, {
    method: "POST",
    headers: {
      Origin: origin,
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      name: user.name,
      email: user.email,
      password: "TestPass123"
    })
  });
  const data = await response.json();

  assert.equal(response.status, 201);
  assert.equal(response.headers.get("access-control-allow-origin"), origin);
  assert.ok(data.token);
});
test("login returns a JWT to a Vercel origin", async () => {
  const response = await fetch(`${baseUrl}/api/auth/login`, {
    method: "POST",
    headers: {
      Origin: origin,
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      email: user.email,
      password: "TestPass123"
    })
  });
  const data = await response.json();

  assert.equal(response.status, 200);
  assert.equal(response.headers.get("access-control-allow-origin"), origin);
  assert.ok(data.token);
});

test("forgot password returns a privacy-safe response", async () => {
  const response = await fetch(`${baseUrl}/api/auth/forgot-password`, {
    method: "POST",
    headers: {
      Origin: origin,
      "Content-Type": "application/json"
    },
    body: JSON.stringify({ email: user.email })
  });
  const data = await response.json();

  assert.equal(response.status, 200);
  assert.match(data.message, /If an account exists/);
});

test("email verification accepts a valid token flow", async () => {
  const response = await fetch(`${baseUrl}/api/auth/verify-email`, {
    method: "POST",
    headers: {
      Origin: origin,
      "Content-Type": "application/json"
    },
    body: JSON.stringify({ token: "valid-test-token" })
  });
  const data = await response.json();

  assert.equal(response.status, 200);
  assert.equal(data.user.emailVerified, true);
});

test("password reset updates the password", async () => {
  const response = await fetch(`${baseUrl}/api/auth/reset-password`, {
    method: "POST",
    headers: {
      Origin: origin,
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      token: "valid-test-token",
      password: "UpdatedPass123"
    })
  });
  const data = await response.json();

  assert.equal(response.status, 200);
  assert.equal(data.message, "Password reset successfully");
});
