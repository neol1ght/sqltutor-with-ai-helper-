import { HeroSection } from '@/components/marketing/hero-section';
import { LearningSection } from '@/components/marketing/learning-section';
import { ReviewsSection } from '@/components/marketing/reviews-section';
import {MarketingHeader} from "@/components/marketing/marketing-header";
import {MarketingFooter} from "@/components/marketing/marketing-footer";
import {AdvantagesSection} from "@/components/marketing/advantages-section";

export default function MarketingPage() {
    return (
        <main>
            <MarketingHeader />
            <HeroSection />
            <AdvantagesSection />
            <LearningSection />
            <ReviewsSection />
            <MarketingFooter />
        </main>

    );
}