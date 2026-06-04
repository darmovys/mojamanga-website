import { teamsQueries } from '@/services/queries'
import { useQuery } from '@tanstack/react-query'
import { AnimatePresence, motion, useReducedMotion } from 'motion/react'
import { useId } from 'react'
import Skeleton from '../Skeleton'
import { Checkbox, CheckboxGroup } from '@base-ui/react'
import { CheckIcon, MinusIcon } from 'lucide-react'
import clsx from 'clsx'
import { range } from '@/lib/utils'
import styles from './CreateWorkForm.module.scss'
import { Team } from '@/lib/treaty-types'

type UserTeamsCheckboxListProps = {
  selectedTeams: Team[]
  onChange: (value: Team[]) => void
}

export function UserTeamsCheckboxList({
  selectedTeams,
  onChange,
}: UserTeamsCheckboxListProps) {
  const id = useId()
  const {
    data: userTeamsData,
    isLoading,
    error: queryError,
  } = useQuery(teamsQueries.getUserTeams())

  const shouldReduceMotion = useReducedMotion()
  const triggerAnimation = shouldReduceMotion
    ? {}
    : {
        initial: { opacity: 0, scale: 0.85, filter: 'blur(4px)' },
        animate: { opacity: 1, scale: 1, filter: 'blur(0px)' },
        exit: { opacity: 0, scale: 0.85, filter: 'blur(4px)' },
        transition: {
          type: 'spring',
          duration: 0.3,
          bounce: 0,
        } as const,
      }

  const userTeams: Team[] = Array.isArray(userTeamsData?.data)
    ? userTeamsData.data
    : []
  const hasError = !!queryError || (userTeamsData && userTeamsData.error)

  if (isLoading) return <SkeletonList />

  if (hasError) {
    return (
      <span className={styles.ErrorMessage}>
        Помилка завантаження команд. Спробуйте оновити сторінку.
      </span>
    )
  }

  if (userTeams.length === 0)
    return <span>Ви не належите до жодної команди</span>

  const selectedIds = selectedTeams.map((team) => team.id)
  const allTeamIds = userTeams.map((team) => team.id)

  const handleChange = (nextIds: string[]) => {
    const nextSelectedTeams = userTeams.filter((team) =>
      nextIds.includes(team.id),
    )
    onChange(nextSelectedTeams)
  }

  const isMultipleTeams = userTeams.length > 1

  return (
    <CheckboxGroup
      aria-labelledby={id}
      value={selectedIds}
      onValueChange={handleChange}
      allValues={allTeamIds}
      className={styles.CheckboxGroup}
    >
      {isMultipleTeams && (
        <label className={styles.CheckboxWrapper}>
          <Checkbox.Root parent className={styles.Checkbox}>
            <Checkbox.Indicator
              className={styles.Indicator}
              keepMounted={true}
              render={(props, state) => (
                <span {...props}>
                  <AnimatePresence
                    mode={shouldReduceMotion ? undefined : 'popLayout'}
                    initial={false}
                  >
                    <motion.span
                      key={state.indeterminate ? 'indeterminate' : 'checked'}
                      {...triggerAnimation}
                    >
                      {state.indeterminate ? <MinusIcon /> : <CheckIcon />}
                    </motion.span>
                  </AnimatePresence>
                </span>
              )}
            />
          </Checkbox.Root>
          Всі перелічені
        </label>
      )}

      <div
        className={styles.ChildrenContainer}
        data-multiple-teams={isMultipleTeams}
      >
        {userTeams.map((team) => (
          <label
            key={team.id}
            className={clsx(styles.CheckboxWrapper, styles.Inner)}
          >
            <Checkbox.Root value={team.id} className={styles.Checkbox}>
              <Checkbox.Indicator
                keepMounted={true}
                className={styles.Indicator}
              >
                <CheckIcon />
              </Checkbox.Indicator>
            </Checkbox.Root>
            <span className={styles.TeamName}>{team.name}</span>
          </label>
        ))}
      </div>
    </CheckboxGroup>
  )
}

function SkeletonList() {
  return (
    <div className={styles.CheckboxGroup}>
      <div style={{ display: 'flex', gap: 'var(--8px)' }}>
        <Skeleton
          height="var(--24px)"
          width="var(--24px)"
          borderRadius="var(--4px)"
        />
        <Skeleton
          height="var(--24px)"
          width="var(--128px)"
          borderRadius="var(--4px)"
        />
      </div>
      {range(2).map((index) => (
        <div
          key={index}
          style={{
            display: 'flex',
            gap: 'var(--8px)',
            marginBlockStart: 'var(--8px)',
            marginInlineStart: 'var(--28px)',
          }}
        >
          <Skeleton
            height="var(--24px)"
            width="var(--24px)"
            borderRadius="var(--4px)"
          />
          <Skeleton
            height="var(--24px)"
            width="var(--128px)"
            borderRadius="var(--4px)"
          />
        </div>
      ))}
    </div>
  )
}
