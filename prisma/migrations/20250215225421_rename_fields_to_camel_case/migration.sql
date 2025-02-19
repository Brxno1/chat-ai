/*
  Warnings:

  - The primary key for the `Authenticator` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `credential_backed_up` on the `Authenticator` table. All the data in the column will be lost.
  - You are about to drop the column `credential_device_type` on the `Authenticator` table. All the data in the column will be lost.
  - You are about to drop the column `credential_id` on the `Authenticator` table. All the data in the column will be lost.
  - You are about to drop the column `credential_public_key` on the `Authenticator` table. All the data in the column will be lost.
  - You are about to drop the column `provider_account_id` on the `Authenticator` table. All the data in the column will be lost.
  - You are about to drop the column `user_id` on the `Authenticator` table. All the data in the column will be lost.
  - You are about to drop the column `created_at` on the `Session` table. All the data in the column will be lost.
  - You are about to drop the column `session_token` on the `Session` table. All the data in the column will be lost.
  - You are about to drop the column `updated_at` on the `Session` table. All the data in the column will be lost.
  - You are about to drop the column `user_id` on the `Session` table. All the data in the column will be lost.
  - You are about to drop the column `created_at` on the `accounts` table. All the data in the column will be lost.
  - You are about to drop the column `provider_account_id` on the `accounts` table. All the data in the column will be lost.
  - You are about to drop the column `updated_at` on the `accounts` table. All the data in the column will be lost.
  - You are about to drop the column `user_id` on the `accounts` table. All the data in the column will be lost.
  - You are about to drop the column `created_at` on the `todos` table. All the data in the column will be lost.
  - You are about to drop the column `updated_at` on the `todos` table. All the data in the column will be lost.
  - You are about to drop the column `user_id` on the `todos` table. All the data in the column will be lost.
  - You are about to drop the column `created_at` on the `users` table. All the data in the column will be lost.
  - You are about to drop the column `email_verified` on the `users` table. All the data in the column will be lost.
  - You are about to drop the column `updated_at` on the `users` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[credentialID]` on the table `Authenticator` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[sessionToken]` on the table `Session` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[provider,providerAccountId]` on the table `accounts` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `credentialBackedUp` to the `Authenticator` table without a default value. This is not possible if the table is not empty.
  - Added the required column `credentialDeviceType` to the `Authenticator` table without a default value. This is not possible if the table is not empty.
  - Added the required column `credentialID` to the `Authenticator` table without a default value. This is not possible if the table is not empty.
  - Added the required column `credentialPublicKey` to the `Authenticator` table without a default value. This is not possible if the table is not empty.
  - Added the required column `providerAccountId` to the `Authenticator` table without a default value. This is not possible if the table is not empty.
  - Added the required column `userId` to the `Authenticator` table without a default value. This is not possible if the table is not empty.
  - Added the required column `sessionToken` to the `Session` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updatedAt` to the `Session` table without a default value. This is not possible if the table is not empty.
  - Added the required column `userId` to the `Session` table without a default value. This is not possible if the table is not empty.
  - Added the required column `providerAccountId` to the `accounts` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updatedAt` to the `accounts` table without a default value. This is not possible if the table is not empty.
  - Added the required column `userId` to the `accounts` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updatedAt` to the `todos` table without a default value. This is not possible if the table is not empty.
  - Added the required column `userId` to the `todos` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updatedAt` to the `users` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "Authenticator" DROP CONSTRAINT "Authenticator_user_id_fkey";

-- DropForeignKey
ALTER TABLE "Session" DROP CONSTRAINT "Session_user_id_fkey";

-- DropForeignKey
ALTER TABLE "accounts" DROP CONSTRAINT "accounts_user_id_fkey";

-- DropForeignKey
ALTER TABLE "todos" DROP CONSTRAINT "todos_user_id_fkey";

-- DropIndex
DROP INDEX "Authenticator_credential_id_key";

-- DropIndex
DROP INDEX "Session_session_token_key";

-- DropIndex
DROP INDEX "accounts_provider_provider_account_id_key";

-- AlterTable
ALTER TABLE "Authenticator" DROP CONSTRAINT "Authenticator_pkey",
DROP COLUMN "credential_backed_up",
DROP COLUMN "credential_device_type",
DROP COLUMN "credential_id",
DROP COLUMN "credential_public_key",
DROP COLUMN "provider_account_id",
DROP COLUMN "user_id",
ADD COLUMN     "credentialBackedUp" BOOLEAN NOT NULL,
ADD COLUMN     "credentialDeviceType" TEXT NOT NULL,
ADD COLUMN     "credentialID" TEXT NOT NULL,
ADD COLUMN     "credentialPublicKey" TEXT NOT NULL,
ADD COLUMN     "providerAccountId" TEXT NOT NULL,
ADD COLUMN     "userId" TEXT NOT NULL,
ADD CONSTRAINT "Authenticator_pkey" PRIMARY KEY ("userId", "credentialID");

-- AlterTable
ALTER TABLE "Session" DROP COLUMN "created_at",
DROP COLUMN "session_token",
DROP COLUMN "updated_at",
DROP COLUMN "user_id",
ADD COLUMN     "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "sessionToken" TEXT NOT NULL,
ADD COLUMN     "updatedAt" TIMESTAMP(3) NOT NULL,
ADD COLUMN     "userId" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "accounts" DROP COLUMN "created_at",
DROP COLUMN "provider_account_id",
DROP COLUMN "updated_at",
DROP COLUMN "user_id",
ADD COLUMN     "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "providerAccountId" TEXT NOT NULL,
ADD COLUMN     "updatedAt" TIMESTAMP(3) NOT NULL,
ADD COLUMN     "userId" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "todos" DROP COLUMN "created_at",
DROP COLUMN "updated_at",
DROP COLUMN "user_id",
ADD COLUMN     "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "updatedAt" TIMESTAMP(3) NOT NULL,
ADD COLUMN     "userId" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "users" DROP COLUMN "created_at",
DROP COLUMN "email_verified",
DROP COLUMN "updated_at",
ADD COLUMN     "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "emailVerified" TIMESTAMP(3),
ADD COLUMN     "updatedAt" TIMESTAMP(3) NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "Authenticator_credentialID_key" ON "Authenticator"("credentialID");

-- CreateIndex
CREATE UNIQUE INDEX "Session_sessionToken_key" ON "Session"("sessionToken");

-- CreateIndex
CREATE UNIQUE INDEX "accounts_provider_providerAccountId_key" ON "accounts"("provider", "providerAccountId");

-- AddForeignKey
ALTER TABLE "todos" ADD CONSTRAINT "todos_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "accounts" ADD CONSTRAINT "accounts_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Session" ADD CONSTRAINT "Session_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Authenticator" ADD CONSTRAINT "Authenticator_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
