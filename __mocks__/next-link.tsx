import React from "react";

const MockLink = ({ children, ...props }: any) => {
  return <a {...props}>{children}</a>;
};

export default MockLink;
