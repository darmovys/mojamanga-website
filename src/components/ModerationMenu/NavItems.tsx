import { Link } from '@tanstack/react-router'
import styles from './ModerationMenu.module.scss'
import { Separator } from '@base-ui/react'
import { NAVIGATION_SECTIONS, NavItem } from './navigation.data'
import React from 'react'

type NavItemsProps = {
  separator: 'light' | 'dark'
  onItemClick?: () => void
}

export function NavItems({ separator, onItemClick }: NavItemsProps) {
  const separatorStyles = {
    '--color':
      separator === 'light'
        ? 'var(--sys-outline-variant)'
        : 'var(--sys-outline)',
  } as React.CSSProperties

  return (
    <>
      {NAVIGATION_SECTIONS.map((section, sIndex) => (
        <React.Fragment key={section.heading}>
          <ul className={styles.NavSection}>
            <h2 className={styles.NavSectionHeading}>{section.heading}</h2>
            {section.items.map((item, iIndex) => (
              <NavigationLink key={iIndex} item={item} onClick={onItemClick} />
            ))}
          </ul>

          {/* Рендеримо сепаратор після кожної секції, крім останньої */}
          {sIndex < NAVIGATION_SECTIONS.length - 1 && (
            <Separator
              style={separatorStyles}
              orientation="horizontal"
              className={styles.Separator}
            />
          )}
        </React.Fragment>
      ))}
    </>
  )
}

function NavigationLink({
  item,
  onClick,
}: {
  item: NavItem
  onClick?: () => void
}) {
  return (
    <Link
      to="/moderation"
      search={{ type: item.type }}
      className={styles.NavSectionItemLinkWrapper}
      activeProps={{ className: styles.ActiveLink }}
      activeOptions={{ includeSearch: true }}
      onClick={onClick}
    >
      <li className={styles.NavSectionItem}>
        <span>{item.label}</span>
        {item.requests !== undefined && (
          <span className={styles.NavSectionItemIndicator}>
            {item.requests}
          </span>
        )}
      </li>
    </Link>
  )
}
