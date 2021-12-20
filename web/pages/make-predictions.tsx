import { useState } from 'react'
import { Col } from '../components/layout/col'
import { Row } from '../components/layout/row'
import { Spacer } from '../components/layout/spacer'
import { Linkify } from '../components/linkify'
import { Page } from '../components/page'
import { Title } from '../components/title'
import { useUser } from '../hooks/use-user'
import { createContract } from '../lib/service/create-contract'

type Prediction = {
  question: string
  description: string
  initalProb: number
}

function PredictionRow(props: { prediction: Prediction }) {
  const { prediction } = props
  return (
    <Row className="gap-4 justify-between hover:bg-gray-300 p-4">
      <Col className="justify-between">
        <div className="font-medium text-indigo-700 mb-2">
          <Linkify text={prediction.question} />
        </div>
        <div className="text-gray-500 text-sm">{prediction.description}</div>
      </Col>
      {/* Initial probability */}
      <div className="ml-auto">
        <div className="text-3xl">
          <div className="text-primary">
            {prediction.initalProb}%<div className="text-lg">chance</div>
          </div>
        </div>
      </div>
      {/* Current probability; hidden for now */}
      {/* <div>
        <div className="text-3xl">
          <div className="text-primary">
            {prediction.initalProb}%<div className="text-lg">chance</div>
          </div>
        </div>
      </div> */}
    </Row>
  )
}

function PredictionList(props: { predictions: Prediction[] }) {
  const { predictions } = props
  return (
    <div className="w-full bg-gray-100 rounded-lg shadow-xl px-6 py-4">
      <Col className="divide-gray-300 divide-y border-gray-300 border rounded-md">
        {predictions.map((prediction) => (
          <PredictionRow key={prediction.question} prediction={prediction} />
        ))}
      </Col>
    </div>
  )
}

const TEST_VALUE = `1. Biden approval rating (as per 538) is greater than 50%: 80%
2. Court packing is clearly going to happen (new justices don't have to be appointed by end of year): 5%
3. Yang is New York mayor: 80%
4. Newsom recalled as CA governor: 5%
5. At least $250 million in damage from BLM protests this year: 30%
6. Significant capital gains tax hike (above 30% for highest bracket): 20%`

export default function MakePredictions() {
  const user = useUser()
  const [predictionsString, setBulkContracts] = useState('')
  const [description, setDescription] = useState('')

  const bulkPlaceholder = `e.g.
${TEST_VALUE}
...
`

  const predictions: Prediction[] = []

  // Parse bulkContracts, then run createContract for each
  const lines = predictionsString.split('\n')
  for (const line of lines) {
    // Parse line with regex
    const matches = line.match(/^(.*):\s*(\d+)%\s*$/) || ['', '', '']
    const [_, question, prob] = matches

    if (!user || !question || !prob) {
      console.error('Invalid prediction: ', line)
      continue
    }

    predictions.push({
      question,
      description,
      initalProb: parseInt(prob),
    })
  }

  async function createContracts() {
    if (!user) {
      // TODO: Convey error with snackbar/toast
      console.error('You need to be signed in!')
      return
    }
    for (const prediction of predictions) {
      await createContract(
        prediction.question,
        prediction.description,
        prediction.initalProb,
        user
      )
      // TODO: Convey success in the UI
      console.log('Created contract: ', prediction.question)
    }
  }

  return (
    <Page>
      <Title text="Make Predictions" />
      <div className="w-full bg-gray-100 rounded-lg shadow-xl px-6 py-4">
        <form>
          <div className="form-control">
            <label className="label">
              <span className="label-text">Prediction</span>
            </label>

            <textarea
              className="textarea h-60 textarea-bordered"
              placeholder={bulkPlaceholder}
              value={predictionsString}
              onChange={(e) => setBulkContracts(e.target.value || '')}
            ></textarea>
          </div>
        </form>

        <Spacer h={4} />

        <div className="form-control w-full">
          <label className="label">
            <span className="label-text">Tags</span>
          </label>

          <input
            type="text"
            placeholder="e.g. #ACX2021 #World"
            className="input"
            value={description}
            onChange={(e) => setDescription(e.target.value || '')}
          />
        </div>
      </div>

      {predictions.length > 0 && (
        <div>
          <Spacer h={16} />
          <Title text="Preview" />
          <PredictionList predictions={predictions} />
        </div>
      )}

      <Spacer h={4} />

      <div className="flex justify-end my-4">
        <button
          type="submit"
          className="btn btn-primary"
          // disabled={isSubmitting || !question}
          onClick={(e) => {
            e.preventDefault()
            createContracts()
          }}
        >
          Create all
        </button>
      </div>
    </Page>
  )
}
