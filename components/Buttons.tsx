import { ChangeEvent, FunctionComponent, ReactNode } from "react";

interface ButtonProps {
     onClick?: (() => Promise<void>) | (<T1, T2>(arg: T1) => T2 | void) ;
     disabled?: boolean,
     children?: ReactNode
}

export const Button: FunctionComponent<ButtonProps> = ({onClick, disabled, children }) => {
     return (
          <>
               <div className="">
                    <button disabled={disabled} className="border-neutral-900 disabled:border-neutral-400 disabled:text-neutral-400 px-2 py-1 rounded-md hover:border-neutral-600 hover:text-neutral-600 border-2" onClick={onClick}>{children}</button>
               </div>
          </>
     );
};