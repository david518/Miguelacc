-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Order" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "orderNumber" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'PENDING',
    "customerName" TEXT NOT NULL,
    "customerEmail" TEXT NOT NULL,
    "customerPhone" TEXT,
    "shippingAddress" TEXT,
    "note" TEXT,
    "shippingMethod" TEXT NOT NULL DEFAULT 'HOME_DELIVERY',
    "cvsStoreId" TEXT,
    "cvsStoreName" TEXT,
    "cvsStoreAddress" TEXT,
    "cvsLogisticsType" TEXT,
    "subtotalOriginal" INTEGER NOT NULL,
    "subtotalDiscount" INTEGER NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);
INSERT INTO "new_Order" ("createdAt", "customerEmail", "customerName", "customerPhone", "id", "note", "orderNumber", "shippingAddress", "status", "subtotalDiscount", "subtotalOriginal", "updatedAt") SELECT "createdAt", "customerEmail", "customerName", "customerPhone", "id", "note", "orderNumber", "shippingAddress", "status", "subtotalDiscount", "subtotalOriginal", "updatedAt" FROM "Order";
DROP TABLE "Order";
ALTER TABLE "new_Order" RENAME TO "Order";
CREATE UNIQUE INDEX "Order_orderNumber_key" ON "Order"("orderNumber");
CREATE TABLE "new_Product" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "shopeeId" TEXT,
    "name" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "thumbnailUrl" TEXT,
    "imagesJson" TEXT,
    "shopeeUrl" TEXT,
    "basePrice" INTEGER,
    "currency" TEXT NOT NULL DEFAULT 'TWD',
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "allowCvsPickup" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);
INSERT INTO "new_Product" ("basePrice", "createdAt", "currency", "description", "id", "imagesJson", "isActive", "name", "shopeeId", "shopeeUrl", "thumbnailUrl", "updatedAt") SELECT "basePrice", "createdAt", "currency", "description", "id", "imagesJson", "isActive", "name", "shopeeId", "shopeeUrl", "thumbnailUrl", "updatedAt" FROM "Product";
DROP TABLE "Product";
ALTER TABLE "new_Product" RENAME TO "Product";
CREATE UNIQUE INDEX "Product_shopeeId_key" ON "Product"("shopeeId");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
