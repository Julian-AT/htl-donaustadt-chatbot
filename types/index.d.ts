export type SiteConfig = {
  name: string
  description: string
  url: string
  links?: LinkConfig[]
}

export type LinkConfig = {
  name: string
  shortName?: string
  url: string
  variant?:
    | 'default'
    | 'destructive'
    | 'outline'
    | 'secondary'
    | 'ghost'
    | 'link'
    | null
    | undefined
  className?: string
  icon?: any
}
