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
import { clusterApiUrl, Connection, Keypair } from "@solana/web3.js"
import bs58 from "bs58"

// Setup Aptos Signer
const aptosSigner = Account.fromPrivateKey({
  privateKey: new Ed25519PrivateKey(process.env.APTOS_PRIVATEKEY || ""),
  address: AccountAddress.from(process.env.APTOS_ADDRESS || ""),
  legacy: true,
})

// Setup Solana Signer
const solanaSigner = Keypair.fromSecretKey(
  bs58.decode(process.env.SOLANA_PRIVATEKEY || ""),
)
const solanaProvider = new Connection(
  clusterApiUrl("mainnet-beta"),
  "confirmed",
)
// Setup Aptos provider
const aptosConfig = new AptosConfig({ network: Network.MAINNET })
const aptosProvider = new Aptos(aptosConfig)

// Setup Kana swap aggregator
const crossChainAggregator = new SwapAggregator(Environment.production, {
  providers: {
    //@ts-ignore
    aptos: aptosProvider,
    solana: solanaProvider,
  },
  signers: {
    //@ts-ignore
    aptos: aptosSigner,
    solana: solanaSigner,
  },
})

export const kanaswap = async () => {
  // Step 1: Get cross-chain quotes
  const crossChainQuotes = await crossChainAggregator.crossChainQuote({
    apiKey: "your-api-key",
    sourceToken: "0x1::aptos_coin::AptosCoin", //APT
    targetToken: "So11111111111111111111111111111111111111112", //SOL
    sourceChain: NetworkId.aptos,
    targetChain: NetworkId.solana,
    amountIn: "10000000", //0.01 APT
    sourceSlippage: 2, // 2% slippage
    targetSlippage: 2, // 2% slippage
  })
  console.log("Quotes:", crossChainQuotes)

  // Step 2: Execute transfer (source chain transaction)
  const transfer = await crossChainAggregator.executeTransfer({
    apiKey: "your-api-key",
    sourceProvider: aptosProvider,
    sourceAddress: aptosSigner.accountAddress.toString(),
    sourceSigner: aptosSigner,
    quote: crossChainQuotes.data[0],
    targetAddress: solanaSigner.publicKey.toBase58(),
  })
  console.log("Transfer executed successfully!")
  console.log("Transaction hash:", transfer)

  // Step 3: Execute claim (target chain transaction)
  const claim = await crossChainAggregator.executeClaim({
    apiKey: "your-api-key",
    txHash: transfer.txHash,
    sourceProvider: aptosProvider,
    targetProvider: solanaProvider,
    targetSigner: solanaSigner,
    quote: crossChainQuotes.data[0],
    sourceAddress: aptosSigner.accountAddress.toString(),
    targetAddress: solanaSigner.publicKey.toBase58(),
  })
  console.log("Tokens claimed successfully!")
  console.log("Transaction hash:", claim)
}

kanaswap()
