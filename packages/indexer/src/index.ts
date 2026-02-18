import { ponder } from "ponder:registry";
import { observation, artifact, tips } from "ponder:schema";

ponder.on("Observations:Observation", async ({ event, context }) => {
  const { collection, tokenId, observer, id, parent, update, note, located, x, y, viewType, time, tip, recipient } = event.args;

  // Insert the event as its own row (preserves full event history)
  await context.db
    .insert(observation)
    .values({
      collection,
      tokenId,
      id: BigInt(id),
      observer,
      parent: BigInt(parent),
      update,
      note,
      located,
      x,
      y,
      view: viewType,
      time,
      tip,
      recipient,
      block: event.block.number,
      timestamp: event.block.timestamp,
      txHash: event.transaction.hash,
    });

  // Process update events: modify the parent observation
  if (update && parent > 0) {
    const parentKey = { collection, tokenId, id: BigInt(parent) };
    const parentRow = await context.db.find(observation, parentKey);

    // Only allow the original observer to edit/delete their observation
    if (parentRow && parentRow.observer === observer) {
      if (note === '') {
        await context.db.update(observation, parentKey).set({ deleted: true });
      } else {
        await context.db.update(observation, parentKey).set({
          note,
          located,
          x,
          y,
          view: viewType,
          time,
          updatedBlock: event.block.number,
        });
      }
    }
  }

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
      .insert(tips)
      .values({
        recipient,
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
  const { recipient, amount } = event.args;

  await context.db
    .insert(tips)
    .values({
      recipient,
      totalTipped: 0n,
      totalClaimed: amount,
      balance: 0n,
    })
    .onConflictDoUpdate((row) => ({
      totalClaimed: row.totalClaimed + amount,
      balance: 0n,
    }));
});
