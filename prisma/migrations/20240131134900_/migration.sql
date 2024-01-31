-- CreateTable
CREATE TABLE "Tags" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL
);

-- CreateTable
CREATE TABLE "TagsPlant" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "id_plant" TEXT NOT NULL,
    "id_tags" TEXT NOT NULL,
    CONSTRAINT "TagsPlant_id_plant_fkey" FOREIGN KEY ("id_plant") REFERENCES "Plant" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "TagsPlant_id_tags_fkey" FOREIGN KEY ("id_tags") REFERENCES "Tags" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Plant" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "picture_url" TEXT,
    "tags" TEXT,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "hint" TEXT,
    "fullname" TEXT NOT NULL
);

-- CreateTable
CREATE TABLE "Garden" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "latitude" REAL NOT NULL,
    "longitude" REAL NOT NULL,
    "address" TEXT,
    "ville" TEXT NOT NULL,
    "cp" TEXT,
    "owner_id" TEXT,
    "other_user_id" TEXT,
    "updated_at" DATETIME NOT NULL,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "status" TEXT,
    "botanist_id" TEXT
);

-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "lastname" TEXT,
    "firstname" TEXT,
    "email" TEXT,
    "picture_url" TEXT,
    "isPubliable" BOOLEAN
);

-- CreateTable
CREATE TABLE "Botanist" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "user_id" TEXT NOT NULL,
    "siret" TEXT NOT NULL,
    CONSTRAINT "Botanist_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Message" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "user_id" TEXT NOT NULL,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "garden_id" TEXT NOT NULL,
    "message" TEXT NOT NULL,
    CONSTRAINT "Message_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "Message_garden_id_fkey" FOREIGN KEY ("garden_id") REFERENCES "Garden" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Photos" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "picture_url" TEXT
);

-- CreateTable
CREATE TABLE "Photo_comu" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "id_photos" TEXT NOT NULL,
    "plant_id" TEXT NOT NULL,
    CONSTRAINT "Photo_comu_id_photos_fkey" FOREIGN KEY ("id_photos") REFERENCES "Photos" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "Photo_comu_plant_id_fkey" FOREIGN KEY ("plant_id") REFERENCES "Plant" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "PlantGardenPhoto" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "id_plant" TEXT NOT NULL,
    "id_garden" TEXT NOT NULL,
    "id_photo" TEXT NOT NULL,
    CONSTRAINT "PlantGardenPhoto_id_plant_fkey" FOREIGN KEY ("id_plant") REFERENCES "Plant" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "PlantGardenPhoto_id_garden_fkey" FOREIGN KEY ("id_garden") REFERENCES "Garden" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "PlantGardenPhoto_id_photo_fkey" FOREIGN KEY ("id_photo") REFERENCES "Photos" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");
