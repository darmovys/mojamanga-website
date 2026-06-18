import { Select } from '@base-ui/react'
import { ChevronDown } from 'lucide-react'
import styles from './SelectField.module.scss'

export interface SelectFieldProps<T extends string> {
  options: T[]
  labels: Record<T, string>
  value: T | null
  onValueChange: (value: T) => void
  placeholder?: string
  id: string
}

export function SelectField<T extends string>({
  options,
  labels,
  value,
  onValueChange,
  placeholder = '',
  id,
}: SelectFieldProps<T>) {
  return (
    <Select.Root value={value} onValueChange={(val) => onValueChange(val as T)}>
      <Select.Trigger id={id} className={styles.Trigger}>
        <Select.Value placeholder={placeholder}>
          {value ? labels[value] : null}
        </Select.Value>
        <Select.Icon className={styles.Icon}>
          <ChevronDown size={16} />
        </Select.Icon>
      </Select.Trigger>

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
