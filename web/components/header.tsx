import { Popover } from '@headlessui/react'
import Link from 'next/link'
import { useUser } from '../hooks/use-user'
import { firebaseLogin } from '../lib/firebase/users'

const navigation = [
  {
    name: 'About',
    href: 'https://mantic.notion.site/About-Mantic-Markets-46a1a0fb6e294011a8b6b582e276359f',
  },
  { name: 'Simulator', href: '/simulator' },
]

function SignInLink() {
  const user = useUser()

  return (
    <>
      {user ? (
        <>
          <Link href="/contract">
            <a className="text-base font-medium text-white hover:text-gray-300">
              Create a market
            </a>
          </Link>

          <Link href="/account">
            <a className="text-base font-medium text-green-400 hover:text-gray-300">
              {user.name}
            </a>
          </Link>
        </>
      ) : (
        <button
          className="text-base font-medium text-green-400  hover:text-gray-300"
          onClick={() => firebaseLogin()}
        >
          Sign In
        </button>
      )}
    </>
  )
}

export function Header() {
  return (
    <Popover as="header" className="relative">
      <div className="pt-6">
        <nav
          className="relative max-w-7xl mx-auto flex items-center justify-between px-4 sm:px-6 bg-dark-50"
          aria-label="Global"
        >
          <div className="flex items-center flex-1">
            <div className="flex items-center justify-between w-full md:w-auto">
              <Link href="/">
                <a className="inline-grid grid-flow-col align-items-center h-6 sm:h-10">
                  <img
                    className="w-auto h-6 sm:h-10 inline-block mr-3"
                    src="/logo-icon.svg"
                  />
                  <span className="text-white font-major-mono lowercase sm:text-2xl my-auto">
                    Mantic Markets
                  </span>
                </a>
              </Link>
            </div>

            <div className="space-x-8 md:flex md:ml-16">
              {navigation.map((item) => (
                <Link key={item.name} href={item.href}>
                  <a className="text-base font-medium text-white hover:text-gray-300">
                    {item.name}
                  </a>
                </Link>
              ))}
              <SignInLink />
            </div>
          </div>
        </nav>
      </div>
    </Popover>
  )
}
