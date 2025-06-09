import {
  Environment,
  getSameChainInstruction,
  getSameChainQuote,
  NetworkId,
} from "@kanalabs/aggregator"
import "dotenv/config"

const WALLET_ADDRESS = "YOUR_WALLET_ADDRESS"

export const kanaswap = async () => {
  // Step 1: Get quotes
  const quotes = await getSameChainQuote(
    {
      apiKey: "your-api-key",
      inputToken: "0x1::aptos_coin::AptosCoin",
      outputToken:
        "0x6f986d146e4a90b828d8c12c14b6f4e003fdff11a8eecceceb63744363eaac01::mod_coin::MOD",
      amountIn: "100000",
      slippage: 0.5,
      network: NetworkId.aptos,
    },
    Environment.production,
  )

  // Step 2: Get swap instruction
  const payload = await getSameChainInstruction(
    {
      apiKey: "your-api-key",
      quote: quotes.data[0],
      address: WALLET_ADDRESS,
    },
    Environment.production,
  )

  console.log("swap Instruction", payload)
}

kanaswap()
