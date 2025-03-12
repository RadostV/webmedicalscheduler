/*
  Warnings:

  - You are about to alter the column `prescriptionFile` on the `Appointment` table. The data in that column could be lost. The data in that column will be cast from `String` to `Binary`.

*/
-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Appointment" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    "doctorId" INTEGER NOT NULL,
    "dateTime" DATETIME NOT NULL,
    "patientId" INTEGER NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'scheduled',
    "symptoms" TEXT,
    "consultationAnalysis" TEXT,
    "description" TEXT,
    "prescriptionFile" BLOB,
    "prescriptionFileType" TEXT,
    CONSTRAINT "Appointment_doctorId_fkey" FOREIGN KEY ("doctorId") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "Appointment_patientId_fkey" FOREIGN KEY ("patientId") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_Appointment" ("consultationAnalysis", "createdAt", "dateTime", "description", "doctorId", "id", "patientId", "prescriptionFile", "status", "symptoms", "updatedAt") SELECT "consultationAnalysis", "createdAt", "dateTime", "description", "doctorId", "id", "patientId", "prescriptionFile", "status", "symptoms", "updatedAt" FROM "Appointment";
DROP TABLE "Appointment";
ALTER TABLE "new_Appointment" RENAME TO "Appointment";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
