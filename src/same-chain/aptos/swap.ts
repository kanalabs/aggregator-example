import { SwapAggregator, Environment, NetworkId } from "@kanalabs/aggregator";
import "dotenv/config";
import { Account, AccountAddress, Aptos, AptosConfig, Ed25519PrivateKey, Network } from "@aptos-labs/ts-sdk";

const aptosSigner = Account.fromPrivateKey({
  privateKey: new Ed25519PrivateKey(process.env.APTOS_PRIVATEKEY || ''),
  address:  AccountAddress.from(process.env.APTOS_ADDRESS || ''),
  legacy: true,
});

const aptosConfig = new AptosConfig({ network: Network.MAINNET });
const aptosProvider = new Aptos(aptosConfig)

const swap = new SwapAggregator(Environment.production, {
  providers: {
    //@ts-ignore
    aptos: aptosProvider,
  },
  signers: {
    //@ts-ignore
    aptos: aptosSigner,
  },
},
);

export const kanaswap = async () => {
  const quote = await swap.swapQuotes({
    apiKey : 'api-key',
    inputToken: "0x1::aptos_coin::AptosCoin",
    outputToken:
      "0x6f986d146e4a90b828d8c12c14b6f4e003fdff11a8eecceceb63744363eaac01::mod_coin::MOD",
    amountIn: "1000",
    slippage: 0.5,
    network: NetworkId.aptos,
  });
  console.log("🚀 ~ kanaswap ~ quote:", quote)

  const optimalQuote = quote.data[0];

  const executeSwap = await swap.executeSwapInstruction({
    apiKey : 'api-key',
    quote: optimalQuote,
    address: aptosSigner.accountAddress.toString(),
  });

  console.log("hash", executeSwap);
};

kanaswap()
