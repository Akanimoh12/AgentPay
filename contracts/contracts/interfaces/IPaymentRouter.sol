// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

interface IPaymentRouter {
    struct Escrow {
        bytes32 payerId;
        bytes32 payeeId;
        uint256 amount;
        address token;
        bytes32 jobId;
        uint256 deadline;
        bool released;
        bool cancelled;
        uint256 createdAt;
    }

    function payDirect(bytes32 recipientAgentId, address token, uint256 amount) external payable;
    function createEscrow(bytes32 payeeAgentId, address token, uint256 amount, bytes32 jobId, uint256 deadline) external payable returns (bytes32);
    function releaseEscrow(bytes32 escrowId) external;
    function cancelEscrow(bytes32 escrowId) external;
    function getEscrow(bytes32 escrowId) external view returns (Escrow memory);
    function setProtocolFee(uint256 feeBps) external;
    function setFeeReceiver(address receiver) external;

    event DirectPayment(bytes32 indexed from, bytes32 indexed to, address token, uint256 amount, uint256 fee);
    event EscrowCreated(bytes32 indexed escrowId, bytes32 indexed payerId, bytes32 indexed payeeId, uint256 amount);
    event EscrowReleased(bytes32 indexed escrowId, uint256 amount, uint256 fee);
    event EscrowCancelled(bytes32 indexed escrowId);
}
