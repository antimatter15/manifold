import router from 'next/router'
import { useEffect, useState } from 'react'

import { CreatorContractsList } from '../components/contracts-list'
import { Spacer } from '../components/layout/spacer'
import { Title } from '../components/title'
import { useUser } from '../hooks/use-user'
import { path } from '../lib/firebase/contracts'
import { createContract } from '../lib/service/create-contract'
import { Page } from '../components/page'

// Allow user to create a new contract
export default function NewContract() {
  const creator = useUser()

  useEffect(() => {
    if (creator === null) router.push('/')
  })

  const [initialProb, setInitialProb] = useState(50)
  const [question, setQuestion] = useState('')
  const [description, setDescription] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  async function submit() {
    // TODO: add more rigorous error handling for question
    if (!creator || !question) return

    setIsSubmitting(true)

    const contract = await createContract(
      question,
      description,
      initialProb,
      creator
    )
    await router.push(path(contract))
  }

  const descriptionPlaceholder = `e.g. This market will resolve to “Yes” if, by June 2, 2021, 11:59:59 PM ET, Paxlovid (also known under PF-07321332)...`

  if (!creator) return <></>

  return (
    <Page>
      <Title text="Create a new prediction market" />

      <div className="w-full bg-white rounded-lg shadow-md px-6 py-4">
        {/* Create a Tailwind form that takes in all the fields needed for a new contract */}
        {/* When the form is submitted, create a new contract in the database */}
        <form>
          <div className="form-control">
            <label className="label">
              <span className="label-text">Question</span>
            </label>

            <input
              type="text"
              placeholder="e.g. Will the FDA approve Paxlovid before Jun 2nd, 2022?"
              className="input input-bordered"
              value={question}
              onChange={(e) => setQuestion(e.target.value || '')}
            />
          </div>

          <Spacer h={4} />

          <div className="form-control">
            <label className="label">
              <span className="label-text">Description (optional)</span>
            </label>

            <textarea
              className="textarea h-24 textarea-bordered"
              placeholder={descriptionPlaceholder}
              value={description}
              onChange={(e) => setDescription(e.target.value || '')}
            ></textarea>
          </div>

          <Spacer h={4} />

          <div className="form-control">
            <label className="label">
              <span className="label-text">
                Initial probability: {initialProb}%
              </span>
            </label>

            <input
              type="range"
              className="range range-lg range-primary"
              min="1"
              max={99}
              value={initialProb}
              onChange={(e) => setInitialProb(parseInt(e.target.value))}
            />
          </div>

          <Spacer h={4} />

          <div className="flex justify-end my-4">
            <button
              type="submit"
              className="btn btn-primary"
              disabled={isSubmitting || !question}
              onClick={(e) => {
                e.preventDefault()
                submit()
              }}
            >
              Create market
            </button>
          </div>
        </form>
      </div>

      <Spacer h={10} />

      <Title text="Your markets" />

      {creator && <CreatorContractsList creator={creator} />}
    </Page>
  )
}
