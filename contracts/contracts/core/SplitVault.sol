// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";

contract SplitVault is ReentrancyGuard {
    struct SplitRecipient {
        address wallet;
        uint256 shareBps;
    }

    struct SplitConfig {
        bytes32 ownerAgentId;
        SplitRecipient[] recipients;
        bool active;
    }

    mapping(bytes32 => SplitConfig) private _splits;
    mapping(bytes32 => bytes32) private _agentToSplit;
    uint256 private _splitCounter;

    event SplitConfigured(
        bytes32 indexed splitId,
        bytes32 indexed agentId,
        uint256 recipientCount
    );
    event SplitDistributed(bytes32 indexed splitId, address token, uint256 totalAmount);
    event SplitDeactivated(bytes32 indexed splitId);

    function configureSplit(
        bytes32 agentId,
        SplitRecipient[] calldata recipients
    ) external returns (bytes32) {
        require(recipients.length > 0 && recipients.length <= 10, "Invalid recipient count");

        uint256 totalBps;
        for (uint256 i = 0; i < recipients.length; i++) {
            totalBps += recipients[i].shareBps;
        }
        require(totalBps == 10000, "Shares must sum to 10000");

        _splitCounter++;
        bytes32 splitId = keccak256(abi.encodePacked(_splitCounter, msg.sender, block.timestamp));

        SplitConfig storage split = _splits[splitId];
        split.ownerAgentId = agentId;
        split.active = true;

        for (uint256 i = 0; i < recipients.length; i++) {
            split.recipients.push(recipients[i]);
        }

        _agentToSplit[agentId] = splitId;

        emit SplitConfigured(splitId, agentId, recipients.length);
        return splitId;
    }

    function distribute(
        bytes32 splitId,
        address token,
        uint256 amount
    ) external payable nonReentrant {
        SplitConfig storage split = _splits[splitId];
        require(split.active, "Split not active");
        require(split.recipients.length > 0, "No recipients");

        if (token == address(0)) {
            require(msg.value == amount, "Incorrect native amount");
            for (uint256 i = 0; i < split.recipients.length; i++) {
                uint256 share = (amount * split.recipients[i].shareBps) / 10000;
                (bool s, ) = split.recipients[i].wallet.call{value: share}("");
                require(s, "Distribution failed");
            }
        } else {
            require(msg.value == 0, "Native value not accepted for token distribution");
            IERC20(token).transferFrom(msg.sender, address(this), amount);
            for (uint256 i = 0; i < split.recipients.length; i++) {
                uint256 share = (amount * split.recipients[i].shareBps) / 10000;
                IERC20(token).transfer(split.recipients[i].wallet, share);
            }
        }

        emit SplitDistributed(splitId, token, amount);
    }

    function getSplitConfig(bytes32 splitId) external view returns (
        bytes32 ownerAgentId,
        SplitRecipient[] memory recipients,
        bool active
    ) {
        SplitConfig storage split = _splits[splitId];
        return (split.ownerAgentId, split.recipients, split.active);
    }

    function getSplitByAgent(bytes32 agentId) external view returns (bytes32) {
        return _agentToSplit[agentId];
    }

    function deactivateSplit(bytes32 splitId) external {
        SplitConfig storage split = _splits[splitId];
        require(split.active, "Split not active");
        split.active = false;
        emit SplitDeactivated(splitId);
    }
}
