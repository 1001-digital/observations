import { ponder } from "ponder:registry";
import { observation, artifact, collectionTips } from "ponder:schema";

ponder.on("Observations:Observation", async ({ event, context }) => {
  const { collection, tokenId, observer, id: observationId, parent, update, note, located, x, y, viewType, time, tip } = event.args;

  await context.db
    .insert(observation)
    .values({
      id: `${event.block.number}-${event.log.logIndex}`,
      collection,
      tokenId,
      observer,
      observationId: BigInt(observationId),
      parent: BigInt(parent),
      update,
      note,
      located,
      x,
      y,
      view: viewType,
      time,
      tip,
      block: event.block.number,
      timestamp: event.block.timestamp,
      txHash: event.transaction.hash,
    });

  await context.db
    .insert(artifact)
    .values({
      collection,
      tokenId,
      count: 1n,
      firstBlock: event.block.number,
    })
    .onConflictDoUpdate((row) => ({
      count: row.count + 1n,
    }));

  if (tip > 0n) {
    await context.db
      .insert(collectionTips)
      .values({
        collection,
        totalTipped: tip,
        totalClaimed: 0n,
        balance: tip,
      })
      .onConflictDoUpdate((row) => ({
        totalTipped: row.totalTipped + tip,
        balance: row.balance + tip,
      }));
  }
});

ponder.on("Observations:TipsClaimed", async ({ event, context }) => {
  const { collection, amount } = event.args;

  await context.db
    .insert(collectionTips)
    .values({
      collection,
      totalTipped: 0n,
      totalClaimed: amount,
      balance: 0n,
    })
    .onConflictDoUpdate((row) => ({
      totalClaimed: row.totalClaimed + amount,
      balance: 0n,
    }));
});
