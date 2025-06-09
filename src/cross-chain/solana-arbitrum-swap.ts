import { SwapAggregator, Environment, NetworkId } from "@kanalabs/aggregator"
import "dotenv/config"
import { clusterApiUrl, Connection, Keypair } from "@solana/web3.js"
import bs58 from "bs58"
import { ethers } from "ethers"

// Setup EVM Signer (Arbitrum)
const evmprivateKey = process.env.EVM_PRIVATE_KEY as string
const arbitrumRpc = process.env.ETH_NODE_URI_ARBITRUM as string

const evmProvider = ethers.getDefaultProvider(arbitrumRpc)
const evmSigner = new ethers.Wallet(evmprivateKey, evmProvider)

// Setup Solana Signer
const solanaSigner = Keypair.fromSecretKey(
  bs58.decode(process.env.SOLANA_PRIVATEKEY || ""),
)
const solanaProvider = new Connection(
  clusterApiUrl("mainnet-beta"),
  "confirmed",
)
// Setup Kana swap aggregator
const crossChainAggregator = new SwapAggregator(Environment.production, {
  providers: {
    //@ts-ignore
    arbitrum: evmProvider,
    solana: solanaProvider,
  },
  signers: {
    //@ts-ignore
    arbitrum: evmSigner,
    solana: solanaSigner,
  },
})

export const kanaswap = async () => {
  // Step 1: Get cross-chain quotes
  const crossChainQuotes = await crossChainAggregator.crossChainQuote({
    apiKey: "your-api-key",
    sourceToken: "So11111111111111111111111111111111111111112", //SOL
    targetToken: "0xeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee", //ETH
    sourceChain: NetworkId.solana,
    targetChain: NetworkId.Arbitrum,
    amountIn: "10000000", //0.01 SOL
    sourceSlippage: 2, // 2% slippage
    targetSlippage: 2, // 2% slippage
  })
  console.log("Quotes:", crossChainQuotes)

  // Step 2: Execute transfer (source chain transaction)
  const transfer = await crossChainAggregator.executeTransfer({
    apiKey: "your-api-key",
    sourceProvider: solanaProvider,
    sourceAddress: solanaSigner.publicKey.toBase58(),
    sourceSigner: solanaSigner,
    quote: crossChainQuotes.data[0],
    targetAddress: (await evmSigner.getAddress()) as string,
  })
  console.log("Transfer executed successfully!")
  console.log("Transaction hash:", transfer)

  // Step 3: Execute claim (target chain transaction)
  const claim = await crossChainAggregator.executeClaim({
    apiKey: "your-api-key",
    txHash: transfer.txHash,
    sourceProvider: solanaProvider,
    targetProvider: evmProvider,
    targetSigner: evmSigner,
    quote: crossChainQuotes.data[0],
    sourceAddress: solanaSigner.publicKey.toBase58(),
    targetAddress: (await evmSigner.getAddress()) as string,
  })
  console.log("Tokens claimed successfully!")
  console.log("Transaction hash:", claim)
}

kanaswap()
