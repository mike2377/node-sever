import { describe, it, expect, jest, beforeEach, afterEach } from '@jest/globals';
import { AppError, errorHandler } from './error-handler.js';
import { logger } from './logger.js';

const mockRes = () => {
  const res = {};
  res.status = jest.fn().mockReturnValue(res);
  res.json = jest.fn().mockReturnValue(res);
  return res;
};

describe('AppError', () => {
  it('should set message and statusCode', () => {
    const error = new AppError('Not found', 404);
    expect(error).toBeInstanceOf(Error);
    expect(error.message).toBe('Not found');
    expect(error.statusCode).toBe(404);
  });
});

describe('errorHandler', () => {
  let loggerSpy;

  beforeEach(() => {
    loggerSpy = jest.spyOn(logger, 'error').mockImplementation(() => {});
  });

  afterEach(() => {
    loggerSpy.mockRestore();
  });

  it('should handle AppError with its statusCode and message', () => {
    const err = new AppError('Not found', 404);
    const res = mockRes();

    errorHandler(err, {}, res, jest.fn());

    expect(res.status).toHaveBeenCalledWith(404);
    expect(res.json).toHaveBeenCalledWith({
      statusCode: 404,
      message: 'Not found',
    });
  });

  it('should handle generic errors with 500 and log them', () => {
    const err = new Error('Boom');
    const res = mockRes();

    errorHandler(err, {}, res, jest.fn());

    expect(loggerSpy).toHaveBeenCalled();
    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith({
      statusCode: 500,
      message: 'Internal Server Error',
    });
  });

  it('should include stack when NODE_ENV=development', () => {
    const original = process.env.NODE_ENV;
    process.env.NODE_ENV = 'development';

    const err = new AppError('Bad request', 400);
    const res = mockRes();

    errorHandler(err, {}, res, jest.fn());

    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({
        statusCode: 400,
        message: 'Bad request',
        stack: expect.any(String),
      }),
    );

    process.env.NODE_ENV = original;
  });
});
