import assert from "node:assert/strict";
import { describe, it } from "node:test";

import { network } from "hardhat";
import { getAddress } from "viem";

describe("Observations", async function () {
  const { viem } = await network.connect();
  const publicClient = await viem.getPublicClient();
  const [walletClient] = await viem.getWalletClients();

  const collection = getAddress("0x036721e5A769Cc48B3189EFb9CCE4C97e7C3C1f5");
  const tokenId = 1n;

  it("Should emit an Observation event", async function () {
    const observations = await viem.deployContract("Observations");

    await viem.assertions.emitWithArgs(
      observations.write.observe([collection, tokenId, "Beautiful piece.", 0]),
      observations,
      "Observation",
      [collection, tokenId, getAddress(walletClient.account.address), "Beautiful piece.", false, 0, 0, 0],
    );
  });

  it("Should emit a located Observation event", async function () {
    const observations = await viem.deployContract("Observations");

    await viem.assertions.emitWithArgs(
      observations.write.observeAt([collection, tokenId, "Detail in the corner.", 120, 340, 0]),
      observations,
      "Observation",
      [collection, tokenId, getAddress(walletClient.account.address), "Detail in the corner.", true, 120, 340, 0],
    );
  });

  it("Should emit an Observation event with animation view", async function () {
    const observations = await viem.deployContract("Observations");

    await viem.assertions.emitWithArgs(
      observations.write.observe([collection, tokenId, "Fluid motion.", 1]),
      observations,
      "Observation",
      [collection, tokenId, getAddress(walletClient.account.address), "Fluid motion.", false, 0, 0, 1],
    );
  });

  it("Should emit a located Observation event with animation view", async function () {
    const observations = await viem.deployContract("Observations");

    await viem.assertions.emitWithArgs(
      observations.write.observeAt([collection, tokenId, "Movement here.", 50, 75, 1]),
      observations,
      "Observation",
      [collection, tokenId, getAddress(walletClient.account.address), "Movement here.", true, 50, 75, 1],
    );
  });

  it("Should track the observation count", async function () {
    const observations = await viem.deployContract("Observations");

    await observations.write.observe([collection, tokenId, "First.", 0]);
    await observations.write.observe([collection, tokenId, "Second.", 0]);
    await observations.write.observeAt([collection, tokenId, "Third.", 10, 20, 0]);

    const [count] = await observations.read.artifacts([collection, tokenId]);

    assert.equal(count, 3n);
  });

  it("Should record the first observation block", async function () {
    const observations = await viem.deployContract("Observations");

    const blockBefore = await publicClient.getBlockNumber();

    await observations.write.observe([collection, tokenId, "First observation.", 0]);

    const [, firstBlock] = await observations.read.artifacts([collection, tokenId]);

    assert.ok(firstBlock > blockBefore);
  });

  it("Should not update firstBlock on subsequent observations", async function () {
    const observations = await viem.deployContract("Observations");

    await observations.write.observe([collection, tokenId, "First.", 0]);
    const [, firstBlock] = await observations.read.artifacts([collection, tokenId]);

    await observations.write.observe([collection, tokenId, "Second.", 0]);
    const [, firstBlockAfter] = await observations.read.artifacts([collection, tokenId]);

    assert.equal(firstBlock, firstBlockAfter);
  });

  it("Should track artifacts independently", async function () {
    const observations = await viem.deployContract("Observations");
    const otherToken = 99n;

    await observations.write.observe([collection, tokenId, "On token 1.", 0]);
    await observations.write.observe([collection, otherToken, "On token 99.", 0]);
    await observations.write.observe([collection, otherToken, "Again on 99.", 0]);

    const [count1] = await observations.read.artifacts([collection, tokenId]);
    const [count99] = await observations.read.artifacts([collection, otherToken]);

    assert.equal(count1, 1n);
    assert.equal(count99, 2n);
  });

  it("Should be filterable by collection and tokenId in logs", async function () {
    const observations = await viem.deployContract("Observations");
    const deployBlock = await publicClient.getBlockNumber();
    const otherToken = 42n;

    await observations.write.observe([collection, tokenId, "Note A.", 0]);
    await observations.write.observe([collection, otherToken, "Note B.", 0]);
    await observations.write.observe([collection, tokenId, "Note C.", 0]);

    // Filter events for a specific tokenId.
    const events = await publicClient.getContractEvents({
      address: observations.address,
      abi: observations.abi,
      eventName: "Observation",
      args: { collection, tokenId },
      fromBlock: deployBlock,
      strict: true,
    });

    assert.equal(events.length, 2);
    assert.equal(events[0].args.note, "Note A.");
    assert.equal(events[1].args.note, "Note C.");
  });
});
