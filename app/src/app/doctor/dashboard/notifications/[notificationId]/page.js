import NotificationIdPage from './NotificationIdPage'

export default async function NotificationPage ({ params }) {
  const { notificationId } = await params

  return (
    <div>
      <NotificationIdPage id={notificationId} />
    </div>
  )
}
