import Navbar from "@/components/Navbar";
import TickerBar from "@/components/TickerBar";
import HeroSection from "@/components/HeroSection";
import FeaturedArticles from "@/components/FeaturedArticles";
import BlogSection from "@/components/BlogSection";
import FooterSection from "@/components/FooterSection";

const Index = () => {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <TickerBar />
      <HeroSection />
      <FeaturedArticles />
      <BlogSection />
      <FooterSection />
    </div>
  );
};

export default Index;
