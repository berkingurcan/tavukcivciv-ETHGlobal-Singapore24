"use client"
import { useState, useEffect } from "react";
import { Web3Provider } from "@ethersproject/providers"; // Correct import for ethers v6
import { parseEther } from "@ethersproject/units"; // Correct import for ethers v6

export default function Wallet() {
  const [account, setAccount] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [address, setAddress] = useState<string>("0x");
  const [value, setValue] = useState<string>("0");
  const [secretKey, setSecretKey] = useState<string>("");
  const [otp, setOtp] = useState<string>(""); // Add state for OTP


  useEffect(() => {
    if (typeof window !== "undefined" && typeof window.ethereum !== "undefined") {
      console.log("MetaMask is installed!");
    } else {
      setError("MetaMask is not installed. Please install it to use this app.");
    }
  }, []);

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

  const deployWallet = async () => {
    if (!secretKey) {
      setError("Please provide a secret key.");
      return;
    }
    console.log("Deploying wallet with secret key:", secretKey);
    setError(null);
  };

  const sendTransaction = async () => {
    if (!address || !value) {
      setError("Please provide a valid address and value.");
      return;
    }

    try {
      const provider = new Web3Provider(window.ethereum);
      const signer = provider.getSigner();
      const tx = await signer.sendTransaction({
        to: address,
        value: parseEther(value), // Corrected utility for parsing value in ethers v6
      });
      console.log("Transaction sent:", tx);
      setError(null);
    } catch (err) {
      setError("Transaction failed.");
      console.error(err);
    }
  };

  const submitOtp = () => {
    if (!otp) {
      setError("Please enter the OTP.");
      return;
    }
    console.log("Submitted OTP:", otp);
    setError(null);
  };
  

  return (
    <div className="grid grid-rows-[20px_1fr_20px] items-center justify-items-center min-h-screen p-8 pb-20 gap-16 sm:p-20 font-[family-name:var(--font-geist-sans)]">
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
            <h2>DEPLOY YOUR SMART CONTRACT WALLET</h2>

            <div className="mt-4 flex flex-col gap-4">
              <input
                type="text"
                placeholder="Secret Key"
                className="p-2 border border-gray-300 rounded-md"
                value={secretKey}
                onChange={handleSecretKeyChange}
              />
              <button
                className="px-4 py-2 bg-slate-900 text-white rounded-2xl"
                onClick={deployWallet}
              >
                DEPLOY
              </button>
            </div>

            <div className="mt-4 flex flex-col gap-4">
              <input
                type="text"
                placeholder="Transfer Address"
                className="p-2 border border-gray-300 rounded-md"
                value={address}
                onChange={handleAddressChange}
              />
              <input
                type="text"
                placeholder="Enter Value ETH"
                className="p-2 border border-gray-300 rounded-md"
                value={value}
                onChange={handleValue}
              />
              <button
                className="px-4 py-2 bg-slate-600 text-white rounded-2xl"
                onClick={sendTransaction}
              >
                SEND {value} ETH
              </button>
              
            </div>
            <div className="mt-4 flex flex-col gap-4">
            <input
                type="text"
                placeholder="Enter OTP"
                className="p-2 border border-gray-300 rounded-md"
                value={otp}
                onChange={handleOtpChange}
            />
            <button
                className="px-4 py-2 bg-green-600 text-white rounded-2xl"
                onClick={submitOtp}
            >
                SUBMIT OTP
            </button>
            </div>

          </div>
        )}
        {error && <p className="text-red-500">{error}</p>}
      </main>
      <footer className="row-start-3 flex gap-6 flex-wrap items-center justify-center">
        <a
          className="flex items-center gap-2 hover:underline hover:underline-offset-4"
          href="/"
          rel="noopener noreferrer"
        >
          ← Go Back
        </a>
      </footer>
    </div>
  );
}
