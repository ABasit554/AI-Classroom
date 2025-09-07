/*
  Warnings:

  - You are about to drop the column `classId` on the `Lecture` table. All the data in the column will be lost.
  - You are about to drop the column `createdById` on the `Lecture` table. All the data in the column will be lost.
  - You are about to drop the column `description` on the `Lecture` table. All the data in the column will be lost.
  - You are about to drop the column `resources` on the `Lecture` table. All the data in the column will be lost.
  - Added the required column `classCode` to the `Lecture` table without a default value. This is not possible if the table is not empty.
  - Added the required column `filePath` to the `Lecture` table without a default value. This is not possible if the table is not empty.
  - Added the required column `fileUrl` to the `Lecture` table without a default value. This is not possible if the table is not empty.

*/
-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Lecture" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "classCode" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "date" DATETIME NOT NULL,
    "filePath" TEXT NOT NULL,
    "fileUrl" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdBy" TEXT
);
INSERT INTO "new_Lecture" ("createdAt", "date", "id", "title") SELECT "createdAt", "date", "id", "title" FROM "Lecture";
DROP TABLE "Lecture";
ALTER TABLE "new_Lecture" RENAME TO "Lecture";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
