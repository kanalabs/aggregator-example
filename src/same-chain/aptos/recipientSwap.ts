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
      "0xbae207659db88bea0cbead6da0ed00aac12edcdda169e591cd41c94180b46f3b",
    amountIn: "100000",
    slippage: 0.5,
    network: NetworkId.aptos,
  });
  console.log("🚀 ~ kanaswap ~ quote:", quote)

  const optimalQuote = quote.data[0];

  const executeSwap = await swap.executeSwapInstruction({
    apiKey : 'api-key',
    quote: optimalQuote,
    address: aptosSigner.accountAddress.toString(),
    recipient: "YOUR_RECIPIENT_WALLET_ADDRESS"
  });

  console.log("hash", executeSwap);
};

kanaswap()
