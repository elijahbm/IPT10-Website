import type { ReactNode } from 'react'

type ArrowLinkProps = {
  children: ReactNode
  href: string
  className?: string
}

function ArrowLink({ children, href, className = '' }: ArrowLinkProps) {
  return (
    <a className={`arrow-link ${className}`} href={href}>
      {children}<span aria-hidden="true">↗</span>
    </a>
  )
}

export default ArrowLink