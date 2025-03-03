import { firebaseLogout, User } from '../../lib/firebase/users'
import { formatMoney } from '../../../common/util/format'
import { Avatar } from '../avatar'
import { IS_PRIVATE_MANIFOLD } from '../../../common/envs/constants'
import { Row } from '../layout/row'

export function getNavigationOptions(user?: User | null) {
  if (IS_PRIVATE_MANIFOLD) {
    return [{ name: 'Leaderboards', href: '/leaderboards' }]
  }

  if (!user) {
    return [
      { name: 'Leaderboards', href: '/leaderboards' },
      { name: 'Discord', href: 'https://discord.gg/eHQBNBqXuh' },
      { name: 'Twitter', href: 'https://twitter.com/ManifoldMarkets' },
    ]
  }

  return [
    { name: 'Add funds', href: '/add-funds' },
    { name: 'Leaderboards', href: '/leaderboards' },
    { name: 'Discord', href: 'https://discord.gg/eHQBNBqXuh' },
    { name: 'Twitter', href: 'https://twitter.com/ManifoldMarkets' },
    { name: 'About', href: 'https://docs.manifold.markets' },
    { name: 'Sign out', href: '#', onClick: () => firebaseLogout() },
  ]
}

export function ProfileSummary(props: { user: User | undefined }) {
  const { user } = props
  return (
    <Row className="group items-center gap-4 rounded-md py-3 text-gray-500 group-hover:bg-gray-100 group-hover:text-gray-700">
      <Avatar avatarUrl={user?.avatarUrl} username={user?.username} noLink />

      <div className="truncate text-left">
        <div>{user?.name}</div>
        <div className="text-sm">
          {user ? formatMoney(Math.floor(user.balance)) : ' '}
        </div>
      </div>
    </Row>
  )
}
