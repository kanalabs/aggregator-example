import { SwapAggregator, Environment, NetworkId } from "@kanalabs/aggregator"
import "dotenv/config"
import { ethers, utils } from "ethers"

// Setup Signer
const privateKey = process.env.EVM_PRIVATE_KEY as string
const polygonRpc = process.env.ETH_NODE_URI_POLYGON as string
const polygonProvider = ethers.getDefaultProvider(polygonRpc)
const polygonSigner = new ethers.Wallet(privateKey, polygonProvider)

// Setup Kana swap aggregator
const swap = new SwapAggregator(Environment.production, {
  providers: {
    //@ts-ignore
    polygon: polygonProvider,
  },
  signers: {
    //@ts-ignore
    polygon: polygonSigner,
  },
})

export const kanaswap = async () => {
  // Step 1: Get quotes
  const quotes = await swap.swapQuotes({
    apiKey: "your-api-key",
    inputToken: "0xeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee",
    outputToken: "0x3c499c542cef5e3811e1192ce70d8cc03d5c3359",
    amountIn: utils.parseEther("0.01").toString(),
    slippage: 0.5,
    network: NetworkId.polygon,
  })
  console.log("Quotes:", quotes)

  // Step 2: Execute swap with best quote
  const executeSwap = await swap.executeSwapInstruction({
    apiKey: "your-api-key",
    quote: quotes.data[0], // Use first (best) quote
    address: await polygonSigner.getAddress(),
    recipient: "YOUR_RECIPIENT_WALLET_ADDRESS",
  })

  console.log("Transaction hash:", executeSwap)
}

kanaswap()
