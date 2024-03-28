import { AptosAccount, AptosClient, Types } from "aptos";
import { SwapAggregator, Environment, NetworkId } from "@kanalabs/aggregator";
import "dotenv/config";

const aptosSigner = AptosAccount.fromAptosAccountObject({
  address: process.env.APTOS_ADDRESS || "",
  publicKeyHex: process.env.APTOS_PUBLICKEY || "",
  privateKeyHex: process.env.APTOS_PRIVATEKEY || "",
});

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
    quote: optimalQuote,
    address: aptosSigner.address().toString(),
  });

  console.log("hash", executeSwap);
};

kanaswap()
