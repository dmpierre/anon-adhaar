const getSubstringIndex = (str: Buffer, substring: string, n: number) => {
     let times = 0;
     let index = 0;

     while (times < n && index !== -1) {
          index = str.indexOf(substring, index + 1);
          times += 1;
     };

     return index;
};

export const extractSignature = (pdf: Buffer, signatureCount = 1) => {

     const byteRangePos = getSubstringIndex(pdf, '/ByteRange [', signatureCount);

     const byteRangeEnd = pdf.indexOf(']', byteRangePos);
     const byteRange = pdf.subarray(byteRangePos, byteRangeEnd + 1).toString();
     const matches = (/\/ByteRange \[(\d+) +(\d+) +(\d+) +(\d+) *\]/).exec(byteRange);

     if (matches == null) {
          return {
               ByteRange: [ 0 ],
               signature: '',
               signedData: Buffer.from([])
          };
     } else {

          const ByteRange = matches.slice(1).map(Number);
          const signedData = Buffer.concat([
               pdf.subarray(ByteRange[ 0 ], ByteRange[ 0 ] + ByteRange[ 1 ]),
               pdf.subarray(ByteRange[ 2 ], ByteRange[ 2 ] + ByteRange[ 3 ]),
          ]);
          const signatureHex = pdf.subarray(ByteRange[ 0 ] + ByteRange[ 1 ] + 1, ByteRange[ 2 ]).toString('binary').replace(/(?:00|>)+$/, '');
          const signature = Buffer.from(signatureHex, 'hex').toString("binary");
          return {
               ByteRange: matches.slice(1, 5).map(Number),
               signature,
               signedData,
          };
     }
};