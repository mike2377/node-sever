import { describe, it, expect, jest } from '@jest/globals';
import { healthcheckController } from './healthcheck.controller.js';

const mockRes = () => {
  const res = {};
  res.status = jest.fn().mockReturnValue(res);
  res.json = jest.fn().mockReturnValue(res);
  return res;
};

describe('healthcheckController', () => {
  describe('getHealth', () => {
    it('should return 200 with health data', () => {
      const res = mockRes();

      healthcheckController.getHealth({}, res);

      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          status: 'success',
          message: 'Server is healthy',
          timestamp: expect.any(String),
          uptime: expect.any(Number),
        }),
      );
    });
  });
});