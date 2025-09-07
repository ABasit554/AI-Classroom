/*
  Warnings:

  - You are about to drop the column `classCode` on the `Lecture` table. All the data in the column will be lost.
  - You are about to drop the column `createdAt` on the `Lecture` table. All the data in the column will be lost.
  - You are about to drop the column `createdBy` on the `Lecture` table. All the data in the column will be lost.
  - You are about to drop the column `filePath` on the `Lecture` table. All the data in the column will be lost.
  - Added the required column `classId` to the `Lecture` table without a default value. This is not possible if the table is not empty.

*/
-- CreateTable
CREATE TABLE "Class" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "code" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "section" TEXT
);

-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Lecture" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "title" TEXT NOT NULL,
    "date" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "fileUrl" TEXT NOT NULL,
    "classId" TEXT NOT NULL,
    CONSTRAINT "Lecture_classId_fkey" FOREIGN KEY ("classId") REFERENCES "Class" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO "new_Lecture" ("date", "fileUrl", "id", "title") SELECT "date", "fileUrl", "id", "title" FROM "Lecture";
DROP TABLE "Lecture";
ALTER TABLE "new_Lecture" RENAME TO "Lecture";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;

-- CreateIndex
CREATE UNIQUE INDEX "Class_code_key" ON "Class"("code");
