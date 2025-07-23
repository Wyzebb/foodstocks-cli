import { PrismaClient } from '@prisma/client';
import { execSync } from 'child_process';
import dotenv from 'dotenv';

dotenv.config();

const readlineSync = require('readline-sync');

const DATABASE_URL = process.env.DB_URL;
const DOCKER_CONTAINER_NAME = process.env.DOCKER_CONTAINER_NAME
const POSTGRES_USER = process.env.POSTGRES_USER
const POSTGRES_PASSWORD = process.env.POSTGRES_PASSWORD
const POSTGRES_PORT = process.env.POSTGRES_PORT
const DB_NAME = process.env.DB_NAME

const prisma = new PrismaClient({
    datasources: { db: { url: DATABASE_URL } }
});

// Month names
const monthNames = [
    "Jan", "Feb", "Mar", "Apr", "May", "Jun",
    "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"
];

// Function to start the Docker container
function startDatabase() {
    try {
        console.log("Starting the database...");
        execSync(`docker start ${DOCKER_CONTAINER_NAME} || docker run --name ${DOCKER_CONTAINER_NAME} -e POSTGRES_USER=${POSTGRES_USER} -e POSTGRES_PASSWORD=${POSTGRES_PASSWORD} -e POSTGRES_DB=${DB_NAME} -p ${POSTGRES_PORT}:5432 -d postgres`, { stdio: 'inherit' });
        console.log("Database started successfully.");
    } catch (error) {
        console.error("Failed to start the database.", error);
        console.error("Open the Docker Desktop App and wait for it to say engine running in the bottom left. Then run npx ts-node index.ts");
        process.exit(1);
    }
}

// Function to stop the Docker container
function stopDatabase() {
    try {
        console.log("Stopping the database...");
        execSync(`docker stop ${DOCKER_CONTAINER_NAME}`, { stdio: 'inherit' });
        console.log("Database stopped successfully.");
    } catch (error) {
        console.error("Failed to stop the database.", error);
    }
}

async function main() {
    startDatabase();

    console.log("Welcome to the food stocks terminal application!");

    let exit = false;

    while (!exit) {
        console.log("\nAvailable commands: add, view, sort, update, delete, lookup, exit");
        const command = readlineSync.question("Enter a command: ").toLowerCase();

        if (command === "add") {
            const name = readlineSync.question("Enter item name: ");
            const expiryDayInput = readlineSync.question("Enter expiry day (or leave empty): ");
            const expiryMonth = parseInt(readlineSync.question("Enter expiry month (1-12): "), 10);
            const expiryYear = parseInt(readlineSync.question("Enter expiry year: "), 10);

            if (!name || isNaN(expiryMonth) || isNaN(expiryYear)) {
                console.log("Invalid input. Name, month, and year are required.");
                continue;
            }

            const expiryDay = expiryDayInput.trim() === "" ? null : parseInt(expiryDayInput, 10);

            await prisma.item.create({
                data: { name, expiryDay, expiryMonth, expiryYear },
            });
            console.log("Item added successfully!");

        } else if (command === "view") {
            const items = await prisma.item.findMany();
            if (items.length === 0) {
                console.log("No items in stock.");
                continue;
            }

            console.log("\nItems in Stock:");
            items.forEach(item => {
                const expiryMonthName = monthNames[item.expiryMonth - 1];
                const expiryDate = item.expiryDay ? `${item.expiryDay} ${expiryMonthName} ${item.expiryYear}` : `${expiryMonthName} ${item.expiryYear}`;
                const updatedAt = item.updatedAt.toISOString().slice(0, 19).replace('T', ' '); // Format timestamp to "YYYY-MM-DD HH:MM:SS"

                console.log(`${item.id} - ${item.name}: Expires ${expiryDate} (Last Updated: ${updatedAt})`);
            });

        } else if (command === "lookup") {
            const searchTerm = readlineSync.question("Enter item name or part of the name to search: ").trim().toLowerCase();

            if (!searchTerm) {
                console.log("Please provide a valid search term.");
                continue;
            }

            // Search for items that match the name
            const items = await prisma.item.findMany({
                where: {
                    name: {
                        contains: searchTerm,
                        mode: 'insensitive', // case-insensitive search
                    }
                }
            });

            if (items.length === 0) {
                console.log("No items found matching that name.");
                continue;
            }

            console.log("\nMatching Items:");
            items.forEach(item => {
                const expiryMonthName = monthNames[item.expiryMonth - 1];
                const expiryDate = item.expiryDay ? `${item.expiryDay} ${expiryMonthName} ${item.expiryYear}` : `${expiryMonthName} ${item.expiryYear}`;
                const updatedAt = item.updatedAt.toISOString().slice(0, 19).replace('T', ' '); // Format timestamp to "YYYY-MM-DD HH:MM:SS"

                console.log(`${item.id} - ${item.name}: Expires ${expiryDate} (Last Updated: ${updatedAt})`);
            });

        } else if (command === "sort") {
            const sortedItems = await prisma.item.findMany({
                orderBy: [
                    { expiryYear: 'asc' },
                    { expiryMonth: 'asc' },
                    { expiryDay: 'asc' },
                ],
            });

            if (sortedItems.length === 0) {
                console.log("No items to sort.");
                continue;
            }

            console.log("\nItems Sorted by Expiry Date:");
            sortedItems.forEach(item => {
                const expiryMonthName = monthNames[item.expiryMonth - 1];
                const expiryDate = item.expiryDay ? `${item.expiryDay} ${expiryMonthName} ${item.expiryYear}` : `${expiryMonthName} ${item.expiryYear}`;
                console.log(`${item.id} - ${item.name}: Expires ${expiryDate}`);
            });

        } else if (command === "update") {
            const id = parseInt(readlineSync.question("Enter item ID to update: "));
            const existingItem = await prisma.item.findFirst({ where: { id } });

            if (!existingItem) {
                console.log(`Item with ID '${id}' not found.`);
                continue;
            }

            const newExpiryDayInput = readlineSync.question("Enter new expiry day (or leave empty): ");
            const newExpiryMonth = parseInt(readlineSync.question("Enter new expiry month (1-12): "), 10);
            const newExpiryYear = parseInt(readlineSync.question("Enter new expiry year: "), 10);

            if (isNaN(newExpiryMonth) || isNaN(newExpiryYear)) {
                console.log("Invalid input. Month and year are required.");
                continue;
            }

            const newExpiryDay = newExpiryDayInput.trim() === "" ? null : parseInt(newExpiryDayInput, 10);

            await prisma.item.update({
                where: { id: existingItem.id },
                data: { expiryDay: newExpiryDay, expiryMonth: newExpiryMonth, expiryYear: newExpiryYear },
            });
            console.log("Item updated successfully!");

        } else if (command === "delete") {
            const id = parseInt(readlineSync.question("Enter item ID to delete: "));
            const existingItem = await prisma.item.findFirst({ where: { id } });

            if (!existingItem) {
                console.log(`Item ID '${id}' not found.`);
                continue;
            }

            await prisma.item.delete({ where: { id: existingItem.id } });
            console.log("Item deleted successfully!");

        } else if (command === "exit") {
            exit = true;

        } else {
            console.log("Unknown command. Please try again.");
        }
    }

    prisma.$disconnect();
    stopDatabase();
}

main().catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    stopDatabase();
    process.exit(1);
});