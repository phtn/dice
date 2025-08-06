import { useSendTransaction } from "wagmi";
import { type Address, type Chain, parseEther } from "viem";
import { useCallback } from "react";

interface SendFromParams {
  to: Address;
  value: number;
  chainId?: Chain;
}

export const useSend = () => {
  const { sendTransaction, isPending, isSuccess, data } = useSendTransaction();

  const sendFrom = useCallback(
    ({
      to = "0x611F3143b76a994214d751d762b52D081d8DC4de",
      value,
    }: SendFromParams) => {
      const ether = usd_2_ETH(value).toString();
      console.table([{ value }, { ether }]);
      sendTransaction({
        value: parseEther(ether), // 0.01 ETH
        to,
      });
    },
    [sendTransaction],
  );

  return {
    sendFrom,
    isPending,
    isSuccess,
    data,
  };
};

export const eth_2_USD = (eth: number) => {
  const c = 2766;
  return c * eth;
};

export const usd_2_ETH = (usd: number) => {
  const c = 2766;
  return usd / c;
};
