# Tavuk Civciv
2FA FHE Time-based One-time Password App

---

## Table of Contents

- [Introduction](#introduction)
- [Project Overview](#project-overview)
- [Contract Review](#contract-review)
  - [1. TwoFactorAuth.sol](#1-twofactorauthsol)
  - [2. TOTPWallet.sol](#2-totpwalletsol)
  - [3. TwoFactorAuthTOTP.sol](#3-twofactorauthtotpsol)
- [User Logic](#user-logic)
  - [Registration Phase](#registration-phase)
  - [Login Phase](#login-phase)
  - [Transaction Execution Phase](#transaction-execution-phase)
- [Business Logic](#business-logic)
- [UI/UX Flow](#uiux-flow)
  - [1. Registration Flow](#1-registration-flow)
  - [2. Login Flow](#2-login-flow)
  - [3. Second Signer Approval Flow](#3-second-signer-approval-flow)
  - [4. OTP Generation and Verification Flow](#4-otp-generation-and-verification-flow)
  - [5. Transaction Execution Flow](#5-transaction-execution-flow)
  - [6. Frontend](#6-frontend)
- [Installation and Usage](#installation-and-usage)
- [Conclusion](#conclusion)
- [License](#license)

---

## Introduction

This project implements a decentralized two-factor authentication (2FA) system using Fhenix. By integrating Time-based One-Time Passwords (TOTP) and Fully Homomorphic Encryption (FHE), we provide a secure and decentralized method for user authentication and transaction authorization without relying on centralized servers.

**_Note:_** The Project is not complete with smooth UI. OTP Randomness is pseudo. UI is not complete.

---

## Project Overview

The project consists of three main smart contracts:

1. **TwoFactorAuth.sol**: Implements 2FA by requiring approvals from two separate Ethereum addresses—a primary address and a second signer.

2. **TOTPWallet.sol**: A smart contract wallet that uses TOTP for transaction authorization for demonstration of the 2FA, with TOTP validation performed using FHE to ensure confidentiality.

3. **TwoFactorAuthTOTP.sol**: Integrates the above contracts to provide a comprehensive 2FA system using encrypted OTPs.

---

## Contract Review

### 1. TwoFactorAuth.sol

**Purpose**: Implements two-factor authentication using two different Ethereum addresses to enhance security.

**Key Components**:

- **User Struct**: Stores user information such as primary and secondary addresses, approval times, and status.
- **Functions**:
  - `register()`: Registers the primary and secondary addresses along with the approval time interval of the OTP.
  - `requestApproval()`: Primary user initiates a login request.
  - `approve()`: Second signer approves the login request within the specified time interval.
  - `login()`: Primary user completes the login process after approval.
  - `updateSecondSigner()`: Updates the second signer address.
  - `updateTimeInterval()`: Updates the time interval for approvals.
  - `isApproved()`: Checks if the second signature is approved and not expired.
- **Events**: Emitted for key actions to facilitate frontend interactions and logging.

### 2. TOTPWallet.sol

**Purpose**: A simple smart contract wallet for demonstration that uses TOTP for transaction authorization, leveraging FHE for secure on-chain processing of OTPs.

**Key Components**:

- **Encrypted Secret Key**: Stored securely using FHE to generate and validate TOTPs.
- **Functions**:
  - `changeSecretKey()`: Allows the owner to update the encrypted secret key.
  - `executeTransaction()`: Validates the TOTP and executes the transaction if valid.
  - `validateTOTP()`: Internal function to validate the provided TOTP using FHE operations.
  - `viewSecretKey()`: Allows authorized users to view the encrypted secret key (placeholder for FHE re-encryption functionality).
  - `isValidSignature()`: Verifies EIP712 signatures for authorization.
- **Modifiers**: `onlyOwner` ensures that only the contract owner can execute certain functions.
- **Events**: `TransactionExecuted` is emitted upon successful transaction execution.

### 3. TwoFactorAuthTOTP.sol

**Purpose**: Integrates `TwoFactorAuth` and `TOTPWallet` to provide a seamless 2FA experience using encrypted OTPs.

**Key Components**:

- **Mappings**: Stores encrypted OTPs for each user.
- **Functions**:
  - `generateEncryptedOTP()`: Generates and encrypts a 4-digit OTP using FHE.
  - `verifyEncryptedOTP()`: Verifies the encrypted OTP by interacting with `TOTPWallet`.
  - `loginWithTwoFactorAuth()`: Orchestrates the 2FA login process by combining approval and OTP verification.
- **Events**: `OTPGenerated` and `UserLoggedIn` facilitate frontend updates and logging.

---

## User Logic

### Registration Phase

1. **Connect Primary Wallet**: User connects their primary Ethereum wallet to the decentralized application (dApp).

2. **Assign Second Signer**: User provides a secondary Ethereum address to act as a second signer for approvals.

3. **Set Time Interval**: User specifies the time interval (in seconds) during which approvals are valid.

4. **Register**: User calls the `register()` function on the `TwoFactorAuth` contract to store their information on-chain.

### Login Phase

1. **Request Approval**:
   - User initiates the login process by calling `requestApproval()` on the `TwoFactorAuth` contract.
   - An `ApprovalRequested` event is emitted, notifying the second signer.

2. **Second Signer Approval**:
   - The second signer receives a notification and connects their wallet to the dApp.
   - Second signer calls `approve()` on the `TwoFactorAuth` contract for the primary user's address.

3. **Generate Encrypted OTP**:
   - Primary user calls `generateEncryptedOTP()` on the `TwoFactorAuthTOTP` contract.
   - An OTP is generated and encrypted using FHE.

4. **Verify Encrypted OTP**:
   - User calls `verifyEncryptedOTP()` with the timestamp.
   - OTP is validated via the `TOTPWallet` contract.
   - Upon successful validation, the user gains access.

### Transaction Execution Phase

1. **Initiate Transaction**:
   - User specifies the recipient address and amount.
   - Calls `executeTransaction()` on the `TOTPWallet` contract, providing the encrypted OTP and timestamp.

2. **Validation and Execution**:
   - The contract validates the OTP using FHE.
   - If valid, the transaction is executed, and a `TransactionExecuted` event is emitted.

---

## Business Logic

- **Security Enhancement**: By requiring approvals from two separate addresses and encrypted OTPs, the system significantly reduces unauthorized access risks.

- **Decentralization**: All authentication processes occur on-chain, aligning with blockchain's trustless and decentralized principles.

- **User Empowerment**: Users have full control over their authentication mechanisms and can update settings as needed.

- **Confidentiality via FHE**: Utilizing FHE ensures sensitive data like OTPs remains confidential, even during on-chain processing.

- **Scalability**: The modular design allows for future enhancements and integrations, such as additional authentication factors.

---

## UI/UX Flow

### 1. Registration Flow

**User Interface Elements**:

- **Connect Wallet Button**: To connect the primary Ethereum wallet.
- **Second Signer Address Input**: Field to input the second signer's Ethereum address.
- **Time Interval Input**: Field to set the approval time window (in seconds).
- **Register Button**: To submit registration details.

**User Experience Flow**:

1. **Access Registration Page**: User navigates to the registration section of the dApp.

2. **Connect Primary Wallet**: User clicks "Connect Wallet" and approves the connection.

3. **Enter Details**:
   - Inputs the second signer's address.
   - Sets the approval time interval.

4. **Submit Registration**:
   - Clicks "Register" to invoke the `register()` function.
   - Receives a confirmation message upon success.

### 2. Login Flow

**User Interface Elements**:

- **Login Button**: To initiate the login request.
- **Status Messages**: Displays current status (e.g., "Awaiting second signer approval").

**User Experience Flow**:

1. **Initiate Login**:
   - Clicks "Login" to call `requestApproval()`.
   - Status message indicates awaiting approval.

2. **Await Approval**:
   - Monitors status updates based on emitted events.

### 3. Second Signer Approval Flow

**User Interface Elements**:

- **Connect Wallet Button**: For the second signer.
- **Pending Approvals List**: Displays pending login requests.
- **Approve Button**: To approve a login request.

**User Experience Flow**:

1. **Notification**: Second signer receives an alert about the pending approval.

2. **Connect Wallet**: Navigates to the dApp and connects their wallet.

3. **View Pending Requests**: Sees a list of pending approvals.

4. **Approve Request**:
   - Selects the request and clicks "Approve".
   - Calls `approve()` with the primary user's address.
   - Receives a confirmation message.

### 4. OTP Generation and Verification Flow

**User Interface Elements**:

- **Generate OTP Button**: To create and encrypt the OTP.
- **Verify OTP Button**: To verify the encrypted OTP.
- **Status Messages**: Indicates process status.

**User Experience Flow**:

1. **Generate Encrypted OTP**:
   - Clicks "Generate OTP" to call `generateEncryptedOTP()`.
   - Receives a status update confirming OTP generation.

2. **Verify Encrypted OTP**:
   - Clicks "Verify OTP" to call `verifyEncryptedOTP()`.
   - Upon success, a "Login Successful" message is displayed.

### 5. Transaction Execution Flow

**User Interface Elements**:

- **Recipient Address Input**: Field for recipient's Ethereum address.
- **Amount Input**: Field to specify the amount to send.
- **Execute Transaction Button**: To initiate the transaction.
- **Status Messages**: Displays transaction outcomes.

**User Experience Flow**:

1. **Input Transaction Details**:
   - Enters recipient address and amount.

2. **Execute Transaction**:
   - Clicks "Execute Transaction" to call `executeTransaction()`.
   - Provides necessary parameters, including the encrypted OTP.

3. **Confirmation**:
   - Upon success, transaction details and confirmations are displayed.

### 6. Frontend

Explain Frontend with ss

---

## Installation and Usage

