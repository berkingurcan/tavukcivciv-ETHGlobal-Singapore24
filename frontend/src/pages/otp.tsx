"use client"
import { useState, useEffect } from "react";
import styles from "../styles/Otp.module.css";
import { ConnectButton } from "@rainbow-me/rainbowkit";
import TwoFactorAuthJSON from "../../../artifacts/contracts/TwoFactorAuth.sol/TwoFactorAuth.json"
import TwoTOTP from "../../../artifacts/contracts/TwoFactorAuthTOTP.sol/TwoFactorAuthTOTP.json"
import { ethers, getAddress, toBigInt } from "ethers";

const TwoFactorAuthABI = TwoFactorAuthJSON.abi
const TwoFactorAuthADDRESS = "0xe7f1725E7734CE288F8367e1Bb143E90bb3F0512"

const TwoTOTPABI = TwoTOTP.abi
const TwoTOTPADDRESS = "0xCf7Ed3AccA5a467e9e704C703E8D87F634fB0Fc9"

export default function TwoFactorAuth() {
    const [account, setAccount] = useState<string | null>(null);
    const [contract, setContract] = useState<any>(null);
    const [secondSigner, setSecondSigner] = useState<string>("");
    const [timeInterval, setTimeInterval] = useState<string>("");
    const [error, setError] = useState<string | null>(null);
    const [otpRequested, setOtpRequested] = useState<boolean>(false);
    const [approvalGranted, setApprovalGranted] = useState<boolean>(false);
    const [primaryAddress, setPrimaryAddress] = useState<string>("");


    async function handleRegister() {
        const provider = new ethers.BrowserProvider(window.ethereum);
        const signer = await provider.getSigner();
        await provider.send("eth_requestAccounts", []);
        const contract = new ethers.Contract(TwoFactorAuthADDRESS, TwoFactorAuthABI, signer);

        const tx = await contract.register(
            getAddress(secondSigner),
            toBigInt(300)
        )
    }

    async function handleApproval() {
        try {
            const provider = new ethers.BrowserProvider(window.ethereum);
            const signer = await provider.getSigner();
            await provider.send("eth_requestAccounts", []);
            const signerAddress = await signer.getAddress();
    
            // Ensure the connected account is the second signer
            if (signerAddress.toLowerCase() !== secondSigner.toLowerCase()) {
                setError("Please connect with the second signer account to approve.");
                return;
            }
    
            const contract = new ethers.Contract(TwoFactorAuthADDRESS, TwoFactorAuthABI, signer);
    
            const tx = await contract.approve(getAddress(primaryAddress));
            await tx.wait();
    
            console.log('Approval successful');
            setApprovalGranted(true);
        } catch (error: any) {
            console.error('Error approving:', error);
            setError(error.message);
        }
    }
    

    async function handleLogin() {
        try {
            const provider = new ethers.BrowserProvider(window.ethereum);
            const signer = await provider.getSigner();
            await provider.send("eth_requestAccounts", []);
            const signerAddress = await signer.getAddress();

            const contract = new ethers.Contract(TwoFactorAuthADDRESS, TwoFactorAuthABI, signer);
    
            const tx = await contract.login();
            await tx.wait();
        } catch (error: any) {
            console.error('Error approving:', error);
            setError(error.message);
        }
    }

    async function verifyOtp() {
        return
    }
    
    async function requestOtp() {
        try {
            const provider = new ethers.BrowserProvider(window.ethereum);
            const signer = await provider.getSigner();
            await provider.send("eth_requestAccounts", []);
            const signerAddress = await signer.getAddress();

            const contract = new ethers.Contract(TwoTOTPADDRESS, TwoTOTPABI, signer);
    
            const tx = await contract.generateEncryptedOTP();
            await tx.wait();
            console.log(tx)
        } catch (error: any) {
            console.error('Error approving:', error);
            setError(error.message);
        }
    }

    


    return (
        <div>
        <main className={styles.container}>
            <ConnectButton />
            <h2 className={styles.heading}>2FA OTP App</h2>
            <div className={styles.inputGroup}>
                <input
                    type="text"
                    placeholder="Second Signer Address"
                    className={styles.inputField}
                    value={secondSigner}
                    onChange={(e) => setSecondSigner(e.target.value)}
                />
                <input
                    type="text"
                    placeholder="Time Interval (in seconds)"
                    className={styles.inputField}
                    value={timeInterval}
                    onChange={(e) => setTimeInterval(e.target.value)}
                />
                <button
                    className={`${styles.button} ${styles.otpButton}`}
                    onClick={handleRegister}
                >
                    REGISTER
                </button>
            </div>

            <div className={styles.inputGroup}>
                <input
                    type="text"
                    placeholder="Primary Address"
                    className={styles.inputField}
                    value={primaryAddress}
                    onChange={(e) => setPrimaryAddress(e.target.value)}
                />
                <button
                    className={`${styles.button} ${styles.approveButton}`}
                    onClick={handleApproval}
                >
                    APPROVE
                </button>
            </div>
            

            <div className={styles.inputGroup}>
                <button
                    className={`${styles.button} ${styles.loginButton}`}
                    onClick={handleLogin}
                    disabled={!approvalGranted}
                >
                    LOGIN
                </button>
            </div>
            <div className={styles.inputGroup}>
                <button
                    className={`${styles.button} ${styles.otpButton}`}
                    onClick={requestOtp}
                    disabled={otpRequested}
                >
                    GENERATE OTP
                </button>
            </div>
            {error && <p className={styles.error}>{error}</p>}
        </main>
    </div>
    )
}