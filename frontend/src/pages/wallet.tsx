"use client"
import { useState, useEffect } from "react";

export default function Wallet() {
  const [account, setAccount] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [address, setAddress] = useState<string>("0x");
  const [value, setValue] = useState<string>("0");
  const [secretKey, setSecretKey] = useState<string>("");
  const [otp, setOtp] = useState<string>(""); // Add state for OTP


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
    return
  }

  function sendTransaction() {
    return
  }

  function submitOtp() {
    return
  }

  return (
        <main className="flex flex-col gap-8 row-start-2 items-center sm:items-start">
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
        {error && <p className="text-red-500">{error}</p>}
      </main>
    )
}