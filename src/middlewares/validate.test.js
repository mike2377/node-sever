import { describe, it, expect, jest } from '@jest/globals';
import { z } from 'zod';
import { validate } from './validate.js';
import { AppError } from './error-handler.js';

describe('validate middleware', () => {
  it('should call next() with no args when validation passes', async () => {
    const schema = z.object({
      body: z.object({ name: z.string() }),
      query: z.object({}).optional(),
      params: z.object({}).optional(),
    });

    const middleware = validate(schema);
    const req = { body: { name: 'John' }, query: {}, params: {} };
    const next = jest.fn();

    await middleware(req, {}, next);

    expect(next).toHaveBeenCalledWith();
  });

  it('should call next with AppError when validation fails (ZodError)', async () => {
    const schema = z.object({
      body: z.object({ name: z.string().min(3) }),
      query: z.object({}).optional(),
      params: z.object({}).optional(),
    });

    const middleware = validate(schema);
    const req = { body: { name: 'J' }, query: {}, params: {} };
    const next = jest.fn();

    await middleware(req, {}, next);

    expect(next).toHaveBeenCalledTimes(1);
    const error = next.mock.calls[0][0];
    expect(error).toBeInstanceOf(AppError);
    expect(error.statusCode).toBe(400);
    expect(error.message).toContain('Validation Error');
  });

  it('should forward non-Zod errors to next()', async () => {
    const customError = new Error('Custom');
    const fakeSchema = {
      parseAsync: jest.fn().mockRejectedValue(customError),
    };

    const middleware = validate(fakeSchema);
    const next = jest.fn();

    await middleware({ body: {}, query: {}, params: {} }, {}, next);

    expect(next).toHaveBeenCalledWith(customError);
  });
});
