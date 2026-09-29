import { Link } from '@tanstack/react-router'
import { Image } from '@unpic/react'
import { TEAM_ROLES } from '@/lib/constants'
import { useMember } from './use-member'
import { TeamMembersData } from '@/services/queries'
import styles from './MemberItem.module.scss'

export function MemberItem({ member }: { member: TeamMembersData[number] }) {
  const { rolesRef, paddingBottom } = useMember()

  return (
    <li>
      <Link
        to="/user/$id/bookmarks"
        params={{ id: member.id }}
        className={styles.MemberLink}
      >
        <div
          className={styles.MemberItem}
          style={
            { '--bottom-space': `${paddingBottom}px` } as React.CSSProperties
          }
        >
          <Image
            alt={`Аватар користувача ${member.displayUsername}`}
            src={
              member.avatarUrl
                ? import.meta.env.VITE_STORAGE_URL + member.avatarUrl
                : `https://api.dicebear.com/9.x/glass/svg?seed=${member.displayUsername}`
            }
            layout="constrained"
            height={50}
            width={50}
            className={styles.MemberAvatar}
          />
          <div className={styles.MemberInfo}>
            <div className={styles.MemberUsername}>
              {member.displayUsername}
            </div>
            <div className={styles.MemberRoles} ref={rolesRef}>
              {member.roles.length > 0
                ? member.roles.map((r, index, array) => {
                    const comma = index !== array.length - 1 ? ', ' : ''

                    return TEAM_ROLES[r] + comma
                  })
                : 'Учасник'}
            </div>
          </div>
        </div>
      </Link>
    </li>
  )
}
