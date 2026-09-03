-- CreateEnum
CREATE TYPE "TipoCliente" AS ENUM ('PESSOA_FISICA', 'EMPRESA');

-- CreateTable
CREATE TABLE "clients" (
    "id" TEXT NOT NULL,
    "nome" TEXT NOT NULL,
    "telefone" TEXT NOT NULL,
    "documento" TEXT,
    "tipo" "TipoCliente" NOT NULL,
    "estado" "Estado" NOT NULL DEFAULT 'ATIVO',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "clients_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "clients_documento_key" ON "clients"("documento");
