"use client"
import { useState, useEffect } from "react";
import styles from "../styles/Wallet.module.css";
import { ConnectButton } from "@rainbow-me/rainbowkit";
import { useAccount, useSigner } from "wagmi"; // Using wagmi hooks for account and signer
import { FhenixClient } from 'fhenixjs';
import { ethers } from "ethers";
import TOPTWallet from "../../../artifacts/contracts/TOTPWallet.sol/TOTPWallet.json"

import { toUtf8Bytes } from "ethers"

const TOTPWalletABI = TOPTWallet.abi

export default function Wallet() {

    const { userAddress, isConnected } = useAccount();
    const { data: signer } = useSigner();
  const [account, setAccount] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [address, setAddress] = useState<string>("0x");
  const [value, setValue] = useState<string>("0");
  const [secretKey, setSecretKey] = useState<string>("");
  const [otp, setOtp] = useState<string>("");

  const handleValue = (event: any) => {
    setValue(event.target.value);
  };

  const handleAddressChange = (event: any) => {
    setAddress(event.target.value);
  };

  const handleSecretKeyChange = (event: any) => {
    setSecretKey(event.target.value);
  };

  const handleOtpChange = (event: any) => {
    setOtp(event.target.value);
  };

  function deployWallet() {
    const encryptedSecretKey = toUtf8Bytes(secretKey);

  }

  function sendTransaction() {
    return
  }

  function submitOtp() {
    return
  }

  return (
    <div>
    <main className={styles.container}>
        <ConnectButton />

      <h2 className={styles.heading}>Deploy Your Smart Contract Wallet</h2>
      <div className={styles.inputGroup}>
        <input
          type="text"
          placeholder="Secret Key"
          className={styles.inputField}
          value={secretKey}
          onChange={handleSecretKeyChange}
        />
        <button
          className={`${styles.button} ${styles.deployButton}`}
          onClick={deployWallet}
        >
          DEPLOY
        </button>
      </div>

      <div className={styles.inputGroup}>
        <input
          type="text"
          placeholder="Transfer Address"
          className={styles.inputField}
          value={address}
          onChange={handleAddressChange}
        />
        <input
          type="text"
          placeholder="Enter Value ETH"
          className={styles.inputField}
          value={value}
          onChange={handleValue}
        />
        <button
          className={`${styles.button} ${styles.sendButton}`}
          onClick={sendTransaction}
        >
          SEND {value} ETH
        </button>
      </div>

      <div className={styles.inputGroup}>
        <input
          type="text"
          placeholder="Enter OTP"
          className={styles.inputField}
          value={otp}
          onChange={handleOtpChange}
        />
        <button
          className={`${styles.button} ${styles.otpButton}`}
          onClick={submitOtp}
        >
          SUBMIT OTP
        </button>
      </div>

      {error && <p className={styles.error}>{error}</p>}
        <a
          className={`${styles.button} ${styles.deployButton}`}
          href="/"
          rel="noopener noreferrer"
        >
          ← Go Back
        </a>
    </main>
        
    </div>
  );
}
