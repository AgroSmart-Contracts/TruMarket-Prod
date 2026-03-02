import type { IProvider } from "@web3auth/base";
import Web3, { utils } from "web3";
import { ethers } from "ethers";

export default class EthereumRpc {
  private static globalProvider: IProvider | null = null;

  static setGlobalProvider(provider: IProvider) {
    EthereumRpc.globalProvider = provider;
  }

  private readonly provider: IProvider;

  constructor() {
    if (!EthereumRpc.globalProvider) {
      console.log("Global provider not set. Call setGlobalProvider before creating an instance.");
    }
    //@ts-ignore
    this.provider = EthereumRpc.globalProvider;
  }

  async waitForTransaction(txHash: string): Promise<any> {
    const web3 = new Web3(this.provider as IProvider);
    return web3.eth.getTransactionReceipt(txHash);
  }

  async getAccounts(): Promise<string[]> {
    try {
      const web3 = new Web3(this.provider as IProvider);
      const accounts = await web3.eth.getAccounts();
      return accounts;
    } catch (error: unknown) {
      return error as string[];
    }
  }

  async getBalance(): Promise<string> {
    try {
      const web3 = new Web3(this.provider as IProvider);
      const accounts = await web3.eth.getAccounts();
      const balance = await web3.eth.getBalance(accounts[0]);
      return balance.toString();
    } catch (error) {
      return error as string;
    }
  }

  async signMessage(milestone: number, nftId: string): Promise<string> {
    try {
      // For ethers v5
      // const provider = new ethers.providers.Web3Provider(this.provider as any);
      const provider = new ethers.BrowserProvider(this.provider as any);
      // For ethers v5
      // const signer = provider.getSigner();
      const signer = await provider.getSigner();

      // const originalMessage = `Approve milestone ${milestone} of deal ${nftId}`;
      const originalMessage = `Approving milestone`;
      const signedMessage = await signer.signMessage(originalMessage);
      return signedMessage;
    } catch (error) {
      return error as string;
    }
  }

  async sendData(to: string, data: string): Promise<string> {
    try {
      const web3 = new Web3(this.provider as IProvider);
      const accounts = await web3.eth.getAccounts();

      // Get current gas price
      const gasPrice = await web3.eth.getGasPrice();

      // Estimate gas
      const gas = await web3.eth.estimateGas({
        from: accounts[0],
        to: to,
        data
      });

      console.log('Transaction details:', {
        from: accounts[0],
        to,
        data,
        gas,
        gasPrice
      });

      const txRes = await web3.eth.sendTransaction({
        from: accounts[0],
        to: to,
        data,
        gas,
        gasPrice
      });

      return txRes.transactionHash.toString();
    } catch (error) {
      console.error('Error sending data:', error);
      throw error;
    }
  }

  async sendEth(to: string, amount: string): Promise<string> {
    try {
      const web3 = new Web3(this.provider as IProvider);
      const accounts = await web3.eth.getAccounts();

      // Validate address
      if (!web3.utils.isAddress(to)) {
        throw new Error('Invalid recipient address');
      }

      // Validate amount
      if (isNaN(Number(amount)) || Number(amount) <= 0) {
        throw new Error('Invalid amount');
      }

      const weiAmount = web3.utils.toWei(amount, "ether");

      // Get current gas price
      const gasPrice = await web3.eth.getGasPrice();

      // Estimate gas
      const gas = await web3.eth.estimateGas({
        from: accounts[0],
        to: to,
        value: weiAmount
      });

      console.log('Transaction details:', {
        from: accounts[0],
        to,
        value: weiAmount,
        gas,
        gasPrice
      });

      const txRes = await web3.eth.sendTransaction({
        from: accounts[0],
        to: to,
        value: weiAmount,
        gas,
        gasPrice
      });

      return txRes.transactionHash.toString();
    } catch (error) {
      console.error('Error sending ETH:', error);
      throw error;
    }
  }

  async signAndSendTransaction(): Promise<string> {
    try {
      const web3 = new Web3(this.provider as IProvider);
      const accounts = await web3.eth.getAccounts();

      const txRes = await web3.eth.sendTransaction({
        from: accounts[0],
        to: accounts[0],
        value: web3.utils.toWei("0.01", "ether"),
      });
      return txRes.transactionHash.toString();
    } catch (error) {
      return error as string;
    }
  }
}
