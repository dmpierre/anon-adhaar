//@ts-ignore
import * as snarkjs from 'snarkjs';

addEventListener(
     'message',
     async (event: MessageEvent<{ provingKey: any; wtns: any; }>) => {
          console.log("Worker started", event.data.wtns);
          const { proof, publicSignals } = snarkjs.groth.genProof(
               snarkjs.unstringifyBigInts(event.data.provingKey),
               snarkjs.unstringifyBigInts(event.data.wtns)
          );
          postMessage({
               proof,
               publicSignals,
          });
     }
);
