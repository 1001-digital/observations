import assert from "node:assert/strict";
import { describe, it } from "node:test";

import { network } from "hardhat";
import { getAddress, parseEther } from "viem";

describe("Observations", async function () {
  const { viem } = await network.connect();
  const publicClient = await viem.getPublicClient();
  const [walletClient] = await viem.getWalletClients();

  const collection = getAddress("0x036721e5A769Cc48B3189EFb9CCE4C97e7C3C1f5");
  const tokenId = 1n;

  it("Should emit an Observation event", async function () {
    const observations = await viem.deployContract("Observations");

    await viem.assertions.emitWithArgs(
      observations.write.observe([collection, tokenId, "Beautiful piece.", 0, 0]),
      observations,
      "Observation",
      [collection, tokenId, getAddress(walletClient.account.address), "Beautiful piece.", false, 0, 0, 0, 0, 0n],
    );
  });

  it("Should emit a located Observation event", async function () {
    const observations = await viem.deployContract("Observations");

    await viem.assertions.emitWithArgs(
      observations.write.observeAt([collection, tokenId, "Detail in the corner.", 120, 340, 0, 0]),
      observations,
      "Observation",
      [collection, tokenId, getAddress(walletClient.account.address), "Detail in the corner.", true, 120, 340, 0, 0, 0n],
    );
  });

  it("Should emit an Observation event with animation view", async function () {
    const observations = await viem.deployContract("Observations");

    await viem.assertions.emitWithArgs(
      observations.write.observe([collection, tokenId, "Fluid motion.", 1, 0]),
      observations,
      "Observation",
      [collection, tokenId, getAddress(walletClient.account.address), "Fluid motion.", false, 0, 0, 1, 0, 0n],
    );
  });

  it("Should emit a located Observation event with animation view", async function () {
    const observations = await viem.deployContract("Observations");

    await viem.assertions.emitWithArgs(
      observations.write.observeAt([collection, tokenId, "Movement here.", 50, 75, 1, 0]),
      observations,
      "Observation",
      [collection, tokenId, getAddress(walletClient.account.address), "Movement here.", true, 50, 75, 1, 0, 0n],
    );
  });

  it("Should track the observation count", async function () {
    const observations = await viem.deployContract("Observations");

    await observations.write.observe([collection, tokenId, "First.", 0, 0]);
    await observations.write.observe([collection, tokenId, "Second.", 0, 0]);
    await observations.write.observeAt([collection, tokenId, "Third.", 10, 20, 0, 0]);

    const [count] = await observations.read.artifacts([collection, tokenId]);

    assert.equal(count, 3n);
  });

  it("Should record the first observation block", async function () {
    const observations = await viem.deployContract("Observations");

    const blockBefore = await publicClient.getBlockNumber();

    await observations.write.observe([collection, tokenId, "First observation.", 0, 0]);

    const [, firstBlock] = await observations.read.artifacts([collection, tokenId]);

    assert.ok(firstBlock > blockBefore);
  });

  it("Should not update firstBlock on subsequent observations", async function () {
    const observations = await viem.deployContract("Observations");

    await observations.write.observe([collection, tokenId, "First.", 0, 0]);
    const [, firstBlock] = await observations.read.artifacts([collection, tokenId]);

    await observations.write.observe([collection, tokenId, "Second.", 0, 0]);
    const [, firstBlockAfter] = await observations.read.artifacts([collection, tokenId]);

    assert.equal(firstBlock, firstBlockAfter);
  });

  it("Should track artifacts independently", async function () {
    const observations = await viem.deployContract("Observations");
    const otherToken = 99n;

    await observations.write.observe([collection, tokenId, "On token 1.", 0, 0]);
    await observations.write.observe([collection, otherToken, "On token 99.", 0, 0]);
    await observations.write.observe([collection, otherToken, "Again on 99.", 0, 0]);

    const [count1] = await observations.read.artifacts([collection, tokenId]);
    const [count99] = await observations.read.artifacts([collection, otherToken]);

    assert.equal(count1, 1n);
    assert.equal(count99, 2n);
  });

  it("Should be filterable by collection and tokenId in logs", async function () {
    const observations = await viem.deployContract("Observations");
    const deployBlock = await publicClient.getBlockNumber();
    const otherToken = 42n;

    await observations.write.observe([collection, tokenId, "Note A.", 0, 0]);
    await observations.write.observe([collection, otherToken, "Note B.", 0, 0]);
    await observations.write.observe([collection, tokenId, "Note C.", 0, 0]);

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

  // --- Tipping tests ---

  it("Should accumulate tips per collection", async function () {
    const observations = await viem.deployContract("Observations");
    const tipAmount = parseEther("0.01");

    await observations.write.observe([collection, tokenId, "Nice.", 0, 0], { value: tipAmount });

    const [balance] = await observations.read.tips([collection]);
    assert.equal(balance, tipAmount);
  });

  it("Should emit tip amount in Observation event", async function () {
    const observations = await viem.deployContract("Observations");
    const tipAmount = parseEther("0.05");

    await viem.assertions.emitWithArgs(
      observations.write.observe([collection, tokenId, "Tipped.", 0, 0], { value: tipAmount }),
      observations,
      "Observation",
      [collection, tokenId, getAddress(walletClient.account.address), "Tipped.", false, 0, 0, 0, 0, tipAmount],
    );
  });

  it("Should work with zero tip (backward compatible)", async function () {
    const observations = await viem.deployContract("Observations");

    await observations.write.observe([collection, tokenId, "Free.", 0, 0]);

    const [balance] = await observations.read.tips([collection]);
    assert.equal(balance, 0n);
  });

  it("Should sum multiple tips on same collection", async function () {
    const observations = await viem.deployContract("Observations");
    const tip1 = parseEther("0.01");
    const tip2 = parseEther("0.02");

    await observations.write.observe([collection, tokenId, "First tip.", 0, 0], { value: tip1 });
    await observations.write.observe([collection, 2n, "Second tip.", 0, 0], { value: tip2 });

    const [balance] = await observations.read.tips([collection]);
    assert.equal(balance, tip1 + tip2);
  });

  it("Should set unclaimedSince on first tip and not reset on subsequent tips", async function () {
    const observations = await viem.deployContract("Observations");
    const tip = parseEther("0.01");

    await observations.write.observe([collection, tokenId, "First.", 0, 0], { value: tip });
    const [, firstUnclaimed] = await observations.read.tips([collection]);
    assert.ok(firstUnclaimed > 0n);

    await observations.write.observe([collection, tokenId, "Second.", 0, 0], { value: tip });
    const [, secondUnclaimed] = await observations.read.tips([collection]);
    assert.equal(firstUnclaimed, secondUnclaimed);
  });

  it("Should allow collection owner to claim tips", async function () {
    const observations = await viem.deployContract("Observations");
    const mockOwnable = await viem.deployContract("MockOwnable", [walletClient.account.address]);
    const tip = parseEther("0.1");

    await observations.write.observe([mockOwnable.address, tokenId, "Tipped.", 0, 0], { value: tip });

    const balanceBefore = await publicClient.getBalance({ address: walletClient.account.address });
    const hash = await observations.write.claimTips([mockOwnable.address]);
    const receipt = await publicClient.getTransactionReceipt({ hash });
    const gasUsed = receipt.gasUsed * receipt.effectiveGasPrice;
    const balanceAfter = await publicClient.getBalance({ address: walletClient.account.address });

    assert.equal(balanceAfter, balanceBefore + tip - gasUsed);

    const [remaining] = await observations.read.tips([mockOwnable.address]);
    assert.equal(remaining, 0n);
  });

  it("Should reset unclaimedSince on claim", async function () {
    const observations = await viem.deployContract("Observations");
    const mockOwnable = await viem.deployContract("MockOwnable", [walletClient.account.address]);
    const tip = parseEther("0.01");

    await observations.write.observe([mockOwnable.address, tokenId, "Tipped.", 0, 0], { value: tip });
    await observations.write.claimTips([mockOwnable.address]);

    const [, unclaimed] = await observations.read.tips([mockOwnable.address]);
    assert.equal(unclaimed, 0n);
  });

  it("Should revert claim for non-authorized caller", async function () {
    const [, otherWallet] = await viem.getWalletClients();
    const observations = await viem.deployContract("Observations");
    const mockOwnable = await viem.deployContract("MockOwnable", [walletClient.account.address]);
    const tip = parseEther("0.01");

    await observations.write.observe([mockOwnable.address, tokenId, "Tipped.", 0, 0], { value: tip });

    await assert.rejects(
      observations.write.claimTips([mockOwnable.address], { account: otherWallet.account }),
      /Not authorized/,
    );
  });

  it("Should revert claim when no tips exist", async function () {
    const observations = await viem.deployContract("Observations");

    await assert.rejects(
      observations.write.claimTips([collection]),
      /No tips to claim/,
    );
  });

  it("Should prevent protocol owner from claiming before 1 year", async function () {
    const observations = await viem.deployContract("Observations");
    // Collection is an EOA (no owner() function) — only protocol owner can claim
    const tip = parseEther("0.01");

    await observations.write.observe([collection, tokenId, "Tipped.", 0, 0], { value: tip });

    await assert.rejects(
      observations.write.claimTips([collection]),
      /Tips not yet sweepable/,
    );
  });

  it("Should allow protocol owner to sweep after 1 year", async function () {
    const observations = await viem.deployContract("Observations");
    const tip = parseEther("0.01");

    await observations.write.observe([collection, tokenId, "Tipped.", 0, 0], { value: tip });

    // Advance time by 1 year + 1 second
    await publicClient.request({ method: "evm_increaseTime" as any, params: [365 * 24 * 60 * 60 + 1] });
    await publicClient.request({ method: "evm_mine" as any, params: [] });

    const balanceBefore = await publicClient.getBalance({ address: walletClient.account.address });
    const hash = await observations.write.claimTips([collection]);
    const receipt = await publicClient.getTransactionReceipt({ hash });
    const gasUsed = receipt.gasUsed * receipt.effectiveGasPrice;
    const balanceAfter = await publicClient.getBalance({ address: walletClient.account.address });

    assert.equal(balanceAfter, balanceBefore + tip - gasUsed);
  });

  it("Should only allow protocol owner to claim for collection without owner()", async function () {
    const observations = await viem.deployContract("Observations");
    const tip = parseEther("0.01");

    // collection is an EOA — no owner() — so only protocol owner after 1 year
    await observations.write.observe([collection, tokenId, "Tipped.", 0, 0], { value: tip });

    // Protocol owner can't claim before 1 year
    await assert.rejects(
      observations.write.claimTips([collection]),
      /Tips not yet sweepable/,
    );

    // Fast forward 1 year + 1
    await publicClient.request({ method: "evm_increaseTime" as any, params: [365 * 24 * 60 * 60 + 1] });
    await publicClient.request({ method: "evm_mine" as any, params: [] });

    // Now protocol owner can claim
    await observations.write.claimTips([collection]);

    const [remaining] = await observations.read.tips([collection]);
    assert.equal(remaining, 0n);
  });

  it("Should emit TipsClaimed event", async function () {
    const observations = await viem.deployContract("Observations");
    const mockOwnable = await viem.deployContract("MockOwnable", [walletClient.account.address]);
    const tip = parseEther("0.05");

    await observations.write.observe([mockOwnable.address, tokenId, "Tipped.", 0, 0], { value: tip });

    await viem.assertions.emitWithArgs(
      observations.write.claimTips([mockOwnable.address]),
      observations,
      "TipsClaimed",
      [getAddress(mockOwnable.address), getAddress(walletClient.account.address), tip],
    );
  });
});
