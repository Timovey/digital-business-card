-- CreateEnum
CREATE TYPE "SocialLinkKind" AS ENUM ('GITHUB', 'TELEGRAM', 'EMAIL', 'PHONE');

-- CreateEnum
CREATE TYPE "SkillCategory" AS ENUM ('LANGUAGE', 'BACKEND', 'FRONTEND', 'DATABASE', 'DEVOPS', 'TESTING', 'PRACTICE');

-- CreateEnum
CREATE TYPE "ProjectKind" AS ENUM ('WORK', 'SIDE', 'PET');

-- CreateTable
CREATE TABLE "profiles" (
    "id" SERIAL NOT NULL,
    "full_name" VARCHAR(150) NOT NULL,
    "headline" VARCHAR(150) NOT NULL,
    "description" TEXT NOT NULL,
    "location" VARCHAR(100),
    "avatar_key" VARCHAR(255),
    "created_at" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(3) NOT NULL,

    CONSTRAINT "profiles_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "social_links" (
    "id" SERIAL NOT NULL,
    "profile_id" INTEGER NOT NULL,
    "kind" "SocialLinkKind" NOT NULL,
    "label" VARCHAR(100) NOT NULL,
    "url" VARCHAR(2048) NOT NULL,
    "sort_order" SMALLINT NOT NULL DEFAULT 0,

    CONSTRAINT "social_links_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "skills" (
    "id" SERIAL NOT NULL,
    "profile_id" INTEGER NOT NULL,
    "name" VARCHAR(50) NOT NULL,
    "category" "SkillCategory" NOT NULL,
    "sort_order" SMALLINT NOT NULL DEFAULT 0,

    CONSTRAINT "skills_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "experiences" (
    "id" SERIAL NOT NULL,
    "profile_id" INTEGER NOT NULL,
    "company" VARCHAR(150) NOT NULL,
    "company_url" VARCHAR(2048),
    "location" VARCHAR(100),
    "position" VARCHAR(150) NOT NULL,
    "start_date" DATE NOT NULL,
    "end_date" DATE,

    CONSTRAINT "experiences_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "achievements" (
    "id" SERIAL NOT NULL,
    "project_id" INTEGER NOT NULL,
    "text" TEXT NOT NULL,
    "sort_order" SMALLINT NOT NULL DEFAULT 0,

    CONSTRAINT "achievements_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "projects" (
    "id" SERIAL NOT NULL,
    "profile_id" INTEGER NOT NULL,
    "name" VARCHAR(150) NOT NULL,
    "description" TEXT NOT NULL,
    "kind" "ProjectKind" NOT NULL,
    "experience_id" INTEGER,
    "repository_url" VARCHAR(2048),
    "demo_url" VARCHAR(2048),
    "featured" BOOLEAN NOT NULL DEFAULT false,
    "sort_order" SMALLINT NOT NULL DEFAULT 0,

    CONSTRAINT "projects_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "project_technologies" (
    "project_id" INTEGER NOT NULL,
    "skill_id" INTEGER NOT NULL,
    "sort_order" SMALLINT NOT NULL DEFAULT 0,

    CONSTRAINT "project_technologies_pkey" PRIMARY KEY ("project_id","skill_id")
);

-- CreateTable
CREATE TABLE "experience_technologies" (
    "experience_id" INTEGER NOT NULL,
    "skill_id" INTEGER NOT NULL,
    "sort_order" SMALLINT NOT NULL DEFAULT 0,

    CONSTRAINT "experience_technologies_pkey" PRIMARY KEY ("experience_id","skill_id")
);

-- CreateIndex
CREATE INDEX "social_links_profile_id_sort_order_idx" ON "social_links"("profile_id", "sort_order");

-- CreateIndex
CREATE UNIQUE INDEX "social_links_profile_id_url_key" ON "social_links"("profile_id", "url");

-- CreateIndex
CREATE INDEX "skills_profile_id_sort_order_idx" ON "skills"("profile_id", "sort_order");

-- CreateIndex
CREATE UNIQUE INDEX "skills_profile_id_name_key" ON "skills"("profile_id", "name");

-- CreateIndex
CREATE INDEX "experiences_profile_id_start_date_idx" ON "experiences"("profile_id", "start_date" DESC);

-- CreateIndex
CREATE UNIQUE INDEX "experiences_profile_id_company_start_date_key" ON "experiences"("profile_id", "company", "start_date");

-- CreateIndex
CREATE UNIQUE INDEX "achievements_project_id_sort_order_key" ON "achievements"("project_id", "sort_order");

-- CreateIndex
CREATE INDEX "projects_profile_id_sort_order_idx" ON "projects"("profile_id", "sort_order");

-- CreateIndex
CREATE INDEX "projects_experience_id_sort_order_idx" ON "projects"("experience_id", "sort_order");

-- CreateIndex
CREATE UNIQUE INDEX "projects_profile_id_name_key" ON "projects"("profile_id", "name");

-- CreateIndex
CREATE INDEX "project_technologies_skill_id_idx" ON "project_technologies"("skill_id");

-- CreateIndex
CREATE INDEX "experience_technologies_skill_id_idx" ON "experience_technologies"("skill_id");

-- AddForeignKey
ALTER TABLE "social_links" ADD CONSTRAINT "social_links_profile_id_fkey" FOREIGN KEY ("profile_id") REFERENCES "profiles"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "skills" ADD CONSTRAINT "skills_profile_id_fkey" FOREIGN KEY ("profile_id") REFERENCES "profiles"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "experiences" ADD CONSTRAINT "experiences_profile_id_fkey" FOREIGN KEY ("profile_id") REFERENCES "profiles"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "achievements" ADD CONSTRAINT "achievements_project_id_fkey" FOREIGN KEY ("project_id") REFERENCES "projects"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "projects" ADD CONSTRAINT "projects_profile_id_fkey" FOREIGN KEY ("profile_id") REFERENCES "profiles"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "projects" ADD CONSTRAINT "projects_experience_id_fkey" FOREIGN KEY ("experience_id") REFERENCES "experiences"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "project_technologies" ADD CONSTRAINT "project_technologies_project_id_fkey" FOREIGN KEY ("project_id") REFERENCES "projects"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "project_technologies" ADD CONSTRAINT "project_technologies_skill_id_fkey" FOREIGN KEY ("skill_id") REFERENCES "skills"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "experience_technologies" ADD CONSTRAINT "experience_technologies_experience_id_fkey" FOREIGN KEY ("experience_id") REFERENCES "experiences"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "experience_technologies" ADD CONSTRAINT "experience_technologies_skill_id_fkey" FOREIGN KEY ("skill_id") REFERENCES "skills"("id") ON DELETE CASCADE ON UPDATE CASCADE;


-- Prisma не умеет описывать CHECK-ограничения в схеме, поэтому они добавлены вручную.

-- Место работы не может закончиться раньше, чем началось; NULL в end_date — текущее место.
ALTER TABLE "experiences"
  ADD CONSTRAINT "experiences_period_check" CHECK ("end_date" IS NULL OR "end_date" >= "start_date");

-- Проект по месту работы (WORK) обязан ссылаться на опыт, остальные (SIDE, PET) — не ссылаются.
ALTER TABLE "projects"
  ADD CONSTRAINT "projects_kind_experience_check" CHECK (("kind" = 'WORK') = ("experience_id" IS NOT NULL));
