import { Link as ClientLink } from '@tanstack/react-router'
import styles from './mdx-components.module.scss'
import { ExternalLink } from 'lucide-react'

type Children = {
  children: React.ReactNode
}

type LinkProps = Children & {
  to: string
}

export const mdxComponents = {
  Body({ children }: Children) {
    return <div className={styles.Body}>{children}</div>
  },
  TextSection({ children }: Children) {
    return <p className={styles.TextSection}>{children}</p>
  },
  ol({ children }: Children) {
    return <ol className={styles.OrderedList}>{children}</ol>
  },
  Link({ children, to }: LinkProps) {
    return (
      <ClientLink className={styles.Link} to={to}>
        {children}
        <ExternalLink className={styles.LinkIcon} size={14} />
      </ClientLink>
    )
  },
}
