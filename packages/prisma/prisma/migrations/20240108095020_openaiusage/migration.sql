-- CreateTable
CREATE TABLE "OpenAiUsage" (
    "id" TEXT NOT NULL,
    "object" TEXT NOT NULL,
    "model" TEXT NOT NULL,
    "created" INTEGER NOT NULL,
    "usage_prompt_tokens" INTEGER NOT NULL,
    "usage_completion_tokens" INTEGER NOT NULL,
    "usage_total_tokens" INTEGER NOT NULL,
    "system_fingerprint" TEXT NOT NULL,

    CONSTRAINT "OpenAiUsage_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "OpenAiUsage_id_key" ON "OpenAiUsage"("id");
