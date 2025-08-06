"use client";

import { useEffect } from "react";
import { appKit } from "@/ctx/wagmi";
import { useTheme } from "next-themes";
import { type ThemeMode } from "@reown/appkit";
import { Icon } from "@/lib/icons";
// import { useAppKitAccount } from "@reown/appkit/react";
// import { useSend } from "@/lib/hooks/x-use-send";

// const TO = "0x611F3143b76a994214d751d762b52D081d8DC4de";
export const WalletConnector = () => {
  const { theme } = useTheme();
  // const { allAccounts } = useAppKitAccount();
  // const { sendFrom, isPending, isSuccess } = useSend();

  // const sendFn = useCallback(() => {
  //   sendFrom({ to: TO, value: 5 });
  // }, [sendFrom]);

  // const getFn = useCallback(async () => {
  //   const u = allAccounts?.map((a) => ({ ...a }));

  //   console.log(u);
  // }, [allAccounts]);

  // const { refetch } = useBalance({
  //   address,
  // });

  useEffect(() => {
    appKit.setThemeMode((theme as ThemeMode) ?? "dark");
  }, [theme]);

  // const getBal = useCallback(async () => {
  //   const balance = await refetch();
  //   const v = balance.data?.value;
  //   const d = balance.data?.decimals;
  //   console.log("BAL", v && parseUnits(String(v), Number(d)));
  // }, [refetch]);

  // const { shorten } = useZip({});
  // const zipd = useMemo(
  //   () => shorten("489b147d-b702-4625-961b-86f78f0d62ae"),
  //   [shorten],
  // );

  // useEffect(() => {
  //   if (zipd) console.log("USE-ZIP", zipd);
  //   if (!isPending && isSuccess) console.log("Payment Sent");
  // }, [isPending, isSuccess, zipd]);

  return (
    <div className="flex space-x-6">
      {/*<IconButton
        icon={isPending ? "spinners-bars" : "arrow-right"}
        onClick={sendFn}
      />*/}
      {/*<IconButton icon="ai-coder" onClick={getFn} />*/}
      {/*<IconButton icon="ai-mind" onClick={getBal} />*/}
      <div className="relative flex items-center justify-center">
        <div className="relative z-10 rounded-full opacity-0 overflow-hidden border border-zinc-600 bg-black -p-8 h-9 w-11 flex items-center">
          <appkit-button
            label="Connect"
            loadingLabel="Connecting..."
            balance="hide"
          />
        </div>
        <Icon
          name="g-claws"
          className="size-5 text-zinc-300 aspect-auto pointer-events-none absolute z-20 flex md:hidden"
        />
        <Icon
          name="g-claws"
          className="size-3 text-lime-200 blur-[2px] animate-spin aspect-auto pointer-events-none absolute z-20 flex md:hidden"
        />
      </div>
    </div>
  );
};
