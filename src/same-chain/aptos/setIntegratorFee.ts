import { Account, AccountAddress, Aptos, AptosConfig, Ed25519PrivateKey, Network } from "@aptos-labs/ts-sdk";
import "dotenv/config";

const aptosSigner = Account.fromPrivateKey({
  privateKey: new Ed25519PrivateKey(process.env.APTOS_PRIVATEKEY || ''),
  address:  AccountAddress.from(process.env.APTOS_ADDRESS || ''),
  legacy: true,
});

const aptosConfig = new AptosConfig({ network: Network.MAINNET });
const aptos = new Aptos(aptosConfig)

export const KANA_ROUTER =
  "0x9538c839fe490ccfaf32ad9f7491b5e84e610ff6edc110ff883f06ebde82463d";

/**
 * 10 bps is 0.1%
 * (100 * 10) / 10000 = 1 (let 100 be the amount received , so you will 0.1 as fee)
 */
export const setIntegratorFee = async () => {
  const payload = await aptos.transaction.build.simple({
    sender: aptosSigner.accountAddress.toString(),
    data: {
      function: `${KANA_ROUTER}::KanalabsRouterV2::set_referral_swap_fee`,
      functionArguments: [10],
      typeArguments: [],
    },
  });
  const sign = await aptos.signAndSubmitTransaction({ signer: aptosSigner, transaction: payload });
  const submit = await aptos.waitForTransaction({ transactionHash: sign.hash });
  console.log(submit)
};

setIntegratorFee();
