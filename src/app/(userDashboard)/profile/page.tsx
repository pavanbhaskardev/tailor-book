import React from "react";
import { UserProfile } from "@clerk/nextjs";

const Profile = () => {
  return (
    <div className="w-max mx-auto">
      <UserProfile
        appearance={{
          variables: {
            colorPrimary: "#22C55E",
            colorText: "white",
          },
          elements: {
            navbarMobileMenuRow: "hidden",
            card: "clerk-profile",
          },
        }}
      />
    </div>
  );
};

export default Profile;
