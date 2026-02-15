import { index, onchainTable, primaryKey, relations } from "ponder";

export const observation = onchainTable(
  "observation",
  (t) => ({
    collection: t.hex().notNull(),
    tokenId: t.bigint().notNull(),
    id: t.bigint().notNull(),
    observer: t.hex().notNull(),
    parent: t.bigint().notNull(),
    update: t.boolean().notNull(),
    note: t.text().notNull(),
    located: t.boolean().notNull(),
    x: t.integer().notNull(),
    y: t.integer().notNull(),
    view: t.integer().notNull(),
    time: t.integer().notNull(),
    tip: t.bigint().notNull(),
    block: t.bigint().notNull(),
    timestamp: t.bigint().notNull(),
    txHash: t.hex().notNull(),
  }),
  (table) => ({
    pk: primaryKey({ columns: [table.collection, table.tokenId, table.id] }),
    collectionIdx: index().on(table.collection),
    observerIdx: index().on(table.observer),
    artifactIdx: index().on(table.collection, table.tokenId),
  }),
);

export const artifact = onchainTable(
  "artifact",
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

export const collectionTips = onchainTable(
  "collection_tips",
  (t) => ({
    collection: t.hex().primaryKey(),
    totalTipped: t.bigint().notNull(),
    totalClaimed: t.bigint().notNull(),
    balance: t.bigint().notNull(),
  }),
);

export const artifactRelations = relations(artifact, ({ many }) => ({
  observations: many(observation),
}));

export const observationRelations = relations(observation, ({ one }) => ({
  artifact: one(artifact, {
    fields: [observation.collection, observation.tokenId],
    references: [artifact.collection, artifact.tokenId],
  }),
}));
