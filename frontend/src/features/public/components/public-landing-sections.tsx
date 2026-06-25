import { Fragment } from 'react'

import type { AdvantageCard, CategoryCard, StepCard, TestimonialCard } from '../landing-page-data'
import type { PublicRoom } from '@/lib/api'
import { PublicLandingCoreSections } from './public-landing-core-sections'
import { PublicLandingFeaturedSections } from './public-landing-featured-sections'

type PublicLandingSectionsProps = {
  isLight: boolean
  categories: CategoryCard[]
  steps: StepCard[]
  advantages: AdvantageCard[]
  testimonials: TestimonialCard[]
  featuredSpaces: PublicRoom[]
  navigateToType: (spaceType: string) => void
}

export const PublicLandingSections = ({
  isLight,
  categories,
  steps,
  advantages,
  testimonials,
  featuredSpaces,
  navigateToType,
}: PublicLandingSectionsProps) => (
  <Fragment>
    <PublicLandingCoreSections
      isLight={isLight}
      categories={categories}
      steps={steps}
      advantages={advantages}
      navigateToType={navigateToType}
    />
    <PublicLandingFeaturedSections
      isLight={isLight}
      testimonials={testimonials}
      featuredSpaces={featuredSpaces}
    />
  </Fragment>
)
