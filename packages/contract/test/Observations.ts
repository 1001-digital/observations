import assert from "node:assert/strict";
import { describe, it } from "node:test";

import { network } from "hardhat";
import { getAddress, parseEther, zeroAddress } from "viem";

describe("Observations", async function () {
  const { viem } = await network.connect();
  const publicClient = await viem.getPublicClient();
  const [walletClient] = await viem.getWalletClients();

  const collection = getAddress("0x036721e5A769Cc48B3189EFb9CCE4C97e7C3C1f5");
  const tokenId = 1n;
  const unclaimedTipsRecipient = getAddress("0x5Ca3d797BF631603efCB3885C8B50A6d60834600");

  it("Should emit an Observation event", async function () {
    const observations = await viem.deployContract("Observations");

    await viem.assertions.emitWithArgs(
      observations.write.observe([collection, tokenId, 0n, false, "Beautiful piece.", 0, 0, zeroAddress]),
      observations,
      "Observation",
      [collection, tokenId, getAddress(walletClient.account.address), 1n, 0n, false, "Beautiful piece.", false, 0, 0, 0, 0, 0n, zeroAddress],
    );
  });

  it("Should emit a located Observation event", async function () {
    const observations = await viem.deployContract("Observations");

    await viem.assertions.emitWithArgs(
      observations.write.observeAt([collection, tokenId, 0n, false, "Detail in the corner.", 120, 340, 0, 0, zeroAddress]),
      observations,
      "Observation",
      [collection, tokenId, getAddress(walletClient.account.address), 1n, 0n, false, "Detail in the corner.", true, 120, 340, 0, 0, 0n, zeroAddress],
    );
  });

  it("Should emit an Observation event with animation view", async function () {
    const observations = await viem.deployContract("Observations");

    await viem.assertions.emitWithArgs(
      observations.write.observe([collection, tokenId, 0n, false, "Fluid motion.", 1, 0, zeroAddress]),
      observations,
      "Observation",
      [collection, tokenId, getAddress(walletClient.account.address), 1n, 0n, false, "Fluid motion.", false, 0, 0, 1, 0, 0n, zeroAddress],
    );
  });

  it("Should emit a located Observation event with animation view", async function () {
    const observations = await viem.deployContract("Observations");

    await viem.assertions.emitWithArgs(
      observations.write.observeAt([collection, tokenId, 0n, false, "Movement here.", 50, 75, 1, 0, zeroAddress]),
      observations,
      "Observation",
      [collection, tokenId, getAddress(walletClient.account.address), 1n, 0n, false, "Movement here.", true, 50, 75, 1, 0, 0n, zeroAddress],
    );
  });

  it("Should track the observation count", async function () {
    const observations = await viem.deployContract("Observations");

    await observations.write.observe([collection, tokenId, 0n, false, "First.", 0, 0, zeroAddress]);
    await observations.write.observe([collection, tokenId, 0n, false, "Second.", 0, 0, zeroAddress]);
    await observations.write.observeAt([collection, tokenId, 0n, false, "Third.", 10, 20, 0, 0, zeroAddress]);

    const [count] = await observations.read.artifacts([collection, tokenId]);

    assert.equal(count, 3n);
  });

  it("Should record the first observation block", async function () {
    const observations = await viem.deployContract("Observations");

    const blockBefore = await publicClient.getBlockNumber();

    await observations.write.observe([collection, tokenId, 0n, false, "First observation.", 0, 0, zeroAddress]);

    const [, firstBlock] = await observations.read.artifacts([collection, tokenId]);

    assert.ok(firstBlock > blockBefore);
  });

  it("Should not update firstBlock on subsequent observations", async function () {
    const observations = await viem.deployContract("Observations");

    await observations.write.observe([collection, tokenId, 0n, false, "First.", 0, 0, zeroAddress]);
    const [, firstBlock] = await observations.read.artifacts([collection, tokenId]);

    await observations.write.observe([collection, tokenId, 0n, false, "Second.", 0, 0, zeroAddress]);
    const [, firstBlockAfter] = await observations.read.artifacts([collection, tokenId]);

    assert.equal(firstBlock, firstBlockAfter);
  });

  it("Should track artifacts independently", async function () {
    const observations = await viem.deployContract("Observations");
    const otherToken = 99n;

    await observations.write.observe([collection, tokenId, 0n, false, "On token 1.", 0, 0, zeroAddress]);
    await observations.write.observe([collection, otherToken, 0n, false, "On token 99.", 0, 0, zeroAddress]);
    await observations.write.observe([collection, otherToken, 0n, false, "Again on 99.", 0, 0, zeroAddress]);

    const [count1] = await observations.read.artifacts([collection, tokenId]);
    const [count99] = await observations.read.artifacts([collection, otherToken]);

    assert.equal(count1, 1n);
    assert.equal(count99, 2n);
  });

  it("Should be filterable by collection and tokenId in logs", async function () {
    const observations = await viem.deployContract("Observations");
    const deployBlock = await publicClient.getBlockNumber();
    const otherToken = 42n;

    await observations.write.observe([collection, tokenId, 0n, false, "Note A.", 0, 0, zeroAddress]);
    await observations.write.observe([collection, otherToken, 0n, false, "Note B.", 0, 0, zeroAddress]);
    await observations.write.observe([collection, tokenId, 0n, false, "Note C.", 0, 0, zeroAddress]);

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

  it("Should accumulate tips per recipient", async function () {
    const observations = await viem.deployContract("Observations");
    const recipient = walletClient.account.address;
    const tipAmount = parseEther("0.01");

    await observations.write.observe([collection, tokenId, 0n, false, "Nice.", 0, 0, recipient], { value: tipAmount });

    const [balance] = await observations.read.tips([recipient]);
    assert.equal(balance, tipAmount);
  });

  it("Should emit tip amount and recipient in Observation event", async function () {
    const observations = await viem.deployContract("Observations");
    const recipient = walletClient.account.address;
    const tipAmount = parseEther("0.05");

    await viem.assertions.emitWithArgs(
      observations.write.observe([collection, tokenId, 0n, false, "Tipped.", 0, 0, recipient], { value: tipAmount }),
      observations,
      "Observation",
      [collection, tokenId, getAddress(walletClient.account.address), 1n, 0n, false, "Tipped.", false, 0, 0, 0, 0, tipAmount, getAddress(recipient)],
    );
  });

  it("Should work with zero tip (backward compatible)", async function () {
    const observations = await viem.deployContract("Observations");

    await observations.write.observe([collection, tokenId, 0n, false, "Free.", 0, 0, zeroAddress]);

    const [balance] = await observations.read.tips([zeroAddress]);
    assert.equal(balance, 0n);
  });

  it("Should sum multiple tips for same recipient", async function () {
    const observations = await viem.deployContract("Observations");
    const recipient = walletClient.account.address;
    const tip1 = parseEther("0.01");
    const tip2 = parseEther("0.02");

    await observations.write.observe([collection, tokenId, 0n, false, "First tip.", 0, 0, recipient], { value: tip1 });
    await observations.write.observe([collection, 2n, 0n, false, "Second tip.", 0, 0, recipient], { value: tip2 });

    const [balance] = await observations.read.tips([recipient]);
    assert.equal(balance, tip1 + tip2);
  });

  it("Should track tips per recipient, not per collection", async function () {
    const [, otherWallet] = await viem.getWalletClients();
    const observations = await viem.deployContract("Observations");
    const recipientA = walletClient.account.address;
    const recipientB = otherWallet.account.address;
    const tipA = parseEther("0.03");
    const tipB = parseEther("0.07");

    // Same collection, different recipients
    await observations.write.observe([collection, tokenId, 0n, false, "Tip A.", 0, 0, recipientA], { value: tipA });
    await observations.write.observe([collection, tokenId, 0n, false, "Tip B.", 0, 0, recipientB], { value: tipB });

    const [balanceA] = await observations.read.tips([recipientA]);
    const [balanceB] = await observations.read.tips([recipientB]);
    assert.equal(balanceA, tipA);
    assert.equal(balanceB, tipB);
  });

  it("Should set unclaimedSince on first tip and not reset on subsequent tips", async function () {
    const observations = await viem.deployContract("Observations");
    const recipient = walletClient.account.address;
    const tip = parseEther("0.01");

    await observations.write.observe([collection, tokenId, 0n, false, "First.", 0, 0, recipient], { value: tip });
    const [, firstUnclaimed] = await observations.read.tips([recipient]);
    assert.ok(firstUnclaimed > 0n);

    await observations.write.observe([collection, tokenId, 0n, false, "Second.", 0, 0, recipient], { value: tip });
    const [, secondUnclaimed] = await observations.read.tips([recipient]);
    assert.equal(firstUnclaimed, secondUnclaimed);
  });

  it("Should allow recipient to claim tips", async function () {
    const [, otherWallet] = await viem.getWalletClients();
    const observations = await viem.deployContract("Observations");
    const recipient = otherWallet.account.address;
    const tip = parseEther("0.1");

    await observations.write.observe([collection, tokenId, 0n, false, "Tipped.", 0, 0, recipient], { value: tip });

    const balanceBefore = await publicClient.getBalance({ address: recipient });
    const hash = await observations.write.claimTips([recipient], { account: otherWallet.account });
    const receipt = await publicClient.getTransactionReceipt({ hash });
    const gasUsed = receipt.gasUsed * receipt.effectiveGasPrice;
    const balanceAfter = await publicClient.getBalance({ address: recipient });

    assert.equal(balanceAfter, balanceBefore + tip - gasUsed);

    const [remaining] = await observations.read.tips([recipient]);
    assert.equal(remaining, 0n);
  });

  it("Should reset unclaimedSince on claim", async function () {
    const observations = await viem.deployContract("Observations");
    const recipient = walletClient.account.address;
    const tip = parseEther("0.01");

    await observations.write.observe([collection, tokenId, 0n, false, "Tipped.", 0, 0, recipient], { value: tip });
    await observations.write.claimTips([recipient]);

    const [, unclaimed] = await observations.read.tips([recipient]);
    assert.equal(unclaimed, 0n);
  });

  it("Should revert claim for non-authorized caller", async function () {
    const [, otherWallet] = await viem.getWalletClients();
    const observations = await viem.deployContract("Observations");
    const recipient = walletClient.account.address;
    const tip = parseEther("0.01");

    await observations.write.observe([collection, tokenId, 0n, false, "Tipped.", 0, 0, recipient], { value: tip });

    await assert.rejects(
      observations.write.claimTips([recipient], { account: otherWallet.account }),
      /NotAuthorized/,
    );
  });

  it("Should revert claim when no tips exist", async function () {
    const observations = await viem.deployContract("Observations");

    await assert.rejects(
      observations.write.claimTips([walletClient.account.address]),
      /NoTipsToClaim/,
    );
  });

  it("Should prevent protocol owner from claiming before 1 year", async function () {
    const observations = await viem.deployContract("Observations");
    const recipient = walletClient.account.address;
    const tip = parseEther("0.01");

    await observations.write.observe([collection, tokenId, 0n, false, "Tipped.", 0, 0, recipient], { value: tip });

    // Impersonate the protocol owner (Safe multisig)
    await publicClient.request({ method: "hardhat_impersonateAccount" as any, params: [unclaimedTipsRecipient] });
    await walletClient.sendTransaction({ to: unclaimedTipsRecipient, value: parseEther("1") });

    await assert.rejects(
      observations.write.claimTips([recipient], { account: unclaimedTipsRecipient }),
      /TipsNotYetClaimable/,
    );

    await publicClient.request({ method: "hardhat_stopImpersonatingAccount" as any, params: [unclaimedTipsRecipient] });
  });

  it("Should allow protocol owner to sweep after 1 year", async function () {
    const observations = await viem.deployContract("Observations");
    const recipient = walletClient.account.address;
    const tip = parseEther("0.01");

    await observations.write.observe([collection, tokenId, 0n, false, "Tipped.", 0, 0, recipient], { value: tip });

    // Advance time by 1 year + 1 second
    await publicClient.request({ method: "evm_increaseTime" as any, params: [365 * 24 * 60 * 60 + 1] });
    await publicClient.request({ method: "evm_mine" as any, params: [] });

    // Impersonate the protocol owner (Safe multisig)
    await publicClient.request({ method: "hardhat_impersonateAccount" as any, params: [unclaimedTipsRecipient] });
    await walletClient.sendTransaction({ to: unclaimedTipsRecipient, value: parseEther("1") });

    const balanceBefore = await publicClient.getBalance({ address: unclaimedTipsRecipient });
    const hash = await observations.write.claimTips([recipient], { account: unclaimedTipsRecipient });
    const receipt = await publicClient.getTransactionReceipt({ hash });
    const gasUsed = receipt.gasUsed * receipt.effectiveGasPrice;
    const balanceAfter = await publicClient.getBalance({ address: unclaimedTipsRecipient });

    assert.equal(balanceAfter, balanceBefore + tip - gasUsed);

    await publicClient.request({ method: "hardhat_stopImpersonatingAccount" as any, params: [unclaimedTipsRecipient] });
  });

  it("Should emit TipsClaimed event", async function () {
    const observations = await viem.deployContract("Observations");
    const recipient = walletClient.account.address;
    const tip = parseEther("0.05");

    await observations.write.observe([collection, tokenId, 0n, false, "Tipped.", 0, 0, recipient], { value: tip });

    await viem.assertions.emitWithArgs(
      observations.write.claimTips([recipient]),
      observations,
      "TipsClaimed",
      [getAddress(recipient), getAddress(walletClient.account.address), tip],
    );
  });

  it("Should handle claim-then-retip-then-reclaim cycle", async function () {
    const observations = await viem.deployContract("Observations");
    const recipient = walletClient.account.address;
    const tip1 = parseEther("0.01");
    const tip2 = parseEther("0.02");

    // First tip and claim
    await observations.write.observe([collection, tokenId, 0n, false, "First.", 0, 0, recipient], { value: tip1 });
    await observations.write.claimTips([recipient]);

    const [balanceAfterClaim, unclaimedAfterClaim] = await observations.read.tips([recipient]);
    assert.equal(balanceAfterClaim, 0n);
    assert.equal(unclaimedAfterClaim, 0n);

    // New tips arrive
    await observations.write.observe([collection, tokenId, 0n, false, "Second.", 0, 0, recipient], { value: tip2 });

    const [balanceAfterRetip, unclaimedAfterRetip] = await observations.read.tips([recipient]);
    assert.equal(balanceAfterRetip, tip2);
    assert.ok(unclaimedAfterRetip > 0n);

    // Claim again
    const balanceBefore = await publicClient.getBalance({ address: walletClient.account.address });
    const hash = await observations.write.claimTips([recipient]);
    const receipt = await publicClient.getTransactionReceipt({ hash });
    const gasUsed = receipt.gasUsed * receipt.effectiveGasPrice;
    const balanceAfter = await publicClient.getBalance({ address: walletClient.account.address });

    assert.equal(balanceAfter, balanceBefore + tip2 - gasUsed);
  });

  it("Should resist reentrancy on claimTips", async function () {
    const observations = await viem.deployContract("Observations");
    const attacker = await viem.deployContract("MockReentrantClaimer");
    const tip = parseEther("0.1");

    // The attacker contract is the recipient
    await observations.write.observe([collection, tokenId, 0n, false, "Tipped.", 0, 0, attacker.address], { value: tip });
    await attacker.write.setTarget([observations.address, attacker.address]);

    // The re-entrant receive() will try to call claimTips again.
    // Balance is zeroed before the transfer, so the re-entrant call should revert with "No tips to claim".
    await assert.rejects(
      attacker.write.claim(),
      (err: any) => {
        // The outer call reverts because the re-entrant call reverts inside receive()
        return true;
      },
    );

    // Verify tips were NOT drained (balance should still be intact since the whole tx reverted)
    const [remaining] = await observations.read.tips([attacker.address]);
    assert.equal(remaining, tip);
  });

  it("Should keep tips separate across recipients", async function () {
    const [, otherWallet] = await viem.getWalletClients();
    const observations = await viem.deployContract("Observations");
    const recipientA = walletClient.account.address;
    const recipientB = otherWallet.account.address;
    const tipA = parseEther("0.03");
    const tipB = parseEther("0.07");

    await observations.write.observe([collection, tokenId, 0n, false, "Tip A.", 0, 0, recipientA], { value: tipA });
    await observations.write.observe([collection, tokenId, 0n, false, "Tip B.", 0, 0, recipientB], { value: tipB });

    // Claim only recipient A
    await observations.write.claimTips([recipientA]);

    const [remainingA] = await observations.read.tips([recipientA]);
    const [remainingB] = await observations.read.tips([recipientB]);
    assert.equal(remainingA, 0n);
    assert.equal(remainingB, tipB);
  });

  it("Should revert with 'Transfer failed' when recipient cannot receive ETH", async function () {
    const observations = await viem.deployContract("Observations");
    const mockNoReceive = await viem.deployContract("MockNoReceive");
    const tip = parseEther("0.01");

    // Tips go to mockNoReceive's address
    await observations.write.observe([collection, tokenId, 0n, false, "Tipped.", 0, 0, mockNoReceive.address], { value: tip });

    // MockNoReceive.claim() calls claimTips(address(this)) — authorized as msg.sender == recipient,
    // but the ETH transfer to MockNoReceive fails because it has no receive/fallback.
    await assert.rejects(
      mockNoReceive.write.claim([observations.address]),
      /TransferFailed/,
    );
  });

  it("Should accumulate tips via observeAt", async function () {
    const observations = await viem.deployContract("Observations");
    const recipient = walletClient.account.address;
    const tip = parseEther("0.02");

    await observations.write.observeAt([collection, tokenId, 0n, false, "Spotted.", 10, 20, 0, 0, recipient], { value: tip });

    const [balance] = await observations.read.tips([recipient]);
    assert.equal(balance, tip);
  });

  it("Should revert when tipping the zero address", async function () {
    const observations = await viem.deployContract("Observations");

    await assert.rejects(
      observations.write.observe([collection, tokenId, 0n, false, "Bad tip.", 0, 0, zeroAddress], { value: parseEther("0.01") }),
      /InvalidRecipient/,
    );
  });

  it("Should allow observing with zero address when no tip", async function () {
    const observations = await viem.deployContract("Observations");

    await observations.write.observe([collection, tokenId, 0n, false, "Free observation.", 0, 0, zeroAddress]);

    const [count] = await observations.read.artifacts([collection, tokenId]);
    assert.equal(count, 1n);
  });

  // --- Threading & updates ---

  it("Should emit sequential IDs", async function () {
    const observations = await viem.deployContract("Observations");

    await viem.assertions.emitWithArgs(
      observations.write.observe([collection, tokenId, 0n, false, "First.", 0, 0, zeroAddress]),
      observations,
      "Observation",
      [collection, tokenId, getAddress(walletClient.account.address), 1n, 0n, false, "First.", false, 0, 0, 0, 0, 0n, zeroAddress],
    );

    await viem.assertions.emitWithArgs(
      observations.write.observe([collection, tokenId, 0n, false, "Second.", 0, 0, zeroAddress]),
      observations,
      "Observation",
      [collection, tokenId, getAddress(walletClient.account.address), 2n, 0n, false, "Second.", false, 0, 0, 0, 0, 0n, zeroAddress],
    );

    await viem.assertions.emitWithArgs(
      observations.write.observe([collection, tokenId, 0n, false, "Third.", 0, 0, zeroAddress]),
      observations,
      "Observation",
      [collection, tokenId, getAddress(walletClient.account.address), 3n, 0n, false, "Third.", false, 0, 0, 0, 0, 0n, zeroAddress],
    );
  });

  it("Should allow reply to existing observation", async function () {
    const observations = await viem.deployContract("Observations");

    await observations.write.observe([collection, tokenId, 0n, false, "Original.", 0, 0, zeroAddress]);

    await viem.assertions.emitWithArgs(
      observations.write.observe([collection, tokenId, 1n, false, "Reply.", 0, 0, zeroAddress]),
      observations,
      "Observation",
      [collection, tokenId, getAddress(walletClient.account.address), 2n, 1n, false, "Reply.", false, 0, 0, 0, 0, 0n, zeroAddress],
    );
  });

  it("Should allow nested replies", async function () {
    const observations = await viem.deployContract("Observations");

    await observations.write.observe([collection, tokenId, 0n, false, "Root.", 0, 0, zeroAddress]);
    await observations.write.observe([collection, tokenId, 1n, false, "Reply.", 0, 0, zeroAddress]);

    await viem.assertions.emitWithArgs(
      observations.write.observe([collection, tokenId, 2n, false, "Nested reply.", 0, 0, zeroAddress]),
      observations,
      "Observation",
      [collection, tokenId, getAddress(walletClient.account.address), 3n, 2n, false, "Nested reply.", false, 0, 0, 0, 0, 0n, zeroAddress],
    );
  });

  it("Should allow update with valid parent", async function () {
    const observations = await viem.deployContract("Observations");

    await observations.write.observe([collection, tokenId, 0n, false, "Original.", 0, 0, zeroAddress]);

    await viem.assertions.emitWithArgs(
      observations.write.observe([collection, tokenId, 1n, true, "Edited.", 0, 0, zeroAddress]),
      observations,
      "Observation",
      [collection, tokenId, getAddress(walletClient.account.address), 2n, 1n, true, "Edited.", false, 0, 0, 0, 0, 0n, zeroAddress],
    );
  });

  it("Should allow deletion (update with empty note)", async function () {
    const observations = await viem.deployContract("Observations");

    await observations.write.observe([collection, tokenId, 0n, false, "To delete.", 0, 0, zeroAddress]);

    await viem.assertions.emitWithArgs(
      observations.write.observe([collection, tokenId, 1n, true, "", 0, 0, zeroAddress]),
      observations,
      "Observation",
      [collection, tokenId, getAddress(walletClient.account.address), 2n, 1n, true, "", false, 0, 0, 0, 0, 0n, zeroAddress],
    );
  });

  it("Should reject invalid parent ID", async function () {
    const observations = await viem.deployContract("Observations");

    await observations.write.observe([collection, tokenId, 0n, false, "First.", 0, 0, zeroAddress]);

    await assert.rejects(
      observations.write.observe([collection, tokenId, 5n, false, "Bad ref.", 0, 0, zeroAddress]),
      /InvalidParent/,
    );
  });

  it("Should reject update without parent", async function () {
    const observations = await viem.deployContract("Observations");

    await assert.rejects(
      observations.write.observe([collection, tokenId, 0n, true, "Bad update.", 0, 0, zeroAddress]),
      /UpdateRequiresParent/,
    );
  });

  it("Should scope IDs per artifact", async function () {
    const observations = await viem.deployContract("Observations");
    const otherToken = 99n;

    await observations.write.observe([collection, tokenId, 0n, false, "A1.", 0, 0, zeroAddress]);
    await observations.write.observe([collection, tokenId, 0n, false, "A2.", 0, 0, zeroAddress]);
    await observations.write.observe([collection, otherToken, 0n, false, "B1.", 0, 0, zeroAddress]);

    // Token 1 has count=2, token 99 has count=1 (independent sequences)
    const [count1] = await observations.read.artifacts([collection, tokenId]);
    const [count99] = await observations.read.artifacts([collection, otherToken]);

    assert.equal(count1, 2n);
    assert.equal(count99, 1n);

    // Reply to observation 1 on token 99 should work
    await viem.assertions.emitWithArgs(
      observations.write.observe([collection, otherToken, 1n, false, "B1 reply.", 0, 0, zeroAddress]),
      observations,
      "Observation",
      [collection, otherToken, getAddress(walletClient.account.address), 2n, 1n, false, "B1 reply.", false, 0, 0, 0, 0, 0n, zeroAddress],
    );
  });

  it("Should reject cross-artifact parent reference", async function () {
    const observations = await viem.deployContract("Observations");
    const otherToken = 99n;

    await observations.write.observe([collection, tokenId, 0n, false, "On token 1.", 0, 0, zeroAddress]);
    await observations.write.observe([collection, tokenId, 0n, false, "Also on token 1.", 0, 0, zeroAddress]);

    // Token 99 has no observations — parent=1 is invalid for it
    await assert.rejects(
      observations.write.observe([collection, otherToken, 1n, false, "Bad cross-ref.", 0, 0, zeroAddress]),
      /InvalidParent/,
    );
  });

  it("Should support threading with observeAt", async function () {
    const observations = await viem.deployContract("Observations");

    await observations.write.observeAt([collection, tokenId, 0n, false, "Spot.", 10, 20, 0, 0, zeroAddress]);

    await viem.assertions.emitWithArgs(
      observations.write.observeAt([collection, tokenId, 1n, false, "Reply at spot.", 15, 25, 0, 0, zeroAddress]),
      observations,
      "Observation",
      [collection, tokenId, getAddress(walletClient.account.address), 2n, 1n, false, "Reply at spot.", true, 15, 25, 0, 0, 0n, zeroAddress],
    );
  });

  it("Should still increment count for replies and updates", async function () {
    const observations = await viem.deployContract("Observations");

    await observations.write.observe([collection, tokenId, 0n, false, "Original.", 0, 0, zeroAddress]);
    await observations.write.observe([collection, tokenId, 1n, false, "Reply.", 0, 0, zeroAddress]);
    await observations.write.observe([collection, tokenId, 1n, true, "Edit.", 0, 0, zeroAddress]);

    const [count] = await observations.read.artifacts([collection, tokenId]);
    assert.equal(count, 3n);
  });
});
