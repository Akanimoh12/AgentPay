// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "../interfaces/IAgentRegistry.sol";

contract PaymentRouter is ReentrancyGuard, Ownable {
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

    mapping(bytes32 => Escrow) private _escrows;
    uint256 private _escrowCounter;
    IAgentRegistry public registry;
    uint256 public protocolFeeBps;
    address public feeReceiver;

    event DirectPayment(
        bytes32 indexed from,
        bytes32 indexed to,
        address token,
        uint256 amount,
        uint256 fee
    );
    event EscrowCreated(
        bytes32 indexed escrowId,
        bytes32 indexed payerId,
        bytes32 indexed payeeId,
        uint256 amount
    );
    event EscrowReleased(bytes32 indexed escrowId, uint256 amount, uint256 fee);
    event EscrowCancelled(bytes32 indexed escrowId);

    constructor(address _registry) Ownable(msg.sender) {
        registry = IAgentRegistry(_registry);
        protocolFeeBps = 50;
        feeReceiver = msg.sender;
    }

    function payDirect(
        bytes32 recipientAgentId,
        address token,
        uint256 amount
    ) external payable nonReentrant {
        bytes32 senderAgentId = registry.getAgentByWallet(msg.sender);
        require(registry.isActiveAgent(senderAgentId), "Sender not active agent");
        require(registry.isActiveAgent(recipientAgentId), "Recipient not active agent");

        IAgentRegistry.AgentProfile memory recipient = registry.getAgent(recipientAgentId);
        uint256 fee = (amount * protocolFeeBps) / 10000;
        uint256 payout = amount - fee;

        if (token == address(0)) {
            require(msg.value == amount, "Incorrect native amount");
            (bool s1, ) = recipient.wallet.call{value: payout}("");
            require(s1, "Transfer to recipient failed");
            if (fee > 0) {
                (bool s2, ) = feeReceiver.call{value: fee}("");
                require(s2, "Fee transfer failed");
            }
        } else {
            require(msg.value == 0, "Native value not accepted for token payments");
            IERC20(token).transferFrom(msg.sender, recipient.wallet, payout);
            if (fee > 0) {
                IERC20(token).transferFrom(msg.sender, feeReceiver, fee);
            }
        }

        emit DirectPayment(senderAgentId, recipientAgentId, token, amount, fee);
    }

    function createEscrow(
        bytes32 payeeAgentId,
        address token,
        uint256 amount,
        bytes32 jobId,
        uint256 deadline
    ) external payable nonReentrant returns (bytes32) {
        bytes32 payerAgentId = registry.getAgentByWallet(msg.sender);
        require(registry.isActiveAgent(payerAgentId), "Payer not active agent");
        require(registry.isActiveAgent(payeeAgentId), "Payee not active agent");

        _escrowCounter++;
        bytes32 escrowId = keccak256(abi.encodePacked(_escrowCounter, msg.sender, block.timestamp));

        if (token == address(0)) {
            require(msg.value == amount, "Incorrect native amount");
        } else {
            require(msg.value == 0, "Native value not accepted for token escrows");
            IERC20(token).transferFrom(msg.sender, address(this), amount);
        }

        _escrows[escrowId] = Escrow({
            payerId: payerAgentId,
            payeeId: payeeAgentId,
            amount: amount,
            token: token,
            jobId: jobId,
            deadline: deadline,
            released: false,
            cancelled: false,
            createdAt: block.timestamp
        });

        emit EscrowCreated(escrowId, payerAgentId, payeeAgentId, amount);
        return escrowId;
    }

    function releaseEscrow(bytes32 escrowId) external nonReentrant {
        Escrow storage escrow = _escrows[escrowId];
        require(escrow.amount > 0, "Escrow not found");
        require(!escrow.released && !escrow.cancelled, "Escrow already settled");

        bytes32 callerAgentId = registry.getAgentByWallet(msg.sender);
        require(callerAgentId == escrow.payerId, "Only payer can release");

        escrow.released = true;

        IAgentRegistry.AgentProfile memory payee = registry.getAgent(escrow.payeeId);
        uint256 fee = (escrow.amount * protocolFeeBps) / 10000;
        uint256 payout = escrow.amount - fee;

        if (escrow.token == address(0)) {
            (bool s1, ) = payee.wallet.call{value: payout}("");
            require(s1, "Transfer to payee failed");
            if (fee > 0) {
                (bool s2, ) = feeReceiver.call{value: fee}("");
                require(s2, "Fee transfer failed");
            }
        } else {
            IERC20(escrow.token).transfer(payee.wallet, payout);
            if (fee > 0) {
                IERC20(escrow.token).transfer(feeReceiver, fee);
            }
        }

        emit EscrowReleased(escrowId, payout, fee);
    }

    function cancelEscrow(bytes32 escrowId) external nonReentrant {
        Escrow storage escrow = _escrows[escrowId];
        require(escrow.amount > 0, "Escrow not found");
        require(!escrow.released && !escrow.cancelled, "Escrow already settled");
        require(block.timestamp >= escrow.deadline, "Deadline not reached");

        bytes32 callerAgentId = registry.getAgentByWallet(msg.sender);
        require(callerAgentId == escrow.payerId, "Only payer can cancel");

        escrow.cancelled = true;

        IAgentRegistry.AgentProfile memory payer = registry.getAgent(escrow.payerId);

        if (escrow.token == address(0)) {
            (bool s, ) = payer.wallet.call{value: escrow.amount}("");
            require(s, "Refund failed");
        } else {
            IERC20(escrow.token).transfer(payer.wallet, escrow.amount);
        }

        emit EscrowCancelled(escrowId);
    }

    function getEscrow(bytes32 escrowId) external view returns (Escrow memory) {
        return _escrows[escrowId];
    }

    function setProtocolFee(uint256 feeBps) external onlyOwner {
        require(feeBps <= 500, "Fee too high");
        protocolFeeBps = feeBps;
    }

    function setFeeReceiver(address receiver) external onlyOwner {
        require(receiver != address(0), "Invalid receiver");
        feeReceiver = receiver;
    }
}
