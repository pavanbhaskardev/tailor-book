import BottomBar from "@/components/BottomBar";

const DashboardLayout = ({ children }: { children: React.ReactNode }) => {
  return (
    <main>
      {children}
      {/* <BottomBar /> */}
    </main>
  );
};

export default DashboardLayout;
