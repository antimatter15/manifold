import _ from 'lodash'
import Link from 'next/link'
import { useEffect, useState } from 'react'
import { Fold } from '../../common/fold'
import { CreateFoldButton } from '../components/create-fold-button'
import { Col } from '../components/layout/col'
import { Row } from '../components/layout/row'
import { Page } from '../components/page'
import { SiteLink } from '../components/site-link'
import { Title } from '../components/title'
import { UserLink } from '../components/user-page'
import { useFolds } from '../hooks/use-fold'
import { useUser } from '../hooks/use-user'
import { foldPath, listAllFolds } from '../lib/firebase/folds'
import { getUser, User } from '../lib/firebase/users'

export async function getStaticProps() {
  const folds = await listAllFolds().catch((_) => [])

  const curators = await Promise.all(
    folds.map((fold) => getUser(fold.curatorId))
  )
  const curatorsDict = _.fromPairs(
    curators.map((curator) => [curator.id, curator])
  )

  return {
    props: {
      folds,
      curatorsDict,
    },

    revalidate: 60, // regenerate after a minute
  }
}

export default function Folds(props: {
  folds: Fold[]
  curatorsDict: _.Dictionary<User>
}) {
  const [curatorsDict, setCuratorsDict] = useState(props.curatorsDict)

  const folds = useFolds() ?? props.folds
  const user = useUser()

  useEffect(() => {
    // Load User object for curator of new Folds.
    const newFolds = folds.filter(({ curatorId }) => !curatorsDict[curatorId])
    if (newFolds.length > 0) {
      Promise.all(newFolds.map(({ curatorId }) => getUser(curatorId))).then(
        (newUsers) => {
          const newUsersDict = _.fromPairs(
            newUsers.map((user) => [user.id, user])
          )
          setCuratorsDict({ ...curatorsDict, ...newUsersDict })
        }
      )
    }
  })

  return (
    <Page>
      <Col className="items-center">
        <Col className="max-w-lg w-full px-2 sm:px-0">
          <Row className="justify-between items-center">
            <Title text="Folds" />
            {user && <CreateFoldButton />}
          </Row>

          <div className="text-gray-500 mb-6">
            Browse Manifold communities, called folds.
          </div>

          <Col className="gap-2">
            {folds.map((fold) => (
              <Col
                key={fold.id}
                className="bg-white p-4 rounded-xl gap-1 relative"
              >
                <Link href={foldPath(fold)}>
                  <a className="absolute left-0 right-0 top-0 bottom-0" />
                </Link>
                <Row className="justify-between items-center gap-2">
                  <SiteLink href={foldPath(fold)}>{fold.name}</SiteLink>
                  <button className="btn btn-secondary btn-sm z-10 mb-1">
                    Follow
                  </button>
                </Row>
                <Row className="items-center gap-2 text-gray-500 text-sm">
                  <div>12 followers</div>
                  <div>•</div>
                  <Row>
                    <div className="mr-1">Curated by</div>
                    <UserLink
                      className="text-neutral"
                      name={curatorsDict[fold.curatorId]?.name ?? ''}
                      username={curatorsDict[fold.curatorId]?.username ?? ''}
                    />
                  </Row>
                </Row>
                <div className="text-gray-500 text-sm">{fold.about}</div>
              </Col>
            ))}
          </Col>
        </Col>
      </Col>
    </Page>
  )
}
