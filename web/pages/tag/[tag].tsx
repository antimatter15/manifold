import { useRouter } from 'next/router'
import { SearchableGrid } from '../../components/contracts-list'
import { Page } from '../../components/page'
import { Title } from '../../components/title'
import { useContracts } from '../../hooks/use-contracts'
import { useQueryAndSortParams } from '../../hooks/use-sort-and-query-params'
import { Contract, listAllContracts } from '../../lib/firebase/contracts'

export async function getStaticProps() {
  const contracts = await listAllContracts().catch((_) => [])
  return {
    props: {
      contracts,
    },

    revalidate: 60, // regenerate after a minute
  }
}

export async function getStaticPaths() {
  return { paths: [], fallback: 'blocking' }
}

export default function TagPage(props: { contracts: Contract[] }) {
  const router = useRouter()
  const { tag } = router.query as { tag: string }

  const contracts = useContracts()

  const taggedContracts = (contracts ?? props.contracts).filter((contract) =>
    contract.lowercaseTags.includes(tag.toLowerCase())
  )

  const { query, setQuery, sort, setSort } = useQueryAndSortParams({
    defaultSort: 'most-traded',
  })

  return (
    <Page>
      <Title text={`#${tag}`} />
      <SearchableGrid
        contracts={taggedContracts}
        query={query}
        setQuery={setQuery}
        sort={sort}
        setSort={setSort}
      />
    </Page>
  )
}
