import { firebaseLogout, User } from '../../lib/firebase/users'
import { formatMoney } from '../../../common/util/format'
import { Avatar } from '../avatar'
import { Col } from '../layout/col'
import { MenuButton } from './menu'
import { IS_PRIVATE_MANIFOLD } from '../../../common/envs/constants'


function getNavigationOptions(
  user: User | undefined,
  options: { mobile: boolean }
) {
  const { mobile } = options
  return [
    {
      name: 'Home',
      href: user ? '/home' : '/',
    },
    ...(mobile
      ? [
          {
            name: 'Markets',
            href: '/markets',
          },
          {
            name: 'Communities',
            href: '/folds',
          },
        ]
      : []),
    {
      name: `Your profile`,
      href: `/${user?.username}`,
    },
    {
      name: 'Your trades',
      href: '/trades',
    },
    // Disable irrelevant menu options for teams.
    ...(IS_PRIVATE_MANIFOLD
      ? [
          {
            name: 'Leaderboards',
            href: '/leaderboards',
          },
        ]
      : [
          {
            name: 'Add funds',
            href: '/add-funds',
          },
          {
            name: 'Leaderboards',
            href: '/leaderboards',
          },
          {
            name: 'Discord',
            href: 'https://discord.gg/eHQBNBqXuh',
          },
          {
            name: 'About',
            href: '/about',
          },
        ]),
    {
      name: 'Sign out',
      href: '#',
      onClick: () => firebaseLogout(),
    },
  ]
}

function ProfileSummary(props: { user: User | undefined }) {
  const { user } = props
  return (
    <Col className="avatar items-center gap-2 sm:flex-row sm:gap-4">
      <Avatar avatarUrl={user?.avatarUrl} username={user?.username} noLink />

      <div className="truncate text-left sm:w-32">
        <div className="hidden sm:flex">{user?.name}</div>
        <div className="text-sm text-gray-700">
          {user ? formatMoney(Math.floor(user.balance)) : ' '}
        </div>
      </div>
    </Col>
  )
}
