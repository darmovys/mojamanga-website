import { Button, Dialog } from '@base-ui/react'
import { useRef, useState } from 'react'
import { Cropper, ReactCropperElement } from 'react-cropper'
import { motion } from 'motion/react'
import styles from './CropImageDialog.module.scss'
import 'react-cropper/dist/cropper.css'
import clsx from 'clsx'
import ClickTargetHelper from '../ClickTargetHelper'
import { api } from '@/lib/api-client'
import { showAuthToast, showTimedToast } from '@/lib/toast'

interface CropImageDialogProps {
  src: string
  originalName: string
  fileType: string
  originalFile: File
  croppedWidth: number
  croppedHeight: number
  onCropped: (file: File | null) => void
  onClose: () => void
}

const MotionBackdrop = motion.create(Dialog.Backdrop)
const MotionPopup = motion.create(Dialog.Popup)

function CropImageDialog({
  src,
  originalName,
  fileType,
  originalFile,
  croppedWidth,
  croppedHeight,
  onCropped,
  onClose,
}: CropImageDialogProps) {
  const cropperRef = useRef<ReactCropperElement>(null)
  const [isProcessing, setIsProcessing] = useState(false)

  async function crop() {
    const cropper = cropperRef.current?.cropper
    if (!cropper) return

    // Варіант для GIF: відправляємо на обробку серверу
    if (fileType === 'image/gif') {
      setIsProcessing(true)
      const cropData = cropper.getData()

      const { data, error } = await api().files['crop-gif'].post({
        height: cropData.height,
        width: cropData.width,
        x: cropData.x,
        y: cropData.y,
        originalFile,
      })

      if (error) {
        switch (error.status) {
          case 422:
            showTimedToast(
              {
                type: 'warning',
                title: 'Попередження',
                description: error.value.message,
              },
              4000,
            )
            break
          case 401:
            showAuthToast()
            break
          default:
            showTimedToast(
              {
                type: 'error',
                title: 'Помилка',
                description: error.value,
              },
              4000,
            )
        }
        onCropped(null)
        setIsProcessing(false)
        return
      }

      const croppedFile = new File([data], originalName, {
        type: 'image/gif',
      })
      onCropped(croppedFile)
      setIsProcessing(false)
      onClose()
      return
    }

    // Стандартний варіант для статичних зображень (WEBP)
    setIsProcessing(true)
    cropper
      .getCroppedCanvas({ width: croppedWidth, height: croppedHeight })
      .toBlob((blob) => {
        if (!blob) {
          showTimedToast(
            {
              type: 'error',
              title: 'Помилка',
              description: 'Не вдалося обрізати зображення',
            },
            3000,
          )
          onCropped(null)
          setIsProcessing(false)
          return
        }
        const file = new File([blob], originalName, {
          type: 'image/webp',
        })
        onCropped(file)
        setIsProcessing(false)
      }, 'image/webp')
    onClose()
  }

  return (
    <Dialog.Root open={true} onOpenChange={onClose}>
      <Dialog.Portal keepMounted>
        <MotionBackdrop
          onClick={onClose}
          className={styles.Overlay}
          initial={{ opacity: 0, backdropFilter: 'blur(0px)' }}
          animate={{ opacity: 1, backdropFilter: 'blur(2px)' }}
          exit={{ opacity: 0, backdropFilter: 'blur(0px)' }}
          transition={{ duration: 0.3, ease: 'easeOut' }}
        />
        <MotionPopup
          className={styles.Popup}
          initial={{ opacity: 0, y: '-10%', filter: 'blur(4px)' }}
          animate={{
            opacity: 1,
            y: '0%',
            filter: 'blur(0px)',
            transition: { type: 'spring', duration: 0.25, bounce: 0 },
          }}
          exit={{
            opacity: 0,
            y: '-10%',
            filter: 'blur(4px)',
            transition: { type: 'spring', duration: 0.35, bounce: 0 },
          }}
        >
          <h1 className={styles.Heading}>Обрізання зображення</h1>
          <Cropper
            src={src}
            style={{ height: 400, width: 'auto' }}
            aspectRatio={croppedWidth / croppedHeight}
            guides={false}
            cropBoxResizable={false}
            dragMode="move"
            autoCropArea={1}
            viewMode={1}
            center={false}
            ref={cropperRef}
          />
          <div className={styles.ActionsSection}>
            <Button
              className={clsx(styles.ClipButton, 'Gradient', {
                [styles.Processing]: isProcessing,
              })}
              onClick={crop}
              focusableWhenDisabled={true}
              disabled={isProcessing}
            >
              <ClickTargetHelper />
              Обрізати
            </Button>
            <Button
              className={clsx(styles.CancelButton, 'Gradient', {
                [styles.Processing]: isProcessing,
              })}
              onClick={onClose}
              focusableWhenDisabled={true}
              disabled={isProcessing}
            >
              <ClickTargetHelper />
              Скасувати
            </Button>
          </div>
        </MotionPopup>
      </Dialog.Portal>
    </Dialog.Root>
  )
}

export default CropImageDialog
