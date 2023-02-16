const { developmentChains } = require("../helper-hardhat-config");

const BASE_FEE = ethers.parseEther("0.25"); // 0.25 is this the premium in LINK
const GAS_PRICE_LINK = 1e9; // link per gas, is this the gas lane? // 0.000000001 LINK per gas

module.exports = async function ({ getNamedAccounts, deployments }) {
    const { deploy, log } = deployments;
    const deployer = await getNamedAccounts();
    const chainId = network.config.chainId;

    if (developmentChains.includes(network.name)) {
        log("Local network detected! Deploying mocks...");
        await deploy("VRFCoordinatorV2Mock", {
            from: deployer,
            logs: true,
            args: [BASE_FEE, GAS_PRICE_LINK],
        });
        log("Mocks Deployed!");
        log("-----------------------------------------------");
    }
};
