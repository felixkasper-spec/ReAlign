import Header from "@/components/Header";
import Footer from "@/components/Footer";

export default function AuthLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <>
      <Header />
      {children}
      <div className="wrap">
        <Footer />
      </div>
    </>
  );
}
