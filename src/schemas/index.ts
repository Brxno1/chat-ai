import { z } from 'zod'

const MAX_SIZE = 1 * 1024 * 1024 // 10MB

export const editProfileSchema = z.object({
  name: z
    .string()
    .nonempty('O nome não pode estar vazio')
    .min(3, 'Nome deve ter no mínimo 3 carácteres'),
  bio: z.string().max(180, 'Biografia deve ter no máximo 180 carácteres'),
  avatar: z.union([
    z
      .instanceof(File, { message: 'Por favor, selecione um arquivo válido' })
      .refine(
        (file) => file.size <= MAX_SIZE,
        `O avatar deve ter no máximo 10MB`,
      ),
    z.null(),
    z.undefined(),
  ]),
  background: z.union([
    z
      .instanceof(File, { message: 'Por favor, selecione um arquivo válido' })
      .refine(
        (file) => file.size <= MAX_SIZE,
        `O fundo deve ter no máximo 10MB`,
      ),
    z.null(),
    z.undefined(),
  ]),
})

export const accountSchema = z.object({
  name: z
    .string()
    .nonempty('O nome não pode estar vazio')
    .min(3, 'Nome deve ter no mínimo 3 carácteres'),
  email: z
    .string()
    .nonempty('O email não pode estar vazio')
    .email('Insira um email válido'),
  avatar: z.union([
    z
      .instanceof(File, { message: 'Por favor, selecione um arquivo válido' })
      .refine(
        (file) => file.size <= MAX_SIZE,
        `O avatar deve ter no máximo 10MB`,
      ),
    z.null(),
    z.undefined(),
  ]),
})

export const loginSchema = z.object({
  email: z
    .string()
    .nonempty('O email não pode estar vazio')
    .email('Insira um email válido'),
})
