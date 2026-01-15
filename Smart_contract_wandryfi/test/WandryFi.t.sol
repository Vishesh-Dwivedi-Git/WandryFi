// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;
import {Test, console} from "forge-std/Test.sol";
import {WandryFi} from "../src/WandryFi.sol";

contract WanderifyTest is Test {
    WandryFi public wanderify;
    address owner = address(0x1);
    address treasury = address(0x3);
    address user1 = address(0x4);
    address user2 = address(0x5);

    uint256 verifierPrivateKey = 0xA11CE;
    address verifier;
    uint256 user1PrivateKey = 0xB0B;

    uint256 constant DESTINATION_ID = 1;
    uint256 constant STAKE_AMOUNT = 1 ether;
    uint256 constant PLATFORM_FEE = 4;
    uint256 constant MIN_STAKE_DURATION = 15 days;
    uint256 constant BASE_REWARD = 2000000000000000; // 0.002 TMON
    uint256 constant BETA = 50;

    function setUp() public {
        verifier = vm.addr(verifierPrivateKey);

        vm.prank(owner);
        wanderify = new WandryFi(verifier, treasury, PLATFORM_FEE);

        vm.deal(owner, 100 ether);
        vm.deal(user1, 10 ether);
        vm.deal(user2, 10 ether);
        vm.deal(treasury, 1 ether);
    }

    function getCommitment(
        address user
    )
        internal
        view
        returns (
            address commitmentUser,
            uint256 amountInPool,
            uint256 travelDate,
            uint256 destinationId,
            bool isProcessed
        )
    {
        (
            commitmentUser,
            amountInPool,
            travelDate,
            destinationId,
            isProcessed
        ) = wanderify.commitments(user);
    }

    // =============================================================
    // Constructor Tests (FIXED ERROR SELECTORS)
    // =============================================================
    function testConstructor() public view {
        assertEq(wanderify.verifierAddress(), verifier);
        assertEq(wanderify.treasuryAddress(), treasury);
        assertEq(wanderify.platformFeePercent(), PLATFORM_FEE);
        assertEq(wanderify.owner(), owner);
        assertEq(wanderify.BASE_REWARD(), BASE_REWARD);
    }

    function testConstructorRevertsOnZeroVerifier() public {
        vm.prank(owner);
        vm.expectRevert(WandryFi.VerifierCannotBeZero.selector);
        new WandryFi(address(0), treasury, PLATFORM_FEE);
    }

    function testConstructorRevertsOnZeroTreasury() public {
        vm.prank(owner);
        vm.expectRevert(WandryFi.TreasuryCannotBeZero.selector);
        new WandryFi(verifier, address(0), PLATFORM_FEE);
    }

    function testConstructorRevertsOnHighFee() public {
        vm.prank(owner);
        vm.expectRevert(WandryFi.FeeCannotExceed5Percent.selector);
        new WandryFi(verifier, treasury, 6);
    }

    // =============================================================
    // Stake Function Tests (FIXED ERROR SELECTORS)
    // =============================================================
    function testStakeSuccess() public {
        uint256 travelDate = block.timestamp + MIN_STAKE_DURATION + 1 days;
        uint256 expectedPoolAmount = (STAKE_AMOUNT * (100 - PLATFORM_FEE)) /
            100;
        uint256 expectedFee = STAKE_AMOUNT - expectedPoolAmount;
        uint256 treasuryBalanceBefore = treasury.balance;

        vm.prank(user1);
        vm.expectEmit(true, true, true, true);
        emit WandryFi.Staked(user1, DESTINATION_ID, STAKE_AMOUNT, travelDate);
        wanderify.stake{value: STAKE_AMOUNT}(DESTINATION_ID, travelDate);

        (
            address commitmentUser,
            uint256 amountInPool,
            uint256 commitmentTravelDate,
            uint256 commitmentDestinationId,
            bool isProcessed
        ) = getCommitment(user1);

        assertEq(commitmentUser, user1);
        assertEq(amountInPool, expectedPoolAmount);
        assertEq(commitmentTravelDate, travelDate);
        assertEq(commitmentDestinationId, DESTINATION_ID);
        assertFalse(isProcessed);

        assertEq(wanderify.locationPools(DESTINATION_ID), expectedPoolAmount);
        assertEq(treasury.balance, treasuryBalanceBefore + expectedFee);
    }

    function testStakeRevertsOnZeroValue() public {
        uint256 travelDate = block.timestamp + MIN_STAKE_DURATION + 1 days;

        vm.prank(user1);
        vm.expectRevert(WandryFi.StakeMustBeGreaterThanZero.selector);
        wanderify.stake{value: 0}(DESTINATION_ID, travelDate);
    }

    function testStakeRevertsOnActiveCommitment() public {
        uint256 travelDate = block.timestamp + MIN_STAKE_DURATION + 1 days;

        vm.prank(user1);
        wanderify.stake{value: STAKE_AMOUNT}(DESTINATION_ID, travelDate);

        vm.prank(user1);
        vm.expectRevert(WandryFi.ActiveCommitmentExists.selector);
        wanderify.stake{value: STAKE_AMOUNT}(DESTINATION_ID + 1, travelDate);
    }

    function testStakeWhenPaused() public {
        vm.prank(owner);
        wanderify.pause();

        uint256 travelDate = block.timestamp + MIN_STAKE_DURATION + 1 days;
        vm.prank(user1);
        vm.expectRevert("Pausable: paused");
        wanderify.stake{value: STAKE_AMOUNT}(DESTINATION_ID, travelDate);
    }

    // =============================================================
    // Check-in Function Tests (FIXED ERROR SELECTORS)
    // =============================================================
    function testCheckInSuccess() public {
        uint256 travelDate = block.timestamp + MIN_STAKE_DURATION + 1 days;
        vm.prank(user1);
        wanderify.stake{value: STAKE_AMOUNT}(DESTINATION_ID, travelDate);

        vm.prank(owner);
        wanderify.seedPool{value: 0.5 ether}(DESTINATION_ID);

        vm.prank(owner);
        wanderify.setPlaceValue(DESTINATION_ID, 5);

        vm.warp(travelDate);

        bytes memory signature = createValidSignature(user1, DESTINATION_ID);

        uint256 userBalanceBefore = user1.balance;
        vm.prank(user1);
        wanderify.checkIn(signature);

        (, , , , bool isProcessed) = getCommitment(user1);
        assertTrue(isProcessed);

        assertGt(user1.balance, userBalanceBefore);
    }

    function testCheckInRevertsOnNoCommitment() public {
        bytes memory signature = new bytes(65);
        vm.prank(user1);
        vm.expectRevert(WandryFi.NoActiveCommitment.selector);
        wanderify.checkIn(signature);
    }

    function testCheckInRevertsOnAlreadyProcessed() public {
        uint256 travelDate = block.timestamp + MIN_STAKE_DURATION + 1 days;
        vm.prank(user1);
        wanderify.stake{value: STAKE_AMOUNT}(DESTINATION_ID, travelDate);

        vm.warp(travelDate + 1);
        vm.prank(user1);
        wanderify.processFailure();

        bytes memory signature = new bytes(65);
        vm.prank(user1);
        vm.expectRevert(WandryFi.CommitmentAlreadyProcessed.selector);
        wanderify.checkIn(signature);
    }

    function testCheckInRevertsOnEarlyDate() public {
        uint256 travelDate = block.timestamp + MIN_STAKE_DURATION + 1 days;
        vm.prank(user1);
        wanderify.stake{value: STAKE_AMOUNT}(DESTINATION_ID, travelDate);

        bytes memory signature = new bytes(65);
        vm.prank(user1);
        vm.expectRevert(WandryFi.TravelDateNotReached.selector);
        wanderify.checkIn(signature);
    }

    function testCheckInRevertsOnInvalidSignature() public {
        uint256 travelDate = block.timestamp + MIN_STAKE_DURATION + 1 days;
        vm.prank(user1);
        wanderify.stake{value: STAKE_AMOUNT}(DESTINATION_ID, travelDate);
        vm.warp(travelDate);

        bytes32 messageHash = keccak256(
            abi.encodePacked(user1, DESTINATION_ID)
        );
        bytes32 prefixedHash = keccak256(
            abi.encodePacked("\x19Ethereum Signed Message:\n32", messageHash)
        );
        (uint8 v, bytes32 r, bytes32 s) = vm.sign(
            user1PrivateKey,
            prefixedHash
        );
        bytes memory signature = abi.encodePacked(r, s, v);

        vm.prank(user1);
        vm.expectRevert(WandryFi.InvalidSignature.selector);
        wanderify.checkIn(signature);
    }

    // =============================================================
    // Process Failure Tests (FIXED ERROR SELECTORS)
    // =============================================================
    function testProcessFailureSuccess() public {
        uint256 travelDate = block.timestamp + MIN_STAKE_DURATION + 1 days;
        vm.prank(user1);
        wanderify.stake{value: STAKE_AMOUNT}(DESTINATION_ID, travelDate);

        vm.warp(travelDate + 1);

        vm.prank(user1);
        vm.expectEmit(true, true, true, true);
        emit WandryFi.FailureProcessed(user1, DESTINATION_ID);
        wanderify.processFailure();

        (, , , , bool isProcessed) = getCommitment(user1);
        assertTrue(isProcessed);
    }

    function testProcessFailureRevertsBeforeDeadline() public {
        uint256 travelDate = block.timestamp + MIN_STAKE_DURATION + 1 days;
        vm.prank(user1);
        wanderify.stake{value: STAKE_AMOUNT}(DESTINATION_ID, travelDate);

        vm.prank(user1);
        vm.expectRevert(WandryFi.TravelDeadlineNotPassed.selector);
        wanderify.processFailure();
    }

    // =============================================================
    // Admin Function Tests (FIXED ERROR SELECTORS)
    // =============================================================
    function testSeedPool() public {
        uint256 seedAmount = 0.5 ether;
        vm.prank(owner);
        vm.expectEmit(true, true, true, true);
        emit WandryFi.PoolSeeded(DESTINATION_ID, seedAmount);
        wanderify.seedPool{value: seedAmount}(DESTINATION_ID);

        assertEq(wanderify.locationPools(DESTINATION_ID), seedAmount);
    }

    function testSeedPoolRevertsOnZeroValue() public {
        vm.prank(owner);
        vm.expectRevert(WandryFi.SeedMustBeGreaterThanZero.selector);
        wanderify.seedPool{value: 0}(DESTINATION_ID);
    }

    function testSeedPoolRevertsOnNonOwner() public {
        vm.prank(user1);
        vm.expectRevert("Ownable: caller is not the owner");
        wanderify.seedPool{value: 0.1 ether}(DESTINATION_ID);
    }

    function testSetVerifierAddressRevertsOnZero() public {
        vm.prank(owner);
        vm.expectRevert(WandryFi.CannotBeZeroAddress.selector);
        wanderify.setVerifierAddress(address(0));
    }

    function testSetPlatformFeePercentRevertsOnHighFee() public {
        vm.prank(owner);
        vm.expectRevert(WandryFi.FeeCannotExceed5Percent.selector);
        wanderify.setPlatformFeePercent(6);
    }

    // =============================================================
    // Helper Functions
    // =============================================================
    function createValidSignature(
        address user,
        uint256 destinationId
    ) internal view returns (bytes memory) {
        bytes32 messageHash = keccak256(abi.encodePacked(user, destinationId));
        bytes32 prefixedHash = keccak256(
            abi.encodePacked("\x19Ethereum Signed Message:\n32", messageHash)
        );
        (uint8 v, bytes32 r, bytes32 s) = vm.sign(
            verifierPrivateKey,
            prefixedHash
        );
        return abi.encodePacked(r, s, v);
    }

    receive() external payable {}

    // Additional basic tests
    function testPauseUnpause() public {
        vm.prank(owner);
        wanderify.pause();
        assertTrue(wanderify.paused());

        vm.prank(owner);
        wanderify.unpause();
        assertFalse(wanderify.paused());
    }

    function testSetPlaceValue() public {
        uint256 placeValue = 10;
        vm.prank(owner);
        wanderify.setPlaceValue(DESTINATION_ID, placeValue);
        assertEq(wanderify.placeValues(DESTINATION_ID), placeValue);
    }

    function testGetLeaderboardEmpty() public view {
        (address[] memory users, uint256[] memory profits) = wanderify
            .getLeaderboard();
        assertEq(users.length, 0);
        assertEq(profits.length, 0);
    }
}
