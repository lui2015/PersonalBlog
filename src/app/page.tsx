import HeroSection from "@/components/home/HeroSection";
import PoemModule from "@/components/modules/PoemModule";
import PhotoFrameModule from "@/components/modules/PhotoFrameModule";
import LatestBlogModule from "@/components/modules/LatestBlogModule";
import StatsModule from "@/components/modules/StatsModule";
import QuoteModule from "@/components/modules/QuoteModule";
import SkillRadarModule from "@/components/modules/SkillRadarModule";

export default function Home() {
  return (
    <div className="relative z-10">
      <HeroSection />

      {/* 自定义模块区域 */}
      <section className="max-w-7xl mx-auto px-3 sm:px-4 py-8 sm:py-16 space-y-8 sm:space-y-16">
        {/* 双栏布局：诗词 + 相框 */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-8">
          <PoemModule />
          <PhotoFrameModule />
        </div>

        {/* 数据面板 */}
        <StatsModule />

        {/* 我的作品 */}
        <LatestBlogModule />

        {/* 双栏：技能雷达 + 随机语录 */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-8">
          <SkillRadarModule />
          <QuoteModule />
        </div>
      </section>
    </div>
  );
}
