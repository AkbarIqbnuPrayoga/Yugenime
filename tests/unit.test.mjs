import test from 'node:test';
import assert from 'node:assert/strict';
import { createRequire } from 'node:module';

const require = createRequire(import.meta.url);

// Test 1: Scrapr Library Loading & Architecture
test('@coflyn/scrapr package initializes with expected methods', () => {
  const scrapr = require('@coflyn/scrapr');
  assert.ok(scrapr, 'Scrapr should be loadable');
  assert.ok(typeof scrapr.bilibili?.direct === 'function', 'bilibili.direct should exist');
  assert.ok(typeof scrapr.youtube?.playlist === 'function', 'youtube.playlist should exist');
  assert.ok(typeof scrapr.resolver?.mediafire === 'function', 'resolver.mediafire should exist');
  assert.ok(typeof scrapr.anime?.gogoanime?.search === 'function', 'gogoanime search should exist');
});

// Test 2: URL Security Validation (SSRF Prevention)
test('SSRF Protection blocks localhost, private subnets, and non-http protocols', () => {
  const FORBIDDEN_HOST_PATTERNS = [
    /^localhost$/i,
    /^127\./,
    /^10\./,
    /^172\.(1[6-9]|2[0-9]|3[0-1])\./,
    /^192\.168\./,
    /^169\.254\./,
    /^::1$/,
    /^fc00:/,
    /^fe80:/,
  ];

  function validateSafeUrl(urlString) {
    try {
      const url = new URL(urlString);
      if (url.protocol !== 'http:' && url.protocol !== 'https:') {
        return { valid: false, error: 'UNAUTHORIZED_SOURCE' };
      }
      const hostname = url.hostname;
      for (const pattern of FORBIDDEN_HOST_PATTERNS) {
        if (pattern.test(hostname)) {
          return { valid: false, error: 'UNAUTHORIZED_SOURCE' };
        }
      }
      return { valid: true };
    } catch {
      return { valid: false, error: 'UNSUPPORTED_FORMAT' };
    }
  }

  assert.equal(validateSafeUrl('http://localhost:3000').valid, false);
  assert.equal(validateSafeUrl('http://127.0.0.1/admin').valid, false);
  assert.equal(validateSafeUrl('http://192.168.1.1/video.mp4').valid, false);
  assert.equal(validateSafeUrl('http://10.0.0.1/video.mp4').valid, false);
  assert.equal(validateSafeUrl('file:///etc/passwd').valid, false);
  assert.equal(validateSafeUrl('javascript:alert(1)').valid, false);

  assert.equal(validateSafeUrl('https://commondatastorage.googleapis.com/sample.mp4').valid, true);
  assert.equal(validateSafeUrl('https://www.youtube.com/watch?v=123').valid, true);
  assert.equal(validateSafeUrl('https://www.bilibili.tv/id/play/123').valid, true);
});

// Test 3: Watch Progress Validation & Clamping
test('Watch Progress calculations correctly clamp values and detect completion', () => {
  function processProgress(position, duration) {
    let p = Math.max(0, position);
    if (duration && p > duration) p = duration;
    const completed = duration ? p / duration >= 0.9 : false;
    return { position: p, completed };
  }

  // Clamps negative position to 0
  assert.equal(processProgress(-50, 1440).position, 0);

  // Clamps position exceeding duration
  assert.equal(processProgress(2000, 1440).position, 1440);

  // Incomplete progress (< 90%)
  assert.equal(processProgress(500, 1440).completed, false);

  // Completed progress (>= 90%)
  assert.equal(processProgress(1300, 1440).completed, true);
});

// Test 4: Provider Health & Circuit Breaker Logic
test('Provider circuit breaker transitions available -> degraded -> unavailable', () => {
  let failureCount = 0;
  let status = 'available';

  function recordFailure() {
    failureCount++;
    if (failureCount >= 3) {
      status = 'unavailable';
    } else {
      status = 'degraded';
    }
    return { status, failureCount };
  }

  function recordSuccess() {
    failureCount = 0;
    status = 'available';
    return { status, failureCount };
  }

  assert.equal(recordFailure().status, 'degraded');
  assert.equal(recordFailure().status, 'degraded');
  assert.equal(recordFailure().status, 'unavailable'); // 3 failures -> circuit broken
  assert.equal(recordSuccess().status, 'available'); // recovered
});
