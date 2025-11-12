import { SwapAggregator, Environment, NetworkId } from "@kanalabs/aggregator"
import "dotenv/config"
import { ethers } from "ethers"

// Setup Signer
const privateKey = process.env.EVM_PRIVATE_KEY as string
const monadRpc = process.env.MONAD_NODE_URI as string
const monadProvider = ethers.getDefaultProvider(monadRpc)
const monadSigner = new ethers.Wallet(privateKey, monadProvider)

// Setup Kana swap aggregator
const swap = new SwapAggregator(Environment.development, {
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
    console.log("🧪 Testing Monad swap with recipient...")
    console.log("API Key:", process.env.KANA_API_KEY)

    // Check network connection
    const network = await monadProvider.getNetwork()
    console.log(`Connected to Monad network: Chain ID ${network.chainId}`)

    // Check balance
    const balance = await monadProvider.getBalance(
      await monadSigner.getAddress()
    )
    console.log(`Wallet balance: ${ethers.utils.formatEther(balance)} MON`)

    // Step 1: Get quotes
    console.log("\n📊 Fetching swap quotes...")
    const quoteParams = {
      apiKey: process.env.KANA_API_KEY as string,
      inputToken: "0x0000000000000000000000000000000000000000",
      outputToken: "0x760AfE86e5de5fa0Ee542fc7B7B713e1c5425701",
      amountIn: ethers.utils.parseEther("0.01").toString(),
      slippage: 5,
      network: NetworkId.monad, // Monad network ID
    }
    console.log("Quote params:", JSON.stringify(quoteParams, null, 2))

    const quotes = await swap.swapQuotes(quoteParams)
    console.log("✅ Quotes received:", JSON.stringify(quotes, null, 2))

    if (!quotes.data || quotes.data.length === 0) {
      console.log("\n⚠️  No liquidity pools found for Monad network")
      console.log(
        "✅ API connection successful - waiting for liquidity configuration"
      )
      return
    }

    // Step 2: Execute swap with best quote
    console.log("\n🔄 Executing swap...")
    const executeSwap = await swap.executeSwapInstruction({
      apiKey: process.env.KANA_API_KEY as string,
      quote: quotes.data[0],
      address: "0x143B240C98865243fb02AD334983443CB92bb9f2",
    })

    console.log("✅ Transaction hash:", executeSwap)
  } catch (error) {
    const errorMsg = (error as Error).message
    console.error("\n❌ Error:", errorMsg)
    console.error("Full error:", error)
  }
}

kanaswap()
