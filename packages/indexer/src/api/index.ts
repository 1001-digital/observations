import { db, publicClients } from "ponder:api";
import schema from "ponder:schema";
import { Hono } from "hono";
import { client, graphql } from "ponder";
import { createEnsRoutes, createOffchainDb } from "@1001-digital/ponder-ens";
import {
  createArtifactRoutes,
  createOffchainDb as createArtifactDb,
} from "@1001-digital/ponder-artifacts";

const { db: ensDb } = await createOffchainDb();
const { db: artifactDb } = await createArtifactDb({
  dataDir: ".ponder/artifacts",
});

const app = new Hono();

app.route(
  "/ens",
  createEnsRoutes({
    client: publicClients["ethereum"],
    db: ensDb,
  }),
);

app.route(
  "/artifacts",
  createArtifactRoutes({
    client: publicClients["sepolia"],
    db: artifactDb,
  }),
);

app.use("/sql/*", client({ db, schema }));

app.use("/", graphql({ db, schema }));
app.use("/graphql", graphql({ db, schema }));

export default app;
