import React from "react";

const ErrorTemplate = ({
  url,
  fromAddress,
  errorMessage,
}: {
  url: string;
  fromAddress: string;
  errorMessage: string;
}) => {
  return (
    <div>
      <h1>Tailor Book</h1>
      <p>Hi admin! there is an issue on website please check ASAP</p>
      <p>URL : {url}</p>
      <p>Error message: {errorMessage}</p>
      <p>Customer Email: {fromAddress}</p>
    </div>
  );
};

export default ErrorTemplate;
