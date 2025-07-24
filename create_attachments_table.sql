-- Criação da tabela attachments que está faltando no banco de dados
CREATE TABLE IF NOT EXISTS "public"."attachments" (
    "id" TEXT NOT NULL,
    "url" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "contentType" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "messageId" TEXT NOT NULL,

    CONSTRAINT "attachments_pkey" PRIMARY KEY ("id")
);

-- Criação do índice de chave estrangeira
CREATE INDEX IF NOT EXISTS "attachments_messageId_idx" ON "public"."attachments"("messageId");

-- Adição da constraint de chave estrangeira
ALTER TABLE "public"."attachments" 
ADD CONSTRAINT "attachments_messageId_fkey" 
FOREIGN KEY ("messageId") REFERENCES "public"."messages"("id") ON DELETE CASCADE ON UPDATE CASCADE;