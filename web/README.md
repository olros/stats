# Stats

**Tech-stack:** [Remix](https://remix.run/), [Prisma](https://www.prisma.io/), [Tailwind](https://tailwindcss.com/), [Radix](https://www.radix-ui.com/), [Nivo](https://nivo.rocks/)

## Development

Create a `.env`-file with the following .env-variables:

```bash
# DATABASE_URL must be a connection string to a database and is required
DATABASE_URL=postgresql://root:password@localhost:5432/stats_db
GITHUB_CLIENT_ID=<insert>
GITHUB_CLIENT_SECRET=<insert>

SECRET_KEY=<a_random_long_key_used_to_hash_user_IP_adresses>
```

### First setup

Docker-Compose must be available in order to automatically setup a local PostgreSQL-instance for development.
Alternatively, you can run a PostgreSQL-instance yourself and provide a connection-string at `DATABASE_URL` in the `.env`-file.

1. Run `pnpm install` to install packages
2. Setup database and types:
   - With Docker-Compose: Run `pnpm run docker:fresh` to create a Docker-container with a PostgreSQL-instance, create tables in it and generate Prisma-types
   - With other PostgreSQL-instance: Run `pnpm run db:generate` to generate Prisma-types
3. Finally run `pnpm run dev` to run the project at http://localhost:3000

### Subsequent starts

If you've already set up the local development environment, you can start the PostgreSQL-instance in Docker with `pnpm run docker:start` and then start the project with `pnpm run dev`

### Useful commands

- View the contents of the database using Prisma Studio. Run `pnpm run db:studio` to run it at http://localhost:5555
- Run `pnpm run docker:fresh` to tear down the Docker container/database and start it again without any previously existing content, the tables will be recreated, but empty.
- Run `pnpm run docker:down` to tear down the Docker container/database and remove all data.

## Database migrations

The project uses Prisma for ORM. This includes database-migrations. When you're done with editing the `schema.prisma`-file, run `pnpm run db:migrate <migration-name>` to add a migration and update your local database.

During development and before you're ready to create a migration, you can also you `pnpm run db:push` to push the changes in the `schema.prisma`-file to the database without creating a migration. You'll still need to run `pnpm run db:new-migration <migration-name>` and create a migration before pushing to production.

When there's new migrations from other developer, you can run `pnpm run db:migrate` to apply these locally.

New migrations will automatically be applied in production with the Github Action which runs on push to the `main`-branch.
