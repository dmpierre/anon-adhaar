//@ts-ignore
import { wasm } from "circom_tester";
import path from "path";
//@ts-ignore
import bigInt from "big-integer";

//@ts-ignore
import compiler from "circom";
//@ts-ignore
import * as snarkjs from "snarkjs";
const { splitToWords, assertWitnessHas } = require("./util.js");
import fs from "fs";

(BigInt.prototype as any).toJSON = function () {
  return this.toString();
};  

describe("Witness calculation", () => {
  //@ts-ignore
  let rsa_pkvs1v15_circuit;

  before(async () => {
    const cirDef = await compiler(
      path.join(__dirname, "circuits", "rsa_sha1_verify.circom")
    );
    rsa_pkvs1v15_circuit = new snarkjs.Circuit(cirDef);
  });

  it("Should calculate witness properly", () => {
    const exp = bigInt(65537);
    const modulus = bigInt(
      "modulusInDecimal"
    );
    const sign = bigInt(
      "signatureInDecimal"
    );
    const hashed = bigInt("hashInDecimal");

    const input = Object.assign(
      {},
      splitToWords(sign, 32, 64, "sign"),
      splitToWords(exp, 32, 64, "exp"),
      splitToWords(modulus, 32, 64, "modulus"),
      splitToWords(hashed, 32, 5, "hashed")
    );

    //@ts-ignore
    const witness = rsa_pkvs1v15_circuit.calculateWitness(input);
  });
});
