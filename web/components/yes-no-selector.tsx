import clsx from 'clsx'
import React from 'react'
import { Row } from './layout/row'

export function YesNoSelector(props: {
  selected: 'YES' | 'NO'
  onSelect: (selected: 'YES' | 'NO') => void
  className?: string
}) {
  const { selected, onSelect, className } = props

  return (
    <Row className={clsx('space-x-3', className)}>
      <Button
        color={selected === 'YES' ? 'green' : 'gray'}
        onClick={() => onSelect('YES')}
      >
        YES
      </Button>

      <Button
        color={selected === 'NO' ? 'red' : 'gray'}
        onClick={() => onSelect('NO')}
      >
        NO
      </Button>
    </Row>
  )
}

export function YesNoCancelSelector(props: {
  selected: 'YES' | 'NO' | 'CANCEL' | undefined
  onSelect: (selected: 'YES' | 'NO' | 'CANCEL') => void
  className?: string
  btnClassName?: string
}) {
  const { selected, onSelect, className } = props

  const btnClassName = clsx('px-6', props.btnClassName)

  return (
    <Row className={clsx('space-x-3', className)}>
      <Button
        color={selected === 'YES' ? 'green' : 'gray'}
        onClick={() => onSelect('YES')}
        className={btnClassName}
      >
        YES
      </Button>

      <Button
        color={selected === 'NO' ? 'red' : 'gray'}
        onClick={() => onSelect('NO')}
        className={btnClassName}
      >
        NO
      </Button>

      <Button
        color={selected === 'CANCEL' ? 'yellow' : 'gray'}
        onClick={() => onSelect('CANCEL')}
        className={btnClassName}
      >
        N/A
      </Button>
    </Row>
  )
}

function Button(props: {
  className?: string
  onClick?: () => void
  color: 'green' | 'red' | 'yellow' | 'gray'
  children?: any
}) {
  const { className, onClick, children, color } = props

  return (
    <button
      type="button"
      className={clsx(
        'flex-1 inline-flex justify-center items-center px-8 py-3 border border-transparent rounded-md shadow-sm text-sm font-medium text-white',
        color === 'green' && 'btn-primary',
        color === 'red' && 'bg-red-400 hover:bg-red-500',
        color === 'yellow' && 'bg-yellow-400 hover:bg-yellow-500',
        color === 'gray' && 'text-gray-700 bg-gray-300 hover:bg-gray-400',
        className
      )}
      onClick={onClick}
    >
      {children}
    </button>
  )
}
