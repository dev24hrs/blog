export type ExternalProfileLinkType = "github"

export interface ExternalProfileLink {
  type: ExternalProfileLinkType
  name: string
  url: string
}

export type ProfileLink = ExternalProfileLink

export const profile: {
  name: string
  bio: string
  avatar: string
  links: ProfileLink[]
} = {
  name: "dev24hrs",
  bio: "Less is More",
  avatar: "/avatar.webp",
  links: [
    {
      type: "github",
      name: "GitHub",
      url: "https://github.com/dev24hrs",
    },
  ],
}
