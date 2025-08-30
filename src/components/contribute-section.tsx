import React from 'react'
import GovernancePortal from './governance-portal'

interface ContributeSectionProps {
  language: 'es' | 'en'
}

export default function ContributeSection({ language }: ContributeSectionProps) {
  return <GovernancePortal language={language} />
}