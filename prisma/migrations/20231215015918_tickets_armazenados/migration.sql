-- CreateTable
CREATE TABLE "Tickets" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "TicketID" TEXT NOT NULL,
    "Owner" TEXT NOT NULL,
    "State" TEXT NOT NULL,
    "TicketNumber" TEXT NOT NULL,
    "Created" TEXT NOT NULL,
    "Changed" TEXT NOT NULL
);
