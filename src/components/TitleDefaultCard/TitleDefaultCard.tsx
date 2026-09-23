import { Link } from '@tanstack/react-router'
import { Image } from '@unpic/react'
import styles from './TitleDefaultCard.module.scss'
import { SystemFolderType, TitleType } from '@/generated/prisma/enums'
import {
  BOOKMARK_SYSTEM_FOLDERS_DATA,
  TITLE_TYPE_LABELS,
} from '@/lib/constants'

interface TitleCardProps {
  titleId: string
  name: string
  type: TitleType
  coverUrl: string | null
  bookmarkFolderData:
    | {
        isSystem: true
        name: null
        color: null
        systemType: SystemFolderType
      }
    | {
        isSystem: false
        name: string
        color: string
        systemType: null
      }
    | null
  /*
   * Цей тип bookmarkFolderData може змінитися в майбутньому.
   *
   * Можна було б використати тип на кшталт
   * TeamTitlesData[number]['bookmarkFolder'], який генерується Eden Treaty,
   * але тоді компонент був би прив'язаний до конкретного запиту команди.
   *
   * TitleDefaultCard планується використовувати не лише на сторінці команди,
   * а й у каталозі, на сторінці автора та інших маршрутах, де набір творів
   * формується за іншими критеріями.
   *
   * Тому тип описаний безпосередньо в компоненті, а не виведений із типу
   * конкретного API-запиту. У майбутньому отримання творів, імовірно,
   * буде перенесено до загального titlesRouter із фільтрами для команди,
   * автора, жанрів, тегів тощо.
   */
}

function TitleDefaultCard({
  titleId,
  type,
  name,
  coverUrl,
  bookmarkFolderData,
}: TitleCardProps) {
  return (
    <div className={styles.Card}>
      <Link to="/" className={styles.TitleLink}>
        <Image
          className={styles.CardImage}
          layout="fullWidth"
          alt={name}
          src={import.meta.env.VITE_STORAGE_URL + coverUrl}
        />
        {bookmarkFolderData && (
          <div
            className={styles.Badge}
            style={
              {
                '--accent': bookmarkFolderData.isSystem
                  ? BOOKMARK_SYSTEM_FOLDERS_DATA[bookmarkFolderData.systemType]
                      .color
                  : bookmarkFolderData.color,
              } as React.CSSProperties
            }
          >
            {bookmarkFolderData.isSystem
              ? BOOKMARK_SYSTEM_FOLDERS_DATA[bookmarkFolderData.systemType]
                  .label
              : bookmarkFolderData.name}
          </div>
        )}
      </Link>

      <Link to="/" className={styles.CardMeta}>
        <span className={styles.CardTitle}>{name}</span>
        <div className={styles.CardInfo}>{TITLE_TYPE_LABELS[type]}</div>
      </Link>
    </div>
  )
}

export default TitleDefaultCard
