import { useId } from 'react'
import { Checkbox } from '@base-ui/react/checkbox'
import { CheckboxGroup } from '@base-ui/react/checkbox-group'
import { TitleFieldName } from '@/generated/prisma/enums'
import { CheckIcon } from 'lucide-react'
import { FIELD_LABELS } from '@/lib/constants'
import clsx from 'clsx'
import styles from './LockedFieldsCheckboxGroup.module.scss'

const ALL_FIELD_VALUES = Object.values(TitleFieldName)

interface TitleLockedFieldsFormProps {
  value: TitleFieldName[]
  onValueChange: (value: TitleFieldName[]) => void
  className?: string
  children?: React.ReactNode
}

function LockedFiedlsCheckboxGroup({
  value,
  onValueChange,
  className,
  children,
}: TitleLockedFieldsFormProps) {
  const id = useId()

  return (
    <>
      {children}
      <CheckboxGroup
        aria-labelledby={id}
        value={value}
        onValueChange={(val) => onValueChange(val as TitleFieldName[])}
        allValues={ALL_FIELD_VALUES}
        className={clsx(styles.CheckboxGroup, className)}
      >
        {ALL_FIELD_VALUES.map((f) => (
          <label key={f} className={styles.CheckboxWrapper}>
            <Checkbox.Root value={f} className={styles.Checkbox}>
              <Checkbox.Indicator
                keepMounted={true}
                className={styles.Indicator}
              >
                <CheckIcon />
              </Checkbox.Indicator>
            </Checkbox.Root>
            <span className={styles.FieldName}>{FIELD_LABELS[f]}</span>
          </label>
        ))}
      </CheckboxGroup>
    </>
  )
}

export default LockedFiedlsCheckboxGroup
