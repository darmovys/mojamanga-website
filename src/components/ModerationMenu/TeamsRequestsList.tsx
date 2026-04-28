import { Link } from '@tanstack/react-router'
import styles from './TeamsRequestsList.module.scss'

// Мокові дані на основі вашої schema.prisma
const MOCK_TEAM_REQUESTS = [
  {
    id: 'cuid1',
    name: 'Dark Scans UA',
    description: 'Команда перекладачів, що спеціалізується на темних фентезі тайтлах. Досвід перекладу 3 роки. Працюємо швидко та якісно. Шукаємо нові проекти для перекладу та розширення аудиторії.',
    creatorUsername: 'darkreader',
    createdAt: '12 год тому', // В реальності тут буде Date і функція форматування
  },
  {
    id: 'cuid2',
    name: 'Manga Cats',
    description: 'Lorem ipsum dolor sit amet consectetur adipisicing elit. Architecto, aperiam necessitatibus quae molestiae sit itaque, officia maiores illo veniam explicabo cum rem ipsum, atque obcaecati vitae ipsa doloribus iure dolorem ea! Dolorum nemo fuga suscipit nostrum neque, mollitia voluptatibus quisquam itaque, dolore explicabo optio, laboriosam porro eligendi ea ullam ducimus nihil praesentium. Dolore est qui explicabo iure consequatur delectus, assumenda et consectetur quam autem nemo laboriosam voluptas numquam accusantium quos, rerum incidunt. Accusantium nemo fuga perspiciatis aperiam quaerat non veniam autem, velit quod unde possimus voluptatum saepe rerum et labore consequuntur ab, quasi ea provident doloribus consectetur, assumenda enim neque?',
    creatorUsername: 'catlover99',
    createdAt: '1 день тому',
  },

]

export default function TeamsRequestsList() {
  return (
    <div className={styles.ListContainer}>
      <h2 className={styles.ListHeading}>Заявки команд ({MOCK_TEAM_REQUESTS.length})</h2>
      <div className={styles.List}>
        {MOCK_TEAM_REQUESTS.map((team) => (
          <TeamRequestCard key={team.id} team={team} />
        ))}
      </div>
    </div>
  )
}

function TeamRequestCard({ team }: { team: typeof MOCK_TEAM_REQUESTS[0] }) {
  return (
    <Link aria-labelledby={team.id} className={styles.Link} to='/moderation/team-review/$teamId' params={{ teamId: team.id }}>
      <article className={styles.Card}>
        <div className={styles.Content}>
          <header className={styles.Header}>
            <h3 id={team.id} className={styles.TeamName}>{team.name}</h3>
            <div className={styles.MetaInfo}>
              <span>засновник: @{team.creatorUsername}</span>
              <span className={styles.Dot}>•</span>
              <span>{team.createdAt}</span>
            </div>
          </header>
          {/* Опис обрізатиметься до 2 рядків через CSS */}
          <p className={styles.Description}>{team.description}</p>
        </div>
      </article>
    </Link>
  )
}