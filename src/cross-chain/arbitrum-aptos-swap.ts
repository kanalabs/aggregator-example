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
import { ethers } from "ethers"

// Setup Aptos Signer
const aptosSigner = Account.fromPrivateKey({
  privateKey: new Ed25519PrivateKey(process.env.APTOS_PRIVATEKEY || ""),
  address: AccountAddress.from(process.env.APTOS_ADDRESS || ""),
  legacy: true,
})

// Setup EVM Signer (Arbitrum)
const evmprivateKey = process.env.EVM_PRIVATE_KEY as string
const arbitrumRpc = process.env.ETH_NODE_URI_POLYGON as string

const evmProvider = ethers.getDefaultProvider(arbitrumRpc)
const evmSigner = new ethers.Wallet(evmprivateKey, evmProvider)

// Setup Aptos provider
const aptosConfig = new AptosConfig({ network: Network.MAINNET })
const aptosProvider = new Aptos(aptosConfig)

// Setup Kana swap aggregator
const crossChainAggregator = new SwapAggregator(Environment.production, {
  providers: {
    //@ts-ignore
    aptos: aptosProvider,
    arbitrum: evmProvider,
  },
  signers: {
    //@ts-ignore
    aptos: aptosSigner,
    arbitrum: evmSigner,
  },
})

export const kanaswap = async () => {
  // Step 1: Get cross-chain quotes
  const crossChainQuotes = await crossChainAggregator.crossChainQuote({
    apiKey: "your-api-key",
    sourceToken: "0xeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee", //ETH
    targetToken: "0x1::aptos_coin::AptosCoin", //APT
    sourceChain: NetworkId.Arbitrum,
    targetChain: NetworkId.aptos,
    amountIn: "100000000000000", //0.0001 ETH
    sourceSlippage: 2, // 2% slippage
    targetSlippage: 2, // 2% slippage
  })
  console.log("Quotes:", crossChainQuotes)

  // Step 2: Execute transfer (source chain transaction)
  const transfer = await crossChainAggregator.executeTransfer({
    apiKey: "your-api-key",
    sourceProvider: evmProvider,
    sourceAddress: (await evmSigner.getAddress()) as string,
    sourceSigner: evmSigner,
    quote: crossChainQuotes.data[0],
    targetAddress: aptosSigner.accountAddress.toString(),
  })
  console.log("Transfer executed successfully!")
  console.log("Transaction hash:", transfer)

  // Step 3: Execute claim (target chain transaction)
  const claim = await crossChainAggregator.executeClaim({
    apiKey: "your-api-key",
    txHash: transfer.txHash,
    sourceProvider: evmProvider,
    targetProvider: aptosProvider,
    targetSigner: aptosSigner,
    quote: crossChainQuotes.data[0],
    sourceAddress: (await evmSigner.getAddress()) as string,
    targetAddress: aptosSigner.accountAddress.toString(),
  })
  console.log("Tokens claimed successfully!")
  console.log("Transaction hash:", claim)
}

kanaswap()
