import React from "react";

export default function UserDashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <div className="sm:max-w-2xl sm:mx-auto h-full">{children}</div>;
}
