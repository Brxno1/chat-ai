'use client'

import { LucideIcon } from 'lucide-react'

import { SidebarNavLink } from '@/components/dashboard/sidebar'
import { TooltipWrapper } from '@/components/tooltip-wrapper'

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
  sideOffset,
  open = true,
}: SidebarLinksProps) {
  return (
    <>
      {links.map((link) => (
        <TooltipWrapper
          key={link.href}
          content={link.label}
          side="right"
          disableHoverableContent
          disabled={open}
          sideOffset={sideOffset}
          asChild
        >
          <div>
            <SidebarNavLink
              href={link.href}
              active={isActiveLink(link.href)}
              onClick={link.onClick}
              className="group-data-[sidebar=closed]/sidebar:flex group-data-[sidebar=closed]/sidebar:justify-center group-data-[sidebar=open]/sidebar:gap-2 group-data-[sidebar=open]/sidebar:pl-3"
            >
              <link.icon size={20} />
              <span className="group-data-[sidebar=open]/sidebar:block group-data-[sidebar=closed]/sidebar:hidden">
                {link.label}
              </span>
            </SidebarNavLink>
          </div>
        </TooltipWrapper>
      ))}
    </>
  )
}
