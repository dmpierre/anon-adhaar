import { FunctionComponent } from "react";
import imgGithub from "../public/github.png";
import imgPSE from "../public/pse_logo.png";
import Image from 'next/image';

export const Footer: FunctionComponent = () => {
     return (
          <>
               <div className="flex items-center pt-10 justify-center">
                    <div className="pr-5"><a target={"_blank"} rel={"noreferrer"} href="https://appliedzkp.org/"><Image className="rounded-xl" alt="pse" src={imgPSE} width={50} height={50}></Image></a></div>
                    <div className="pl-5"><a target={"_blank"} rel={"noreferrer"} href="https://github.com/dmpierre/anon-adhaar"><Image alt="github" src={imgGithub} width={45} height={45}></Image></a></div>
               </div>
          </>
     );
};

interface HelpInfoProps {
     link: string;
     description: string;
}
export const HelpInfo: FunctionComponent<HelpInfoProps> = ({ link, description }) => {
     return (
          <>
               <div className="flex pt-2 hover:text-neutral-600 text-xs justify-end">
                    <a target={"_blank"} rel={"noreferrer"} href={link}>{description}</a>
               </div>
          </>
     );
};
