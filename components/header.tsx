import * as React from 'react'
import Link from 'next/link'

import { cn } from '@/lib/utils'
// import { auth } from '@/auth'
// import { clearChats } from '@/app/actions'
import { Button, buttonVariants } from '@/components/ui/button'
// import { Sidebar } from '@/components/sidebar'
// import { SidebarList } from '@/components/sidebar-list'
import { IconExternalLink } from '@/components/ui/icons'
import { ThemeToggle } from '@/components/theme-toggle'
import { siteConfig } from '@/config/config'
import { Icon } from '@radix-ui/react-select'

export async function Header({
  children,
  className,
  ...props
}: React.ComponentProps<'div'>) {
  //   const session = await auth()
  return (
    <header className="sticky top-0 z-50 flex items-center justify-between w-full h-16 px-4 border-b border-border shrink-0 bg-gradient-to-b from-background/10 via-background/50 to-background/80 backdrop-blur-xl">
      <div className="flex items-center justify-end space-x-2">
        {siteConfig.links?.map(link => {
          return (
            <Link
              href={link.url}
              className={cn(
                buttonVariants({
                  variant: link.variant,
                  className: ` ${link.className?.toString()}`
                })
              )}
              key={link.name}
            >
              <div className="mr-2 cursor-pointer">
                {<link.icon /> ?? <IconExternalLink />}
              </div>
              <span className="hidden sm:block">{link.name}</span>
              <span className="sm:hidden">
                {link.shortName ? link.shortName : link.name}
              </span>
            </Link>
          )
        })}
      </div>
      <ThemeToggle />
    </header>
  )
}
