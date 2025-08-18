import { SwapAggregator, Environment, NetworkId, BridgeId } from "@kanalabs/aggregator"
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

// Setup EVM Signer (Polygon)
const evmprivateKey = process.env.EVM_PRIVATE_KEY as string
const polygonRpc = process.env.ETH_NODE_URI_POLYGON as string

const evmProvider = ethers.getDefaultProvider(polygonRpc)
const evmSigner = new ethers.Wallet(evmprivateKey, evmProvider)

// Setup Aptos provider
const aptosConfig = new AptosConfig({ network: Network.MAINNET })
const aptosProvider = new Aptos(aptosConfig)

// Setup Kana swap aggregator
const crossChainAggregator = new SwapAggregator(Environment.production, {
  providers: {
    //@ts-ignore
    aptos: aptosProvider,
    polygon: evmProvider,
  },
  signers: {
    //@ts-ignore
    aptos: aptosSigner,
    polygon: evmSigner,
  },
})

export const kanaswap = async (hash: string) => {
  // Step 1: Execute Redeem (Redeem on Target chain)
  const claim = await crossChainAggregator.redeem({
    apiKey: "your-api-key",
    sourceChain: NetworkId.polygon,
    targetChain: NetworkId.aptos,
    sourceProvider: evmProvider,
    targetProvider: aptosProvider,
    SourceHash: hash,
    targetAddress: aptosSigner.accountAddress.toString(),
    targetSigner: aptosSigner,
    BridgeId: BridgeId.cctp
  })
  console.log("Tokens redeemed successfully!")
  console.log("Transaction hash:", claim)
}

kanaswap("SOURCE BRIDGE HASH")
