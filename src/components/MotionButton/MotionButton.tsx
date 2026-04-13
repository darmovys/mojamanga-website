import { Button as BaseUIButton } from '@base-ui/react'
import { motion, MotionProps } from 'motion/react'

const MotionBaseButton = motion.create(BaseUIButton)

type MotionButtonProps = React.ComponentProps<typeof BaseUIButton> & MotionProps

export const tapAnimation: MotionProps = {
  whileTap: {
    scale: 0.96,
    transition: { type: 'spring', duration: 0.3, bounce: 0 },
  },
}

function MotionButton({ children, ...props }: MotionButtonProps) {
  return (
    <MotionBaseButton {...tapAnimation} {...props}>
      {children}
    </MotionBaseButton>
  )
}

export default MotionButton
