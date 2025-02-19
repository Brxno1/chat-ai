/*
  Warnings:

  - The primary key for the `Authenticator` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `credentialBackedUp` on the `Authenticator` table. All the data in the column will be lost.
  - You are about to drop the column `credentialDeviceType` on the `Authenticator` table. All the data in the column will be lost.
  - You are about to drop the column `credentialID` on the `Authenticator` table. All the data in the column will be lost.
  - You are about to drop the column `credentialPublicKey` on the `Authenticator` table. All the data in the column will be lost.
  - You are about to drop the column `providerAccountId` on the `Authenticator` table. All the data in the column will be lost.
  - You are about to drop the column `userId` on the `Authenticator` table. All the data in the column will be lost.
  - You are about to drop the column `createdAt` on the `Session` table. All the data in the column will be lost.
  - You are about to drop the column `sessionToken` on the `Session` table. All the data in the column will be lost.
  - You are about to drop the column `updatedAt` on the `Session` table. All the data in the column will be lost.
  - You are about to drop the column `userId` on the `Session` table. All the data in the column will be lost.
  - You are about to drop the column `createdAt` on the `accounts` table. All the data in the column will be lost.
  - You are about to drop the column `providerAccountId` on the `accounts` table. All the data in the column will be lost.
  - You are about to drop the column `updatedAt` on the `accounts` table. All the data in the column will be lost.
  - You are about to drop the column `userId` on the `accounts` table. All the data in the column will be lost.
  - You are about to drop the column `createdAt` on the `todos` table. All the data in the column will be lost.
  - You are about to drop the column `updatedAt` on the `todos` table. All the data in the column will be lost.
  - You are about to drop the column `userId` on the `todos` table. All the data in the column will be lost.
  - You are about to drop the column `createdAt` on the `users` table. All the data in the column will be lost.
  - You are about to drop the column `emailVerified` on the `users` table. All the data in the column will be lost.
  - You are about to drop the column `updatedAt` on the `users` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[credential_id]` on the table `Authenticator` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[session_token]` on the table `Session` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[provider,provider_account_id]` on the table `accounts` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `credential_backed_up` to the `Authenticator` table without a default value. This is not possible if the table is not empty.
  - Added the required column `credential_device_type` to the `Authenticator` table without a default value. This is not possible if the table is not empty.
  - Added the required column `credential_id` to the `Authenticator` table without a default value. This is not possible if the table is not empty.
  - Added the required column `credential_public_key` to the `Authenticator` table without a default value. This is not possible if the table is not empty.
  - Added the required column `provider_account_id` to the `Authenticator` table without a default value. This is not possible if the table is not empty.
  - Added the required column `user_id` to the `Authenticator` table without a default value. This is not possible if the table is not empty.
  - Added the required column `session_token` to the `Session` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updated_at` to the `Session` table without a default value. This is not possible if the table is not empty.
  - Added the required column `user_id` to the `Session` table without a default value. This is not possible if the table is not empty.
  - Added the required column `provider_account_id` to the `accounts` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updated_at` to the `accounts` table without a default value. This is not possible if the table is not empty.
  - Added the required column `user_id` to the `accounts` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updated_at` to the `todos` table without a default value. This is not possible if the table is not empty.
  - Added the required column `user_id` to the `todos` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updated_at` to the `users` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "Authenticator" DROP CONSTRAINT "Authenticator_userId_fkey";

-- DropForeignKey
ALTER TABLE "Session" DROP CONSTRAINT "Session_userId_fkey";

-- DropForeignKey
ALTER TABLE "accounts" DROP CONSTRAINT "accounts_userId_fkey";

-- DropForeignKey
ALTER TABLE "todos" DROP CONSTRAINT "todos_userId_fkey";

-- DropIndex
DROP INDEX "Authenticator_credentialID_key";

-- DropIndex
DROP INDEX "Session_sessionToken_key";

-- DropIndex
DROP INDEX "accounts_provider_providerAccountId_key";

-- AlterTable
ALTER TABLE "Authenticator" DROP CONSTRAINT "Authenticator_pkey",
DROP COLUMN "credentialBackedUp",
DROP COLUMN "credentialDeviceType",
DROP COLUMN "credentialID",
DROP COLUMN "credentialPublicKey",
DROP COLUMN "providerAccountId",
DROP COLUMN "userId",
ADD COLUMN     "credential_backed_up" BOOLEAN NOT NULL,
ADD COLUMN     "credential_device_type" TEXT NOT NULL,
ADD COLUMN     "credential_id" TEXT NOT NULL,
ADD COLUMN     "credential_public_key" TEXT NOT NULL,
ADD COLUMN     "provider_account_id" TEXT NOT NULL,
ADD COLUMN     "user_id" TEXT NOT NULL,
ADD CONSTRAINT "Authenticator_pkey" PRIMARY KEY ("user_id", "credential_id");

-- AlterTable
ALTER TABLE "Session" DROP COLUMN "createdAt",
DROP COLUMN "sessionToken",
DROP COLUMN "updatedAt",
DROP COLUMN "userId",
ADD COLUMN     "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "session_token" TEXT NOT NULL,
ADD COLUMN     "updated_at" TIMESTAMP(3) NOT NULL,
ADD COLUMN     "user_id" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "accounts" DROP COLUMN "createdAt",
DROP COLUMN "providerAccountId",
DROP COLUMN "updatedAt",
DROP COLUMN "userId",
ADD COLUMN     "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "provider_account_id" TEXT NOT NULL,
ADD COLUMN     "updated_at" TIMESTAMP(3) NOT NULL,
ADD COLUMN     "user_id" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "todos" DROP COLUMN "createdAt",
DROP COLUMN "updatedAt",
DROP COLUMN "userId",
ADD COLUMN     "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "updated_at" TIMESTAMP(3) NOT NULL,
ADD COLUMN     "user_id" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "users" DROP COLUMN "createdAt",
DROP COLUMN "emailVerified",
DROP COLUMN "updatedAt",
ADD COLUMN     "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "email_verified" TIMESTAMP(3),
ADD COLUMN     "updated_at" TIMESTAMP(3) NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "Authenticator_credential_id_key" ON "Authenticator"("credential_id");

-- CreateIndex
CREATE UNIQUE INDEX "Session_session_token_key" ON "Session"("session_token");

-- CreateIndex
CREATE UNIQUE INDEX "accounts_provider_provider_account_id_key" ON "accounts"("provider", "provider_account_id");

-- AddForeignKey
ALTER TABLE "todos" ADD CONSTRAINT "todos_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "accounts" ADD CONSTRAINT "accounts_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Session" ADD CONSTRAINT "Session_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Authenticator" ADD CONSTRAINT "Authenticator_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
