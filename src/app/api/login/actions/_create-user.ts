'use server'

import { createAccountSchema } from '@/schemas'

import { createUserAndSendMagicLink } from './login'

export type FormState =
  | {
      errors?: {
        name?: string[]
        email?: string[]
        avatar?: string[]
      }
      message?: string
    }
  | undefined

export async function createUser(state: FormState, formData: FormData) {
  const validatedFields = createAccountSchema.safeParse({
    name: formData.get('name'),
    email: formData.get('email'),
    avatar: formData.get('avatar'),
  })

  if (validatedFields.error) {
    return {
      errors: validatedFields.error.flatten().fieldErrors,
    }
  }

  const { name, email, avatar } = validatedFields.data

  const { user, error, userExists } = await createUserAndSendMagicLink({
    name,
    email,
    avatar,
  })

  if (error) {
    return {
      errors: { email: [error] },
    }
  }

  if (userExists) {
    return {
      errors: { email: ['Email já cadastrado'] },
    }
  }

  return {
    user,
    error: null,
  }
}
