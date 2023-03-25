import { FunctionComponent, ReactNode } from "react";

interface MainFlexProps {
     children: ReactNode;
}

export const MainFlex: FunctionComponent<MainFlexProps> = ({ children }) => {
     return (
          <>
               <div className="flex-col">
                    {children}
               </div>
          </>
     );
};