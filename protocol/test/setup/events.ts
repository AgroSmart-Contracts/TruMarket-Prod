import { ethers } from 'ethers';

export function decodeDealManagerEvents(
  receipt: ethers.ContractTransactionReceipt,
  abi: string
): Array<{
  eventName: string;
  args: Record<string, any>;
} | null> {
  const iface = new ethers.Interface(abi);
  return receipt.logs.map((log) => {
    try {
      const parsed = iface.parseLog({
        topics: [...log.topics],
        data: log.data,
      });
      if (!parsed) return null;
      return {
        eventName: parsed.name,
        args: Object.fromEntries(
          parsed.fragment.inputs.map((input, index) => [
            input.name,
            parsed.args[index],
          ])
        ),
      };
    } catch (e) {
      return null;
    }
  });
}
