import { DeployFunction } from "hardhat-deploy/types";
import { HardhatRuntimeEnvironment } from "hardhat/types";
import { toUtf8Bytes } from "ethers"; // v6 import

import chalk from "chalk";
import { skip } from "node:test";

const hre = require("hardhat");

const func: DeployFunction = async function () {
  const { fhenixjs, ethers } = hre;
  const { deploy } = hre.deployments;
  const [signer] = await ethers.getSigners();
  await fhenixjs.getFunds("0x758F15dD1701e3966b04aFdDbAE671F271Cd5B0f")
  await fhenixjs.getFunds("0x2B429594507BdFB5e08D269384B37eEc7cc05467")
  await fhenixjs.getFunds("0x534ac62EDB1230f5145dC8af8d270250600e3F0F")


  if ((await ethers.provider.getBalance(signer.address)).toString() === "0") {
    if (hre.network.name === "localfhenix") {
      await fhenixjs.getFunds(signer.address);
    } else {
        console.log(
            chalk.red("Please fund your account with testnet FHE from https://faucet.fhenix.zone"));
        return;
    }
  }

  const counter = await deploy("Counter", {
    from: signer.address,
    args: [],
    log: true,
    skipIfAlreadyDeployed: false,
  });

  const twoFactorAuth = await deploy("TwoFactorAuth", {
    from: signer.address,
    args: [],
    log: true,
    skipIfAlreadyDeployed: false,
  })

  console.log(`Counter contract: `, counter.address);
  console.log(`Two Factor Auth Contract: `, twoFactorAuth.address)

  const _encryptedSecretKey = fhenixjs.encrypt_uint32(123456789);
  const encryptedSecretKey = toUtf8Bytes(_encryptedSecretKey)

  const TOTPWallet = await deploy("TOTPWallet", {
    from: signer.address,
    args: [encryptedSecretKey],
    log: true,
    skipIfAlreadyDeployed: false,
  })

  console.log(`TOTP Wallet: `, TOTPWallet.address)

  const twoFactorAuthOTP = await deploy("TwoFactorAuthTOTP", {
    from: signer.address,
    args: [TOTPWallet.address, twoFactorAuth.address],
    log: true,
    skipIfAlreadyDeployed: false,
  })

  console.log(`TwoFactorAuthTOTP: `, twoFactorAuthOTP.address)
};

export default func;
func.id = "deploy_counter";
func.tags = ["Counter"];
