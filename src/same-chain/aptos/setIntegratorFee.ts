import {
  Account,
  AccountAddress,
  Aptos,
  AptosConfig,
  Ed25519PrivateKey,
  Network,
} from "@aptos-labs/ts-sdk"
import "dotenv/config"

// Setup signer from private key
const aptosSigner = Account.fromPrivateKey({
  privateKey: new Ed25519PrivateKey(process.env.APTOS_PRIVATEKEY || ""),
  address: AccountAddress.from(process.env.APTOS_ADDRESS || ""),
  legacy: true,
})

// Setup Aptos provider
const aptosConfig = new AptosConfig({ network: Network.MAINNET })
const aptos = new Aptos(aptosConfig)

// Kana Router contract address
export const KANA_ROUTER =
  "0x9538c839fe490ccfaf32ad9f7491b5e84e610ff6edc110ff883f06ebde82463d"

/**
 * Set integrator referral fee for Kana Labs router
 *
 * This function allows integrators to set their referral fee percentage
 * for swaps routed through Kana Labs. The fee is deducted from the output
 * amount and sent to the integrator's wallet.
 *
 * Fee calculation:
 * - 1 bps = 0.01%
 * - 10 bps = 0.1%
 * - 100 bps = 1%
 *
 * @param feeBps - Fee in basis points (10 bps = 0.1%)
 * @returns Transaction result object
 */
export const setIntegratorFee = async () => {
  // Build transaction
  const payload = await aptos.transaction.build.simple({
    sender: aptosSigner.accountAddress.toString(),
    data: {
      function: `${KANA_ROUTER}::KanalabsRouterV2::set_referral_swap_fee`,
      functionArguments: [10],
      typeArguments: [],
    },
  })

  // Sign and submit
  const sign = await aptos.signAndSubmitTransaction({
    signer: aptosSigner,
    transaction: payload,
  })

  // Wait for transaction
  const submit = await aptos.waitForTransaction({ transactionHash: sign.hash })
  console.log(submit)
}

setIntegratorFee()
