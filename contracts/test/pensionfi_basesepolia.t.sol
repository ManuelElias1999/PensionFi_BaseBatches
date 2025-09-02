// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.24; // Updated pragma to match pensionfi_basesepolia.sol

import {Test, console} from "forge-std/Test.sol";
import {Vm} from "forge-std/Vm.sol"; // Import Vm for mocking
import {PensionMinimal, IERC20} from "../src/pensionfi_basesepolia.sol"; // Import PensionMinimal and IERC20

contract PensionMinimalTest is Test {
    PensionMinimal public pensionMinimal;

    // Define mock addresses for testing
    address public constant USER = address(0x1); // User creating the plan
    address public constant BENEFICIARY = address(0x2); // Beneficiary of the plan
    address public constant OTHER_USER = address(0x3); // Another user for potential future tests

    // Mock USDT address (the one defined in PensionMinimal)
    address public constant MOCK_USDT = 0x05105fa9611F7A23ce7008f19Bcc384a24921FE6;
    address public constant VAULT_WALLET = 0xd806A01E295386ef7a7Cea0B9DA037B242622743;

    // Mock values for plan creation
    uint256 public constant MONTHLY_AMOUNT = 100 ether; // Using ether for simplicity, assuming USDT has 18 decimals
    uint256 public constant TOTAL_MONTHS = 12;
    uint256 public constant TOTAL_DEPOSIT = MONTHLY_AMOUNT * TOTAL_MONTHS;

    function setUp() public {
        // Deploy the PensionMinimal contract
        pensionMinimal = new PensionMinimal();

        // Assert that the contract's constants match our mock constants for clarity
        assertEq(pensionMinimal.vaultWallet(), VAULT_WALLET);
        assertEq(pensionMinimal.USDT(), MOCK_USDT);
    }

    // --- Helper functions for mocking IERC20 calls ---
    function mockUsdtTransferFrom(address _from, address _to, uint256 _amount, bool _success) internal {
        vm.mockCall(
            MOCK_USDT,
            abi.encodeWithSelector(IERC20.transferFrom.selector, _from, _to, _amount),
            abi.encode(_success)
        );
    }

    function mockUsdtAllowance(address _owner, address _spender, uint256 _amount) internal {
        vm.mockCall(
            MOCK_USDT,
            abi.encodeWithSelector(IERC20.allowance.selector, _owner, _spender),
            abi.encode(_amount)
        );
    }

    function mockUsdtBalanceOf(address _account, uint256 _amount) internal {
        vm.mockCall(
            MOCK_USDT,
            abi.encodeWithSelector(IERC20.balanceOf.selector, _account),
            abi.encode(_amount)
        );
    }

    // --- Test createPlan function ---
    function test_CreatePlan_Success() public {
        vm.startPrank(USER);
        // Mock a successful transferFrom from USER to VAULT_WALLET
        mockUsdtTransferFrom(USER, VAULT_WALLET, TOTAL_DEPOSIT, true);

        // Expect the PlanCreated event
        vm.expectEmit(true, true, true, true);
        emit PensionMinimal.PlanCreated(1, BENEFICIARY, MONTHLY_AMOUNT, TOTAL_MONTHS);

        // Call createPlan
        uint256 planId = pensionMinimal.createPlan(BENEFICIARY, MONTHLY_AMOUNT, TOTAL_MONTHS);
        assertEq(planId, 1);
        assertEq(pensionMinimal.planCount(), 1);

        // Verify the stored plan data
        (address beneficiary, uint256 monthlyAmount, uint256 totalMonths, uint256 monthsPaid, uint256 startTime, bool active) = pensionMinimal.plans(planId);
        assertEq(beneficiary, BENEFICIARY);
        assertEq(monthlyAmount, MONTHLY_AMOUNT);
        assertEq(totalMonths, TOTAL_MONTHS);
        assertEq(monthsPaid, 0);
        assertTrue(startTime > 0); // startTime should be block.timestamp
        assertTrue(active);
        vm.stopPrank();
    }

    function test_CreatePlan_Revert_BadBeneficiary() public {
        vm.startPrank(USER);
        vm.expectRevert("BAD_BEN");
        pensionMinimal.createPlan(address(0), MONTHLY_AMOUNT, TOTAL_MONTHS);
        vm.stopPrank();
    }

    function test_CreatePlan_Revert_BadParams_ZeroMonthlyAmount() public {
        vm.startPrank(USER);
        vm.expectRevert("BAD_PARAMS");
        pensionMinimal.createPlan(BENEFICIARY, 0, TOTAL_MONTHS);
        vm.stopPrank();
    }

    function test_CreatePlan_Revert_BadParams_ZeroTotalMonths() public {
        vm.startPrank(USER);
        vm.expectRevert("BAD_PARAMS");
        pensionMinimal.createPlan(BENEFICIARY, MONTHLY_AMOUNT, 0);
        vm.stopPrank();
    }

    function test_CreatePlan_Revert_TransferFail() public {
        vm.startPrank(USER);
        // Mock transferFrom to return false
        mockUsdtTransferFrom(USER, VAULT_WALLET, TOTAL_DEPOSIT, false);
        vm.expectRevert("TRANSFER_FAIL");
        pensionMinimal.createPlan(BENEFICIARY, MONTHLY_AMOUNT, TOTAL_MONTHS);
        vm.stopPrank();
    }

    // --- Test processPayment function ---
    function test_ProcessPayment_Success() public {
        // 1. Create a plan first
        vm.startPrank(USER);
        mockUsdtTransferFrom(USER, VAULT_WALLET, TOTAL_DEPOSIT, true);
        uint256 planId = pensionMinimal.createPlan(BENEFICIARY, MONTHLY_AMOUNT, TOTAL_MONTHS);
        vm.stopPrank();

        // 2. Advance time to allow the first payment (1 month = 30 days)
        uint256 initialTimestamp = block.timestamp;
        vm.warp(initialTimestamp + 30 days);

        // 3. Mock allowance and balance for vaultWallet, and successful transfer to beneficiary
        mockUsdtAllowance(VAULT_WALLET, address(pensionMinimal), MONTHLY_AMOUNT);
        mockUsdtBalanceOf(VAULT_WALLET, MONTHLY_AMOUNT);
        mockUsdtTransferFrom(VAULT_WALLET, BENEFICIARY, MONTHLY_AMOUNT, true);

        // 4. Expect the PaymentExecuted event
        vm.expectEmit(true, true, true, true);
        emit PensionMinimal.PaymentExecuted(planId, 1, MONTHLY_AMOUNT);

        // 5. Process payment
        pensionMinimal.processPayment(planId);

        // 6. Assert state change: monthsPaid should be 1
        (,,,, uint256 monthsPaid,,) = pensionMinimal.plans(planId); // Destructure to get monthsPaid
        assertEq(monthsPaid, 1);
    }

    function test_ProcessPayment_Revert_InactivePlan() public {
        // 1. Create a plan for 1 month
        vm.startPrank(USER);
        mockUsdtTransferFrom(USER, VAULT_WALLET, MONTHLY_AMOUNT, true); // Only 1 month deposit
        uint256 planId = pensionMinimal.createPlan(BENEFICIARY, MONTHLY_AMOUNT, 1);
        vm.stopPrank();

        // 2. Advance time and process the first (and only) payment to make the plan inactive
        uint256 initialTimestamp = block.timestamp;
        vm.warp(initialTimestamp + 30 days);
        mockUsdtAllowance(VAULT_WALLET, address(pensionMinimal), MONTHLY_AMOUNT);
        mockUsdtBalanceOf(VAULT_WALLET, MONTHLY_AMOUNT);
        mockUsdtTransferFrom(VAULT_WALLET, BENEFICIARY, MONTHLY_AMOUNT, true);
        pensionMinimal.processPayment(planId);

        // 3. Try to process payment again on the now inactive plan
        vm.expectRevert("INACTIVE_PLAN");
        pensionMinimal.processPayment(planId);
    }

    function test_ProcessPayment_Revert_AllPaid() public {
        // 1. Create a plan for 1 month
        vm.startPrank(USER);
        mockUsdtTransferFrom(USER, VAULT_WALLET, MONTHLY_AMOUNT, true);
        uint256 planId = pensionMinimal.createPlan(BENEFICIARY, MONTHLY_AMOUNT, 1);
        vm.stopPrank();

        // 2. Advance time and process the first (and only) payment
        uint256 initialTimestamp = block.timestamp;
        vm.warp(initialTimestamp + 30 days);
        mockUsdtAllowance(VAULT_WALLET, address(pensionMinimal), MONTHLY_AMOUNT);
        mockUsdtBalanceOf(VAULT_WALLET, MONTHLY_AMOUNT);
        mockUsdtTransferFrom(VAULT_WALLET, BENEFICIARY, MONTHLY_AMOUNT, true);
        pensionMinimal.processPayment(planId);

        // 3. Advance more time, but all months are already paid
        vm.warp(initialTimestamp + 60 days);
        vm.expectRevert("ALL_PAID");
        pensionMinimal.processPayment(planId);
    }

    function test_ProcessPayment_Revert_TooEarly() public {
        // 1. Create a plan
        vm.startPrank(USER);
        mockUsdtTransferFrom(USER, VAULT_WALLET, TOTAL_DEPOSIT, true);
        uint256 planId = pensionMinimal.createPlan(BENEFICIARY, MONTHLY_AMOUNT, TOTAL_MONTHS);
        vm.stopPrank();

        // 2. Try to process payment immediately (before 30 days have passed)
        vm.expectRevert("TOO_EARLY");
        pensionMinimal.processPayment(planId);
    }

    function test_ProcessPayment_Fail_InsufficientAllowance() public {
        // 1. Create a plan
        vm.startPrank(USER);
        mockUsdtTransferFrom(USER, VAULT_WALLET, TOTAL_DEPOSIT, true);
        uint256 planId = pensionMinimal.createPlan(BENEFICIARY, MONTHLY_AMOUNT, TOTAL_MONTHS);
        vm.stopPrank();

        // 2. Advance time
        uint256 initialTimestamp = block.timestamp;
        vm.warp(initialTimestamp + 30 days);

        // 3. Mock insufficient allowance for the contract
        mockUsdtAllowance(VAULT_WALLET, address(pensionMinimal), MONTHLY_AMOUNT - 1); // Less than required
        mockUsdtBalanceOf(VAULT_WALLET, MONTHLY_AMOUNT); // Sufficient balance

        // 4. Expect PaymentFailed event
        vm.expectEmit(true, true, true, true);
        emit PensionMinimal.PaymentFailed(planId, 1, MONTHLY_AMOUNT);

        pensionMinimal.processPayment(planId);

        // 5. Assert no payment was made (monthsPaid remains 0)
        (,,,, uint256 monthsPaid,,) = pensionMinimal.plans(planId);
        assertEq(monthsPaid, 0);
    }

    function test_ProcessPayment_Fail_InsufficientBalance() public {
        // 1. Create a plan
        vm.startPrank(USER);
        mockUsdtTransferFrom(USER, VAULT_WALLET, TOTAL_DEPOSIT, true);
        uint256 planId = pensionMinimal.createPlan(BENEFICIARY, MONTHLY_AMOUNT, TOTAL_MONTHS);
        vm.stopPrank();

        // 2. Advance time
        uint256 initialTimestamp = block.timestamp;
        vm.warp(initialTimestamp + 30 days);

        // 3. Mock sufficient allowance but insufficient balance in vaultWallet
        mockUsdtAllowance(VAULT_WALLET, address(pensionMinimal), MONTHLY_AMOUNT);
        mockUsdtBalanceOf(VAULT_WALLET, MONTHLY_AMOUNT - 1); // Less than required

        // 4. Expect PaymentFailed event
        vm.expectEmit(true, true, true, true);
        emit PensionMinimal.PaymentFailed(planId, 1, MONTHLY_AMOUNT);

        pensionMinimal.processPayment(planId);

        // 5. Assert no payment was made (monthsPaid remains 0)
        (,,,, uint256 monthsPaid,,) = pensionMinimal.plans(planId);
        assertEq(monthsPaid, 0);
    }

    function test_ProcessPayment_Revert_PayFail() public {
        // 1. Create a plan
        vm.startPrank(USER);
        mockUsdtTransferFrom(USER, VAULT_WALLET, TOTAL_DEPOSIT, true);
        uint256 planId = pensionMinimal.createPlan(BENEFICIARY, MONTHLY_AMOUNT, TOTAL_MONTHS);
        vm.stopPrank();

        // 2. Advance time
        uint256 initialTimestamp = block.timestamp;
        vm.warp(initialTimestamp + 30 days);

        // 3. Mock sufficient allowance and balance, but transferFrom to beneficiary fails
        mockUsdtAllowance(VAULT_WALLET, address(pensionMinimal), MONTHLY_AMOUNT);
        mockUsdtBalanceOf(VAULT_WALLET, MONTHLY_AMOUNT);
        mockUsdtTransferFrom(VAULT_WALLET, BENEFICIARY, MONTHLY_AMOUNT, false); // Transfer fails

        // 4. Expect revert
        vm.expectRevert("PAY_FAIL");
        pensionMinimal.processPayment(planId);
    }

    function test_ProcessPayment_DeactivatesPlanWhenFullyPaid() public {
        // 1. Create a plan for 1 month
        vm.startPrank(USER);
        mockUsdtTransferFrom(USER, VAULT_WALLET, MONTHLY_AMOUNT, true);
        uint256 planId = pensionMinimal.createPlan(BENEFICIARY, MONTHLY_AMOUNT, 1);
        vm.stopPrank();

        // 2. Advance time and process the only payment
        uint256 initialTimestamp = block.timestamp;
        vm.warp(initialTimestamp + 30 days);
        mockUsdtAllowance(VAULT_WALLET, address(pensionMinimal), MONTHLY_AMOUNT);
        mockUsdtBalanceOf(VAULT_WALLET, MONTHLY_AMOUNT);
        mockUsdtTransferFrom(VAULT_WALLET, BENEFICIARY, MONTHLY_AMOUNT, true);
        pensionMinimal.processPayment(planId);

        // 3. Assert plan is inactive
        (,,,,,, bool active) = pensionMinimal.plans(planId);
        assertFalse(active);
    }

    // --- Test checkUpkeep function (for Chainlink Automation) ---
    function test_CheckUpkeep_ReturnsTrueWhenDue() public {
        // 1. Create a plan
        vm.startPrank(USER);
        mockUsdtTransferFrom(USER, VAULT_WALLET, TOTAL_DEPOSIT, true);
        uint256 planId = pensionMinimal.createPlan(BENEFICIARY, MONTHLY_AMOUNT, TOTAL_MONTHS);
        vm.stopPrank();

        // 2. Advance time to be due for the first payment
        uint256 initialTimestamp = block.timestamp;
        vm.warp(initialTimestamp + 30 days);

        assertTrue(pensionMinimal.checkUpkeep(planId));
    }

    function test_CheckUpkeep_ReturnsFalseWhenNotDue() public {
        // 1. Create a plan
        vm.startPrank(USER);
        mockUsdtTransferFrom(USER, VAULT_WALLET, TOTAL_DEPOSIT, true);
        uint256 planId = pensionMinimal.createPlan(BENEFICIARY, MONTHLY_AMOUNT, TOTAL_MONTHS);
        vm.stopPrank();

        // 2. Time is not yet due
        assertFalse(pensionMinimal.checkUpkeep(planId));
    }

    function test_CheckUpkeep_ReturnsFalseWhenInactive() public {
        // 1. Create a plan for 1 month
        vm.startPrank(USER);
        mockUsdtTransferFrom(USER, VAULT_WALLET, MONTHLY_AMOUNT, true);
        uint256 planId = pensionMinimal.createPlan(BENEFICIARY, MONTHLY_AMOUNT, 1);
        vm.stopPrank();

        // 2. Advance time and process the only payment to make it inactive
        uint256 initialTimestamp = block.timestamp;
        vm.warp(initialTimestamp + 30 days);
        mockUsdtAllowance(VAULT_WALLET, address(pensionMinimal), MONTHLY_AMOUNT);
        mockUsdtBalanceOf(VAULT_WALLET, MONTHLY_AMOUNT);
        mockUsdtTransferFrom(VAULT_WALLET, BENEFICIARY, MONTHLY_AMOUNT, true);
        pensionMinimal.processPayment(planId);

        // 3. Check upkeep on the inactive plan
        assertFalse(pensionMinimal.checkUpkeep(planId));
    }

    function test_CheckUpkeep_ReturnsFalseWhenAllPaid() public {
        // 1. Create a plan for 1 month
        vm.startPrank(USER);
        mockUsdtTransferFrom(USER, VAULT_WALLET, MONTHLY_AMOUNT, true);
        uint256 planId = pensionMinimal.createPlan(BENEFICIARY, MONTHLY_AMOUNT, 1);
        vm.stopPrank();

        // 2. Advance time and process the only payment
        uint256 initialTimestamp = block.timestamp;
        vm.warp(initialTimestamp + 30 days);
        mockUsdtAllowance(VAULT_WALLET, address(pensionMinimal), MONTHLY_AMOUNT);
        mockUsdtBalanceOf(VAULT_WALLET, MONTHLY_AMOUNT);
        mockUsdtTransferFrom(VAULT_WALLET, BENEFICIARY, MONTHLY_AMOUNT, true);
        pensionMinimal.processPayment(planId);

        // 3. Advance more time (even though it's inactive, check the monthsPaid condition)
        vm.warp(initialTimestamp + 60 days);
        assertFalse(pensionMinimal.checkUpkeep(planId));
    }

    // --- Test performUpkeep function (for Chainlink Automation) ---
    function test_PerformUpkeep_CallsProcessPayment() public {
        // 1. Create a plan
        vm.startPrank(USER);
        mockUsdtTransferFrom(USER, VAULT_WALLET, TOTAL_DEPOSIT, true);
        uint256 planId = pensionMinimal.createPlan(BENEFICIARY, MONTHLY_AMOUNT, TOTAL_MONTHS);
        vm.stopPrank();

        // 2. Advance time to be due
        uint256 initialTimestamp = block.timestamp;
        vm.warp(initialTimestamp + 30 days);

        // 3. Mock allowance and balance for vaultWallet for performUpkeep to succeed
        mockUsdtAllowance(VAULT_WALLET, address(pensionMinimal), MONTHLY_AMOUNT);
        mockUsdtBalanceOf(VAULT_WALLET, MONTHLY_AMOUNT);
        mockUsdtTransferFrom(VAULT_WALLET, BENEFICIARY, MONTHLY_AMOUNT, true);

        // 4. Expect PaymentExecuted event from performUpkeep calling processPayment
        vm.expectEmit(true, true, true, true);
        emit PensionMinimal.PaymentExecuted(planId, 1, MONTHLY_AMOUNT);

        pensionMinimal.performUpkeep(planId);

        // 5. Assert state change: monthsPaid should be 1
        (,,,, uint256 monthsPaid,,) = pensionMinimal.plans(planId);
        assertEq(monthsPaid, 1);
    }

    function test_PerformUpkeep_RevertsIfProcessPaymentReverts() public {
        // 1. Create a plan
        vm.startPrank(USER);
        mockUsdtTransferFrom(USER, VAULT_WALLET, TOTAL_DEPOSIT, true);
        uint256 planId = pensionMinimal.createPlan(BENEFICIARY, MONTHLY_AMOUNT, TOTAL_MONTHS);
        vm.stopPrank();

        // 2. Do NOT advance time, so processPayment will revert with "TOO_EARLY"
        // No need to mock USDT calls as processPayment will revert before them.

        vm.expectRevert("TOO_EARLY");
        pensionMinimal.performUpkeep(planId);
    }
}
