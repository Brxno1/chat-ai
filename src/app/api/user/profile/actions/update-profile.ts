'use server'

import { User } from 'next-auth'

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
  error?: Error | null
}

export async function updateProfile(
  data: ProfileUpdateData,
): Promise<EditProfileResponse> {
  const session = await auth()

  if (!session?.user) {
    return {
      error: new Error('User not authenticated'),
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
        updateData.image = await uploadImage(data.avatar, user.id, 'avatar')
      } catch (error) {
        return {
          error: error instanceof Error ? error : new Error(String(error)),
          user,
        }
      }
    }

    if (data.background) {
      try {
        updateData.background = await uploadImage(
          data.background,
          user.id,
          'background',
        )
      } catch (error) {
        return {
          error: error instanceof Error ? error : new Error(String(error)),
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
    console.error('Error in updateProfile:', error)
    return {
      error:
        error instanceof Error ? error : new Error('Internal server error'),
      user,
    }
  }
}
