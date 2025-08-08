"use client"

import { useEffect } from "react"
import { useHeader } from "@/contexts/header-context"

interface HeaderContentProps {
  title?: string
  subtitle?: string
  pageType?: 'default' | 'dre' | 'users' | 'settings' | 'dashboard'
  showDefaultActions?: boolean
}

export const useHeaderContent = (content: HeaderContentProps) => {
  const { setContent } = useHeader()
  
  useEffect(() => {
    setContent(content)
    
    // Reset to default content on unmount
    return () => {
      setContent({ showDefaultActions: true, pageType: 'default' })
    }
  }, [
    content.title,
    content.subtitle,
    content.pageType,
    content.showDefaultActions,
    setContent
  ])
} 