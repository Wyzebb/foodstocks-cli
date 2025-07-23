![GitHub Downloads (all assets, all releases)](https://img.shields.io/github/downloads/wyzebb/foodstocks-cli/total)
![GitHub License](https://img.shields.io/github/license/wyzebb/foodstocks-cli)
![GitHub Repo stars](https://img.shields.io/github/stars/wyzebb/foodstocks-cli)
![GitHub Release](https://img.shields.io/github/v/release/wyzebb/foodstocks-cli)


# Food Stocks Terminal Application

A simple Node.js terminal app to track stock of food items and their expiry dates using Prisma and PostgreSQL (via Docker).

---

## Features
- Add, view, sort, update, delete, lookup and exit commands
- Integration with PostgreSQL database via Docker
- Easy-to-use command line interface

## ✅ Prerequisites

- [Docker](https://www.docker.com/)
- [Node.js](https://nodejs.org/)
- [pnpm](https://pnpm.io/) or [npm](https://www.npmjs.com/)

---

## 📦 Installation

1. **Clone the repository:**

```bash
git clone https://github.com/wyzebb/foodstocks-cli.git
cd foodstocks-cli
```

2. **Install dependencies**

```bash
pnpm install
# or
npm install
```

3. **Configure environment variables**
Create a `.env` file in the root and copy and change the defaults from `.env.example` or from below:

```dotenv
DB_URL="postgresql://postgres:postgres@localhost:5432/foodstocksdb"

DOCKER_CONTAINER_NAME=""
POSTGRES_USER="postgres"
POSTGRES_PASSWORD="postgres"
POSTGRES_PORT="5432"
DB_NAME="foodstocksdb"
```

4. **Start the PostgreSQL database using Docker**
```bash
docker compose up -d
```

5. **Run migrations to set up the database schema**
```bash
pnpm dlx prisma migrate dev --name init
# or
pnpm prisma migrate dev --name init
```

6. **Start the app**
```bash
pnpm dlx ts-node index.ts
# or
npx ts-node index.ts
```

## Usage
- Usage is made very clear in the app, simply follow the instructions given

## Licence

This repository is open-source software licensed under the [Mozilla Public License 2.0](https://www.mozilla.org/en-US/MPL/2.0/).