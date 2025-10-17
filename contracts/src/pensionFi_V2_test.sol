// SPDX-License-Identifier: MIT
pragma solidity ^0.8.17;

// Smart Contract Deployed in Base Testnet 0x1F9d38B49430Edd284B9b9DF398CbA4a52f1E3db

interface IERC20 {
    function totalSupply() external view returns (uint256);
    function balanceOf(address account) external view returns (uint256);
    function transfer(address to, uint256 amount) external returns (bool);
    function allowance(address owner, address spender) external view returns (uint256);
    function approve(address spender, uint256 amount) external returns (bool);
    function transferFrom(address from,address to,uint256 amount) external returns (bool);
}

/// Chainlink Automation minimal
interface AutomationCompatibleInterface {
    function checkUpkeep(bytes calldata checkData) external returns (bool upkeepNeeded, bytes memory performData);
    function performUpkeep(bytes calldata performData) external;
}

contract PensionMVP is AutomationCompatibleInterface {
    IERC20 public immutable usdt;
    address public immutable mainWallet;
    address public immutable feeWallet;
    address public owner;

    uint256 public nextPlanId;
    uint256 public lastCheckedIndex;
    uint256 public immutable interval; // 5 min testnet, 30 days mainnet
    uint256 public immutable minDuration; // total seconds mínimo (12 pagos)
    uint256 public immutable maxDuration; // total segundos máximo (60 pagos testnet, 120 pagos mainnet)

    struct Plan {
        address beneficiary;
        uint256 paymentAmount;
        uint256 paymentsRemaining;
        uint256 lastPaid;
        bool active;
    }

    mapping(uint256 => Plan) public plans;
    uint256[] public planIds;

    event PlanCreated(uint256 indexed planId, address indexed beneficiary, uint256 totalDeposited, uint256 paymentAmount, uint256 payments);
    event PaymentExecuted(uint256 indexed planId, address indexed beneficiary, uint256 amount, uint256 paymentsRemaining);
    event PlanCompleted(uint256 indexed planId);
    event PaymentFailed(uint256 indexed planId, string reason);

    modifier onlyOwner() {
        require(msg.sender == owner, "not owner");
        _;
    }

    constructor(
        address _usdt,
        address _mainWallet,
        address _feeWallet,
        uint256 _interval,
        uint256 _minDuration,
        uint256 _maxDuration
    ) {
        require(_usdt != address(0) && _mainWallet != address(0) && _feeWallet != address(0), "zero addr");
        usdt = IERC20(_usdt);
        mainWallet = _mainWallet;
        feeWallet = _feeWallet;
        owner = msg.sender;
        nextPlanId = 1;
        interval = _interval;
        minDuration = _minDuration;
        maxDuration = _maxDuration;
    }

    /// @notice Usuario deposita según monthlyAmount y months
    function payPension(
        uint256 monthlyAmount,
        uint256 months
    ) external {
        require(monthlyAmount > 0 && months > 0, "invalid amounts");

        uint256 totalToReceive = monthlyAmount * months;
        uint256 totalAmount = (totalToReceive * 100) / 110; // aplica 10% extra

        uint256 totalDuration = months * interval;
        require(totalDuration >= minDuration, "duration < min");
        require(totalDuration <= maxDuration, "duration > max");

        // Transfer totalAmount desde el usuario al contrato
        bool ok = usdt.transferFrom(msg.sender, address(this), totalAmount);
        require(ok, "transferFrom failed");

        // Divide 95/5
        uint256 mainShare = (totalAmount * 95) / 100;
        uint256 feeShare = totalAmount - mainShare;

        require(usdt.transfer(mainWallet, mainShare), "transfer to mainWallet failed");
        require(usdt.transfer(feeWallet, feeShare), "transfer to feeWallet failed");

        // Crea plan
        uint256 planId = nextPlanId++;
        plans[planId] = Plan({
            beneficiary: msg.sender,
            paymentAmount: monthlyAmount,
            paymentsRemaining: months,
            lastPaid: block.timestamp,
            active: true
        });

        planIds.push(planId);

        emit PlanCreated(planId, msg.sender, totalAmount, monthlyAmount, months);
    }

    /// Chainlink Automation
    function checkUpkeep(bytes calldata) external override returns (bool upkeepNeeded, bytes memory performData) {
        uint256 len = planIds.length;
        if (len == 0) return (false, bytes(""));

        for (uint256 i = 0; i < len; i++) {
            uint256 idx = (lastCheckedIndex + i) % len;
            uint256 planId = planIds[idx];
            Plan storage p = plans[planId];

            if (!p.active || p.paymentsRemaining == 0) continue;
            if (block.timestamp >= p.lastPaid + interval) {
                upkeepNeeded = true;
                performData = abi.encode(planId);
                lastCheckedIndex = (idx + 1) % len;
                return (upkeepNeeded, performData);
            }
        }
        return (false, bytes(""));
    }

    function performUpkeep(bytes calldata performData) external override {
        require(performData.length == 32, "bad performData");
        uint256 planId = abi.decode(performData, (uint256));
        Plan storage p = plans[planId];
        require(p.active, "plan not active");
        require(p.paymentsRemaining > 0, "no payments left");
        require(block.timestamp >= p.lastPaid + interval, "not due yet");

        bool success = usdt.transferFrom(mainWallet, p.beneficiary, p.paymentAmount);
        if (!success) {
            emit PaymentFailed(planId, "transferFrom mainWallet failed");
            return;
        }

        p.paymentsRemaining -= 1;
        p.lastPaid += interval;

        emit PaymentExecuted(planId, p.beneficiary, p.paymentAmount, p.paymentsRemaining);

        if (p.paymentsRemaining == 0) {
            p.active = false;
            emit PlanCompleted(planId);
        }
    }

    /// Views
    function getPlanIds() external view returns (uint256[] memory) {
        return planIds;
    }

    function getPlan(uint256 planId) external view returns (
        address beneficiary,
        uint256 paymentAmount,
        uint256 paymentsRemaining,
        uint256 lastPaid,
        bool active
    ) {
        Plan storage p = plans[planId];
        beneficiary = p.beneficiary;
        paymentAmount = p.paymentAmount;
        paymentsRemaining = p.paymentsRemaining;
        lastPaid = p.lastPaid;
        active = p.active;
    }

    /// Admin
    function setOwner(address newOwner) external onlyOwner {
        require(newOwner != address(0), "zero addr");
        owner = newOwner;
    }

    function deactivatePlan(uint256 planId) external onlyOwner {
        plans[planId].active = false;
    }
}