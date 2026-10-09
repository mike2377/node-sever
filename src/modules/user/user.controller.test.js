import { describe, it, expect, jest, beforeEach } from '@jest/globals';

// 1) Mocks ESM
const mockGetAllUsers = jest.fn();
const mockGetUserById = jest.fn();
const mockCreateUser = jest.fn();
const mockDeleteUser = jest.fn();

jest.unstable_mockModule('./user.service.js', () => ({
  userService: {
    getAllUsers: mockGetAllUsers,
    getUserById: mockGetUserById,
    createUser: mockCreateUser,
    deleteUser: mockDeleteUser,
  },
}));

// 2) Import après le mock
const { userController } = await import('./user.controller.js');

// Helper
const mockRes = () => {
  const res = {};
  res.status = jest.fn().mockReturnValue(res);
  res.json = jest.fn().mockReturnValue(res);
  return res;
};

describe('UserController', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('getAllUsers', () => {
    it('should return 200 with all users', async () => {
      const users = [{ id: '1', name: 'John' }];
      mockGetAllUsers.mockResolvedValue(users);

      const res = mockRes();
      await userController.getAllUsers({}, res);

      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({ status: 'success', data: users });
    });
  });

  describe('getUserById', () => {
    it('should return 200 with the user', async () => {
      const user = { id: 'uuid', name: 'John' };
      mockGetUserById.mockResolvedValue(user);

      const req = { params: { id: 'uuid' } };
      const res = mockRes();
      await userController.getUserById(req, res);

      expect(mockGetUserById).toHaveBeenCalledWith('uuid');
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({ status: 'success', data: user });
    });
  });

  describe('createUser', () => {
    it('should return 201 with the new user', async () => {
      const newUser = { id: 'uuid', name: 'John', email: 'john@test.com' };
      mockCreateUser.mockResolvedValue(newUser);

      const req = { body: { name: 'John', email: 'john@test.com' } };
      const res = mockRes();
      await userController.createUser(req, res);

      expect(mockCreateUser).toHaveBeenCalledWith(req.body);
      expect(res.status).toHaveBeenCalledWith(201);
      expect(res.json).toHaveBeenCalledWith({ status: 'success', data: newUser });
    });
  });

  describe('deleteUser', () => {
    it('should return 204', async () => {
      mockDeleteUser.mockResolvedValue(undefined);

      const req = { params: { id: 'uuid' } };
      const res = mockRes();
      await userController.deleteUser(req, res);

      expect(mockDeleteUser).toHaveBeenCalledWith('uuid');
      expect(res.status).toHaveBeenCalledWith(204);
    });
  });
});
