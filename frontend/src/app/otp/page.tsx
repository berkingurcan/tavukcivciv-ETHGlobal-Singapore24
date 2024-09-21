"use client";
import { useState, useEffect } from "react";
import { ethers } from "ethers"; // Import ethers.js library
import TwoFactorAuthABI from "../../../../artifacts/contracts/TwoFactorAuth.sol/TwoFactorAuth.json"; // Import the ABI for TwoFactorAuth contract
import { Provider } from "ethers"; // Correct import for ethers v6

export default function TwoFactorAuth() {
  const [account, setAccount] = useState<string | null>(null);
  const [contract, setContract] = useState<any>(null);
  const [secondSigner, setSecondSigner] = useState<string>("");
  const [timeInterval, setTimeInterval] = useState<string>("");
  const [error, setError] = useState<string | null>(null);
  const [otpRequested, setOtpRequested] = useState<boolean>(false);
  const [approvalGranted, setApprovalGranted] = useState<boolean>(false);
  const [primaryAddress, setPrimaryAddress] = useState<string>("");

  const contractAddress = "YOUR_CONTRACT_ADDRESS"; // Replace with your deployed contract address

  useEffect(() => {
    if (typeof window !== "undefined" && typeof window.ethereum !== "undefined") {
      console.log("MetaMask is installed!");
    } else {
      setError("MetaMask is not installed. Please install it to use this app.");
    }
  }, []);

  const connectWallet = async () => {
    try {
      if (typeof window !== "undefined" && typeof window.ethereum !== "undefined") {
        const accounts = await window.ethereum.request({
          method: 'eth_requestAccounts',
        });
        setAccount(accounts[0]);
        setError(null);
      } else {
        setError("MetaMask is not installed. Please install it.");
      }
    } catch (err) {
      setError("Error connecting to wallet.");
      console.error(err);
    }
  };

  const handleRegister = async () => {
    if (!secondSigner || !timeInterval) {
      setError("Please provide valid second signer and time interval.");
      return;
    }

    try {
      const tx = await contract.register(secondSigner, timeInterval);
      await tx.wait();
      console.log("User registered successfully");
      setError(null);
    } catch (err) {
      setError("Registration failed.");
      console.error(err);
    }
  };

  const requestOtp = async () => {
    try {
      const tx = await contract.requestApproval();
      await tx.wait();
      console.log("OTP requested successfully");
      setOtpRequested(true);
      setError(null);
    } catch (err) {
      setError("Failed to request OTP.");
      console.error(err);
    }
  };

  const approveOtp = async () => {
    try {
      const tx = await contract.approve(primaryAddress);
      await tx.wait();
      console.log("OTP approved successfully");
      setApprovalGranted(true);
      setError(null);
    } catch (err) {
      setError("OTP approval failed.");
      console.error(err);
    }
  };

  const login = async () => {
    if (!approvalGranted) {
      setError("OTP not approved yet.");
      return;
    }

    try {
      const tx = await contract.login();
      await tx.wait();
      console.log("User logged in successfully");
      setError(null);
    } catch (err) {
      setError("Login failed.");
      console.error(err);
    }
  };

  return (
    <div className="grid grid-rows-[20px_1fr_20px] items-center justify-items-center min-h-screen p-8 pb-20 gap-16 sm:p-20">
      <main className="flex flex-col gap-8 row-start-2 items-center sm:items-start">
        {!account ? (
          <button
            className="px-4 py-2 bg-blue-600 text-white rounded-md"
            onClick={connectWallet}
          >
            CONNECT WALLET
          </button>
        ) : (
          <div>
            <p className="text-lg font-semibold">Connected Account: {account}</p>
            <h2>TWO FACTOR AUTHENTICATION</h2>

            <div className="mt-4 flex flex-col gap-4">
              <input
                type="text"
                placeholder="Second Signer Address"
                className="p-2 border border-gray-300 rounded-md"
                value={secondSigner}
                onChange={(e) => setSecondSigner(e.target.value)}
              />
              <input
                type="text"
                placeholder="Time Interval (in seconds)"
                className="p-2 border border-gray-300 rounded-md"
                value={timeInterval}
                onChange={(e) => setTimeInterval(e.target.value)}
              />
              <button
                className="px-4 py-2 bg-slate-900 text-white rounded-2xl"
                onClick={handleRegister}
              >
                REGISTER
              </button>
            </div>

            <div className="mt-4 flex flex-col gap-4">
              <button
                className="px-4 py-2 bg-slate-600 text-white rounded-2xl"
                onClick={requestOtp}
                disabled={otpRequested}
              >
                REQUEST OTP
              </button>
            </div>

            <div className="mt-4 flex flex-col gap-4">
              <input
                type="text"
                placeholder="Primary Address"
                className="p-2 border border-gray-300 rounded-md"
                value={primaryAddress}
                onChange={(e) => setPrimaryAddress(e.target.value)}
              />
              <button
                className="px-4 py-2 bg-green-600 text-white rounded-2xl"
                onClick={approveOtp}
              >
                APPROVE OTP
              </button>
            </div>

            <div className="mt-4 flex flex-col gap-4">
              <button
                className="px-4 py-2 bg-blue-600 text-white rounded-2xl"
                onClick={login}
                disabled={!approvalGranted}
              >
                LOGIN
              </button>
            </div>

            {error && <p className="text-red-500">{error}</p>}
          </div>
        )}
      </main>
    </div>
  );
}
