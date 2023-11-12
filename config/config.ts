import { IconGitHub, IconHTL } from '@/components/ui/icons'
import { SiteConfig } from 'types'

export const siteConfig: SiteConfig = {
  name: 'HTL Donaustadt - AI Chatbot',
  description: 'AI Chatbot für die HTL Donaustadt',
  url: 'http://localhost:3000',
  links: [
    {
      name: 'HTL Donaustadt',
      shortName: 'HTL22',
      url: 'https://www.htl-donaustadt.at/home',
      icon: IconHTL
    },
    {
      name: 'Github',
      url: 'https://www.github.com/julian-at',
      variant: 'outline',
      className: 'bg-gray-300 hover:bg-gray-600',
      icon: IconGitHub
    }
  ]
}
