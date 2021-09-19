const TokenFarm = artifacts.require("TokenFarm");
const DappToken = artifacts.require("DappToken");
const DaiToken = artifacts.require("DaiToken");


module.exports = async function (deployer, network, accounts) {
    // deploy mock DAI Token
    await deployer.deploy(DaiToken);
    const daiToken = await DaiToken.deployed();

    // deploy DAPP Token
    await deployer.deploy(DappToken);
    const dappToken = await DappToken.deployed();

    // deploy TokenFarm
    await deployer.deploy(TokenFarm, dappToken.address, daiToken.address);
    const tokenFarm = await TokenFarm.deployed();

    // transfer all tokens to TokenFarm(1 million)
    await dappToken.transfer(tokenFarm.address, '100000000000000000000')

    // transfer 100 mock dai tokens to investor
    await daiToken.transfer(accounts[1], '100000000000000000000')
};
