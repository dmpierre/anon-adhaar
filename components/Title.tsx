import { FunctionComponent } from "react";

export const Title: FunctionComponent = () => {

     return (<>
          <div className='flex pt-5 text-xl justify-center'>Anonymous Adhaar</div>
          <div className="flex justify-center pt-2">🥷</div>
     </>);

};

export const Description: FunctionComponent = () => {
     return (
          <>
               <div className="flex flex-col p-2 text-center">
                    <div> Prove your adhaar card{"'"}s validity, while keeping your sensitive data private.</div>
                    <div><i>Note: generating a proof can take up to 10 minutes</i></div>
               </div>
          </>
     );
};

