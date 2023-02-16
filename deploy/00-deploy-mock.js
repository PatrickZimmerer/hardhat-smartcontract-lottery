const { network } = require("hardhat");

const BASE_FEE = ethers.utils.parseEther("0.25"); // 0.25 is this the premium in LINK
const GAS_PRICE_LINK = 1e9; // link per gas, is this the gas lane? // 0.000000001 LINK per gas

module.exports = async function ({ getNamedAccounts, deployments }) {
    const { deploy, log } = deployments;
    const { deployer } = await getNamedAccounts();
    log(deployer);
    const chainId = network.config.chainId;

    if (chainId == 31337) {
        log("Local network detected! Deploying mocks...");
        await deploy("VRFCoordinatorV2Mock", {
            from: deployer,
            logs: true,
            args: [BASE_FEE, GAS_PRICE_LINK],
        });
        log("Mocks Deployed!");
        log("-----------------------------------------------");
        log(
            "You are deploying to a local network, you'll need a local network running to interact"
        );
        log(
            "Please run `yarn hardhat console --network localhost` to interact with the deployed smart contracts!"
        );
        log("-----------------------------------------------");
    }
};
