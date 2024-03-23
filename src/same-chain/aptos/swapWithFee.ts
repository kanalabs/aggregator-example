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
});

export const kanaswap = async () => {
  const quote = await swap.swapQuotes({
    apiKey: "key", // currently not applicable you can pass any string
    inputToken: "0x1::aptos_coin::AptosCoin",
    outputToken:
      "0x6f986d146e4a90b828d8c12c14b6f4e003fdff11a8eecceceb63744363eaac01::mod_coin::MOD",
    amountIn: "1000",
    slippage: 0.8,
    network: NetworkId.aptos,
    options: {
      integratorAddress:
        "0x9538c839fe490ccfaf32ad9f7491b5e84e610ff6edc110ff883f06ebde82463d",
      integratorFeePercentage: 0.1,
    },
  });

  const optimalQuote = quote.data[0];
  console.log("🚀 ~ kanaswap ~ optimalQuote:", optimalQuote)

  const executeSwap = await swap.executeSwapInstruction({
    quote: optimalQuote,
    address: aptosSigner.address().toString(),
  });

  console.log("hash", executeSwap);
};

kanaswap();
