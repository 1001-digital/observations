import { db, publicClients } from "ponder:api";
import schema from "ponder:schema";
import { Hono } from "hono";
import { client, graphql } from "ponder";
import { createEnsRoutes, createOffchainDb } from "@1001-digital/ponder-ens";

const { db: ensDb } = await createOffchainDb();

const app = new Hono();

app.route(
  "/profiles",
  createEnsRoutes({
    client: publicClients["ethereum"],
    db: ensDb,
  }),
);

app.use("/sql/*", client({ db, schema }));

app.use("/", graphql({ db, schema }));
app.use("/graphql", graphql({ db, schema }));

export default app;
