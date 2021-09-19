const { assert } = require('chai');

const TokenFarm = artifacts.require("TokenFarm");
const DappToken = artifacts.require("DappToken");
const DaiToken = artifacts.require("DaiToken");

require('chai')
    .use(require('chai-as-promised'))
    .should();

function tokens(n) {
    return web3.utils.toWei(n, 'ether')
}

contract('TokenFarm', ([owner, investor]) => {
    let daiToken, dappToken, tokenFarm;

    before(async () => {
        // load contracts
        daiToken = await DaiToken.new();
        dappToken = await DappToken.new();
        tokenFarm = await TokenFarm.new(dappToken.address, daiToken.address);

        // transfer all dapp tokens to farm(1 million)
        await dappToken.transfer(tokenFarm.address, tokens('1000000'))

        // send tokens to investors
        await daiToken.transfer(investor, tokens('100'), { from: owner })
    })

    describe('mock dai deployment', async () => {
        it('has a name', async () => {
            const name = await daiToken.name();
            assert.equal(name, 'Mock DAI Token')
        })
    })

    describe('dapp token deployment', async () => {
        it('has a name', async () => {
            const name = await dappToken.name();
            assert.equal(name, 'DApp Token')
        })
    })

    describe('token farm deployment', async () => {
        it('has a name', async () => {
            const name = await tokenFarm.name();
            assert.equal(name, 'Dapp Token Farm')
        })
        it('contract has tokens', async () => {
            let balance = await dappToken.balanceOf(tokenFarm.address);
            assert.equal(balance.toString(), tokens('1000000'))
        })
    })

    describe('farming tokens', async () => {
        it('rewards investor for staking mDai tokens', async () => {
            let result;
            // check investor balance before staking
            result = await daiToken.balanceOf(investor);
            assert.equal(result.toString(), tokens('100'), 'investor mock dai wallet balance correct before staking');

            // stake mock dai tokens
            // needs to approve first before staking
            await daiToken.approve(tokenFarm.address, tokens('100'), { from: investor })
            await tokenFarm.stakeTokens(tokens('100'), { from: investor });

            // check staking result
            result = await daiToken.balanceOf(investor);
            assert.equal(result.toString(), tokens('0'), 'investor mock dai wallet balance correct after staknig')

            result = await daiToken.balanceOf(tokenFarm.address);
            assert.equal(result.toString(), tokens('100'), 'token farm address mock dai wallet balance correct after staknig')

            result = await tokenFarm.stakingBalance(investor);
            assert.equal(result.toString(), tokens('100'), 'investor staking balance correct after staking')

            result = await tokenFarm.isStaking(investor);
            assert.equal(result.toString(), 'true', 'investor staking status correct after staking')


            // issue tokens
            await tokenFarm.issueTokens({ from: owner });

            // check balance after issuance
            result = await dappToken.balanceOf(investor);
            assert.equal(result.toString(), tokens('100'), 'investor dapp token wallet balance correct after issuance')

            // ensure that only owner can issue tokens
            await tokenFarm.issueTokens({ from: investor }).should.be.rejected;

            // unstake the tokens
            await tokenFarm.unstakeTokens({ from: investor });

            // check result after unstaking
            // they withdraw all tokens in the
            result = await daiToken.balanceOf(investor);
            assert.equal(result.toString(), tokens('100'), 'investor mock dai wallet balance correct after staking');
        
            result = await daiToken.balanceOf(tokenFarm.address);
            assert.equal(result.toString(), tokens('0'), 'token farm mock dai wallet balance correct after staking')
        
            result = await tokenFarm.isStaking(investor);
            assert.equal(result.toString(), 'false', 'investor staking status correct after staking');
        })
    })
})