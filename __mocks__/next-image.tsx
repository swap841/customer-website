import React from "react";

const MockImage = (props: any) => {
  const { fill, ...rest } = props;
  return <img {...rest} />;
};

export default MockImage;
