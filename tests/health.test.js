import test from 'node:test';
import assert from 'node:assert/strict';
import app from '../src/server.js';

test('application module loads', () => assert.equal(typeof app, 'function'));
