'use client'

import { LucideIcon } from 'lucide-react'

import { SidebarNavLink } from '@/components/dashboard/sidebar'
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui/tooltip'

interface SidebarNavItem {
  href: string
  icon: LucideIcon
  label: string
  onClick?: () => void
}

interface SidebarLinksProps {
  links: SidebarNavItem[]
  className?: string
  isActiveLink: (path: string) => boolean
  sideOffset?: number
  open?: boolean
}

export function SidebarLinks({
  links,
  isActiveLink,
  sideOffset = 5,
  open = true,
}: SidebarLinksProps) {
  return (
    <>
      {links.map((link) => (
        <Tooltip disableHoverableContent key={link.href}>
          <TooltipTrigger asChild>
            <div>
              <SidebarNavLink
                href={link.href}
                active={isActiveLink(link.href)}
                className="group-data-[sidebar=closed]/sidebar:flex group-data-[sidebar=closed]/sidebar:justify-center group-data-[sidebar=open]/sidebar:gap-2 group-data-[sidebar=open]/sidebar:pl-3"
              >
                <link.icon size={20} />
                <span className="group-data-[sidebar=open]/sidebar:block group-data-[sidebar=closed]/sidebar:hidden">
                  {link.label}
                </span>
              </SidebarNavLink>
            </div>
          </TooltipTrigger>

          {!open && (
            <TooltipContent side="right" sideOffset={sideOffset}>
              {link.label}
            </TooltipContent>
          )}
        </Tooltip>
      ))}
    </>
  )
}
