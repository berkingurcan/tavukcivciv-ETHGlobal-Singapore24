import { ConnectButton } from '@rainbow-me/rainbowkit';
import type { NextPage } from 'next';
import Head from 'next/head';
import styles from '../styles/Home.module.css';

const Home: NextPage = () => {
  return (
    <div className={styles.container}>
      <Head>
        <title>Tavuk Civciv 2FA OTP FHE </title>
      </Head>
      <main className={styles.main}>
        <ConnectButton />

        <div className={styles.grid}>
          <a className={styles.card} href="/wallet">
            <h2>Smart Contract Wallet App</h2>
            <p>Deploy and use your smart contract wallet with 2FA</p>
          </a>

          <a className={styles.card} href="/otp">
            <h2>2FA App</h2>
            <p>Register or Login the 2FA OTP Application</p>
          </a>
        </div>
      </main>

      <footer className={styles.footer}>
        <a href="https://rainbow.me" rel="noopener noreferrer" target="_blank">
          Made with ❤️ by your frens at 🌈
        </a>
      </footer>
    </div>
  );
};

export default Home;
