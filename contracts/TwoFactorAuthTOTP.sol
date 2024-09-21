// SPDX-License-Identifier: MIT
pragma solidity ^0.8.17;

import "@fhenixprotocol/contracts/FHE.sol";
import "./TOTPWallet.sol";
import "./TwoFactorAuth.sol";

/**
 * @title TwoFactorAuthTOTP
 * @dev A contract that integrates TOTPWallet and TwoFactorAuth for 2FA using encrypted OTPs.
 */
contract TwoFactorAuthTOTP {
    using FHE for *;

    /// @notice Instance of the TOTPWallet contract
    TOTPWallet public totpWallet;

    /// @notice Instance of the TwoFactorAuth contract
    TwoFactorAuth public twoFactorAuth;

    /// @notice Mapping to store encrypted OTPs for users
    mapping(address => bytes) public encryptedOTPs;

    /// @notice Event emitted when an OTP is generated
    event OTPGenerated(address indexed user, uint32 timestamp);

    /// @notice Event emitted when a user successfully logs in
    event UserLoggedIn(address indexed user, uint32 timestamp);

    /**
     * @dev Constructor to initialize the TOTPWallet and TwoFactorAuth instances.
     * @param _totpWalletAddress The address of the deployed TOTPWallet contract.
     * @param _twoFactorAuthAddress The address of the deployed TwoFactorAuth contract.
     */
    constructor(address _totpWalletAddress, address _twoFactorAuthAddress) {
        require(_totpWalletAddress != address(0), "Invalid TOTPWallet address");
        require(_twoFactorAuthAddress != address(0), "Invalid TwoFactorAuth address");

        totpWallet = TOTPWallet(payable(_totpWalletAddress));
        twoFactorAuth = TwoFactorAuth(_twoFactorAuthAddress);
    }

    /**
     * @dev Generates an encrypted OTP using the same algorithm as TOTPWallet's validateTOTP function.
     * @notice This function should be called by the user who wants to log in.
     */
    function generateEncryptedOTP() external {
        // Get the encrypted secret key from TOTPWallet
        bytes memory encryptedSecretKeyBytes = totpWallet.getEncryptedSecretKey();
        euint32 encryptedSecretKey = FHE.asEuint32(encryptedSecretKeyBytes);

        // Get the current timestamp
        uint32 timestamp = uint32(block.timestamp);

        // Calculate the time step (e.g., 300-second intervals)
        uint32 timeStep = timestamp / 300;
        euint32 encryptedTimeStep = FHE.asEuint32(timeStep);

        // Compute the encrypted TOTP
        // encryptedMultiplication = encryptedSecretKey * encryptedTimeStep
        euint32 encryptedMultiplication = FHE.mul(encryptedSecretKey, encryptedTimeStep);

        // encryptedDivision = encryptedMultiplication / 1000000
        euint32 encryptedDivision = FHE.div(encryptedMultiplication, FHE.asEuint32(1000000));

        // encryptedModulo = encryptedMultiplication - (encryptedDivision * 1000000)
        euint32 encryptedModulo = FHE.sub(
            encryptedMultiplication,
            FHE.mul(encryptedDivision, FHE.asEuint32(1000000))
        );

        bytes memory encryptedOTP = new bytes(4); // uint32 takes 4 bytes


        assembly {
            mstore(add(encryptedOTP, 32), encryptedModulo)
        }
        encryptedOTPs[msg.sender] = encryptedOTP;

        // Emit event
        emit OTPGenerated(msg.sender, timestamp);
    }


    /**
     * @dev Sends the encrypted OTP to the TOTPWallet contract for verification.
     * @param _timestamp The timestamp when the OTP was generated.
     */
    function verifyEncryptedOTP(uint32 _timestamp) external {
        // Retrieve the encrypted OTP
        bytes memory encryptedOTP = encryptedOTPs[msg.sender];
        require(encryptedOTP.length > 0, "No OTP generated");

        // Call the TOTPWallet's executeTransaction function for verification
        // For demonstration, we'll assume the transaction is to send 0 Ether to the user's address
        totpWallet.executeTransaction(
            payable(msg.sender),
            0,
            encryptedOTP,
            _timestamp
        );

        // Emit event
        emit UserLoggedIn(msg.sender, _timestamp);

        // Clear the stored encrypted OTP
        delete encryptedOTPs[msg.sender];
    }

    /**
     * @dev Handles the TwoFactorAuth process by requesting approval and logging in.
     */
    function loginWithTwoFactorAuth() external {
        // Step 1: Primary user requests approval
        twoFactorAuth.requestApproval();

        // Step 2: Second signer approves the request
        // This would be done by the second signer calling twoFactorAuth.approve(primaryAddress)
        // For demonstration, we assume this step is done off-chain by the second signer

        // Step 3: Primary user completes the login
        twoFactorAuth.login();

        // The user is now logged in with TwoFactorAuth
    }
}
