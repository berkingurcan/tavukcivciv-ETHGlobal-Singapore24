"use client"
import { useState, useEffect } from "react";
import styles from "../styles/Otp.module.css";
import { ConnectButton } from "@rainbow-me/rainbowkit";

export default function TwoFactorAuth() {
    const [account, setAccount] = useState<string | null>(null);
    const [contract, setContract] = useState<any>(null);
    const [secondSigner, setSecondSigner] = useState<string>("");
    const [timeInterval, setTimeInterval] = useState<string>("");
    const [error, setError] = useState<string | null>(null);
    const [otpRequested, setOtpRequested] = useState<boolean>(false);
    const [approvalGranted, setApprovalGranted] = useState<boolean>(false);
    const [primaryAddress, setPrimaryAddress] = useState<string>("");


    function handleRegister() {
        return
    }

    function handleLogin() {
        return
    }
    
    function requestOtp() {
        return
    }

    function verifyOtp() {
        return
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
                <button
                    className={`${styles.button} ${styles.otpButton}`}
                    onClick={requestOtp}
                    disabled={otpRequested}
                >
                    REQUEST OTP
                </button>
                <button
                    className={`${styles.button} ${styles.otpButton}`}
                    onClick={verifyOtp}
                >
                    VERIFY OTP
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

            {error && <p className={styles.error}>{error}</p>}
        </main>
    </div>
    )
}