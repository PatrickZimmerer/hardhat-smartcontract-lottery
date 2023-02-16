const { getNamedAccounts, deployments, ethers, network } = require("hardhat");
const {
    developmentChains,
    networkConfig,
} = require("../../helper-hardhat-config");
const { assert, expect } = require("chai");

developmentChains.includes(network.name)
    ? describe.skip
    : describe("Raffle Staging Tests", () => {
          let raffle, raffleEntranceFee, deployer;

          beforeEach(async () => {
              const accounts = await ethers.getSigners();
              deployer = accounts[0];
              raffleContract = await ethers.getContract("Raffle");
              raffleEntranceFee = await raffle.getEntranceFee();
          });
          describe("fullfillRandomwords", () => {
              it("works with live chainlink keepers and chainlink vrf, we get a random winner", async () => {
                  const startingTimeStamp = await raffle.getLatestTimeStamp();
                  await new Promise(async (resolve, reject) => {
                      raffle.once("WinnerPicked", async () => {
                          console.log("Winner picked event fired");
                          try {
                              const recentWinner =
                                  await raffle.getRecentWinner();
                              const raffleState = await raffle.getRaffleState();
                              const winnerEndingBalance =
                                  await ayyounts[0].getBalance();
                              const endingTimeStamp =
                                  await raffle.getLatestTimeStamp();
                              await expect(raffle.getPlayer(0).to.be.reverted);
                              assert.equal(raffleState, 0);
                              assert.equal(
                                  winnerEndingBalance.toString(),
                                  winnerStartingBalance
                                      .add(raffleEntranceFee)
                                      .toString()
                              );
                              assert(endingTimeStamp > startingTimeStamp);
                              resolve();
                          } catch (error) {
                              console.log(error);
                              reject(e);
                          }
                      });
                  });
                  // Then entering the raffle
                  await raffle.enterRaffle({
                      value: raffleEntranceFee,
                  });
                  const winnerStartingBalance = await accounts[0].getBalance();
              });
          });
      });
