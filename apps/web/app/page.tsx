


import { Cta } from '@/components/site/cta'
import { Features } from '@/components/site/features'
import { Hero } from '@/components/site/hero'
import { HowItWorks } from '@/components/site/how-it-works'
import { Reviews } from '@/components/site/reviews'
import { SiteFooter } from '@/components/site/site-footer'
import { SiteHeader } from '@/components/site/site-header'
import { Tracks } from '@/components/site/tracks'

export default function HomePage() {
    return (
        <>
            <SiteHeader />
            <main>
                <Hero />
                <Features />
                <Tracks />
                <HowItWorks />
                <Reviews />
                <Cta />
            </main>
            <SiteFooter />
        </>
    )
}

