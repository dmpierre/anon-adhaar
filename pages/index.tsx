import { ChangeEvent, useEffect, useRef, useState } from "react";
import { extractSignature } from "@/utils/extractPdfSig";
import * as peculiarX509 from "@peculiar/x509";
import { bufferEquals, splitToWords, validateProofJSON } from "@/utils/utils";
import axios from "axios";
import { FileInput, InputDescription, InputFlex } from "@/components/Inputs";
//@ts-ignore
import snarkjs from "snarkjs";
import { Description, Title } from "@/components/Title";
import { Footer, HelpInfo } from "@/components/Footer";
import { Button } from "@/components/Buttons";
import { MainFlex } from "@/components/Main";
import CircularProgress from '@mui/material/CircularProgress';
import { ThemeProvider } from '@mui/material/styles';
import { AppState, AdhaarPdfValidation, AdhaarSignatureValidition, AdhaarCertificateValidation, AdhaarProofFile, AdhaarProofState } from "@/interfaces/interfaces";
import { theme } from "@/utils/theme";

/**
 * @dev for exporting json proof and public signals data
 */
(BigInt.prototype as any).toJSON = function () {
  return this.toString();
};

const downloadVerifier = async (url: string) => {
  const vkeyVerifier = await (await axios.get(url)).data;
  return vkeyVerifier;
};

const validity = (
  vkeyVerifier: any,
  proof: any,
  publicSignals: any
) => {
  return snarkjs.groth.isValid(
    snarkjs.unstringifyBigInts(vkeyVerifier),
    snarkjs.unstringifyBigInts(proof),
    snarkjs.unstringifyBigInts(publicSignals)
  );
};

export default function Home () {

  const [ signature, setsignature ] = useState<string>('');
  const [ signedPdfData, setsignedPdfData ] = useState(Buffer.from([]));
  const [ x509Certificate, setx509Certificate ] = useState<peculiarX509.X509Certificate | null>();
  const [ msgBigInt, setmsgBigInt ] = useState<bigint>();
  const [ sigBigInt, setsigBigInt ] = useState<bigint>();
  const [ modulusBigInt, setmodulusBigInt ] = useState<bigint>();

  // Buttons and inputs activation
  const [ disabledCertificateUploadInput, setdisabledCertificateUploadInput ] = useState(true);
  const [ disabledGenerateProofButton, setdisabledGenerateProofButton ] = useState(true);
  const [ buttonProofDisabledDuringProofGeneration, setbuttonProofDisabledDuringProofGeneration ] = useState<boolean>(false);
  const [ appState, setappState ] = useState<'' | AppState>('');

  // Signature verification setup
  const [ pdfStatus, setpdfStatus ] = useState<'' | AdhaarPdfValidation>('');
  const [ signatureValidity, setsignatureValidity ] = useState<'' | AdhaarSignatureValidition>('');
  const [ certificateStatus, setcertificateStatus ] = useState<'' | AdhaarCertificateValidation>();

  // Proving worker setup
  const workerRef = useRef<Worker>();
  const [ proof, setproof ] = useState<undefined | any>();
  const [ publicSignals, setpublicSignals ] = useState();
  const [ loading, setloading ] = useState(true);

  // Proof verification 
  const [ proofFileValidity, setproofFileValidity ] = useState<'' | AdhaarProofFile>();
  const [ proofData, setproofData ] = useState<null | any>(null);
  const [ proofValidity, setproofValidity ] = useState<'' | AdhaarProofState>();

  const pdfUpload = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      try {
        const fileReader = new FileReader();
        fileReader.readAsBinaryString(e.target.files[ 0 ]);
        const userFilename = e.target.files[ 0 ].name;
        fileReader.onload = (e) => {
          if (e.target) {
            try {
              const { signedData, signature, ByteRange } = extractSignature(Buffer.from(e.target.result as string, 'binary'));
              if (signature != '') {
                setsignature((window as any).forge.asn1.fromDer(signature).value as string);
                setsignedPdfData(signedData);
                setpdfStatus(AdhaarPdfValidation.SIGNATURE_PRESENT);
                setdisabledCertificateUploadInput(true);

              } else {
                setpdfStatus(AdhaarPdfValidation.SIGNATURE_NOT_PRESENT);
              }
            } catch (error) {
              setpdfStatus(AdhaarPdfValidation.ERROR_PARSING_PDF);
            }
          }
        };
      } catch {
        setpdfStatus('');
        setsignatureValidity('');
      }
    }
  };

  const cerUpload = async (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      try {
        const fileReader = new FileReader();
        fileReader.readAsArrayBuffer(e.target.files[ 0 ]);
        const userFilename = e.target.files[ 0 ].name;
        fileReader.onload = (e) => {
          if (e.target && pdfStatus == AdhaarPdfValidation.SIGNATURE_PRESENT) {
            try {
              const cer = new peculiarX509.X509Certificate(e.target.result as Buffer);
              setx509Certificate(cer);
              // (window as any) to avoid typescript complaining
              const cert = (window as any).forge.pki.certificateFromPem(cer.toString("pem"));

              const md = (window as any).forge.md.sha1.create();
              md.update(signedPdfData.toString("binary")); // defaults to raw encoding

              const decryptData = Buffer.from(cert.publicKey.encrypt(signature, "RAW"), "binary");
              const hash = Buffer.from(md.digest().bytes(), "binary");

              const isValid = bufferEquals(decryptData.subarray(236, 256), hash);
              if (isValid) {
                setmsgBigInt(BigInt("0x" + hash.toString("hex")));
                setsigBigInt(BigInt("0x" + Buffer.from(signature, "binary").toString("hex")));
                setmodulusBigInt(BigInt("0x" + cert.publicKey.n.toString(16)));
                setsignatureValidity(AdhaarSignatureValidition.SIGNATURE_VALID);
                setcertificateStatus(AdhaarCertificateValidation.CERTIFICATE_CORRECTLY_FORMATTED);
              }
              else {
                setsignatureValidity(AdhaarSignatureValidition.SIGNATURE_INVALID);
                setcertificateStatus(AdhaarCertificateValidation.CERTIFICATE_CORRECTLY_FORMATTED);
              }

            } catch (error) {
              setsignatureValidity(AdhaarSignatureValidition.SIGNATURE_INVALID);
              setcertificateStatus(AdhaarCertificateValidation.ERROR_PARSING_CERTIFICATE);

            }
          } else {
            setcertificateStatus(AdhaarCertificateValidation.NO_PDF_UPLOADED);
          }
        };
      } catch {
        setsignatureValidity(AdhaarSignatureValidition.SIGNATURE_INVALID);
        setcertificateStatus('');
      }
    }
  };

  const proofUpload = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      try {
        const fileReader = new FileReader();
        fileReader.readAsText(e.target.files[ 0 ], 'UTF-8');
        const userFilename = e.target.files[ 0 ].name;
        fileReader.onload = (e) => {
          if (e.target) {
            try {
              const proof = JSON.parse(e.target.result as string);
              const isValid = validateProofJSON(proof);
              setproofData(proof);
              setproofFileValidity(AdhaarProofFile.PROOF_FILE_VALID);
            } catch (error) {
              setproofFileValidity(AdhaarProofFile.PROOF_FILE_INVALID);
              setproofData(null);
            }
          }
        };

      } catch (error) {
        setproofFileValidity('');
        setproofData(null);
      }
    }
  };

  useEffect(() => {
    workerRef.current = new Worker(
      new URL('../components/worker/generateProof.ts', import.meta.url)
    );
    workerRef.current.onmessage = (
      e: MessageEvent<{ proof: any; publicSignals: any; }>
    ) => {
      setproof(e.data.proof);
      setpublicSignals(e.data.publicSignals);
      setloading(false);
      setappState('');
    };
    return () => {
      workerRef.current?.terminate();
    };
  }, [ setproof, setpublicSignals ]);


  const generateProof = async () => {
    if (sigBigInt && modulusBigInt && msgBigInt) {

      const input = Object.assign(
        {},
        splitToWords(sigBigInt, BigInt(32), BigInt(64), 'sign'),
        splitToWords(BigInt(65337), BigInt(32), BigInt(64), 'exp'),
        splitToWords(modulusBigInt, BigInt(32), BigInt(64), 'modulus'),
        splitToWords(msgBigInt, BigInt(32), BigInt(5), 'hashed')
      );
      const [ circuitUrl, provingKeyUrl, verifyingKeyUrl ] = [
        process.env[ "NEXT_PUBLIC_CIRCUIT_URL" ],
        process.env[ "NEXT_PUBLIC_ZKEY_PROVE_URL" ],
        process.env[ "NEXT_PUBLIC_ZKEY_VERIFY_URL" ]
      ];

      if (circuitUrl && provingKeyUrl && verifyingKeyUrl) {
        setbuttonProofDisabledDuringProofGeneration(true);
        setappState(AppState.GENERATING_PROOF);
        const circuit = new snarkjs.Circuit(await (await axios.get(circuitUrl)).data);
        const provingKey = await (await axios.get(provingKeyUrl)).data;
        const wtns = circuit.calculateWitness(input);
        console.log(circuit);
        console.log("Started worker");
        workerRef.current?.postMessage({
          provingKey,
          wtns
        });
      } else {
        console.log("Could not get access to artifacts urls");
      }
    }
  };

  const verifyProof = async () => {
    if (proofData.proof && proofData.publicSignals) {
      const vkeyVerifier = await downloadVerifier(
        process.env[
        'NEXT_PUBLIC_ZKEY_VERIFY_URL'
        ] as string
      );
      const proofValidity = validity(vkeyVerifier, proofData.proof, proofData.publicSignals);
      console.log(proofValidity);
      if (proofValidity) {
        setproofValidity(AdhaarProofState.PROOF_VALID);
      } else {
        setproofValidity(AdhaarProofState.PROOF_INVALID);
      }
    }
  };

  const certificateOrSignatureStatus = (certificateStatus == AdhaarCertificateValidation.ERROR_PARSING_CERTIFICATE || certificateStatus == '' || certificateStatus == AdhaarCertificateValidation.NO_PDF_UPLOADED) ? certificateStatus : signatureValidity;
  const downloadProofButtonContent = proof ? <a href={`data:text/json;charset=utf-8,${encodeURIComponent(JSON.stringify({ proof, publicSignals }))}`} download="proof_public_signals.json">Download Proof</a> : <>Download Proof</>;

  return (
    <>
      <div className="flex justify-center p-5">
        <MainFlex>
          <Title />
          <div className="flex justify-center p-4">
            <Description />
          </div>
          <div className="flex space-y-5 md:space-y-0 md:flex-row md:space-x-5 flex-col">
            <div className="border-2 pt-2 pb-2 pl-2 border-slate-500 rounded-xl">
              <div className="space-y-5">
                <InputFlex>
                  <InputDescription content={<>Your adhaar card in pdf format: </>}></InputDescription>
                  <FileInput onChange={pdfUpload} />
                  <div className="pt-2 text-sm">{pdfStatus}</div>
                </InputFlex>
                <InputFlex>
                  <InputDescription content={<>Your adhaar certificate file <a className="hover:text-neutral-600" target={"_blank"} rel={"noreferrer"} href="https://github.com/dmpierre/anon-adhaar/tree/main/tutorial">(how?)</a>:</>}></InputDescription>
                  <FileInput onChange={cerUpload} />
                  <div className="pt-2 text-sm">{certificateOrSignatureStatus}</div>
                </InputFlex>
                <div className="flex items-center space-x-5">
                  <Button disabled={!(signatureValidity == AdhaarSignatureValidition.SIGNATURE_VALID) || buttonProofDisabledDuringProofGeneration} onClick={generateProof}>
                    <span>Generate Proof</span>
                  </Button>
                  {
                    appState ?
                      <div className="flex">
                        <div className="pr-2 align-middle">
                          <ThemeProvider theme={theme}>
                            <CircularProgress size={25} disableShrink color="primary" />
                          </ThemeProvider>
                        </div>
                      </div>
                      : <></>
                  }
                </div>
                <Button disabled={!proof}>
                  {downloadProofButtonContent}
                </Button>
              </div>
            </div>
            <div className="flex border-2 pt-2 pb-2 pl-2 border-slate-500 rounded-xl">
              <div className="space-y-5">
                <InputFlex>
                  <InputDescription content={<>Verify your proof: </>}></InputDescription>
                  <FileInput onChange={proofUpload}></FileInput>
                  <div className="pt-2 text-sm">{proofFileValidity}</div>
                </InputFlex>
                <div className="flex">
                  <div>
                    <Button disabled={proofData ? false : true} onClick={verifyProof}>
                      <span>Verify Proof</span>
                    </Button>
                  </div>
                  <div className="pl-3">
                    <span className="text-sm ">{proofValidity}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div className="pt-5">
            <HelpInfo link="https://en.wikipedia.org/wiki/Aadhaar" description={"What is an adhaaar card?"} />
            <HelpInfo link="https://blog.cryptographyengineering.com/2014/11/27/zero-knowledge-proofs-illustrated-primer/" description={"What is zero knowledge?"} />
          </div>
          <Footer />
        </MainFlex>
      </div>
    </>
  );
}
