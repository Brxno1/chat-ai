'use server'

import { type User } from 'next-auth'

import { errorHandler } from '@/app/api/chat/utils/error-handler'
import { auth } from '@/services/auth'
import { prisma } from '@/services/database/prisma'

import { uploadImage } from './upload-image'

type ProfileUpdateData = {
  name: string
  bio: string
  avatar?: File | null
  background?: File | null
}

type EditProfileResponse = {
  user: User
  error?: string | null
}

export async function updateProfile(
  data: ProfileUpdateData,
): Promise<EditProfileResponse> {
  const session = await auth()

  if (!session?.user) {
    return {
      error: 'User not authenticated',
      user: {} as User,
    }
  }

  const { user } = session

  try {
    const updateData: Record<string, unknown> = {}

    if (data.name) updateData.name = data.name
    if (data.bio) updateData.bio = data.bio

    if (data.avatar) {
      try {
        updateData.image = await uploadImage(user.id, data.avatar, 'avatar')
      } catch (error) {
        return {
          error: errorHandler(error),
          user,
        }
      }
    }

    if (data.background) {
      try {
        updateData.background = await uploadImage(
          user.id,
          data.background,
          'background',
        )
      } catch (error) {
        return {
          error: errorHandler(error),
          user,
        }
      }
    }

    if (Object.keys(updateData).length > 0) {
      const updatedUser = await prisma.user.update({
        where: { id: user.id },
        data: updateData,
      })

      return {
        error: null,
        user: updatedUser,
      }
    }

    return {
      error: null,
      user,
    }
  } catch (error) {
    return {
      user,
      error: errorHandler(error),
    }
  }
}
