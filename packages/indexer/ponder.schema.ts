import { index, onchainTable, primaryKey, relations } from "ponder";

export const observations = onchainTable(
  "observations",
  (t) => ({
    id: t.text().primaryKey(),
    collection: t.hex().notNull(),
    tokenId: t.bigint().notNull(),
    observer: t.hex().notNull(),
    note: t.text().notNull(),
    located: t.boolean().notNull(),
    x: t.integer().notNull(),
    y: t.integer().notNull(),
    view: t.integer().notNull(),
    block: t.bigint().notNull(),
    timestamp: t.bigint().notNull(),
    txHash: t.hex().notNull(),
  }),
  (table) => ({
    collectionIdx: index().on(table.collection),
    observerIdx: index().on(table.observer),
    artifactIdx: index().on(table.collection, table.tokenId),
  }),
);

export const artifacts = onchainTable(
  "artifacts",
  (t) => ({
    collection: t.hex().notNull(),
    tokenId: t.bigint().notNull(),
    count: t.bigint().notNull(),
    firstBlock: t.bigint().notNull(),
  }),
  (table) => ({
    pk: primaryKey({ columns: [table.collection, table.tokenId] }),
    collectionIdx: index().on(table.collection),
  }),
);

export const artifactsRelations = relations(artifacts, ({ many }) => ({
  observations: many(observations),
}));

export const observationsRelations = relations(observations, ({ one }) => ({
  artifact: one(artifacts, {
    fields: [observations.collection, observations.tokenId],
    references: [artifacts.collection, artifacts.tokenId],
  }),
}));
