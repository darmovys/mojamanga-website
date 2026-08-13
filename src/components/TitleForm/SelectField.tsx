import { Select } from '@base-ui/react'
import { ChevronDown, LockIcon } from 'lucide-react'
import styles from './SelectField.module.scss'
import { showTimedToast } from '@/lib/toast'

export interface SelectFieldProps<T extends string> {
  options: T[]
  labels: Record<T, string>
  value: T | null
  onValueChange: (value: T) => void
  placeholder?: string
  id: string
  isLocked: boolean
}

export function SelectField<T extends string>({
  options,
  labels,
  value,
  onValueChange,
  placeholder = '',
  id,
  isLocked,
}: SelectFieldProps<T>) {
  return (
    <Select.Root value={value} onValueChange={(val) => onValueChange(val as T)}>
      <div
        className={styles.TriggerWrapper}
        data-locked={isLocked ? '' : undefined}
      >
        <Select.Trigger id={id} className={styles.Trigger} disabled={isLocked}>
          <Select.Value placeholder={placeholder}>
            {value ? labels[value] : null}
          </Select.Value>
          <Select.Icon className={styles.Icon}>
            <ChevronDown size={16} />
          </Select.Icon>
        </Select.Trigger>
        {isLocked && (
          <div
            className={styles.LockOverlay}
            onClick={() => {
              showTimedToast(
                {
                  type: 'warning',
                  title: 'Попередження',
                  description: 'Поле заблоковано для внесення змін',
                },
                1500,
              )
            }}
          >
            <LockIcon size={20} />
          </div>
        )}
      </div>

      <Select.Portal>
        <Select.Positioner sideOffset={8} alignItemWithTrigger={false}>
          <Select.Popup className={styles.Popup}>
            {options.map((type) => (
              <Select.Item key={type} value={type} className={styles.Item}>
                <Select.ItemText>{labels[type]}</Select.ItemText>
              </Select.Item>
            ))}
          </Select.Popup>
        </Select.Positioner>
      </Select.Portal>
    </Select.Root>
  )
}
