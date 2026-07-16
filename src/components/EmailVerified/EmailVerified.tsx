import { Link, useNavigate } from '@tanstack/react-router'
import { HouseIcon } from 'lucide-react'
import ShiftBy from '../ShiftBy/ShiftBy'
import { pluralize } from '@/lib/utils'
import { useEffect } from 'react'
import { useVerificationStore } from '@/stores/email-verification-store'
import styles from './EmailVerified.module.scss'

function EmailVerified() {
  const timeRemaining = useVerificationStore((s) => s.timeRemaining)
  const decrement = useVerificationStore((s) => s.decrement)
  const setTime = useVerificationStore((s) => s.setTime)
  const setExpired = useVerificationStore((s) => s.setExpired)
  const navigate = useNavigate({ from: '/email-verified' })

  useEffect(() => {
    if (timeRemaining <= 0) {
      setExpired(true)
      navigate({ to: '/', replace: true })
      return
    }

    const timer = setTimeout(() => {
      decrement()
    }, 1000)

    return () => clearTimeout(timer)
  }, [timeRemaining, decrement, setExpired, navigate])

  return (
    <div className={styles.Wrapper}>
      <h1 className={styles.Heading}>Пошта успішно підтверджена!</h1>
      <p className={styles.Paragraph}>
        Ця сторінка автоматично закриється через {timeRemaining}{' '}
        {pluralize(timeRemaining, ['секунду', 'секунди', 'секунд'])}
      </p>
      <Link onClick={() => setTime(0)} to="/" className={styles.Link}>
        <ShiftBy y={-0.3}>
          <HouseIcon size={14} />
        </ShiftBy>
        На головну
      </Link>
    </div>
  )
}

export default EmailVerified
