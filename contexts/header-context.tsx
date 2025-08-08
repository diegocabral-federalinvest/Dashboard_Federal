"use client"

import React, { createContext, useContext, useState, ReactNode } from "react"

// Header content with all required properties
interface HeaderContentType {
  title?: string
  subtitle?: string
  pageType?: 'default' | 'dre' | 'users' | 'settings' | 'dashboard'
  showDefaultActions?: boolean
  actions?: React.ReactNode
}

interface HeaderContextValue {
  title?: string
  subtitle?: string
  pageType?: 'default' | 'dre' | 'users' | 'settings' | 'dashboard'
  showDefaultActions?: boolean
  actions?: React.ReactNode
  setContent: (content: HeaderContentType) => void
}

const HeaderContext = createContext<HeaderContextValue | undefined>(undefined)

export const HeaderProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [content, setContent] = useState<HeaderContentType>({
    showDefaultActions: true,
    pageType: 'default'
  })
  
  const contextValue: HeaderContextValue = {
    ...content,
    setContent
  }
  
  return (
    <HeaderContext.Provider value={contextValue}>
      {children}
    </HeaderContext.Provider>
  )
}

export const useHeader = () => {
  const context = useContext(HeaderContext)
  if (context === undefined) {
    throw new Error("useHeader must be used within a HeaderProvider")
  }
  return context
}

// Custom hook for updating the header content
export const useHeaderContent = (content: HeaderContentType) => {
  const { setContent } = useHeader()
  
  React.useEffect(() => {
    setContent(content)
  }, [content, setContent])
} 