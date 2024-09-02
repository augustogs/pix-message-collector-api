/*
  Warnings:

  - You are about to drop the `ActiveStream` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `InteractionLog` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `PixMessage` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropTable
DROP TABLE "ActiveStream";

-- DropTable
DROP TABLE "InteractionLog";

-- DropTable
DROP TABLE "PixMessage";

-- CreateTable
CREATE TABLE "pix_messages" (
    "id" SERIAL NOT NULL,
    "end_to_end_id" TEXT NOT NULL,
    "valor" DOUBLE PRECISION NOT NULL,
    "pagador_nome" TEXT NOT NULL,
    "pagador_cpf_cnpj" TEXT NOT NULL,
    "pagador_ispb" TEXT NOT NULL,
    "pagador_agencia" TEXT NOT NULL,
    "pagador_conta_transacional" TEXT NOT NULL,
    "pagador_tipo_conta" TEXT NOT NULL,
    "recebedor_nome" TEXT NOT NULL,
    "recebedor_cpf_cnpj" TEXT NOT NULL,
    "recebedor_ispb" TEXT NOT NULL,
    "recebedor_agencia" TEXT NOT NULL,
    "recebedor_conta_transacional" TEXT NOT NULL,
    "recebedor_tipo_conta" TEXT NOT NULL,
    "campo_livre" TEXT,
    "tx_id" TEXT,
    "data_hora_pagamento" TIMESTAMP(3),
    "interaction_id" TEXT,

    CONSTRAINT "pix_messages_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "interaction_logs" (
    "interaction_id" TEXT NOT NULL,
    "ispb" TEXT,
    "message_ids" VARCHAR(255)[],
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "interaction_logs_pkey" PRIMARY KEY ("interaction_id")
);

-- CreateTable
CREATE TABLE "active_streams" (
    "id" SERIAL NOT NULL,
    "ispb" TEXT NOT NULL,
    "interaction_id" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'active',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "active_streams_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "pix_messages_end_to_end_id_key" ON "pix_messages"("end_to_end_id");
