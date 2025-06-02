import { z } from 'zod'

export const createProvinceSchema = z.object({
  name: z.string().min(2, 'Nome deve ter pelo menos 2 caracteres').max(100, 'Nome muito longo'),
  code: z.string().max(10, 'Código muito longo').optional(),
})

export const updateProvinceSchema = z.object({
  id: z.string().min(1, 'ID é obrigatório'),
  name: z.string().min(2, 'Nome deve ter pelo menos 2 caracteres').max(100, 'Nome muito longo').optional(),
  code: z.string().max(10, 'Código muito longo').optional(),
})

export const createDistrictSchema = z.object({
  name: z.string().min(2, 'Nome deve ter pelo menos 2 caracteres').max(100, 'Nome muito longo'),
  code: z.string().max(10, 'Código muito longo').optional(),
  provinceId: z.string().min(1, 'Província é obrigatória'),
})

export const updateDistrictSchema = z.object({
  id: z.string().min(1, 'ID é obrigatório'),
  name: z.string().min(2, 'Nome deve ter pelo menos 2 caracteres').max(100, 'Nome muito longo').optional(),
  code: z.string().max(10, 'Código muito longo').optional(),
  provinceId: z.string().min(1, 'Província é obrigatória').optional(),
})

export const createLocalitySchema = z.object({
  name: z.string().min(2, 'Nome deve ter pelo menos 2 caracteres').max(100, 'Nome muito longo'),
  districtId: z.string().min(1, 'Distrito é obrigatório'),
})

export const updateLocalitySchema = z.object({
  id: z.string().min(1, 'ID é obrigatório'),
  name: z.string().min(2, 'Nome deve ter pelo menos 2 caracteres').max(100, 'Nome muito longo').optional(),
  districtId: z.string().min(1, 'Distrito é obrigatório').optional(),
})

export const createCommunitySchema = z.object({
  name: z.string().min(2, 'Nome deve ter pelo menos 2 caracteres').max(100, 'Nome muito longo'),
  localityId: z.string().min(1, 'Localidade é obrigatória'),
})

export const updateCommunitySchema = z.object({
  id: z.string().min(1, 'ID é obrigatório'),
  name: z.string().min(2, 'Nome deve ter pelo menos 2 caracteres').max(100, 'Nome muito longo').optional(),
  localityId: z.string().min(1, 'Localidade é obrigatória').optional(),
})

export type CreateProvinceInput = z.infer<typeof createProvinceSchema>
export type UpdateProvinceInput = z.infer<typeof updateProvinceSchema>
export type CreateDistrictInput = z.infer<typeof createDistrictSchema>
export type UpdateDistrictInput = z.infer<typeof updateDistrictSchema>
export type CreateLocalityInput = z.infer<typeof createLocalitySchema>
export type UpdateLocalityInput = z.infer<typeof updateLocalitySchema>
export type CreateCommunityInput = z.infer<typeof createCommunitySchema>
export type UpdateCommunityInput = z.infer<typeof updateCommunitySchema>