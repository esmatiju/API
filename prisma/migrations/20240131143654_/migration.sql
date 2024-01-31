/*
  Warnings:

  - You are about to drop the column `tags` on the `Plant` table. All the data in the column will be lost.

*/
-- RedefineTables
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Plant" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "picture_url" TEXT,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "hint" TEXT,
    "fullname" TEXT NOT NULL
);
INSERT INTO "new_Plant" ("description", "fullname", "hint", "id", "name", "picture_url") SELECT "description", "fullname", "hint", "id", "name", "picture_url" FROM "Plant";
DROP TABLE "Plant";
ALTER TABLE "new_Plant" RENAME TO "Plant";
PRAGMA foreign_key_check;
PRAGMA foreign_keys=ON;
