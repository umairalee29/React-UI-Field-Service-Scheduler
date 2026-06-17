import { z } from 'zod';

export const createJobSchema = z.object({
  title: z.string().min(3, 'Title must be at least 3 characters').max(100),
  description: z.string().min(10, 'Description must be at least 10 characters').max(2000),
  type: z.enum(['installation', 'maintenance', 'repair', 'inspection', 'emergency']),
  priority: z.enum(['low', 'medium', 'high', 'critical']),
  scheduledAt: z.string().datetime({ offset: true }).or(z.string().min(1)),
  estimatedDuration: z.number().int().min(15).max(480),
  customer: z.object({
    name: z.string().min(2).max(100),
    phone: z.string().min(7).max(20),
    email: z.string().email(),
    address: z.object({
      street: z.string().min(3).max(200),
      city: z.string().min(2).max(100),
      postCode: z.string().min(3).max(10),
      country: z.string().min(2).max(100),
    }),
  }),
  location: z.object({
    type: z.literal('Point'),
    coordinates: z.tuple([z.number(), z.number()]),
  }),
  technicianId: z.string().optional(),
  notes: z.string().max(2000).optional().default(''),
});

export const assignJobSchema = z.object({
  technicianId: z.string().min(1, 'Technician ID is required'),
});

export const updateStatusSchema = z.object({
  status: z.enum(['unassigned', 'assigned', 'in_progress', 'on_hold', 'completed', 'cancelled']),
  note: z.string().max(500).optional().default(''),
  actualDuration: z.number().int().min(1).optional(),
  completionNotes: z.string().max(2000).optional(),
});

export const locationPingSchema = z.object({
  coordinates: z.tuple([z.number(), z.number()]),
  accuracy: z.number().min(0).max(1000),
});

export const createUserSchema = z.object({
  name: z.string().min(2).max(100),
  email: z.string().email(),
  password: z.string().min(6).max(100),
  role: z.enum(['admin', 'dispatcher', 'technician']),
  phone: z.string().min(7).max(20).optional(),
  skills: z.array(z.string()).optional().default([]),
  isAvailable: z.boolean().optional().default(true),
});

export const updateUserSchema = z.object({
  name: z.string().min(2).max(100).optional(),
  role: z.enum(['admin', 'dispatcher', 'technician']).optional(),
  phone: z.string().min(7).max(20).optional(),
  isAvailable: z.boolean().optional(),
  isActive: z.boolean().optional(),
  skills: z.array(z.string()).optional(),
});

export type CreateJobInput = z.infer<typeof createJobSchema>;
export type AssignJobInput = z.infer<typeof assignJobSchema>;
export type UpdateStatusInput = z.infer<typeof updateStatusSchema>;
export type LocationPingInput = z.infer<typeof locationPingSchema>;
export type CreateUserInput = z.infer<typeof createUserSchema>;
export type UpdateUserInput = z.infer<typeof updateUserSchema>;
