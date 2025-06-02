import { z } from 'zod'

export const createActorSchema = z.object({
  name: z.string().min(2, 'Nome deve ter pelo menos 2 caracteres').max(100, 'Nome muito longo'),
  description: z.string().max(500, 'Descrição muito longa').optional(),
  number: z.string()
    .regex(/^[A-Z0-9-]*$/, 'Número deve conter apenas letras maiúsculas, números e hífens')
    .max(20, 'Número muito longo')
    .optional(),
  actorTypeId: z.string().min(1, 'Tipo de actor é obrigatório'),
  isActive: z.boolean().optional().default(true),
})

export const updateActorSchema = z.object({
  id: z.string().min(1, 'ID é obrigatório'),
  name: z.string().min(2, 'Nome deve ter pelo menos 2 caracteres').max(100, 'Nome muito longo').optional(),
  description: z.string().max(500, 'Descrição muito longa').optional(),
  number: z.string()
    .regex(/^[A-Z0-9-]*$/, 'Número deve conter apenas letras maiúsculas, números e hífens')
    .max(20, 'Número muito longo')
    .optional(),
  actorTypeId: z.string().min(1, 'Tipo de actor é obrigatório').optional(),
  isActive: z.boolean().optional(),
})

export const createActorTypeSchema = z.object({
  name: z.string().min(2, 'Nome deve ter pelo menos 2 caracteres').max(50, 'Nome muito longo'),
  number: z.number().int().positive('Número deve ser positivo'),
})

export const updateActorTypeSchema = z.object({
  id: z.string().min(1, 'ID é obrigatório'),
  name: z.string().min(2, 'Nome deve ter pelo menos 2 caracteres').max(50, 'Nome muito longo').optional(),
  number: z.number().int().positive('Número deve ser positivo').optional(),
})

export type CreateActorInput = z.infer<typeof createActorSchema>
export type UpdateActorInput = z.infer<typeof updateActorSchema>
export type CreateActorTypeInput = z.infer<typeof createActorTypeSchema>
export type UpdateActorTypeInput = z.infer<typeof updateActorTypeSchema>