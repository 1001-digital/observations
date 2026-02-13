import { ponder } from "ponder:registry";
import { observation, artifact } from "ponder:schema";

ponder.on("Observations:Observation", async ({ event, context }) => {
  const { collection, tokenId, observer, note, located, x, y, viewType, time } = event.args;

  await context.db
    .insert(observation)
    .values({
      id: `${event.block.number}-${event.log.logIndex}`,
      collection,
      tokenId,
      observer,
      note,
      located,
      x,
      y,
      view: viewType,
      time,
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
});
