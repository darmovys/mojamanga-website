import { useState } from 'react'
import { useDevicesSection } from './use-devices-section'
import ConfirmDialog from '../ConfirmDialog'
import { HandIcon } from 'lucide-react'
import ShiftBy from '../ShiftBy/ShiftBy'
import { Button } from '@base-ui/react'
import Skeleton from '../Skeleton'
import { range } from '@/lib/utils'
import styles from './DevicesSection.module.scss'

function DevicesSection() {
  const {
    currentDevice,
    otherDevices,
    allDevices,
    isDialogShown,
    setIsDialogShown,
    isPending,
    handleRevokeOtherSessions,
    handleRevokeSession,
  } = useDevicesSection()

  return (
    <>
      {currentDevice && (
        <div
          className={styles.Card}
          data-has-other-sessions={otherDevices.length !== 0}
        >
          <span className={styles.CardLabel}>Цей пристрій</span>
          <div className={styles.CardInfo}>
            <h3 className={styles.DeviceTitle}>{currentDevice.device}</h3>
            <p className={styles.DeviceSubtitle}>
              {currentDevice.browser}, {currentDevice.os}
            </p>
            <p className={styles.DeviceMeta}>
              {currentDevice.location} • {currentDevice.ipAddress}
            </p>
          </div>

          {allDevices.length > 1 && (
            <>
              <Button
                disabled={isPending}
                focusableWhenDisabled={true}
                onClick={() => setIsDialogShown(true)}
                className={styles.RevokeAllButton}
              >
                <ShiftBy className={styles.Front} x={-1}>
                  <HandIcon size={14} /> Завершити всі інші сеанси
                </ShiftBy>
              </Button>
              <ConfirmDialog
                isOpen={isDialogShown}
                onIsOpenChange={setIsDialogShown}
                title="Завершити сеанси"
                description="Ви дійсно хочете завершити всі інші сеанси?"
                onConfirm={() => {
                  if (isPending) return
                  handleRevokeOtherSessions()
                }}
              />
            </>
          )}
        </div>
      )}

      <p className={styles.Description}>
        Вийти з акаунта на всіх пристроях, крім цього.
      </p>

      <div
        className={styles.Card}
        data-has-other-sessions={otherDevices.length !== 0}
      >
        <span className={styles.CardLabel}>Активні сеанси</span>

        {otherDevices.length === 0 ? (
          <p className={styles.EmptyText}>Немає інших активних сеансів</p>
        ) : (
          <div className={styles.SessionList}>
            {otherDevices.map(
              ({ id, token, device, browser, os, location }) => (
                <SessionItem
                  key={id}
                  token={token}
                  device={device}
                  browser={browser}
                  os={os}
                  location={location}
                  isPending={isPending}
                  onRevoke={handleRevokeSession}
                />
              ),
            )}
          </div>
        )}
      </div>
    </>
  )
}

interface SessionItemProps {
  token: string
  device: string
  browser: string
  os: string
  location: string
  isPending: boolean
  onRevoke: (token: string) => void
}

function SessionItem({
  device,
  browser,
  os,
  location,
  token,
  isPending,
  onRevoke,
}: SessionItemProps) {
  const [isDialogShown, setIsDialogShown] = useState(false)

  function handleConfirm() {
    setIsDialogShown(false)
    onRevoke(token)
  }

  return (
    <>
      <Button
        disabled={isPending}
        focusableWhenDisabled={true}
        className={styles.SessionItem}
        onClick={() => setIsDialogShown(true)}
      >
        <h3 className={styles.DeviceTitle}>{device}</h3>
        <p className={styles.DeviceSubtitle}>
          {browser}, {os}
        </p>
        <p className={styles.DeviceMeta}>{location}</p>
      </Button>
      <ConfirmDialog
        isOpen={isDialogShown}
        onIsOpenChange={setIsDialogShown}
        title="Завершити сеанс"
        description="Ви дійсно хочете завершити цей сеанс?"
        onConfirm={() => {
          if (isPending) return
          handleConfirm()
        }}
      />
    </>
  )
}

export function DevicesSectionSkeleton() {
  return (
    <>
      <div className={styles.Card} data-has-other-sessions={false}>
        <span className={styles.CardLabel}>Цей пристрій</span>
        <div className={styles.CardInfo}>
          <Skeleton
            height="var(--20px)"
            width="9.375rem"
            borderRadius="var(--4px)"
          />
          <Skeleton
            height="var(--18px)"
            width="11.875rem"
            borderRadius="var(--4px)"
          />
          <Skeleton
            height="var(--14px)"
            width="8.75rem"
            borderRadius="var(--4px)"
          />
        </div>
      </div>

      <div style={{ paddingBlockEnd: 'var(--32px)' }}></div>

      <div className={styles.Card} data-has-other-sessions={false}>
        <span className={styles.CardLabel}>Активні сеанси</span>

        <div className={styles.SessionList}>
          {range(2).map((index) => (
            <div key={index} className={styles.SessionItem}>
              <Skeleton
                height="var(--20px)"
                width="9.375rem"
                borderRadius="var(--4px)"
              />
              <Skeleton
                height="var(--18px)"
                width="11.875rem"
                borderRadius="var(--4px)"
              />
              <Skeleton
                height="var(--14px)"
                width="8.75rem"
                borderRadius="var(--4px)"
              />
            </div>
          ))}
        </div>
      </div>
    </>
  )
}

export default DevicesSection
