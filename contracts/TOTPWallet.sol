// SPDX-License-Identifier: MIT
pragma solidity ^0.8.17;

import "@fhenixprotocol/contracts/FHE.sol";
import "@openzeppelin/contracts/utils/cryptography/EIP712.sol";
import "@openzeppelin/contracts/utils/cryptography/ECDSA.sol";

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

    /// @notice EIP712 type hash for signature verification
    bytes32 private constant VIEW_SECRET_KEY_TYPEHASH = keccak256("ViewSecretKey(bytes32 publicKey)");

    /// @notice Modifier to restrict functions to the wallet owner
    modifier onlyOwner() {
        require(msg.sender == owner, "TOTPWallet: Caller is not the owner");
        _;
    }

    /**
     * @dev Initializes the wallet with an encrypted secret key and sets the deployer as the owner.
     */
    constructor() EIP712("TOTPWallet", "1") {
        //encryptedSecretKey = FHE.asEuint32(1234);
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
     * @dev Returns the encrypted secret key.
     * @return The encrypted secret key as bytes.
    */
    function getEncryptedSecretKey() external view returns (bytes memory) {
        // Convert euint32 to bytes
        bytes memory gotEncryptedSecretKey = new bytes(4); // uint32 takes 4 bytes

        assembly {
            mstore(add(gotEncryptedSecretKey, 32), sload(encryptedSecretKey.slot))
        }
        return gotEncryptedSecretKey;
    }

    /**
     * @dev Executes a transaction to a specified address after validating the provided TOTP.
     * @param _to The recipient address.
     * @param _amount The amount of Ether to send.
     * @param _encryptedTOTP The encrypted TOTP provided by the user.
     * @param _timestamp The timestamp at which the TOTP was generated.
     */
    function executeTransaction(
        address payable _to,
        uint256 _amount,
        bytes calldata _encryptedTOTP,
        uint32 _timestamp
    ) external onlyOwner {
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
        require(_timestamp <= block.timestamp, "TOTPWallet: Invalid future timestamp");

        // Calculate the time step (e.g., 300-second intervals)
        uint32 timeStep = _timestamp / 300;
        euint32 encryptedTimeStep = FHE.asEuint32(timeStep);

        // Compute the expected TOTP using FHE operations
        // expectedTOTP = (secretKey * timeStep) % 1000000
        euint32 encryptedMultiplication = FHE.mul(encryptedSecretKey, encryptedTimeStep);
        euint32 encryptedDivision = FHE.div(encryptedMultiplication, FHE.asEuint32(1000000));
        euint32 encryptedModulo = FHE.sub(encryptedMultiplication, FHE.mul(encryptedDivision, FHE.asEuint32(1000000)));

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

        // Re-encrypt the secret key with the provided public key (if supported by FHE library)
        // Assuming the FHE library provides a re-encryption function
        // !TODO
        // reEncryptedKey = FHE.reEncrypt(encryptedSecretKey, publicKey);
    }

    /**
     * @dev Internal function to verify EIP712 signatures.
     * @param publicKey The public key provided by the user.
     * @param signature The signature to verify.
     * @return isValid Boolean indicating whether the signature is valid.
     */
    function isValidSignature(bytes32 publicKey, bytes calldata signature) internal view returns (bool isValid) {
        bytes32 structHash = keccak256(abi.encode(
            VIEW_SECRET_KEY_TYPEHASH,
            publicKey
        ));
        bytes32 digest = _hashTypedDataV4(structHash);
        address signer = ECDSA.recover(digest, signature);
        isValid = (signer == owner);
    }

    /**
     * @dev Fallback function to accept Ether deposits.
     */
    receive() external payable {}
}
