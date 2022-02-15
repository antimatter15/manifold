import clsx from 'clsx'
import { useEffect, useRef, useState } from 'react'
import Textarea from 'react-expanding-textarea'
import { XIcon } from '@heroicons/react/solid'

import { Answer } from '../../common/answer'
import { Contract } from '../../common/contract'
import { AmountInput } from './amount-input'
import { Col } from './layout/col'
import { createAnswer, placeBet } from '../lib/firebase/api-call'
import { Row } from './layout/row'
import { Avatar } from './avatar'
import { SiteLink } from './site-link'
import { DateTimeTooltip } from './datetime-tooltip'
import dayjs from 'dayjs'
import { BuyButton } from './yes-no-selector'
import { Spacer } from './layout/spacer'
import {
  formatMoney,
  formatPercent,
  formatWithCommas,
} from '../../common/util/format'
import { InfoTooltip } from './info-tooltip'
import { useUser } from '../hooks/use-user'
import {
  getProbabilityAfterBet,
  getOutcomeProbability,
  calculateShares,
  calculatePayoutAfterCorrectBet,
} from '../../common/calculate'
import { firebaseLogin } from '../lib/firebase/users'
import { Bet } from '../../common/bet'

export function AnswersPanel(props: {
  contract: Contract<'MULTI'>
  answers: Answer[]
}) {
  const { contract, answers } = props

  return (
    <Col className="gap-4">
      {answers.map((answer) => (
        <AnswerItem key={answer.id} answer={answer} contract={contract} />
      ))}
      <CreateAnswerInput contract={contract} />
    </Col>
  )
}

function AnswerItem(props: { answer: Answer; contract: Contract<'MULTI'> }) {
  const { answer, contract } = props
  const { username, avatarUrl, name, createdTime } = answer

  const createdDate = dayjs(createdTime).format('MMM D')
  const prob = getOutcomeProbability(contract.totalShares, answer.id)
  const probPercent = formatPercent(prob)

  const [isBetting, setIsBetting] = useState(false)

  return (
    <Col className="p-2 sm:flex-row">
      <Row className="flex-1">
        <Col className="gap-2 flex-1">
          <div>{answer.text}</div>

          <Row className="text-gray-500 text-sm gap-2 items-center">
            <SiteLink className="relative" href={`/${username}`}>
              <Row className="items-center gap-2">
                <Avatar avatarUrl={avatarUrl} size={6} />
                <div className="truncate">{name}</div>
              </Row>
            </SiteLink>

            <div className="">•</div>

            <div className="whitespace-nowrap">
              <DateTimeTooltip text="" time={contract.createdTime}>
                {createdDate}
              </DateTimeTooltip>
            </div>
          </Row>
        </Col>

        {!isBetting && (
          <Col className="sm:flex-row items-center gap-4">
            <div className="text-2xl text-green-500">{probPercent}</div>
            <BuyButton
              className="justify-end self-end flex-initial btn-md !px-4 sm:!px-8"
              onClick={() => {
                setIsBetting(true)
              }}
            />
          </Col>
        )}
      </Row>

      {isBetting && (
        <AnswerBetPanel
          answer={answer}
          contract={contract}
          closePanel={() => setIsBetting(false)}
        />
      )}
    </Col>
  )
}

function AnswerBetPanel(props: {
  answer: Answer
  contract: Contract<'MULTI'>
  closePanel: () => void
}) {
  const { answer, contract, closePanel } = props
  const { id: answerId } = answer

  const user = useUser()
  const [betAmount, setBetAmount] = useState<number | undefined>(undefined)

  const [error, setError] = useState<string | undefined>()
  const [isSubmitting, setIsSubmitting] = useState(false)

  const inputRef = useRef<HTMLElement>(null)
  useEffect(() => {
    inputRef.current && inputRef.current.focus()
  }, [])

  async function submitBet() {
    if (!user || !betAmount) return

    if (user.balance < betAmount) {
      setError('Insufficient balance')
      return
    }

    setError(undefined)
    setIsSubmitting(true)

    const result = await placeBet({
      amount: betAmount,
      outcome: answerId,
      contractId: contract.id,
    }).then((r) => r.data as any)

    console.log('placed bet. Result:', result)

    if (result?.status === 'success') {
      closePanel()
    } else {
      setError(result?.error || 'Error placing bet')
      setIsSubmitting(false)
    }
  }

  const betDisabled = isSubmitting || !betAmount || error

  const initialProb = getOutcomeProbability(contract.totalShares, answer.id)

  const resultProb = getProbabilityAfterBet(
    contract.totalShares,
    answerId,
    betAmount ?? 0
  )

  const shares = calculateShares(contract.totalShares, betAmount ?? 0, answerId)

  const currentPayout = betAmount
    ? calculatePayoutAfterCorrectBet(
        contract as any as Contract,
        {
          outcome: answerId,
          amount: betAmount,
          shares,
        } as Bet
      )
    : 0

  const currentReturn = betAmount ? (currentPayout - betAmount) / betAmount : 0
  const currentReturnPercent = (currentReturn * 100).toFixed() + '%'

  return (
    <Col className="items-start">
      <Row className="self-stretch items-center justify-between">
        <div className="text-xl">Buy this answer</div>

        <button className="btn-ghost btn-circle" onClick={closePanel}>
          <XIcon className="w-8 h-8 text-gray-500 mx-auto" aria-hidden="true" />
        </button>
      </Row>
      <div className="my-3 text-left text-sm text-gray-500">Amount </div>
      <AmountInput
        inputClassName="w-full"
        amount={betAmount}
        onChange={setBetAmount}
        error={error}
        setError={setError}
        disabled={isSubmitting}
        inputRef={inputRef}
      />

      <Spacer h={4} />

      <div className="mt-2 mb-1 text-sm text-gray-500">Implied probability</div>
      <Row>
        <div>{formatPercent(initialProb)}</div>
        <div className="mx-2">→</div>
        <div>{formatPercent(resultProb)}</div>
      </Row>

      <Spacer h={4} />

      <Row className="mt-2 mb-1 items-center gap-2 text-sm text-gray-500">
        Potential payout
        <InfoTooltip
          text={`Current payout for ${formatWithCommas(
            shares
          )} / ${formatWithCommas(
            shares + contract.totalShares[answerId]
          )} shares`}
        />
      </Row>
      <div>
        {formatMoney(currentPayout)}
        &nbsp; <span>(+{currentReturnPercent})</span>
      </div>

      <Spacer h={6} />

      {user ? (
        <button
          className={clsx(
            'btn',
            betDisabled ? 'btn-disabled' : 'btn-primary',
            isSubmitting ? 'loading' : ''
          )}
          onClick={betDisabled ? undefined : submitBet}
        >
          {isSubmitting ? 'Submitting...' : 'Submit trade'}
        </button>
      ) : (
        <button
          className="btn mt-4 whitespace-nowrap border-none bg-gradient-to-r from-teal-500 to-green-500 px-10 text-lg font-medium normal-case hover:from-teal-600 hover:to-green-600"
          onClick={firebaseLogin}
        >
          Sign in to trade!
        </button>
      )}
    </Col>
  )
}

function CreateAnswerInput(props: { contract: Contract<'MULTI'> }) {
  const { contract } = props
  const [text, setText] = useState('')
  const [betAmount, setBetAmount] = useState<number | undefined>(10)
  const [amountError, setAmountError] = useState<string | undefined>()
  const [isSubmitting, setIsSubmitting] = useState(false)

  const canSubmit = text && betAmount && !amountError && !isSubmitting

  const submitAnswer = async () => {
    if (canSubmit) {
      setIsSubmitting(true)
      console.log('submitting', { text, betAmount })
      const result = await createAnswer({
        contractId: contract.id,
        text,
        amount: betAmount,
      }).then((r) => r.data)

      console.log('submit complte', result)
      setIsSubmitting(false)

      if (result.status === 'success') {
        setText('')
        setBetAmount(10)
        setAmountError(undefined)
      }
    }
  }

  return (
    <Col className="gap-4 mt-2 px-2">
      <Col className="sm:flex-row gap-8">
        <Col className="flex-1 gap-2">
          <div className="text-gray-500 text-sm mb-1">Add your answer</div>
          <Textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            className="textarea textarea-bordered w-full"
            placeholder="Type your answer..."
            rows={1}
            maxLength={10000}
          />
          <button
            className={clsx(
              'btn btn-sm self-end mt-2',
              canSubmit ? 'btn-outline' : 'btn-disabled'
            )}
            disabled={!canSubmit}
            onClick={submitAnswer}
          >
            Submit answer & bet
          </button>
        </Col>
        <Col className={clsx('gap-2', text ? 'visible' : 'invisible')}>
          <div className="text-gray-500 text-sm">Bet amount</div>
          <AmountInput
            amount={betAmount}
            onChange={setBetAmount}
            error={amountError}
            setError={setAmountError}
            minimumAmount={10}
            disabled={isSubmitting}
          />
        </Col>
      </Col>
    </Col>
  )
}
