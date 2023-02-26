# Stats

Et enkelt analysverktøy for nettsider

**Tech-stack:** [Remix](https://remix.run/), [Prisma](https://www.prisma.io/), [MUI Joy UI](https://mui.com/joy-ui/getting-started/overview/), [nivo](https://nivo.rocks/)

## Setup project

Add the following .env-variables:

```bash
DATABASE_URL=postgresql://root:password@localhost:5432/stats_db
GITHUB_CLIENT_ID=<insert>
GITHUB_CLIENT_SECRET=<insert>
```

Run `yarn` to install packages, `yarn fresh` to setup the databse and load fixtures. Finally run `yarn dev` to run the project.

## Migrations

The project uses Prisma for ORM. This includes database-migrations. When you're done with editing the `schema.prisma`-file, run `yarn migrate <migration-name>` to add a migration and update your local database.

New migrations will automatically be applied in production with the Github Action which runs on push to the `main`-branch.
