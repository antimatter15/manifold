import clsx from 'clsx'
import _ from 'lodash'

import { User } from '../../../common/user'
import { Row } from '../layout/row'
import { CATEGORIES, FEED_CATEGORY_LIST } from '../../../common/categories'
import { updateUser } from '../../lib/firebase/users'

export function CategorySelector(props: {
  user: User | null | undefined
  className?: string
}) {
  const { className, user } = props

  const followedCategories = user?.followedCategories ?? []

  return (
    <Row
      className={clsx(
        'carousel carousel-center mx-2 items-center space-x-2 pt-4 pb-4',
        className
      )}
    >
      <div className="mr-1 hidden text-gray-500 sm:flex">Categories</div>

      <CategoryButton
        key={'all' + followedCategories.length}
        category="All"
        isFollowed={followedCategories.length === 0}
        toggle={async () => {
          if (!user?.id) return

          await updateUser(user.id, {
            followedCategories: [],
          })
        }}
      />

      {FEED_CATEGORY_LIST.map((cat) => (
        <CategoryButton
          key={cat + followedCategories.length}
          category={CATEGORIES[cat].split(' ')[0]}
          isFollowed={followedCategories.includes(cat)}
          toggle={async () => {
            if (!user?.id) return

            await updateUser(user.id, {
              followedCategories: !followedCategories.includes(cat)
                ? _.union([cat], followedCategories)
                : _.difference(followedCategories, [cat]),
            })
          }}
        />
      ))}
    </Row>
  )
}

function CategoryButton(props: {
  category: string
  isFollowed: boolean
  toggle: () => void
}) {
  const { toggle, category, isFollowed } = props

  return (
    <div
      className={clsx(
        'rounded-full border-2 px-4 py-1 shadow-md',
        'cursor-pointer',
        isFollowed ? 'border-gray-300 bg-gray-300' : 'bg-white'
      )}
      onClick={toggle}
    >
      <span className="text-sm text-gray-500">{category}</span>
    </div>
  )
}
