'use client'

import { type ABTest } from '@/lib/schemas/experimentSetup'
import SingleSelectQuestion from './common/SingleSelectQuestion'
import SinglePlayer from '../player/SinglePlayer'
import {
  type PartialResult,
  type ABResult
} from '@/lib/schemas/experimentState'
import { useEffect, useState } from 'react'
import { getSampleUrl } from './common/utils'

const ABTestComponent = ({
  testData,
  initialValues,
  experimentName,
  setAnswer
}: {
  testData: ABTest
  initialValues?: PartialResult<ABResult>
  experimentName: string
  setAnswer: (result: ABResult) => void
}): JSX.Element => {
  const { samples, questions } = testData

  const getInitialSelections = (): Record<string, string> => {
    if (initialValues?.selections == null) return {}

    const result: Record<string, string> = {}
    initialValues.selections.forEach((selection) => {
      result[selection.questionId] = selection.sampleId
    })
    return result
  }

  const [selected, setSelected] = useState<Record<string, string>>(
    getInitialSelections()
  )

  const updateSelections = (questionId: string, sampleIdx: number): void => {
    const selectedSampleId = samples[sampleIdx].sampleId
    setSelected((prev) => ({
      ...prev,
      [questionId]: selectedSampleId
    }))
  }

  useEffect(() => {
    const result: ABResult = {
      testNumber: testData.testNumber,
      selections: Object.keys(selected).map((questionId) => ({
        questionId,
        sampleId: selected[questionId]
      }))
    }
    setAnswer(result)
  }, [setAnswer, selected, testData.testNumber])

  return (
    <div className="bg-white rounded-md p-lg flex flex-col items-center text-black">
      <div className="flex gap-md mt-md">
        {samples.map((sample, idx) => (
          <SinglePlayer
            key={`sample_player_${idx}`}
            assetPath={getSampleUrl(experimentName, sample.assetPath)}
            name={`Sample ${idx + 1}`}
          />
        ))}
      </div>
      <div className="flex flex-col gap-sm w-full mt-md">
        {questions.map((question, idx) => (
          <SingleSelectQuestion
            key={`question_${idx}`}
            text={question.text}
            sampleNames={Array.from(
              { length: samples.length },
              (_, i) => `Sample ${i + 1}`
            )}
            onOptionSelect={(selectedIdx) => {
              updateSelections(question.questionId, selectedIdx)
            }}
            initialSelection={samples.findIndex(
              (s) => s.sampleId === selected[question.questionId]
            )}
          />
        ))}
      </div>
    </div>
  )
}

export default ABTestComponent
