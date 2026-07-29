const { z } = require('zod');

const registerSchema = z.object({
  name: z.string().optional(),
  phone_no: z.string().min(11).max(11),
  email: z.string().email().optional().or(z.literal('')),
  password: z.string().min(4),
});

const loginSchema = z.object({
  phone_no: z.string().min(11).max(11),
  password: z.string().min(4),
});

const updatePasswordSchema = z.object({
  phone_no: z.string().min(11).max(11),
  password: z.string().min(4),
});

module.exports = { registerSchema, loginSchema, updatePasswordSchema };
