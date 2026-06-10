import React from "react";

interface ContainerProps {
  children: React.ReactNode;
}

const Container: React.FC<ContainerProps> = ({ children }) => {
  return (
    <div className="mx-auto w-full max-w-[1440px] px-4 sm:px-5 lg:px-[20px]">{children}</div>
  );
};

export default Container;
