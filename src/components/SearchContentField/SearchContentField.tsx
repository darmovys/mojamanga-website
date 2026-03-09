import { Search } from 'lucide-react'
import styles from './SearchContentField.module.scss'
import clsx from 'clsx'

export interface SearchContentFieldProps {
  className?: string
}

export default function SearchContentField({ className }: SearchContentFieldProps) {
  return (
    <div className={clsx(styles.Wrapper, className)}>
      <Search className={styles.SearchIcon} size={20} />
      <input placeholder="Що шукаємо?" className={styles.SearchField} />
    </div>
  )
}
