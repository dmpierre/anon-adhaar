export const bufferEquals = (x: Buffer, y: Buffer) => {
     let i = x.length;
     while (i--) {
          if (x[ i ] !== y[ i ]) {
               return false;
          }
     }
     return true;
};

export const splitToWords = (x: bigint, w: bigint, n: bigint, name: string) => {
     let t = x;
     const words: { [ key: string ]: string; } = {};
     for (let i = BigInt(0); i < n; ++i) {
          const baseTwo: bigint = BigInt("2");
          const key = `${name}[${i.toString()}]`;
          words[ key ] = `${t % (baseTwo ** w)}`;
          t = BigInt(t / (BigInt(2) ** w));
     }
     if (!(t == BigInt(0))) {
          throw `Number ${x} does not fit in ${(w * n).toString()} bits`;
     }
     return words;
};

export const validateProofJSON = (proofFile: any) => {
     const expectedKeys = [ 'proof', 'publicSignals' ];
     if (Object.keys(proofFile).length != 2)
          throw Error('Proof file has too many keys');
     Object.keys(proofFile).map((k, i) => {
          if (expectedKeys[ i ] !== k)
               throw Error('Proof file does not have required keys');
     });
     return true;
};