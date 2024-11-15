import { z } from 'zod';

export const signupSchema = z.object({
  email: z.string().email(),
  password: z
    .string()
    .min(8)
    .regex(
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/,
      'Password must contain uppercase, lowercase, number, and special character'
    ),
  fullName: z.string().min(2),
  username: z.string().min(3),
  phoneNumber: z
    .string()
    .regex(/^\+?[1-9]\d{1,14}$/, 'Invalid phone number'),
  dateOfBirth: z.string().refine((date) => {
    const age = Math.floor(
      (Date.now() - new Date(date).getTime()) / (1000 * 60 * 60 * 24 * 365.25)
    );
    return age >= 13;
  }, 'Must be at least 13 years old'),
});

export const postSchema = z.object({
  caption: z.string().max(2200),
  image: z
    .instanceof(File)
    .refine((file) => file.size <= 5000000, 'File size must be less than 5MB')
    .refine(
      (file) => ['image/jpeg', 'image/png', 'image/webp'].includes(file.type),
      'Only .jpg, .png, and .webp formats are supported'
    ),
});