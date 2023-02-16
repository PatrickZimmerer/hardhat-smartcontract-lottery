const { getNamedAccounts, deployments, ethers, network } = require("hardhat");
const {
    developmentChains,
    networkConfig,
} = require("../../helper-hardhat-config");
const { assert, expect } = require("chai");

!developmentChains.includes(network.name)
    ? describe.skip
    : describe("Raffle Unit Tests", () => {
          let raffle, vrfCoordinatorV2Mock;
          const chainId = network.config.chainId;

          beforeEach(async () => {
              accounts = await ethers.getSigners(); // could also do with getNamedAccounts
              deployer = accounts[0];
              player = accounts[1];
              await deployments.fixture(["mocks", "raffle"]);
              vrfCoordinatorV2Mock = await ethers.getContract(
                  "VRFCoordinatorV2Mock"
              );
              raffleContract = await ethers.getContract("Raffle");
              raffle = raffleContract.connect(player);
              const subscriptionId = raffle.getSubscriptionId();
              await vrfCoordinatorV2Mock.addConsumer(
                  subscriptionId,
                  raffle.address
              );
              raffleEntranceFee = await raffle.getEntranceFee();
              interval = await raffle.getInterval();
          });
          describe("constructor", async () => {
              it("Initializes the raffle correctly", async () => {
                  debugger;
                  const raffleState = await raffle.getRaffleState();
                  const interval = await raffle.getInterval();
                  assert.equal(raffleState.toString(), "0");
                  assert.equal(
                      interval.toString(),
                      networkConfig[chainId]["interval"]
                  );
              });
          });

          describe("enterRaffle", () => {
              it("reverts when you don't pay enough", async () => {
                  await expect(raffle.enterRaffle()).to.be.revertedWith(
                      // is reverted when not paid enough or raffle is not open
                      "Raffle__SendMoreToEnterRaffle"
                  );
              });
              it("records player when they enter", async () => {
                  await raffle.enterRaffle({ value: raffleEntranceFee });
                  const contractPlayer = await raffle.getPlayer(0);
                  assert.equal(player.address, contractPlayer);
              });
              it("emits event on enter", async () => {
                  await expect(
                      raffle.enterRaffle({ value: raffleEntranceFee })
                  ).to.emit(raffle, "RaffleEnter");
              });
              it("doesnt allow entrance when raffle is calculating", async () => {
                  await raffle.enterRaffle({ value: raffleEntranceFee });
                  await network.provider.send("evm_increaseTime", [
                      interval.toNumber() + 1,
                  ]);
                  await network.provider.request({
                      method: "evm_mine",
                      params: [],
                  });

                  await raffle.performUpkeep([]);
                  await expect(
                      raffle.enterRaffle({ value: raffleEntranceFee })
                  ).to.be.revertedWith(
                      // is reverted as raffle is calculating
                      "Raffle__NotOpen"
                  );
              });
          });
          describe("checkUpkeep", async () => {
              it("returns false if people haven't sent any ETH", async () => {
                  await network.provider.send("evm_increaseTime", [
                      interval.toNumber() + 1,
                  ]);
                  await network.provider.request({
                      method: "evm_mine",
                      params: [],
                  });
                  const { upkeepNeeded } = await raffle.callStatic.checkUpkeep(
                      []
                  );
                  assert(!upkeepNeeded);
              });
              it("returns false if raffle isn't open", async () => {
                  await raffle.enterRaffle({ value: raffleEntranceFee });
                  await network.provider.send("evm_increaseTime", [
                      interval.toNumber() + 1,
                  ]);
                  await network.provider.request({
                      method: "evm_mine",
                      params: [],
                  });
                  await raffle.performUpkeep([]);
                  const raffleState = await raffle.getRaffleState();
                  const { upkeepNeeded } = await raffle.callStatic.checkUpkeep(
                      []
                  );
                  assert.equal(raffleState.toString(), "1");
                  assert.equal(upkeepNeeded, false);
              });
              it("returns false if enough time hasn't passed", async () => {
                  await raffle.enterRaffle({ value: raffleEntranceFee });
                  await network.provider.send("evm_increaseTime", [
                      interval.toNumber() - 10,
                  ]);
                  await network.provider.request({
                      method: "evm_mine",
                      params: [],
                  });
                  const { upkeepNeeded } = await raffle.callStatic.checkUpkeep(
                      "0x"
                  );
                  assert(!upkeepNeeded);
              });
              it("returns true if enough time has passed, has players, eth and is open", async () => {
                  await raffle.enterRaffle({ value: raffleEntranceFee });
                  await network.provider.send("evm_increaseTime", [
                      interval.toNumber() + 1,
                  ]);
                  await network.provider.request({
                      method: "evm_mine",
                      params: [],
                  });
                  const { upkeepNeeded } = await raffle.callStatic.checkUpkeep(
                      "0x"
                  );
                  assert(upkeepNeeded);
              });
          });
      });
