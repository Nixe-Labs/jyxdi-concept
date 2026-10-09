import HomeClient from "@/components/home/HomeClient";
import NewArrivals from "@/components/home/NewArrivals";
import ArtistBlock from "@/components/home/ArtistBlock";
import Formats from "@/components/home/Formats";
import Teasers from "@/components/home/Teasers";
import Footer from "@/components/chrome/Footer";

export default function Home() {
  return (
    <>
      <HomeClient newArrivals={<NewArrivals />} artist={<ArtistBlock />} formats={<Formats />} teasers={<Teasers />} />
      <Footer />
    </>
  );
}
