import { SwapAggregator, Environment, NetworkId } from "@kanalabs/aggregator"
import "dotenv/config"
import bs58 from "bs58"
import { Connection, Keypair, clusterApiUrl } from "@solana/web3.js"

// Setup Signer
const solanaSigner = Keypair.fromSecretKey(
  bs58.decode(process.env.SOLANA_PRIVATEKEY || ""),
)
const solanaProvider = new Connection(
  clusterApiUrl("mainnet-beta"),
  "confirmed",
)

// Setup Kana swap aggregator
const swap = new SwapAggregator(Environment.production, {
  providers: {
    //@ts-ignore
    solana: solanaProvider,
  },
  signers: {
    //@ts-ignore
    solana: solanaSigner,
  },
})

export const kanaswap = async () => {
  // Step 1: Get quotes
  const quotes = await swap.swapQuotes({
    apiKey: "your-api-key",
    inputToken: "So11111111111111111111111111111111111111112",
    outputToken: "EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v",
    amountIn: "100000",
    slippage: 0.5,
    network: NetworkId.solana,
  })
  console.log("Quotes:", quotes)

  // Step 2: Execute swap with best quote
  const executeSwap = await swap.executeSwapInstruction({
    apiKey: "your-api-key",
    quote: quotes.data[0], // Use first (best) quote
    address: solanaSigner.publicKey.toBase58(),
    recipient: "YOUR_RECIPIENT_WALLET_ADDRESS",
  })

  console.log("Transaction hash:", executeSwap)
}

kanaswap()
