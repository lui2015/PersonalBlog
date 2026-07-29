import HeroSection from "@/components/home/HeroSection";
import PoemModule from "@/components/modules/PoemModule";
import LatestBlogModule from "@/components/modules/LatestBlogModule";
import StatsModule from "@/components/modules/StatsModule";
import QuoteModule from "@/components/modules/QuoteModule";
import SkillRadarModule from "@/components/modules/SkillRadarModule";
import SoftwareScrollModule from "@/components/modules/SoftwareScrollModule";
import SkillScrollModule from "@/components/modules/SkillScrollModule";
import VideoScrollModule from "@/components/modules/VideoScrollModule";
import GalleryCarouselModule from "@/components/modules/GalleryCarouselModule";

export default function Home() {
  return (
    <div className="relative z-10">
      <HeroSection />

      {/* 滚动展示：软件作品 + 视频作品 */}
      <section className="max-w-7xl mx-auto px-3 sm:px-4">
        <SoftwareScrollModule />
        <SkillScrollModule />
        <GalleryCarouselModule />
        <VideoScrollModule />
        <LatestBlogModule />
      </section>

      {/* 自定义模块区域 */}
      <section className="max-w-7xl mx-auto px-3 sm:px-4 py-8 sm:py-16 space-y-8 sm:space-y-16">
        {/* 双栏布局：诗词 + 随机语录 */}
        <div
          id="poems"
          className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-8 scroll-mt-24"
        >
          <PoemModule />
          <QuoteModule />
        </div>

        {/* 数据面板 */}
        <StatsModule />

        {/* 技能雷达 */}
        <SkillRadarModule />
      </section>
    </div>
  );
}
