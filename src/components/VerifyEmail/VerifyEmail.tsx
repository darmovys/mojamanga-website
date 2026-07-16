import { useTransition } from 'react'
import MotionButton from '../MotionButton'
import { useSuspenseQuery } from '@tanstack/react-query'
import { authQueries } from '@/services/queries'
import { showAuthToast, showTimedToast } from '@/lib/toast'
import { authClient } from '@/lib/auth-client'
import { motion } from 'motion/react'
import { LoaderCircleIcon } from 'lucide-react'
import styles from './VerifyEmail.module.scss'

function VerifyEmail() {
  const { data: authState } = useSuspenseQuery(authQueries.user())
  const [isSending, startTransition] = useTransition()

  function sendVerificationEmail() {
    if (!authState.isAuthenticated) {
      return showAuthToast()
    }

    if (authState.user.emailVerified) {
      return showTimedToast({
        type: 'warning',
        title: 'Ваша електронна пошта вже підтверджена',
      })
    }

    startTransition(async () => {
      const { error } = await authClient.sendVerificationEmail({
        email: authState.user.email,
        callbackURL: '/email-verified',
      })
      if (error) {
        showTimedToast(
          { type: 'error', title: 'Помилка', description: error.message },
          4000,
        )
        return
      }
      showTimedToast(
        {
          type: 'success',
          title: 'Успіх',
          description: 'Лист було надіслано',
        },
        4000,
      )
    })
  }
  return (
    <div className={styles.Wrapper}>
      <h1 className={styles.Heading}>Підтвердьте електронну пошту</h1>
      <p className={styles.Paragraph}>
        Лист з підтвердженням був надісланий на вашу пошту
      </p>
      <MotionButton
        className={styles.Button}
        disabled={isSending}
        focusableWhenDisabled={true}
        onClick={sendVerificationEmail}
        layout
        transition={{
          type: 'spring',
          stiffness: 380,
          damping: 30,
        }}
      >
        <motion.span
          key={isSending ? 'sending' : 'idle'}
          initial={{
            opacity: 0,
            filter: 'blur(4px)',
          }}
          animate={{
            opacity: 1,
            filter: 'blur(0px)',
          }}
          exit={{
            opacity: 0,
            filter: 'blur(4px)',
          }}
          transition={{
            type: 'spring',
            duration: 0.6,
            bounce: 0,
          }}
          // layout="position" запобігає деформації/розтягуванню тексту
          layout="position"
          style={{ display: 'flex', alignItems: 'center', gap: 'var(--4px)' }}
        >
          {isSending ? (
            <>
              <LoaderCircleIcon className={styles.Loader} size={14} />
              Надсилаємо...
            </>
          ) : (
            'Надіслати повторно'
          )}
        </motion.span>
      </MotionButton>
    </div>
  )
}

export default VerifyEmail
