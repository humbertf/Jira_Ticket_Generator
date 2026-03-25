-- CreateTable
CREATE TABLE "Sprint" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "sprintIndex" INTEGER NOT NULL,
    "sprintId" INTEGER NOT NULL,
    "epicName" TEXT NOT NULL,
    "startMonth" INTEGER,
    "startDay" INTEGER,
    "startYear" INTEGER,
    "endMonth" INTEGER,
    "endDay" INTEGER,
    "endYear" INTEGER,
    "issueType" TEXT NOT NULL DEFAULT 'Story',
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "Persona" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "label" TEXT NOT NULL,
    "sortOrder" INTEGER NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "Prefix" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "code" TEXT NOT NULL,
    "description" TEXT,
    "sortOrder" INTEGER NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "Assignee" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "username" TEXT NOT NULL,
    "displayName" TEXT,
    "email" TEXT,
    "jiraAccountId" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "Component" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "sortOrder" INTEGER NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "Story" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "sprintIndex" INTEGER NOT NULL,
    "taskCategory" TEXT NOT NULL,
    "taskType" TEXT,
    "taskAction" TEXT NOT NULL,
    "persona" TEXT,
    "goal" TEXT,
    "benefit" TEXT,
    "acceptanceCriteria" TEXT,
    "jiraDescription" TEXT,
    "assignee" TEXT,
    "summary" TEXT,
    "headline" TEXT,
    "isSelected" BOOLEAN NOT NULL DEFAULT false,
    "isExported" BOOLEAN NOT NULL DEFAULT false,
    "useStructuredMode" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "Story_sprintIndex_fkey" FOREIGN KEY ("sprintIndex") REFERENCES "Sprint" ("sprintIndex") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateIndex
CREATE UNIQUE INDEX "Sprint_sprintIndex_key" ON "Sprint"("sprintIndex");

-- CreateIndex
CREATE UNIQUE INDEX "Sprint_sprintId_key" ON "Sprint"("sprintId");

-- CreateIndex
CREATE UNIQUE INDEX "Persona_label_key" ON "Persona"("label");

-- CreateIndex
CREATE UNIQUE INDEX "Prefix_code_key" ON "Prefix"("code");

-- CreateIndex
CREATE UNIQUE INDEX "Assignee_username_key" ON "Assignee"("username");

-- CreateIndex
CREATE UNIQUE INDEX "Component_name_key" ON "Component"("name");
