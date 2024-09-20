// SPDX-License-Identifier: MIT
pragma solidity ^0.8.17;

/**
 * @title TwoFactorAuth
 * @dev A contract that implements 2FA login functionality using two different addresses.
 */
contract TwoFactorAuth {
    struct User {
        address primaryAddress;
        address secondSigner;
        uint256 lastRequestTime;
        uint256 lastApprovalTime;
        uint256 timeInterval;
        bool secondSignatureApproved;
    }

    /// @notice Mapping from primary address to User struct
    mapping(address => User) public users;

    /// @notice Event emitted when a new user is registered
    event UserRegistered(address indexed primaryAddress, address indexed secondSigner, uint256 timeInterval);

    /// @notice Event emitted when a login approval is requested
    event ApprovalRequested(address indexed primaryAddress, uint256 requestTime);

    /// @notice Event emitted when a login approval is granted
    event ApprovalGranted(address indexed secondSigner, address indexed primaryAddress, uint256 approvalTime);

    /// @notice Event emitted when a user logs in successfully
    event UserLoggedIn(address indexed primaryAddress, uint256 loginTime);

    /**
     * @dev Allows a user to register with their primary address and set a second signer address.
     * @param _secondSigner The address of the second signer.
     * @param _timeInterval The time interval (in seconds) for approvals.
     */
    function register(address _secondSigner, uint256 _timeInterval) external {
        require(_secondSigner != address(0), "Invalid second signer address");
        require(_secondSigner != msg.sender, "Second signer cannot be the same as primary address");
        require(users[msg.sender].primaryAddress == address(0), "User already registered");
        require(_timeInterval > 0, "Time interval must be greater than zero");

        users[msg.sender] = User({
            primaryAddress: msg.sender,
            secondSigner: _secondSigner,
            lastRequestTime: 0,
            lastApprovalTime: 0,
            timeInterval: _timeInterval,
            secondSignatureApproved: false
        });

        emit UserRegistered(msg.sender, _secondSigner, _timeInterval);
    }

    /**
     * @dev Primary user initiates a login request. This could be considered as requesting an OTP code.
     */
    function requestApproval() external {
        User storage user = users[msg.sender];
        require(user.primaryAddress != address(0), "User not registered");

        user.lastRequestTime = block.timestamp;
        user.secondSignatureApproved = false;

        emit ApprovalRequested(msg.sender, user.lastRequestTime);
    }

    /**
     * @dev Second signer approves the request within the time interval.
     * @param _primaryAddress The primary address of the user requesting approval.
     */
    function approve(address _primaryAddress) external {
        User storage user = users[_primaryAddress];
        require(user.secondSigner == msg.sender, "Caller is not the second signer");
        require(user.lastRequestTime != 0, "No approval requested");
        require(block.timestamp <= user.lastRequestTime + user.timeInterval, "Approval time window has expired");

        user.lastApprovalTime = block.timestamp;
        user.secondSignatureApproved = true;

        emit ApprovalGranted(msg.sender, _primaryAddress, user.lastApprovalTime);
    }

    /**
     * @dev Function to simulate user login after both signatures are approved.
     * This function would be called by the primary user after the second signer has approved.
     */
    function login() external {
        User storage user = users[msg.sender];
        require(user.primaryAddress != address(0), "User not registered");
        require(user.secondSignatureApproved, "Second signature not approved");
        require(block.timestamp <= user.lastApprovalTime + user.timeInterval, "Approval expired");

        // Reset approval status after successful login
        user.secondSignatureApproved = false;
        user.lastRequestTime = 0;
        user.lastApprovalTime = 0;

        emit UserLoggedIn(msg.sender, block.timestamp);
        // Additional login logic can be implemented here
    }

    /**
     * @dev Allows the primary user to update the second signer address.
     * @param _newSecondSigner The new second signer address.
     */
    function updateSecondSigner(address _newSecondSigner) external {
        User storage user = users[msg.sender];
        require(user.primaryAddress != address(0), "User not registered");
        require(_newSecondSigner != address(0), "Invalid second signer address");
        require(_newSecondSigner != msg.sender, "Second signer cannot be the same as primary address");

        user.secondSigner = _newSecondSigner;
    }

    /**
     * @dev Allows the primary user to update the time interval for approvals.
     * @param _newTimeInterval The new time interval (in seconds).
     */
    function updateTimeInterval(uint256 _newTimeInterval) external {
        User storage user = users[msg.sender];
        require(user.primaryAddress != address(0), "User not registered");
        require(_newTimeInterval > 0, "Time interval must be greater than zero");

        user.timeInterval = _newTimeInterval;
    }

    /**
     * @dev Fetches the user's current approval status.
     * @param _primaryAddress The primary address of the user.
     * @return isIApproved True if the second signature is approved and not expired.
     */
    function isApproved(address _primaryAddress) external view returns (bool isIApproved) {
        User storage user = users[_primaryAddress];
        isIApproved = user.secondSignatureApproved && (block.timestamp <= user.lastApprovalTime + user.timeInterval);
    }
}
