import type { ReactNode } from 'react'
import { Link } from 'react-router-dom'

interface DrillCardProps {
  to: string
  title: string
  description: string
  children: ReactNode
}

export function DrillCard({
  to,
  title,
  description,
  children,
}: DrillCardProps) {
  return (
    <Link
      to={to}
      className="block rounded-lg border-2 border-transparent bg-white p-6 shadow-md transition-shadow duration-300 hover:border-indigo-400 hover:shadow-xl"
    >
      <h3 className="mb-3 text-xl font-bold text-gray-800">{title}</h3>
      <p className="mb-3 text-gray-600">{description}</p>
      {children}
    </Link>
  )
}

interface DrillExampleProps {
  question: string
  answer: string
}

export function DrillExample({ question, answer }: DrillExampleProps) {
  return (
    <div className="rounded-lg bg-gray-50 p-3 text-center">
      <div className="mb-1 text-2xl font-bold text-indigo-900">{question}</div>
      <div className="text-sm text-gray-500">
        答え：<span className="font-bold text-green-600">{answer}</span>
      </div>
    </div>
  )
}
