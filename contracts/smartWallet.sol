// SPDX-License-Identifier: MIT
pragma solidity ^0.8.17;

import "@fhenixprotocol/contracts/FHE.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/cryptography/EIP712.sol";
import "@openzeppelin/contracts/utils/cryptography/ECDSA.sol";

contract TOTPWallet is EIP712, Ownable {
    // Store encrypted secret key using FHE encryption (encrypted as uint16)
    bytes public encryptedSecretKey;

    // Owner's address for the wallet
    address public walletOwner;

    // Time window for TOTP validity (in seconds)
    uint256 constant TOTP_VALIDITY_WINDOW = 200;

    // Event to track secret key changes
    event SecretKeyChanged(address indexed owner);
    
    // Event to track successful TOTP verification
    event TOTPValidated(address indexed owner, uint32 timestamp, bool success);

    // Constructor to set up the initial owner and secret key
    constructor(bytes memory _encryptedSecretKey) Ownable(msg.sender) EIP712("TOTPWallet", "1") {
        encryptedSecretKey = _encryptedSecretKey;
        walletOwner = msg.sender;
    }

    // Modifier to ensure only the wallet owner can call certain functions
    modifier onlyWalletOwner() {
        require(msg.sender == walletOwner, "Only wallet owner can call this");
        _;
    }

    // Function to change the secret key (encrypted), only by the wallet owner
    function changeSecretKey(bytes memory newEncryptedSecretKey) public onlyWalletOwner {
        encryptedSecretKey = newEncryptedSecretKey;
        emit SecretKeyChanged(walletOwner);
    }

    // View encrypted secret key (securely)
    // Requires EIP-712 signature from the wallet owner
    function viewSecretKey(bytes memory signature) public view returns (bytes memory) {
        // TODO!
    }

    // TOTP validation logic, requires the user to provide encrypted TOTP and timestamp
    // FHE decryption is done off-chain, results of comparison provided here
    function validateTOTP(bytes memory encryptedTOTP, uint32 timestamp) public onlyWalletOwner returns (bool) {
        // Ensure the TOTP is being verified within the time window
        require(block.timestamp <= timestamp + TOTP_VALIDITY_WINDOW, "TOTP expired");

        // Validate the TOTP (user-side logic should decrypt the provided encryptedTOTP and secretKey)
        bytes memory decryptedTOTP = FHE.decrypt(encryptedTOTP);  // Replace with FHE decryption logic
        bytes memory decryptedSecretKey = FHE.decrypt(encryptedSecretKey);  // Decrypt the secret key

        // Check the last 5 digits of the timestamp against the decrypted secretKey
        uint32 shorterTimestamp = timestamp % 100000;  // Extract the last 5 digits
        bool isValid = FHE.compareTOTP(decryptedTOTP, shorterTimestamp, decryptedSecretKey);

        emit TOTPValidated(walletOwner, timestamp, isValid);
        return isValid;
    }

    // Utility function to allow wallet owner to change ownership
    function transferWalletOwnership(address newOwner) public onlyWalletOwner {
        require(newOwner != address(0), "New owner cannot be the zero address");
        walletOwner = newOwner;
    }

    // Allow the contract to receive funds
    receive() external payable {}

    // Withdraw function (simple wallet behavior), only accessible by the owner
    function withdraw(uint256 amount, address payable recipient) public onlyWalletOwner {
        require(address(this).balance >= amount, "Insufficient balance");
        recipient.transfer(amount);
    }
}
