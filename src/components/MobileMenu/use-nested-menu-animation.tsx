import { useState } from 'react'

export default function useNestedMenuAnimation() {
  const [showInnerList, setShowInnerList] = useState(false)
  const [isMotionAllowed, setIsMotionAllowed] = useState(false)

  const handleAccordionOpenChange = (open: boolean) => {
    // Якщо акордіон закривається, скинути початкову анімацію
    if (open) {
      setIsMotionAllowed(false)
      setShowInnerList(false)
    }
  }

  return {
    showInnerList,
    setShowInnerList,
    isMotionAllowed,
    setIsMotionAllowed,
    handleAccordionOpenChange,
  }
}
