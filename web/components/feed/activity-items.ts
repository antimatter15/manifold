import _ from 'lodash'

import { Answer } from '../../../common/answer'
import { Bet } from '../../../common/bet'
import { getOutcomeProbability } from '../../../common/calculate'
import { Comment } from '../../../common/comment'
import { Contract } from '../../../common/contract'
import { User } from '../../../common/user'
import { filterDefined } from '../../../common/util/array'
import { mapCommentsByBetId } from '../../lib/firebase/comments'

export type ActivityItem =
  | DescriptionItem
  | QuestionItem
  | BetItem
  | CommentItem
  | CreateAnswerItem
  | BetGroupItem
  | AnswerGroupItem
  | CloseItem
  | ResolveItem

type BaseActivityItem = {
  id: string
  contract: Contract
}

export type DescriptionItem = BaseActivityItem & {
  type: 'description'
}

export type QuestionItem = BaseActivityItem & {
  type: 'question'
  showDescription: boolean
}

export type BetItem = BaseActivityItem & {
  type: 'bet'
  bet: Bet
  hideOutcome: boolean
}

export type CommentItem = BaseActivityItem & {
  type: 'comment'
  comment: Comment
  bet: Bet
  hideOutcome: boolean
  truncate: boolean
}

export type CreateAnswerItem = BaseActivityItem & {
  type: 'createanswer'
  answer: Answer
}

export type BetGroupItem = BaseActivityItem & {
  type: 'betgroup'
  bets: Bet[]
  hideOutcome: boolean
}

export type AnswerGroupItem = BaseActivityItem & {
  type: 'answergroup'
  answer: Answer
  items: ActivityItem[]
}

export type CloseItem = BaseActivityItem & {
  type: 'close'
}

export type ResolveItem = BaseActivityItem & {
  type: 'resolve'
}

const DAY_IN_MS = 24 * 60 * 60 * 1000

// Group together bets that are:
// - Within `windowMs` of the first in the group
// - Do not have a comment
// - Were not created by this user or the contract creator
// Return a list of ActivityItems
function groupBets(
  bets: Bet[],
  comments: Comment[],
  windowMs: number,
  contract: Contract,
  userId: string | undefined,
  options: {
    hideOutcome: boolean
    abbreviated: boolean
  }
) {
  const { hideOutcome, abbreviated } = options

  const commentsMap = mapCommentsByBetId(comments)
  const items: ActivityItem[] = []
  let group: Bet[] = []

  // Turn the current group into an ActivityItem
  function pushGroup() {
    if (group.length == 1) {
      items.push(toActivityItem(group[0]))
    } else if (group.length > 1) {
      items.push({
        type: 'betgroup',
        bets: [...group],
        id: group[0].id,
        contract,
        hideOutcome,
      })
    }
    group = []
  }

  function toActivityItem(bet: Bet): ActivityItem {
    const comment = commentsMap[bet.id]
    return comment
      ? {
          type: 'comment' as const,
          id: bet.id,
          comment,
          bet,
          contract,
          hideOutcome,
          truncate: abbreviated,
        }
      : {
          type: 'bet' as const,
          id: bet.id,
          bet,
          contract,
          hideOutcome,
        }
  }

  for (const bet of bets) {
    const isCreator = userId === bet.userId

    if (commentsMap[bet.id] || isCreator) {
      pushGroup()
      // Create a single item for this
      items.push(toActivityItem(bet))
    } else {
      if (
        group.length > 0 &&
        bet.createdTime - group[0].createdTime > windowMs
      ) {
        // More than `windowMs` has passed; start a new group
        pushGroup()
      }
      group.push(bet)
    }
  }
  if (group.length > 0) {
    pushGroup()
  }
  return abbreviated ? items.slice(-3) : items
}

function getAnswerGroups(
  contract: Contract,
  bets: Bet[],
  comments: Comment[],
  user: User | undefined | null,
  options: {
    sortByProb: boolean
    abbreviated: boolean
  }
) {
  const { sortByProb, abbreviated } = options

  let outcomes = _.uniq(bets.map((bet) => bet.outcome)).filter(
    (outcome) => getOutcomeProbability(contract.totalShares, outcome) > 0.01
  )
  if (abbreviated) outcomes = outcomes.slice(-2)
  if (sortByProb) {
    outcomes = _.sortBy(
      outcomes,
      (outcome) => -1 * getOutcomeProbability(contract.totalShares, outcome)
    )
  }

  const answerGroups = outcomes.map((outcome) => {
    const answerBets = bets.filter((bet) => bet.outcome === outcome)
    const answerComments = comments.filter((comment) =>
      answerBets.some((bet) => bet.id === comment.betId)
    )
    const answer = contract.answers?.find(
      (answer) => answer.id === outcome
    ) as Answer

    let items = groupBets(
      answerBets,
      answerComments,
      DAY_IN_MS,
      contract,
      user?.id,
      { hideOutcome: true, abbreviated }
    )

    if (abbreviated) items = items.slice(-2)

    return {
      id: outcome,
      type: 'answergroup' as const,
      contract,
      answer,
      items,
      user,
    }
  })

  return answerGroups
}

export function getAllContractActivityItems(
  contract: Contract,
  bets: Bet[],
  comments: Comment[],
  user: User | null | undefined,
  filterToOutcome: string | undefined,
  options: {
    abbreviated: boolean
  }
) {
  const { abbreviated } = options
  const { outcomeType } = contract

  bets =
    outcomeType === 'BINARY'
      ? bets.filter((bet) => !bet.isAnte)
      : bets.filter((bet) => !(bet.isAnte && (bet.outcome as string) === '0'))

  let answer: Answer | undefined
  if (filterToOutcome) {
    bets = bets.filter((bet) => bet.outcome === filterToOutcome)
    answer = contract.answers?.find((answer) => answer.id === filterToOutcome)
  }

  const items: ActivityItem[] =
    filterToOutcome && answer
      ? [{ type: 'createanswer', id: answer.id, contract, answer }]
      : abbreviated
      ? [{ type: 'question', id: '0', contract, showDescription: false }]
      : [{ type: 'description', id: '0', contract }]

  items.push(
    ...(outcomeType === 'FREE_RESPONSE' && !filterToOutcome
      ? getAnswerGroups(contract, bets, comments, user, {
          sortByProb: true,
          abbreviated,
        })
      : groupBets(bets, comments, DAY_IN_MS, contract, user?.id, {
          hideOutcome: !!filterToOutcome,
          abbreviated,
        }))
  )

  if (contract.closeTime && contract.closeTime <= Date.now()) {
    items.push({ type: 'close', id: `${contract.closeTime}`, contract })
  }
  if (contract.resolution) {
    items.push({ type: 'resolve', id: `${contract.resolutionTime}`, contract })
  }

  return items
}

export function getRecentContractActivityItems(
  contract: Contract,
  bets: Bet[],
  comments: Comment[],
  user: User | null | undefined
) {
  bets = bets.sort((b1, b2) => b1.createdTime - b2.createdTime)
  comments = comments.sort((c1, c2) => c1.createdTime - c2.createdTime)

  const questionItem: QuestionItem = {
    type: 'question',
    id: '0',
    contract,
    showDescription: false,
  }

  const answerItems =
    contract.outcomeType === 'FREE_RESPONSE'
      ? getAnswerGroups(contract, bets, comments, user, {
          sortByProb: false,
          abbreviated: true,
        })
      : groupBets(bets, comments, DAY_IN_MS, contract, user?.id, {
          hideOutcome: false,
          abbreviated: true,
        })

  return [questionItem, ...answerItems]
}
