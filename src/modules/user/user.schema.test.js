import { describe, it, expect } from '@jest/globals';
import { createUserSchema, getUserByIdSchema, deleteUserSchema } from './user.schema.js';

const VALID_UUID = '123e4567-e89b-12d3-a456-426614174000';

describe('User Schemas', () => {
  describe('createUserSchema', () => {
    it('should validate a valid body', async () => {
      const result = await createUserSchema.parseAsync({
        body: { name: 'John Doe', email: 'john@example.com' },
        });
      expect(result.body.name).toBe('John Doe');
    });

    it('should reject a name that is too short', async () => {
      await expect(
        createUserSchema.parseAsync({
          body: { name: 'J', email: 'john@example.com' },
        }),
      ).rejects.toThrow();
    });

    it('should reject a name that is too long', async () => {
      await expect(
        createUserSchema.parseAsync({
          body: { name: 'a'.repeat(51), email: 'john@example.com' },
        }),
      ).rejects.toThrow();
    });

    it('should reject an invalid email', async () => {
      await expect(
        createUserSchema.parseAsync({
          body: { name: 'John Doe', email: 'not-an-email' },
        }),
      ).rejects.toThrow();
    });
  });

  describe('getUserByIdSchema', () => {
    it('should accept a valid UUID', async () => {
      await expect(getUserByIdSchema.parseAsync({ params: { id: VALID_UUID } })).resolves.toBeDefined();
    });

    it('should reject an invalid UUID', async () => {
      await expect(getUserByIdSchema.parseAsync({ params: { id: 'not-a-uuid' } })).rejects.toThrow();
    });
  });

  describe('deleteUserSchema', () => {
    it('should accept a valid UUID', async () => {
      await expect(deleteUserSchema.parseAsync({ params: { id: VALID_UUID } })).resolves.toBeDefined();
    });

    it('should reject an invalid UUID', async () => {
      await expect(deleteUserSchema.parseAsync({ params: { id: 'invalid' } })).rejects.toThrow();
    });
  });
});
