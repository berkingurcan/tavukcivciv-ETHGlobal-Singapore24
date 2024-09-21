"use client"
import { useState, useEffect } from "react";
import styles from "../styles/Wallet.module.css";
import { ConnectButton } from "@rainbow-me/rainbowkit";
import { FhenixClient, fhenixjs, getPermit } from 'fhenixjs';
import { ethers } from "ethers";
import TOPTWallet from "../../../artifacts/contracts/TOTPWallet.sol/TOTPWallet.json"

import { toUtf8Bytes, parseEther, BrowserProvider, toBigInt, getAddress } from "ethers"

const TOTPWalletABI = TOPTWallet.abi
const TOPTWalletByteCode = TOPTWallet.bytecode
const TOPTWalletAddress = "0x9fE46736679d2D9a65F0992F2272dE9f3c7fa6e0"

export default function Wallet() {
  const [account, setAccount] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [timestamp, setTimestamp] = useState<string>("0");
  const [address, setAddress] = useState<string>("0x");
  const [value, setValue] = useState<string>("");
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
    if (typeof window.ethereum !== 'undefined') {
      const provider = new BrowserProvider(window.ethereum);
      
      console.log(provider)
      const signer = await provider.getSigner();
      console.log(signer)
      const factory = new ethers.ContractFactory(TOTPWalletABI, TOPTWalletByteCode, signer);

      const encryptedSecretKey = toUtf8Bytes(secretKey);
      console.log(encryptedSecretKey)
      const contract = await factory.deploy(encryptedSecretKey, {
          gasLimit: 6000000000,
      });
      console.log(contract)
      setWalletContractAddress((await contract.getAddress()).toString())
      console.log('Contract instance created: ', await contract.getAddress());
    } else {
      console.error('Ethereum wallet not detected');
      throw new Error('Ethereum wallet not detected');
    }
  }

  async function sendTransaction() {
    const provider = new ethers.BrowserProvider(window.ethereum);
    const signer = await provider.getSigner();
    await provider.send("eth_requestAccounts", []);
    const contract = new ethers.Contract(TOPTWalletAddress, TOTPWalletABI, signer);

    const tx = await contract.executeTransaction(
        getAddress(address),
        parseEther(value),
        toUtf8Bytes(otp),
        toBigInt(timestamp)
    );
    tx.wait()
  }

  return (
    <div>
    <main className={styles.container}>
        <ConnectButton />

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
          placeholder="Enter Value TFHE"
          className={styles.inputField}
          value={value}
          onChange={handleValue}
        />
        
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
          className={`${styles.button} ${styles.sendButton}`}
          onClick={sendTransaction}
        >
          SEND {value} TFHE
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
