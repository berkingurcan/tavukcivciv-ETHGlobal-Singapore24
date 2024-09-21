"use client"
import { useState, useEffect } from "react";
import styles from "../styles/Wallet.module.css";
import { ConnectButton } from "@rainbow-me/rainbowkit";
import { FhenixClient, fhenixjs } from 'fhenixjs';
import { ethers } from "ethers";
import TOPTWallet from "../../../artifacts/contracts/TOTPWallet.sol/TOTPWallet.json"

import { toUtf8Bytes, parseEther,  } from "ethers"

const TOTPWalletABI = TOPTWallet.abi
const TOPTWalletByteCode = TOPTWallet.bytecode

export default function Wallet() {
  const [account, setAccount] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [timestamp, setTimestamp] = useState<string>("0");
  const [address, setAddress] = useState<string>("0x");
  const [value, setValue] = useState<string>("0");
  const [secretKey, setSecretKey] = useState<string>("");
  const [otp, setOtp] = useState<string>("");
  const [walletContractAddress, setWalletContractAddress] = useState<string>("");

  const handleValue = (event: any) => {
    setValue(event.target.value);
  };

  const handleTimestamp = (event: any) => {
    setTimestamp(event.target.value);
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

  async function deployWallet() {
    const provider = new ethers.BrowserProvider(window.ethereum);
    const signer = await provider.getSigner();
    const factory = new ethers.ContractFactory(TOTPWalletABI, TOPTWalletByteCode, signer);
    // const fhenixClient = new FhenixClient({ provider });
    console.log('FhenixClient initialized');

    const encryptedSecretKey = toUtf8Bytes(secretKey);
    console.log(encryptedSecretKey)
    const contract = await factory.deploy(encryptedSecretKey);
    console.log(contract)
    setWalletContractAddress((await contract.getAddress()).toString())
    console.log('Contract instance created: ', await contract.getAddress());
  }

  async function sendTransaction() {
    const provider = new ethers.BrowserProvider(window.ethereum);
    const signer = await provider.getSigner();
    await provider.send("eth_requestAccounts", []);
    const contract = new ethers.Contract(walletContractAddress, TOTPWalletABI, signer);


    const tx = await contract.executeTransaction(
        address,
        parseEther(value),
        otp,
        timestamp
    );
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
        <input
          type="text"
          placeholder="Enter Timestamp"
          className={styles.inputField}
          value={timestamp}
          onChange={handleTimestamp}
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
