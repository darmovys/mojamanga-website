import { Link as ClientLink } from '@tanstack/react-router'
import styles from './mdx-components.module.scss'
import { ExternalLink } from 'lucide-react'

type Children = {
  children: React.ReactNode
}

type LinkProps = Children & {
  to: string
}

type WarningProps = Children & {
  title: string
}

type Definition = {
  term: string
  description: React.ReactNode
}

type DefinitionTableProps = {
  termHeading: string
  descriptionHeading: string
  definitions: Definition[]
}

export const mdxComponents = {
  Body({ children }: Children) {
    return <div className={styles.Body}>{children}</div>
  },
  TextSection({ children }: Children) {
    return <div className={styles.TextSection}>{children}</div>
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
  Warning({ children, title }: WarningProps) {
    return (
      <aside className={styles.Warning}>
        <h2 className={styles.WarningTitle}>{title}</h2>
        {children}
      </aside>
    )
  },
  DefinitionTable({
    definitions,
    descriptionHeading,
    termHeading,
  }: DefinitionTableProps) {
    return (
      <div className={styles.DefinitionTableWrapper}>
        <dl className={styles.DefinitionTable}>
          <div className={styles.DefinitionHeader}>
            <div className={styles.DefinitionTermHeading}>{termHeading}</div>
            <div className={styles.DefinitionDescriptionHeading}>
              {descriptionHeading}
            </div>
          </div>

          {definitions.map(({ term, description }) => (
            <div className={styles.DefinitionRow} key={term}>
              <dt className={styles.DefinitionTerm}>{term}</dt>
              <dd className={styles.DefinitionDescription}>{description}</dd>
            </div>
          ))}
        </dl>
      </div>
    )
  },
}
