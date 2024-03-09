import React from "react";

const CustomerOrder = ({ params }: { params: { slug: string } }) => {
  console.log(params.slug);

  return <div>CustomerOrder</div>;
};

export default CustomerOrder;
