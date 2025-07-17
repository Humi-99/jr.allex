// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";

contract SpinToken is ERC20, Ownable, ReentrancyGuard {
    uint256 public constant MAX_SUPPLY = 1000000 * 10**18; // 1 million tokens
    uint256 public constant CLAIM_COOLDOWN = 24 hours;
    uint256 public constant MAX_CLAIM_AMOUNT = 1000 * 10**18; // 1000 tokens max per claim
    uint256 public constant CLAIM_FEE = 0.001 ether; // 0.001 ETH fee per claim
    
    mapping(address => uint256) public lastClaimTime;
    mapping(address => uint256) public totalClaimed;
    mapping(address => uint256) public gamePoints;
    
    event TokensClaimed(address indexed user, uint256 amount, uint256 fee);
    event GameReward(address indexed user, uint256 amount, uint256 multiplier);
    event PointsConverted(address indexed user, uint256 points, uint256 tokens);
    event FeesWithdrawn(address indexed owner, uint256 amount);
    
    constructor() ERC20("SpinToken", "SPIN") {
        // Mint initial supply to contract for distribution
        _mint(address(this), MAX_SUPPLY);
    }
    
    function claimTokens() external payable nonReentrant {
        require(msg.value >= CLAIM_FEE, "Insufficient fee sent");
        require(
            block.timestamp >= lastClaimTime[msg.sender] + CLAIM_COOLDOWN,
            "Claim cooldown not met"
        );
        require(
            balanceOf(address(this)) >= MAX_CLAIM_AMOUNT,
            "Insufficient tokens in contract"
        );
        
        lastClaimTime[msg.sender] = block.timestamp;
        totalClaimed[msg.sender] += MAX_CLAIM_AMOUNT;
        
        // Transfer tokens from contract to user
        _transfer(address(this), msg.sender, MAX_CLAIM_AMOUNT);
        
        // Refund excess ETH
        if (msg.value > CLAIM_FEE) {
            payable(msg.sender).transfer(msg.value - CLAIM_FEE);
        }
        
        emit TokensClaimed(msg.sender, MAX_CLAIM_AMOUNT, CLAIM_FEE);
    }
    
    function addGamePoints(address user, uint256 points) external onlyOwner {
        gamePoints[user] += points;
    }
    
    function convertPointsToTokens(uint256 points) external nonReentrant {
        require(gamePoints[msg.sender] >= points, "Insufficient game points");
        require(points > 0, "Points must be greater than 0");
        
        uint256 tokensToMint = points * 10**18; // 1 point = 1 token
        require(
            balanceOf(address(this)) >= tokensToMint,
            "Insufficient tokens in contract"
        );
        
        gamePoints[msg.sender] -= points;
        
        // Transfer tokens from contract to user
        _transfer(address(this), msg.sender, tokensToMint);
        
        emit PointsConverted(msg.sender, points, tokensToMint);
    }
    
    function distributeReward(address user, uint256 amount, uint256 multiplier) external onlyOwner {
        require(user != address(0), "Invalid user address");
        require(amount > 0, "Amount must be greater than 0");
        require(
            balanceOf(address(this)) >= amount,
            "Insufficient tokens in contract"
        );
        
        _transfer(address(this), user, amount);
        
        emit GameReward(user, amount, multiplier);
    }
    
    function getClaimableAmount(address user) external view returns (uint256) {
        if (block.timestamp < lastClaimTime[user] + CLAIM_COOLDOWN) {
            return 0;
        }
        return MAX_CLAIM_AMOUNT;
    }
    
    function getTimeUntilNextClaim(address user) external view returns (uint256) {
        if (block.timestamp >= lastClaimTime[user] + CLAIM_COOLDOWN) {
            return 0;
        }
        return (lastClaimTime[user] + CLAIM_COOLDOWN) - block.timestamp;
    }
    
    function getUserStats(address user) external view returns (
        uint256 balance,
        uint256 totalClaimedAmount,
        uint256 lastClaim,
        uint256 timeUntilNextClaim,
        uint256 claimableAmount,
        uint256 userGamePoints
    ) {
        balance = balanceOf(user);
        totalClaimedAmount = totalClaimed[user];
        lastClaim = lastClaimTime[user];
        timeUntilNextClaim = this.getTimeUntilNextClaim(user);
        claimableAmount = this.getClaimableAmount(user);
        userGamePoints = gamePoints[user];
    }
    
    function getContractBalance() external view returns (uint256) {
        return balanceOf(address(this));
    }
    
    function withdrawFees() external onlyOwner {
        uint256 balance = address(this).balance;
        require(balance > 0, "No fees to withdraw");
        
        payable(owner()).transfer(balance);
        
        emit FeesWithdrawn(owner(), balance);
    }
    
    // Emergency function to withdraw remaining tokens
    function emergencyWithdraw() external onlyOwner {
        uint256 balance = balanceOf(address(this));
        if (balance > 0) {
            _transfer(address(this), owner(), balance);
        }
    }
    
    receive() external payable {}
}