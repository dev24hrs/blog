"use client"

import { Github } from "lucide-react"
import { type ProfileLink } from "@/data/profile"

const iconMap = {
  github: Github,
}

interface ProfileContactLinkProps {
  link: ProfileLink
  className: string
  iconClassName: string
}

export function ProfileContactLink({ link, className, iconClassName }: ProfileContactLinkProps) {
  const Icon = iconMap[link.type]

  return (
    <a
      href={link.url}
      target="_blank"
      rel="noreferrer"
      className={className}
      aria-label={link.name}
    >
      <Icon className={iconClassName} />
    </a>
  )
}
