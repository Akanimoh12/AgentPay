// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

interface ISplitVault {
    struct SplitRecipient {
        address wallet;
        uint256 shareBps;
    }

    function configureSplit(bytes32 agentId, SplitRecipient[] calldata recipients) external returns (bytes32);
    function distribute(bytes32 splitId, address token, uint256 amount) external payable;
    function getSplitConfig(bytes32 splitId) external view returns (bytes32 ownerAgentId, SplitRecipient[] memory recipients, bool active);
    function getSplitByAgent(bytes32 agentId) external view returns (bytes32);
    function deactivateSplit(bytes32 splitId) external;

    event SplitConfigured(bytes32 indexed splitId, bytes32 indexed agentId, uint256 recipientCount);
    event SplitDistributed(bytes32 indexed splitId, address token, uint256 totalAmount);
    event SplitDeactivated(bytes32 indexed splitId);
}
