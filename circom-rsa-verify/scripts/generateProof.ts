//@ts-ignore
import * as snarkjs from "snarkjs";
import { readFileSync } from "fs";
import {
  unstringifyBigInts,
  //@ts-ignore
} from "snarkjs/src/stringifybigint.js";
import fs from "fs";
import bigInt from "big-integer";
const { splitToWords, assertWitnessHas } = require("../test/util.js");

const main = () => {
  const circuitName = process.argv[ 2 ];

  console.log("Loading circuit..");
  const circuitDef = JSON.parse(
    readFileSync(`./bin/rsa_sha1_verify.json`, "utf-8")
  );

  console.log("Instantiating circuit...");
  const circuit = new snarkjs.Circuit(circuitDef);

  const exp = bigInt(65537);
  const modulus = bigInt(
    "pubK"
  );
  const sign = bigInt(
    "sig"
  );
  const hashed = bigInt("hash");

  const input = Object.assign(
    {},
    splitToWords(sign, 32, 64, "sign"),
    splitToWords(exp, 32, 64, "exp"),
    splitToWords(modulus, 32, 64, "modulus"),
    splitToWords(hashed, 32, 5, "hashed")
  );

  console.log("Calculating witness..");
  const witness = circuit.calculateWitness(input);

  console.log("Loading zk proving key..");
  const vkProof = JSON.parse(
    fs.readFileSync(`zkeys/groth16_zkey_prove.json`, "utf8")
  );

  console.log("Loading zk verifying key");
  const vkVerifier = JSON.parse(
    fs.readFileSync(`zkeys/groth16_zkey_verify.json`, "utf8")
  );

  console.log("Generating proof..");
  const { proof, publicSignals } = snarkjs.groth.genProof(
    unstringifyBigInts(vkProof),
    unstringifyBigInts(witness)
  );
  if (
    snarkjs.groth.isValid(
      unstringifyBigInts(vkVerifier),
      unstringifyBigInts(proof),
      unstringifyBigInts(publicSignals)
    )
  ) {
    console.log("Valid!");
  } else {
    console.log("Invalid!");
  }
};

main();
