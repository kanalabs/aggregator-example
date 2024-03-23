import { AptosAccount, AptosClient, Types } from "aptos";
import { SwapAggregator, Environment, NetworkId } from "@kanalabs/aggregator";
import "dotenv/config";

const aptosSigner = AptosAccount.fromAptosAccountObject({
  address: process.env.APTOS_ADDRESS || "",
  publicKeyHex: process.env.APTOS_PUBLICKEY || "",
  privateKeyHex: process.env.APTOS_PRIVATEKEY || "",
});

export const KANA_ROUTER =
  "0x9538c839fe490ccfaf32ad9f7491b5e84e610ff6edc110ff883f06ebde82463d";

const aptosProvider = new AptosClient("https://api.mainnet.aptoslabs.com/v1");

const swap = new SwapAggregator(Environment.production, {
  providers: {
    //@ts-ignore
    aptos: aptosProvider,
  },
  signers: {
    //@ts-ignore
    aptos: aptosSigner,
  },
});


/**
 * 10 bps is 0.1%
 * (100 * 10) / 10000 = 1 (let 100 be the amount received , so you will 0.1 as fee)
 */
export const setIntegratorFee = async () => {
  const payload = {
    function: `${KANA_ROUTER}::KanalabsRouterV2::set_referral_swap_fee`,
    arguments: [10] // fee bps,
  } as Types.EntryFunctionPayload;

  const transcaction = await aptosProvider.generateTransaction(
    aptosSigner.address(),
    payload as Types.EntryFunctionPayload
  );
  const sign = await aptosProvider.signTransaction(aptosSigner, transcaction);
  const submit = await aptosProvider.submitTransaction(sign);
  console.log(submit)
};

setIntegratorFee();
