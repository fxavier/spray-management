import { z } from 'zod'

export const sprayTypeEnum = z.enum(['PRINCIPAL', 'SECUNDARIA'])
export const reasonNotSprayedEnum = z.enum(['RECUSA', 'FECHADA', 'OUTRO'])
export const wallsTypeEnum = z.enum(['MATOPE', 'COLMO', 'CIMENTO'])
export const roofsTypeEnum = z.enum(['CAPIM_PLASTICO', 'ZINCO'])
export const sprayStatusEnum = z.enum(['PLANNED', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED'])

export const createSprayConfigurationSchema = z.object({
  year: z.number().int().min(2020, 'Ano deve ser 2020 ou posterior').max(2030, 'Ano deve ser até 2030'),
  provinceId: z.string().optional(),
  districtId: z.string().optional(),
  proposedSprayDays: z.number().int().min(1, 'Dias propostos deve ser pelo menos 1').max(365, 'Máximo 365 dias'),
  startDate: z.date().optional(),
  endDate: z.date().optional(),
  sprayRounds: z.number().int().min(1, 'Rondas deve ser pelo menos 1').max(5, 'Máximo 5 rondas').default(1),
  daysBetweenRounds: z.number().int().min(0, 'Dias entre rondas não pode ser negativo').default(0),
  description: z.string().max(500, 'Descrição muito longa').optional(),
  notes: z.string().max(1000, 'Notas muito longas').optional(),
  isActive: z.boolean().default(true),
}).refine((data) => {
  if (data.startDate && data.endDate) {
    return data.startDate <= data.endDate
  }
  return true
}, {
  message: 'Data de início deve ser anterior à data de fim',
  path: ['endDate'],
})

export const updateSprayConfigurationSchema = z.object({
  id: z.string().min(1, 'ID é obrigatório'),
  year: z.number().int().min(2020, 'Ano deve ser 2020 ou posterior').max(2030, 'Ano deve ser até 2030').optional(),
  provinceId: z.string().optional(),
  districtId: z.string().optional(),
  proposedSprayDays: z.number().int().min(1, 'Dias propostos deve ser pelo menos 1').max(365, 'Máximo 365 dias').optional(),
  startDate: z.date().optional(),
  endDate: z.date().optional(),
  sprayRounds: z.number().int().min(1, 'Rondas deve ser pelo menos 1').max(5, 'Máximo 5 rondas').optional(),
  daysBetweenRounds: z.number().int().min(0, 'Dias entre rondas não pode ser negativo').optional(),
  description: z.string().max(500, 'Descrição muito longa').optional(),
  notes: z.string().max(1000, 'Notas muito longas').optional(),
  isActive: z.boolean().optional(),
}).refine((data) => {
  if (data.startDate && data.endDate) {
    return data.startDate <= data.endDate
  }
  return true
}, {
  message: 'Data de início deve ser anterior à data de fim',
  path: ['endDate'],
})

export const createSprayTotalsSchema = z.object({
  sprayerId: z.string().min(1, 'Pulverizador é obrigatório'),
  brigadeChiefId: z.string().min(1, 'Chefe de brigada é obrigatório'),
  communityId: z.string().min(1, 'Comunidade é obrigatória'),
  sprayConfigurationId: z.string().optional(),
  sprayType: sprayTypeEnum,
  sprayDate: z.date(),
  sprayYear: z.number().int().min(2020, 'Ano deve ser 2020 ou posterior').max(2030, 'Ano deve ser até 2030'),
  sprayRound: z.number().int().min(1, 'Ronda deve ser pelo menos 1').max(5, 'Máximo 5 rondas').default(1),
  sprayStatus: sprayStatusEnum.default('PLANNED'),
  insecticideUsed: z.string().min(2, 'Insecticida é obrigatório').max(100, 'Nome do insecticida muito longo'),
  structuresFound: z.number().int().min(0, 'Estruturas encontradas não pode ser negativo'),
  structuresSprayed: z.number().int().min(0, 'Estruturas pulverizadas não pode ser negativo'),
  compartmentsSprayed: z.number().int().min(0, 'Compartimentos pulverizados não pode ser negativo'),
  reasonNotSprayed: reasonNotSprayedEnum.optional(),
  wallsType: wallsTypeEnum,
  roofsType: roofsTypeEnum,
  numberOfPersons: z.number().int().min(0, 'Número de pessoas não pode ser negativo'),
  childrenUnder5: z.number().int().min(0, 'Crianças menores de 5 anos não pode ser negativo'),
  pregnantWomen: z.number().int().min(0, 'Mulheres grávidas não pode ser negativo'),
}).refine((data) => {
  return data.structuresSprayed <= data.structuresFound
}, {
  message: 'Estruturas pulverizadas não pode ser maior que estruturas encontradas',
  path: ['structuresSprayed'],
}).refine((data) => {
  return data.childrenUnder5 <= data.numberOfPersons
}, {
  message: 'Crianças menores de 5 anos não pode ser maior que número total de pessoas',
  path: ['childrenUnder5'],
}).refine((data) => {
  return data.pregnantWomen <= data.numberOfPersons
}, {
  message: 'Mulheres grávidas não pode ser maior que número total de pessoas',
  path: ['pregnantWomen'],
})

export const updateSprayTotalsSchema = z.object({
  id: z.string().min(1, 'ID é obrigatório'),
  sprayerId: z.string().min(1, 'Pulverizador é obrigatório').optional(),
  brigadeChiefId: z.string().min(1, 'Chefe de brigada é obrigatório').optional(),
  communityId: z.string().min(1, 'Comunidade é obrigatória').optional(),
  sprayConfigurationId: z.string().optional(),
  sprayType: sprayTypeEnum.optional(),
  sprayDate: z.date().optional(),
  sprayYear: z.number().int().min(2020, 'Ano deve ser 2020 ou posterior').max(2030, 'Ano deve ser até 2030').optional(),
  sprayRound: z.number().int().min(1, 'Ronda deve ser pelo menos 1').max(5, 'Máximo 5 rondas').optional(),
  sprayStatus: sprayStatusEnum.optional(),
  insecticideUsed: z.string().min(2, 'Insecticida é obrigatório').max(100, 'Nome do insecticida muito longo').optional(),
  structuresFound: z.number().int().min(0, 'Estruturas encontradas não pode ser negativo').optional(),
  structuresSprayed: z.number().int().min(0, 'Estruturas pulverizadas não pode ser negativo').optional(),
  compartmentsSprayed: z.number().int().min(0, 'Compartimentos pulverizados não pode ser negativo').optional(),
  reasonNotSprayed: reasonNotSprayedEnum.optional(),
  wallsType: wallsTypeEnum.optional(),
  roofsType: roofsTypeEnum.optional(),
  numberOfPersons: z.number().int().min(0, 'Número de pessoas não pode ser negativo').optional(),
  childrenUnder5: z.number().int().min(0, 'Crianças menores de 5 anos não pode ser negativo').optional(),
  pregnantWomen: z.number().int().min(0, 'Mulheres grávidas não pode ser negativo').optional(),
}).refine((data) => {
  if (data.structuresSprayed !== undefined && data.structuresFound !== undefined) {
    return data.structuresSprayed <= data.structuresFound
  }
  return true
}, {
  message: 'Estruturas pulverizadas não pode ser maior que estruturas encontradas',
  path: ['structuresSprayed'],
}).refine((data) => {
  if (data.childrenUnder5 !== undefined && data.numberOfPersons !== undefined) {
    return data.childrenUnder5 <= data.numberOfPersons
  }
  return true
}, {
  message: 'Crianças menores de 5 anos não pode ser maior que número total de pessoas',
  path: ['childrenUnder5'],
}).refine((data) => {
  if (data.pregnantWomen !== undefined && data.numberOfPersons !== undefined) {
    return data.pregnantWomen <= data.numberOfPersons
  }
  return true
}, {
  message: 'Mulheres grávidas não pode ser maior que número total de pessoas',
  path: ['pregnantWomen'],
})

export type CreateSprayConfigurationInput = z.infer<typeof createSprayConfigurationSchema>
export type UpdateSprayConfigurationInput = z.infer<typeof updateSprayConfigurationSchema>
export type CreateSprayTotalsInput = z.infer<typeof createSprayTotalsSchema>
export type UpdateSprayTotalsInput = z.infer<typeof updateSprayTotalsSchema>