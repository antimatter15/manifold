import {
  HomeIcon,
  UserGroupIcon,
  CakeIcon,
  SearchIcon,
  ChatIcon,
  BookOpenIcon,
  DotsHorizontalIcon,
  CashIcon,
  HeartIcon,
  PresentationChartLineIcon,
} from '@heroicons/react/outline'
import clsx from 'clsx'
import _ from 'lodash'
import Link from 'next/link'
import { useRouter } from 'next/router'
import { useFollowedFolds } from '../../hooks/use-fold'
import { useUser } from '../../hooks/use-user'
import { firebaseLogin, firebaseLogout } from '../../lib/firebase/users'
import { ManifoldLogo } from './manifold-logo'
import { MenuButton } from './menu'
import { getNavigationOptions, ProfileSummary } from './profile-menu'
import { useHasCreatedContractToday } from '../../hooks/use-has-created-contract-today'

// Create an icon from the url of an image
function IconFromUrl(url: string): React.ComponentType<{ className?: string }> {
  return function Icon(props) {
    return <img src={url} className={clsx(props.className, 'h-6 w-6')} />
  }
}

const navigation = [
  { name: 'Home', href: '/home', icon: HomeIcon },
  { name: 'Explore', href: '/markets', icon: SearchIcon },
  { name: 'Portfolio', href: '/portfolio', icon: PresentationChartLineIcon },
  { name: 'Charity', href: '/charity', icon: HeartIcon },
]

const signedOutNavigation = [
  { name: 'Home', href: '/home', icon: HomeIcon },
  { name: 'Explore', href: '/markets', icon: SearchIcon },
  { name: 'Charity', href: '/charity', icon: HeartIcon },
  { name: 'About', href: 'https://docs.manifold.markets', icon: BookOpenIcon },
]

const signedOutMobileNavigation = [
  { name: 'Charity', href: '/charity', icon: HeartIcon },
  { name: 'Leaderboards', href: '/leaderboards', icon: CakeIcon },
  { name: 'Discord', href: 'https://discord.gg/eHQBNBqXuh', icon: IconFromUrl("/discord-logo.svg") },
  { name: 'Twitter', href: 'https://twitter.com/ManifoldMarkets', icon: IconFromUrl("/twitter-logo.svg") },
  { name: 'About', href: 'https://docs.manifold.markets', icon: BookOpenIcon },
]

const mobileNavigation = [
  { name: 'Add funds', href: '/add-funds', icon: CashIcon },
  ...signedOutMobileNavigation,
]

type Item = {
  name: string
  href: string
  icon: React.ComponentType<{ className?: string }>
}

function SidebarItem(props: { item: Item; currentPage: string }) {
  const { item, currentPage } = props
  return (
    <Link href={item.href} key={item.name}>
      <a
        className={clsx(
          item.href == currentPage
            ? 'bg-gray-200 text-gray-900'
            : 'text-gray-600 hover:bg-gray-100',
          'group flex items-center rounded-md px-3 py-2 text-sm font-medium'
        )}
        aria-current={item.href == currentPage ? 'page' : undefined}
      >
        <item.icon
          className={clsx(
            item.href == currentPage
              ? 'text-gray-500'
              : 'text-gray-400 group-hover:text-gray-500',
            '-ml-1 mr-3 h-6 w-6 flex-shrink-0'
          )}
          aria-hidden="true"
        />
        <span className="truncate">{item.name}</span>
      </a>
    </Link>
  )
}

function MoreButton() {
  return (
    <a className="group flex items-center rounded-md px-3 py-2 text-sm font-medium text-gray-600 hover:cursor-pointer hover:bg-gray-100">
      <DotsHorizontalIcon
        className="-ml-1 mr-3 h-6 w-6 flex-shrink-0 text-gray-400 group-hover:text-gray-500"
        aria-hidden="true"
      />
      <span className="truncate">More</span>
    </a>
  )
}

export default function Sidebar() {
  const router = useRouter()
  const currentPage = router.pathname

  const user = useUser()
  let folds = useFollowedFolds(user) || []
  folds = _.sortBy(folds, 'followCount').reverse()
  const deservesDailyFreeMarket = !useHasCreatedContractToday(user)

  const navigationOptions = user === null ? signedOutNavigation : navigation
  const mobileNavigationOptions =
    user === null ? signedOutMobileNavigation : mobileNavigation

  return (
    <nav aria-label="Sidebar" className="sticky top-4 divide-gray-300 pl-2">
      <div className="space-y-1 pb-6">
        <ManifoldLogo twoLine />
      </div>

      <div className="mb-2" style={{ minHeight: 80 }}>
        {user ? (
          <Link href={`/${user.username}`}>
            <a className="group">
              <ProfileSummary user={user} />
            </a>
          </Link>
        ) : user === null ? (
          <div className="py-6 text-center">
            <button
              className="btn btn-sm px-6 font-medium normal-case "
              style={{
                backgroundColor: 'white',
                border: '2px solid',
                color: '#3D4451',
              }}
              onClick={firebaseLogin}
            >
              Sign in
            </button>
          </div>
        ) : (
          <div />
        )}
      </div>

      <div className="space-y-1 lg:hidden">
        {mobileNavigationOptions.map((item) => (
          <SidebarItem key={item.name} item={item} currentPage={currentPage} />
        ))}

        {user && (
          <MenuButton
            menuItems={[
              { name: 'Sign out', href: '#', onClick: () => firebaseLogout() },
            ]}
            buttonContent={<MoreButton />}
          />
        )}
      </div>

      <div className="hidden space-y-1 lg:block">
        {navigationOptions.map((item) => (
          <SidebarItem key={item.name} item={item} currentPage={currentPage} />
        ))}

        <MenuButton
          menuItems={getNavigationOptions(user)}
          buttonContent={<MoreButton />}
        />
      </div>

      {deservesDailyFreeMarket ? (
        <div className=" text-primary mt-4 text-center">
          Use your daily free market! 🎉
        </div>
      ) : (
        <div />
      )}

      {user && (
        <div className={'aligncenter flex justify-center'}>
          <Link href={'/create'}>
            <button className="btn btn-primary btn-md mt-4 capitalize">
              Create Market
            </button>
          </Link>
        </div>
      )}
    </nav>
  )
}
