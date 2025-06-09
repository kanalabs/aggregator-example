import { SwapAggregator, Environment, NetworkId } from "@kanalabs/aggregator"
import "dotenv/config"
import {
  Account,
  AccountAddress,
  Aptos,
  AptosConfig,
  Ed25519PrivateKey,
  Network,
} from "@aptos-labs/ts-sdk"

// Setup Signer
const aptosSigner = Account.fromPrivateKey({
  privateKey: new Ed25519PrivateKey(process.env.APTOS_PRIVATEKEY || ""),
  address: AccountAddress.from(process.env.APTOS_ADDRESS || ""),
  legacy: true,
})

// Setup Aptos provider
const aptosConfig = new AptosConfig({ network: Network.MAINNET })
const aptosProvider = new Aptos(aptosConfig)

// Setup Kana swap aggregator
const swap = new SwapAggregator(Environment.production, {
  providers: {
    //@ts-ignore
    aptos: aptosProvider,
  },
  signers: {
    //@ts-ignore
    aptos: aptosSigner,
  },
})

export const kanaswap = async () => {
  // Step 1: Get quotes
  const quotes = await swap.swapQuotes({
    apiKey: "your-api-key",
    inputToken: "0x1::aptos_coin::AptosCoin",
    outputToken:
      "0x6f986d146e4a90b828d8c12c14b6f4e003fdff11a8eecceceb63744363eaac01::mod_coin::MOD",
    amountIn: "100000",
    slippage: 0.8,
    network: NetworkId.aptos,
    options: {
      integratorAddress:
        "0x9538c839fe490ccfaf32ad9f7491b5e84e610ff6edc110ff883f06ebde82463d",
      integratorFeePercentage: 0.1,
    },
  })

  console.log("Quotes:", quotes)

  // Step 2: Execute swap with best quote
  const executeSwap = await swap.executeSwapInstruction({
    apiKey: "your-api-key",
    quote: quotes.data[0], // Use first (best) quote
    address: aptosSigner.accountAddress.toString(),
  })

  console.log("Transaction hash:", executeSwap)
}

kanaswap()
