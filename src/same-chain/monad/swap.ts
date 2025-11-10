import { SwapAggregator, Environment, NetworkId } from "@kanalabs/aggregator"
import "dotenv/config"

import { ethers } from "ethers"

// Setup Signer
const privateKey = process.env.EVM_PRIVATE_KEY as string
const monadRpc = process.env.MONAD_NODE_URI as string
const monadProvider = ethers.getDefaultProvider(monadRpc)
const monadSigner = new ethers.Wallet(privateKey, monadProvider)

// Setup Kana swap aggregator
const swap = new SwapAggregator(Environment.local, {
  providers: {
    //@ts-ignore
    monad: monadProvider,
  },
  signers: {
    //@ts-ignore
    monad: monadSigner,
  },
})

export const kanaswap = async () => {
  try {
    console.log(" Testing Monad swap...")

    // Check network connection
    const network = await monadProvider.getNetwork()
    console.log(`Connected to Monad network: Chain ID ${network.chainId}`)

    // Check balance
    const balance = await monadProvider.getBalance(
      await monadSigner.getAddress()
    )
    console.log(`Wallet balance: ${ethers.utils.formatEther(balance)} MON`)

    // Step 1: Get quotes
    console.log("\n Fetching swap quotes...")
    const quotes = await swap.swapQuotes({
      apiKey: process.env.KANA_API_KEY as string,
      inputToken: "0xeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee",
      outputToken: "0x760AfE86e5de5fa0Ee542fc7B7B713e1c5425701",
      amountIn: ethers.utils.parseEther("0.010").toString(),
      slippage: 5,
      network: NetworkId.monad,
    })
    console.log("✅ Quotes received:", quotes)

    // Step 2: Execute swap with best quote
    console.log("\n💱 Executing swap...")
    const executeSwap = await swap.executeSwapInstruction({
      apiKey: process.env.KANA_API_KEY as string,
      quote: quotes.data[0],
      address: await monadSigner.getAddress(),
    })

    console.log("✅ Transaction hash:", executeSwap)
  } catch (error) {
    if (error instanceof Error) {
      console.error("❌ Error:", error.message)
    } else {
      console.error("❌ Unknown error:", error)
    }
  }
}

kanaswap()
