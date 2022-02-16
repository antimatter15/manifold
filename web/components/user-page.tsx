import clsx from 'clsx'
import { User } from '../lib/firebase/users'
import { CreatorContractsList } from './contracts-list'
import { SEO } from './SEO'
import { Page } from './page'
import { SiteLink } from './site-link'
import { Avatar } from './avatar'
import { Col } from './layout/col'
import { Linkify } from './linkify'
import { Spacer } from './layout/spacer'
import { Row } from './layout/row'
import { LinkIcon } from '@heroicons/react/solid'
import { genHash } from '../../common/util/random'

export function UserLink(props: {
  name: string
  username: string
  showUsername?: boolean
  className?: string
}) {
  const { name, username, showUsername, className } = props

  return (
    <SiteLink href={`/${username}`} className={clsx('z-10', className)}>
      {name}
      {showUsername && ` (@${username})`}
    </SiteLink>
  )
}

export function UserPage(props: { user: User; currentUser?: User }) {
  const { user, currentUser } = props

  const isCurrentUser = user.id === currentUser?.id

  const possesive = isCurrentUser ? 'Your ' : `${user.name}'s `

  const bannerUrl = user.bannerUrl ?? defaultBannerUrl(user.id)

  const placeholderBio = `I... haven't gotten around to writing a bio yet 😛`

  return (
    <Page>
      <SEO
        title={possesive + 'markets'}
        description={possesive + 'markets'}
        url={`/${user.username}`}
      />

      {/* Banner image up top, with an circle avatar overlaid */}
      <div
        className="h-32 w-full bg-cover bg-center sm:h-40"
        style={{
          backgroundImage: `url(${bannerUrl})`,
        }}
      />
      <div className="relative -top-10 left-4">
        {/* TODO: add a white ring to the avatar */}
        <Avatar username={user.username} avatarUrl={user.avatarUrl} size={20} />
      </div>

      {/* Profile details: name, username, bio, and link to twitter/discord */}
      <Col className="mx-4 -mt-6">
        <span className="text-2xl font-bold">{user.name}</span>
        <span className="text-gray-500">@{user.username}</span>
        <Spacer h={4} />

        <div>
          <Linkify text={user.bio || placeholderBio}></Linkify>
        </div>
        <Spacer h={4} />

        <Col className="sm:flex-row sm:gap-4">
          {user.website && (
            <SiteLink href={user.website}>
              <Row className="items-center gap-1">
                <LinkIcon className="h-4 w-4" />
                <span className="text-sm text-gray-500">{user.website}</span>
              </Row>
            </SiteLink>
          )}

          {user.twitterHandle && (
            <SiteLink href={`https://twitter.com/${user.twitterHandle}`}>
              <Row className="items-center gap-1">
                <img
                  src="/twitter-logo.svg"
                  className="h-4 w-4"
                  alt="Twitter"
                />
                <span className="text-sm text-gray-500">
                  {user.twitterHandle}
                </span>
              </Row>
            </SiteLink>
          )}

          {user.discordHandle && (
            <SiteLink href="https://discord.com/invite/eHQBNBqXuh">
              <Row className="items-center gap-1">
                <img
                  src="/discord-logo.svg"
                  className="h-4 w-4"
                  alt="Discord"
                />
                <span className="text-sm text-gray-500">
                  {user.discordHandle}
                </span>
              </Row>
            </SiteLink>
          )}
        </Col>

        <Spacer h={10} />

        <CreatorContractsList creator={user} />
      </Col>
    </Page>
  )
}

// Assign each user to a random default banner based on the hash of userId
export function defaultBannerUrl(userId: string) {
  const defaultBanner = [
    'https://images.unsplash.com/photo-1501523460185-2aa5d2a0f981?ixlib=rb-1.2.1&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=2131&q=80',
    'https://images.unsplash.com/photo-1458682625221-3a45f8a844c7?ixlib=rb-1.2.1&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1974&q=80',
    'https://images.unsplash.com/photo-1558517259-165ae4b10f7f?ixlib=rb-1.2.1&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=2080&q=80',
    'https://images.unsplash.com/photo-1563260797-cb5cd70254c8?ixlib=rb-1.2.1&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=2069&q=80',
    'https://images.unsplash.com/photo-1603399587513-136aa9398f2d?ixlib=rb-1.2.1&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1467&q=80',
  ]
  return defaultBanner[genHash(userId)() % defaultBanner.length]
}
