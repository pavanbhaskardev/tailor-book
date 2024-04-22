import React from "react";

const CustomerDetailsPage = ({ params }: { params: { id: string } }) => {
  console.log({ params });

  return <div>CustomerDetailsPage {params.id}</div>;
};

export default CustomerDetailsPage;
