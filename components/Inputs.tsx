import { ChangeEvent, FunctionComponent, ReactNode } from "react";

interface FileInputProps {
     onChange: (e: ChangeEvent<HTMLInputElement>) => void;
}

export const FileInput: FunctionComponent<FileInputProps> = ({ onChange }) => {
     return (
          <div className="justify-center">
               <input type="file" onChange={onChange} />
          </div>
     );
};

interface InputDescriptionProps {
     content: any;
}

export const InputDescription: FunctionComponent<InputDescriptionProps> = ({ content }) => {
     return (
          <>
               <div className="pb-2">
                    {content}
               </div>
          </>
     );
};

interface InputFlexProps {
     children: ReactNode;
}

export const InputFlex: FunctionComponent<InputFlexProps> = ({ children }) => {
     return (<div className="flex-col">
          {children}
     </div>);
};
