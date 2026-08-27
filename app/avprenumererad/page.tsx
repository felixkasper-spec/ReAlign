import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { pageMetadata } from "@/lib/page-metadata";

export const metadata = pageMetadata({
  title: "Avprenumererad — ReAlign Metoden",
  description: "Du har avslutat mejlutskick från ReAlign Metoden.",
  image: "/og/default.png",
  path: "/avprenumererad",
});

export default async function AvprenumereradPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string }>;
}) {
  const { status } = await searchParams;
  const ok = status !== "error";

  return (
    <>
      <Header />
      <div className="wrap" style={{ maxWidth: 560, padding: "80px 0", textAlign: "center" }}>
        <span className="eyebrow">{ok ? "Klart" : "Något gick fel"}</span>
        <h1 style={{ margin: "12px 0 16px" }}>
          {ok ? "Du är avanmäld." : "Länken gick inte att verifiera."}
        </h1>
        <p style={{ color: "var(--text-soft)" }}>
          {ok
            ? "Du kommer inte längre få träningstips eller erbjudanden från oss via mejl. Bekräftelser på sånt du själv gör, som kontaktformuläret, påverkas inte."
            : "Testa igen från ett av mejlen du fått, eller ändra dina mejlinställningar på Min sida."}
        </p>
      </div>
      <Footer />
    </>
  );
}
