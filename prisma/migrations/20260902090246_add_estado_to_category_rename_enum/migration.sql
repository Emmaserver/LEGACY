/*
  Warnings:

  - The `estado` column on the `products` table would be dropped and recreated. This will lead to data loss if there is data in the column.

*/
-- CreateEnum
CREATE TYPE "Estado" AS ENUM ('ATIVO', 'INATIVO');

-- AlterTable
ALTER TABLE "categories" ADD COLUMN     "estado" "Estado" NOT NULL DEFAULT 'ATIVO';

-- AlterTable
ALTER TABLE "products" DROP COLUMN "estado",
ADD COLUMN     "estado" "Estado" NOT NULL DEFAULT 'ATIVO';

-- DropEnum
DROP TYPE "EstadoProduto";
