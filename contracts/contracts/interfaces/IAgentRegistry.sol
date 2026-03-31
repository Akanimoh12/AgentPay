// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

interface IAgentRegistry {
    struct AgentProfile {
        address wallet;
        bytes32 agentId;
        string name;
        string[] services;
        bool active;
        uint256 registeredAt;
    }

    function registerAgent(bytes32 agentId, string calldata name, string[] calldata services) external;
    function updateServices(string[] calldata services) external;
    function deactivateAgent() external;
    function getAgent(bytes32 agentId) external view returns (AgentProfile memory);
    function getAgentByWallet(address wallet) external view returns (bytes32);
    function isRegistered(bytes32 agentId) external view returns (bool);
    function isActiveAgent(bytes32 agentId) external view returns (bool);
    function getAgentCount() external view returns (uint256);
    function getAllAgentIds() external view returns (bytes32[] memory);

    event AgentRegistered(bytes32 indexed agentId, address indexed wallet, string name);
    event ServicesUpdated(bytes32 indexed agentId);
    event AgentDeactivated(bytes32 indexed agentId);
}
