// global.d.ts
interface Window {
  ethereum?: {
    isMetaMask?: boolean;
    request: (args: { method: string; params?: Array<any> }) => Promise<any>;
    on: (event: string, callback: (args: any) => void) => void;
    // Add other MetaMask specific properties and methods as needed
  };
}
