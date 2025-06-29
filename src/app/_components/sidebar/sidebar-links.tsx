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
  link: SidebarNavItem
  className?: string
  isActiveLink: (path: string) => boolean
  sideOffset?: number
  open?: boolean
}

export function SidebarLinks({
  link,
  isActiveLink,
  sideOffset,
  open = true,
}: SidebarLinksProps) {
  return (
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
          className="gap-2 px-2 group-data-[sidebar=closed]/sidebar:flex group-data-[sidebar=closed]/sidebar:justify-center"
        >
          <link.icon size={20} />
          <span className="group-data-[sidebar=open]/sidebar:block group-data-[sidebar=closed]/sidebar:hidden">
            {link.label}
          </span>
        </SidebarNavLink>
      </div>
    </TooltipWrapper>
  )
}
