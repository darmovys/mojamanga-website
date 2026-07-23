import { HouseIcon } from 'lucide-react'
import ShiftBy from '../ShiftBy'
import styles from './EmailChangeAccepted.module.scss'
import { Link } from '@tanstack/react-router'

function EmailChangeAccepted() {
  return (
    <div className={styles.Wrapper}>
      <h1 className={styles.Heading}>
        Запит на зміну електронної пошти підтверджено
      </h1>
      <p className={styles.Paragraph}>
        На вашу нову адресу надійде лист для її верифікації.
        <br />
        Після підтвердження вашу електронну пошту буде остаточно змінено.
      </p>
      <Link to="/" className={styles.Link}>
        <ShiftBy y={-0.3}>
          <HouseIcon size={14} />
        </ShiftBy>
        На головну
      </Link>
    </div>
  )
}

export default EmailChangeAccepted
