import { Image } from '@unpic/react'
import logo from '/logo.png'
import clsx from 'clsx'
import styles from './Logo.module.scss'

export interface LogoProps {
  className?: string
}

export default function Logo({ className }: LogoProps) {
  return (
    <div className={clsx(styles.Wrapper, className)}>
      <div className={styles.LogoImageWrapper}>
        <Image
          layout="fullWidth"
          height={45}
          src={logo}
          alt="Logo | Back to main page"
        />
      </div>
      <div className={styles.LogoTextWrapper}>
        <span>моя</span>
        <span>манга</span>
      </div>
    </div>
  )
}
