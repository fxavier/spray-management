import { z } from 'zod'

export const createSprayTotalsSchema = z.object({
  sprayerId: z.string().min(1, 'Pulverizador é obrigatório'),
  brigadeChiefId: z.string().min(1, 'Chefe de brigada é obrigatório'),
  communityId: z.string().min(1, 'Comunidade é obrigatória'),
  sprayConfigurationId: z.string().optional().nullable(),
  sprayType: z.enum(['PRINCIPAL', 'SECUNDARIA'], {
    required_error: 'Tipo de pulverização é obrigatório',
  }),
  sprayDate: z.string().min(1, 'Data de pulverização é obrigatória'),
  sprayYear: z.number().int().min(2020).max(2050),
  sprayRound: z.number().int().min(1).default(1),
  sprayStatus: z.enum(['PLANNED', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED']).default('PLANNED'),
  insecticideUsed: z.string().min(1, 'Inseticida usado é obrigatório'),
  structuresFound: z.number().int().min(0).default(0),
  structuresSprayed: z.number().int().min(0).default(0),
  structuresNotSprayed: z.number().int().min(0).default(0),
  compartmentsSprayed: z.number().int().min(0).default(0),
  reasonNotSprayed: z.enum(['RECUSA', 'FECHADA', 'OUTRO']).optional().nullable(),
  wallsType: z.enum(['MATOPE', 'COLMO', 'CIMENTO'], {
    required_error: 'Tipo de paredes é obrigatório',
  }),
  roofsType: z.enum(['CAPIM_PLASTICO', 'ZINCO'], {
    required_error: 'Tipo de tetos é obrigatório',
  }),
  numberOfPersons: z.number().int().min(0).default(0),
  childrenUnder5: z.number().int().min(0).default(0),
  pregnantWomen: z.number().int().min(0).default(0),
})

export const updateSprayTotalsSchema = z.object({
  id: z.string(),
  sprayerId: z.string().optional(),
  brigadeChiefId: z.string().optional(),
  communityId: z.string().optional(),
  sprayConfigurationId: z.string().optional().nullable(),
  sprayType: z.enum(['PRINCIPAL', 'SECUNDARIA']).optional(),
  sprayDate: z.string().optional(),
  sprayYear: z.number().int().min(2020).max(2050).optional(),
  sprayRound: z.number().int().min(1).optional(),
  sprayStatus: z.enum(['PLANNED', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED']).optional(),
  insecticideUsed: z.string().optional(),
  structuresFound: z.number().int().min(0).optional(),
  structuresSprayed: z.number().int().min(0).optional(),
  structuresNotSprayed: z.number().int().min(0).optional(),
  compartmentsSprayed: z.number().int().min(0).optional(),
  reasonNotSprayed: z.enum(['RECUSA', 'FECHADA', 'OUTRO']).optional().nullable(),
  wallsType: z.enum(['MATOPE', 'COLMO', 'CIMENTO']).optional(),
  roofsType: z.enum(['CAPIM_PLASTICO', 'ZINCO']).optional(),
  numberOfPersons: z.number().int().min(0).optional(),
  childrenUnder5: z.number().int().min(0).optional(),
  pregnantWomen: z.number().int().min(0).optional(),
})

export type CreateSprayTotalsInput = z.infer<typeof createSprayTotalsSchema>
export type UpdateSprayTotalsInput = z.infer<typeof updateSprayTotalsSchema>