const { z } = require('zod');

const geoSchema = z.object({
  city:      z.string().max(200).optional().default(''),
  latitude:  z.number().nullable().optional().default(null),
  longitude: z.number().nullable().optional().default(null),
}).optional();

const registerSchema = z.object({
  name: z.string().optional(),
  phone_no: z.string().min(11).max(11),
  email: z.string().email().optional().or(z.literal('')),
  password: z.string().min(4),
  platform: z.enum(['android', 'ios', 'web', 'unknown']).optional(),
  device: z.string().max(200).optional(),
  geo: geoSchema,
});

const loginSchema = z.object({
  phone_no: z.string().min(11).max(11),
  password: z.string().min(4),
  platform: z.enum(['android', 'ios', 'web', 'unknown']).optional(),
  device: z.string().max(200).optional(),
  geo: geoSchema,
});

const updatePasswordSchema = z.object({
  phone_no: z.string().min(11).max(11),
  password: z.string().min(4),
});

const changePasswordSchema = z.object({
  current_password: z.string().min(1),
  password: z.string().min(4),
});

module.exports = { registerSchema, loginSchema, updatePasswordSchema, changePasswordSchema };
