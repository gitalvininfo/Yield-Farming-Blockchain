pragma solidity ^0.5.0;

import "./DappToken.sol";
import "./DaiToken.sol";

contract TokenFarm {
    string public name = "Dapp Token Farm";
    DappToken public dappToken;
    DaiToken public daiToken;
    address public owner;

    address[] public stakers;
    mapping(address => uint256) public stakingBalance;
    mapping(address => bool) public hasStaked;
    mapping(address => bool) public isStaking;

    constructor(DappToken _dappToken, DaiToken _daiToken) public {
        dappToken = _dappToken;
        daiToken = _daiToken;
        owner = msg.sender;
    }

    // 1. Stakes tokens
    // investor deposit the DAI in to smart contract to earn rewards
    function stakeTokens(uint256 _amount) public {
        require(_amount > 0, "amount cannot be 0");
        // transfer mock dai tokens to this contract for staking
        daiToken.transferFrom(msg.sender, address(this), _amount);

        // update staking balance
        stakingBalance[msg.sender] = stakingBalance[msg.sender] + _amount;

        // add user to stakers array only if they haven't staked
        if (!hasStaked[msg.sender]) {
            stakers.push(msg.sender);
        }

        // update staking status
        isStaking[msg.sender] = true;
        hasStaked[msg.sender] = true;
    }

    // 2. Unstake tokens (withdraw)
    function unstakeTokens() public {
        // fetch staking balance
        uint256 balance = stakingBalance[msg.sender];
        // require greater than 0 amount
        require(balance > 0, "staking balance cannot be 0");
        // transfer mock dai token to the user
        daiToken.transfer(msg.sender, balance);

        // reset balance to 0
        stakingBalance[msg.sender] = 0;
        // update staking balance
        isStaking[msg.sender] = false;
    }

    // 3. Issuing tokens
    function issueTokens() public {
        require(msg.sender == owner, "caller must be owner");
        for (uint256 i = 0; i < stakers.length; i++) {
            // find the investor in stakers
            address recipient = stakers[i];
            // find its balance then return as Dapp token equal to how many dai the investor invest
            uint256 balance = stakingBalance[recipient];
            if (balance > 0) {
                dappToken.transfer(recipient, balance);
            }
        }
    }
}
