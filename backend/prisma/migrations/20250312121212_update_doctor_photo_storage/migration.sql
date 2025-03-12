/*
  Warnings:

  - You are about to drop the column `photoUrl` on the `Doctor` table. All the data in the column will be lost.

*/
-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Doctor" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "userId" INTEGER NOT NULL,
    "specialty" TEXT NOT NULL,
    "education" TEXT NOT NULL,
    "qualification" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "siteUrl" TEXT,
    "phone" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "location" TEXT NOT NULL,
    "languages" TEXT NOT NULL,
    "photo" BLOB,
    "photoType" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "Doctor_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_Doctor" ("createdAt", "description", "education", "email", "id", "languages", "location", "phone", "qualification", "siteUrl", "specialty", "updatedAt", "userId") SELECT "createdAt", "description", "education", "email", "id", "languages", "location", "phone", "qualification", "siteUrl", "specialty", "updatedAt", "userId" FROM "Doctor";
DROP TABLE "Doctor";
ALTER TABLE "new_Doctor" RENAME TO "Doctor";
CREATE UNIQUE INDEX "Doctor_userId_key" ON "Doctor"("userId");
CREATE UNIQUE INDEX "Doctor_email_key" ON "Doctor"("email");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
