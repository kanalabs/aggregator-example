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
      "0xbae207659db88bea0cbead6da0ed00aac12edcdda169e591cd41c94180b46f3b",
    amountIn: "100000",
    slippage: 0.5,
    network: NetworkId.aptos,
  })
  console.log("Quotes:", quotes)

  // Step 2: Execute swap with best quote
  const executeSwap = await swap.executeSwapInstruction({
    apiKey: "your-api-key",
    quote: quotes.data[0], // Use first (best) quote
    address: aptosSigner.accountAddress.toString(),
    recipient: "YOUR_RECIPIENT_WALLET_ADDRESS", // Send to same wallet
  })

  console.log("Transaction hash:", executeSwap)
}

kanaswap()
