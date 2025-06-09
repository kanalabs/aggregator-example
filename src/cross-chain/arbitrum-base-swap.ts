import { SwapAggregator, Environment, NetworkId } from "@kanalabs/aggregator"
import "dotenv/config"
import { ethers } from "ethers"

// Setup EVM Signer (Arbitrum)
const arbitrumprivateKey = process.env.EVM_PRIVATE_KEY as string
const arbitrumRpc = process.env.ETH_NODE_URI_ARBITRUM as string

const arbitrumProvider = ethers.getDefaultProvider(arbitrumRpc)
const arbitrumSigner = new ethers.Wallet(arbitrumprivateKey, arbitrumProvider)

// Setup EVM Signer (Base)
const baseprivateKey = process.env.EVM_PRIVATE_KEY as string
const baseRpc = process.env.ETH_NODE_URI_BASE as string

const baseProvider = ethers.getDefaultProvider(baseRpc)
const baseSigner = new ethers.Wallet(baseprivateKey, baseProvider)

// Setup Kana swap aggregator
const crossChainAggregator = new SwapAggregator(Environment.production, {
  providers: {
    //@ts-ignore
    arbitrum: arbitrumProvider,
    base: baseProvider,
  },
  signers: {
    //@ts-ignore
    arbitrum: arbitrumSigner,
    base: baseSigner,
  },
})

export const kanaswap = async () => {
  // Step 1: Get cross-chain quotes
  const crossChainQuotes = await crossChainAggregator.crossChainQuote({
    apiKey: "your-api-key",
    sourceToken: "0xeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee", //ETH
    targetToken: "0xeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee", //ETH
    sourceChain: NetworkId.Arbitrum,
    targetChain: NetworkId.base,
    amountIn: "100000000000000", //0.0001 ETH
    sourceSlippage: 2, // 2% slippage
    targetSlippage: 2, // 2% slippage
  })
  console.log("Quotes:", crossChainQuotes)

  // Step 2: Execute transfer (source chain transaction)
  const transfer = await crossChainAggregator.executeTransfer({
    apiKey: "your-api-key",
    sourceProvider: arbitrumProvider,
    sourceAddress: (await arbitrumSigner.getAddress()) as string,
    sourceSigner: arbitrumSigner,
    quote: crossChainQuotes.data[0],
    targetAddress: (await baseSigner.getAddress()) as string,
  })
  console.log("Transfer executed successfully!")
  console.log("Transaction hash:", transfer)

  // Step 3: Execute claim (target chain transaction)
  const claim = await crossChainAggregator.executeClaim({
    apiKey: "your-api-key",
    txHash: transfer.txHash,
    sourceProvider: arbitrumProvider,
    targetProvider: baseProvider,
    targetSigner: baseSigner,
    quote: crossChainQuotes.data[0],
    sourceAddress: (await arbitrumSigner.getAddress()) as string,
    targetAddress: (await baseSigner.getAddress()) as string,
  })
  console.log("Tokens claimed successfully!")
  console.log("Transaction hash:", claim)
}

kanaswap()
