// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "@openzeppelin/contracts/access/Ownable.sol";

contract AgentRegistry is Ownable {
    struct AgentProfile {
        address wallet;
        bytes32 agentId;
        string name;
        string[] services;
        bool active;
        uint256 registeredAt;
    }

    mapping(bytes32 => AgentProfile) private _agents;
    mapping(address => bytes32) private _walletToAgent;
    bytes32[] private _allAgentIds;

    event AgentRegistered(bytes32 indexed agentId, address indexed wallet, string name);
    event ServicesUpdated(bytes32 indexed agentId);
    event AgentDeactivated(bytes32 indexed agentId);

    constructor() Ownable(msg.sender) {}

    function registerAgent(
        bytes32 agentId,
        string calldata name,
        string[] calldata services
    ) external {
        require(_agents[agentId].wallet == address(0), "AgentId already registered");
        require(_walletToAgent[msg.sender] == bytes32(0), "Wallet already registered");

        _agents[agentId] = AgentProfile({
            wallet: msg.sender,
            agentId: agentId,
            name: name,
            services: services,
            active: true,
            registeredAt: block.timestamp
        });

        _walletToAgent[msg.sender] = agentId;
        _allAgentIds.push(agentId);

        emit AgentRegistered(agentId, msg.sender, name);
    }

    function updateServices(string[] calldata services) external {
        bytes32 agentId = _walletToAgent[msg.sender];
        require(agentId != bytes32(0), "Not registered");

        _agents[agentId].services = services;
        emit ServicesUpdated(agentId);
    }

    function deactivateAgent() external {
        bytes32 agentId = _walletToAgent[msg.sender];
        require(agentId != bytes32(0), "Not registered");

        _agents[agentId].active = false;
        emit AgentDeactivated(agentId);
    }

    function getAgent(bytes32 agentId) external view returns (AgentProfile memory) {
        return _agents[agentId];
    }

    function getAgentByWallet(address wallet) external view returns (bytes32) {
        return _walletToAgent[wallet];
    }

    function isRegistered(bytes32 agentId) external view returns (bool) {
        return _agents[agentId].wallet != address(0);
    }

    function isActiveAgent(bytes32 agentId) external view returns (bool) {
        return _agents[agentId].wallet != address(0) && _agents[agentId].active;
    }

    function getAgentCount() external view returns (uint256) {
        return _allAgentIds.length;
    }

    function getAllAgentIds() external view returns (bytes32[] memory) {
        return _allAgentIds;
    }
}
