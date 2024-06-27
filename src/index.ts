import { kanaswap } from "./same-chain/aptos/swapWith_fee_coin_in";
import readline from "readline";

export { kanaswap };

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

const call = (fun: string, param?: any) => {
  if (fun === "swap") {
    return kanaswap();
  } else {
    throw new Error("invalid function");
  }
};

export default call;
