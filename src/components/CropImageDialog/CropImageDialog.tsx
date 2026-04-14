import { Button, Dialog } from '@base-ui/react'
import { useRef } from 'react'
import { Cropper, ReactCropperElement } from 'react-cropper'
import { motion } from 'motion/react'
import styles from './CropImageDialog.module.scss'
import 'react-cropper/dist/cropper.css'
import clsx from 'clsx'
import ClickTargetHelper from '../ClickTargetHelper'

interface CropImageDialogProps {
  src: string
  originalName: string
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
  croppedWidth,
  croppedHeight,
  onCropped,
  onClose,
}: CropImageDialogProps) {
  const cropperRef = useRef<ReactCropperElement>(null)

  function crop() {
    const cropper = cropperRef.current?.cropper
    if (!cropper) return
    cropper
      .getCroppedCanvas({ width: croppedWidth, height: croppedHeight })
      .toBlob((blob) => {
        if (!blob) return onCropped(null)
        const file = new File([blob], `${originalName}`, {
          type: 'image/webp',
        })
        onCropped(file)
      }, 'image/webp')
    onClose()
  }
  return (
    <Dialog.Root open={true} onOpenChange={onClose}>
      <Dialog.Portal keepMounted>
        <MotionBackdrop
          onClick={onClose}
          className={styles.Overlay}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2, ease: 'easeOut' }}
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
              className={clsx(styles.ClipButton, 'Gradient')}
              onClick={crop}
            >
              <ClickTargetHelper />
              Обрізати
            </Button>
            <Button
              className={clsx(styles.CancelButton, 'Gradient')}
              onClick={onClose}
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
