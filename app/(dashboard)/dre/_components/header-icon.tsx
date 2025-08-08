"use client"

import React, { memo } from "react"
import { FileSpreadsheet } from "lucide-react"

export const DREHeaderIcon = memo(() => {
  return <FileSpreadsheet className="h-6 w-6 text-blue-400" />
})

DREHeaderIcon.displayName = "DREHeaderIcon" 