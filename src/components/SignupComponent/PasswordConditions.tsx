import { Circle, CircleCheckBig } from 'lucide-react'
import clsx from 'clsx'
import styles from './PasswordConditions.module.scss'

export const PASSWORD_CONDITIONS = [
  { key: 'onlyLatin', label: 'Лише англійські літери' },
  { key: 'minLength', label: 'Принаймні 12 символів' },
  { key: 'hasCase', label: 'Великі та малі літери' },
  { key: 'hasNumber', label: 'Числа' },
  { key: 'hasSymbol', label: 'Символи (-_&/,^@.#:%\\\=\'$!?*`;+"|~[](){}<>)' },
] as const

export type PasswordConditionKey = (typeof PASSWORD_CONDITIONS)[number]['key']
export type PasswordConditions = Record<PasswordConditionKey, boolean>

type StrengthScore = 1 | 2 | 3 | 4 | 5

export const STRENGTH_COLORS: Record<StrengthScore, string> = {
  1: 'var(--blue-200)',
  2: 'var(--blue-300)',
  3: 'var(--blue-400)',
  4: 'var(--blue-500)',
  5: 'var(--blue-600)',
}

interface Props {
  conditions: PasswordConditions
  strengthScore: StrengthScore
}

export function PasswordConditionsContent({
  conditions,
  strengthScore,
}: Props) {
  return (
    <div className={styles.Wrapper}>
      <div className={styles.ScoreWrapper}>
        {[...Array(5)].map((_, i) => (
          <span
            key={i}
            className={styles.ScoreElement}
            style={
              i < strengthScore
                ? { backgroundColor: STRENGTH_COLORS[(i + 1) as StrengthScore] }
                : undefined
            }
          />
        ))}
      </div>

      <h4 className={styles.ConditionsHeader}>Пароль повинен містити:</h4>

      <ul className={styles.ConditionList}>
        {PASSWORD_CONDITIONS.map(({ key, label }) => {
          const isDone = conditions[key]
          return (
            <li
              key={key}
              className={clsx(styles.Condition, { [styles.Done]: isDone })}
            >
              {isDone ? <CircleCheckBig size={14} /> : <Circle size={14} />}
              <span>{label}</span>
            </li>
          )
        })}
      </ul>
    </div>
  )
}
