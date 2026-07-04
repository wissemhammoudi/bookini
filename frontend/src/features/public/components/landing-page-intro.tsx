import { useState } from 'react'
import { LandingPageIntroCategories } from './landing-page-intro-categories'
import { heroSpaces, categories } from './landing-page-intro-data'
import { LandingPageIntroHero } from './landing-page-intro-hero'
import { LandingPageIntroSearch } from './landing-page-intro-search'

type LandingPageIntroProps = {
  isLight: boolean
  navigate: (path: string) => void
}

export const LandingPageIntro = ({ isLight, navigate }: LandingPageIntroProps) => {
  const [location, setLocation] = useState('')
  const [spaceType, setSpaceType] = useState('')
  const [date, setDate] = useState('')
  const [capacity, setCapacity] = useState('')

  const handleSearch = (event: React.FormEvent) => {
    event.preventDefault()
    const params = new URLSearchParams()
    if (location) params.append('location', location)
    if (spaceType) params.append('type', spaceType)
    if (date) params.append('date', date)
    if (capacity) params.append('capacity', capacity)
    navigate(`/book?${params.toString()}`)
  }

  return (
    <>
      <LandingPageIntroHero isLight={isLight} heroSpaces={heroSpaces} navigate={navigate} />

      <LandingPageIntroSearch
        isLight={isLight}
        location={location}
        spaceType={spaceType}
        date={date}
        capacity={capacity}
        onLocationChange={setLocation}
        onSpaceTypeChange={setSpaceType}
        onDateChange={setDate}
        onCapacityChange={setCapacity}
        onSubmit={handleSearch}
      />

      <LandingPageIntroCategories
        isLight={isLight}
        categories={categories}
        navigate={navigate}
      />
    </>
  )
}
