import { describe, it, expect, beforeAll, beforeEach } from '@jest/globals';
import request from 'supertest';
import { createApp } from './app.js';
import { clearUsers } from '#src/modules/user/user.service.js';

describe('App (integration)', () => {
  let app;

  beforeAll(() => {
    app = createApp();
  });

  beforeEach(() => {
    clearUsers();
  });

  describe('GET /api/health', () => {
    it('should return 200 and health status', async () => {
      const res = await request(app).get('/api/health');
      expect(res.status).toBe(200);
      expect(res.body.status).toBe('success');
    });
  });

  describe('GET /api/v1/users/', () => {
    it('should return 200 with empty array initially', async () => {
      const res = await request(app).get('/api/v1/users/');
      expect(res.status).toBe(200);
      expect(res.body).toEqual({ status: 'success', data: [] });
    });
  });

  describe('POST /api/v1/users/', () => {
    it('should create a user and return 201', async () => {
      const res = await request(app).post('/api/v1/users/').send({ name: 'John Doe', email: 'john@example.com' });

      expect(res.status).toBe(201);
      expect(res.body.data.name).toBe('John Doe');
      expect(res.body.data.email).toBe('john@example.com');
      expect(res.body.data.id).toBeDefined();
    });

    it('should return 400 on invalid body', async () => {
      const res = await request(app).post('/api/v1/users/').send({ name: 'J', email: 'invalid' });

      expect(res.status).toBe(400);
      expect(res.body.message).toContain('Validation Error');
    });

    it('should return 409 when email already exists', async () => {
      await request(app).post('/api/v1/users/').send({ name: 'John Doe', email: 'john@example.com' });

      const res = await request(app).post('/api/v1/users/').send({ name: 'Jane Smith', email: 'john@example.com' });

      expect(res.status).toBe(409);
      expect(res.body.message).toContain('already exists');
    });
  });

  describe('GET /api/v1/users/:id', () => {
    it('should return 200 with the user', async () => {
      const created = await request(app).post('/api/v1/users/').send({ name: 'John Doe', email: 'john@example.com' });

      const res = await request(app).get(`/api/v1/users/${created.body.data.id}`);
      expect(res.status).toBe(200);
      expect(res.body.data.id).toBe(created.body.data.id);
    });

    it('should return 400 on invalid UUID', async () => {
      const res = await request(app).get('/api/v1/users/invalid-uuid');
      expect(res.status).toBe(400);
      expect(res.body.message).toContain('Validation Error');
    });

    it('should return 404 when user not found', async () => {
      const res = await request(app).get('/api/v1/users/123e4567-e89b-12d3-a456-426614174000');
      expect(res.status).toBe(404);
      expect(res.body.message).toBe('User not found');
    });
  });

  describe('DELETE /api/v1/users/:id', () => {
    it('should delete the user and return 204', async () => {
      const created = await request(app).post('/api/v1/users/').send({ name: 'John Doe', email: 'john@example.com' });

      const res = await request(app).delete(`/api/v1/users/${created.body.data.id}`);
      expect(res.status).toBe(204);
    });

    it('should return 400 on invalid UUID', async () => {
      const res = await request(app).delete('/api/v1/users/invalid');
      expect(res.status).toBe(400);
    });

    it('should return 404 when user not found', async () => {
      const res = await request(app).delete('/api/v1/users/123e4567-e89b-12d3-a456-426614174000');
      expect(res.status).toBe(404);
    });
  });

  describe('Unknown route', () => {
    it('should return 404 with "Route not found"', async () => {
      const res = await request(app).get('/api/does-not-exist');
      expect(res.status).toBe(404);
      expect(res.body.message).toBe('Route not found');
    });
  });
});
