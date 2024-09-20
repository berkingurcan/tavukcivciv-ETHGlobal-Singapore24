// SPDX-License-Identifier: MIT
pragma solidity ^0.8.17;

import "@fhenixprotocol/contracts/FHE.sol";
import "@openzeppelin/contracts/utils/cryptography/EIP712.sol";
import "@fhenixprotocol/contracts/FHE.sol";

/**
 * @title TOTPWallet
 * @dev A smart contract wallet that utilizes Time-based One-Time Passwords (TOTP) for transaction authorization.
 *      TOTP verification is processed using Fully Homomorphic Encryption (FHE) via the Fhenix library.
 */
contract TOTPWallet is EIP712 {
    using FHE for *;

    /// @notice Encrypted secret key used for generating and validating TOTP
    euint32 private encryptedSecretKey;

    /// @notice Owner of the wallet
    address public owner;

    /// @notice Validity period for a TOTP in seconds
    uint256 public constant TOTP_VALIDITY = 200;

    /// @notice Event emitted upon successful transaction execution
    event TransactionExecuted(address indexed to, uint256 amount, uint32 timestamp);

    /// @notice Modifier to restrict functions to the wallet owner
    modifier onlyOwner() {
        require(msg.sender == owner, "TOTPWallet: Caller is not the owner");
        _;
    }

    /**
     * @dev Initializes the wallet with an encrypted secret key and sets the deployer as the owner.
     * @param _encryptedSecretKey The encrypted secret key for TOTP generation and validation.
     */
    constructor(bytes memory _encryptedSecretKey) EIP712("TOTPWallet", "1") {
        encryptedSecretKey = FHE.asEuint32(_encryptedSecretKey);
        owner = msg.sender;
    }

    /**
     * @dev Allows the owner to update the encrypted secret key.
     * @param newEncryptedSecretKey The new encrypted secret key.
     */
    function changeSecretKey(bytes calldata newEncryptedSecretKey) external onlyOwner {
        encryptedSecretKey = FHE.asEuint32(newEncryptedSecretKey);
    }

    /**
     * @dev Executes a transaction to a specified address after validating the provided TOTP.
     * @param _to The recipient address.
     * @param _amount The amount of Ether to send.
     * @param _encryptedTOTP The encrypted TOTP provided by the user.
     * @param _timestamp The timestamp at which the TOTP was generated.
     * @param publicKey The user's public key for signature verification.
     * @param signature The EIP712 signature authorizing the transaction.
     */
    function executeTransaction(
        address payable _to,
        uint256 _amount,
        bytes calldata _encryptedTOTP,
        uint32 _timestamp,
        bytes32 publicKey,
        bytes calldata signature
    ) external onlyOwner {
        // Verify the user's signature
        require(isValidSignature(publicKey, signature), "TOTPWallet: Invalid signature");

        // Validate the provided TOTP
        require(validateTOTP(_encryptedTOTP, _timestamp), "TOTPWallet: Invalid TOTP");

        // Ensure the contract has sufficient balance
        require(address(this).balance >= _amount, "TOTPWallet: Insufficient balance");

        // Execute the transfer
        (bool success, ) = _to.call{value: _amount}("");
        require(success, "TOTPWallet: Transaction failed");

        emit TransactionExecuted(_to, _amount, _timestamp);
    }

    /**
     * @dev Validates the provided TOTP against the encrypted secret key and timestamp.
     * @param _encryptedTOTP The encrypted TOTP to validate.
     * @param _timestamp The timestamp used to generate the TOTP.
     * @return isValid Boolean indicating whether the TOTP is valid.
     */
    function validateTOTP(bytes calldata _encryptedTOTP, uint32 _timestamp) internal view returns (bool isValid) {
        // Ensure the timestamp is within the valid window
        require(block.timestamp <= uint256(_timestamp) + TOTP_VALIDITY, "TOTPWallet: Timestamp expired");
        // TODO! Check if its okay
        require(_timestamp <= block.timestamp, "TOTPWallet: Invalid future timestamp");

    
        // Calculate the time step (e.g., 30-second intervals)
        uint32 timeStep = _timestamp / 30;
    
        // Compute the expected TOTP using FHE operations
        // Example operation: expectedTOTP = (secretKey * timeStep) % 1000000 can be rewritten as:
        euint32 encryptedTimeStep = FHE.asEuint32(timeStep);
        
        euint32 encryptedMultiplication = FHE.mul(encryptedSecretKey, encryptedTimeStep);
        euint32 encryptedDivision = FHE.div(encryptedMultiplication, FHE.asEuint32(1000000));  // Division
        euint32 encryptedModulo = FHE.sub(encryptedMultiplication, FHE.mul(encryptedDivision, FHE.asEuint32(1000000)));  // Result equivalent to modulo
    
        euint32 encryptedProvidedTOTP = FHE.asEuint32(_encryptedTOTP);
    
        // Compare the encrypted expected TOTP with the provided encrypted TOTP
        ebool comparisonResult = FHE.eq(encryptedModulo, encryptedProvidedTOTP);
    
        // Decrypt the comparison result to obtain a boolean
        isValid = FHE.decrypt(comparisonResult);
    }
    
    /**
     * @dev Allows authorized users to view the encrypted secret key by re-encrypting it with their public key.
     *      Requires a valid EIP712 signature.
     * @param publicKey The public key of the requester.
     * @param signature The EIP712 signature authorizing the request.
     * @return reEncryptedKey The re-encrypted secret key for the requester.
     */
    function viewSecretKey(bytes32 publicKey, bytes calldata signature) external view returns (bytes memory reEncryptedKey) {
        // Verify the user's signature
        require(isValidSignature(publicKey, signature), "TOTPWallet: Invalid signature");

        // !TODO Re-encrypt the secret key with the provided public key 
        
    }

    /**
     * @dev Internal function to verify EIP712 signatures.
     *      This should be implemented based on the specific EIP712WithModifier logic.
     * @param publicKey The public key provided by the user.
     * @param signature The signature to verify.
     * @return isValid Boolean indicating whether the signature is valid.
     */
    function isValidSignature(bytes32 publicKey, bytes calldata signature) internal view returns (bool isValid) {
        // TODO!
        // Placeholder for signature verification logic
        // Example implementation:
        /*
        bytes32 digest = _hashTypedDataV4(keccak256(abi.encode(
            keccak256("ViewSecretKey(bytes32 publicKey)"),
            publicKey
        )));
        address signer = ECDSA.recover(digest, signature);
        return (signer == owner);
        */
        
        // For template purposes, return true. Implement actual verification as needed.
        isValid = true;
    }

    /**
     * @dev Fallback function to accept Ether deposits.
     */
    receive() external payable {}
}