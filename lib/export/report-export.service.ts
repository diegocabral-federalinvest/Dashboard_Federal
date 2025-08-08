import html2canvas from 'html2canvas'
import jsPDF from 'jspdf'

export class ReportExportService {
  // Prepare DOM for export by hiding unnecessary elements
  private prepareDOM() {
    const elementsToHide = [
      '.sidebar',
      '.header',
      '[data-export-hide="true"]'
    ]
    
    elementsToHide.forEach(selector => {
      document.querySelectorAll(selector).forEach(el => {
        (el as HTMLElement).style.display = 'none'
      })
    })
  }
  
  // Restore DOM after export
  private restoreDOM() {
    const hiddenElements = document.querySelectorAll('[style*="display: none"]')
    hiddenElements.forEach(el => {
      (el as HTMLElement).style.display = ''
    })
  }
  
  // Export to PNG
  async exportToPNG(elementId: string, filename: string) {
    this.prepareDOM()
    
    try {
      const element = document.getElementById(elementId)
      if (!element) throw new Error('Element not found')
      
      const canvas = await html2canvas(element, {
        backgroundColor: '#ffffff',
        scale: 2,
        logging: false,
        useCORS: true
      })
      
      // Create download link
      const link = document.createElement('a')
      link.download = `${filename}.png`
      link.href = canvas.toDataURL()
      link.click()
    } finally {
      this.restoreDOM()
    }
  }
  
  // Export to PDF
  async exportToPDF(elementId: string, filename: string) {
    this.prepareDOM()
    
    try {
      const element = document.getElementById(elementId)
      if (!element) throw new Error('Element not found')
      
      const canvas = await html2canvas(element, {
        backgroundColor: '#ffffff',
        scale: 2
      })
      
      const imgData = canvas.toDataURL('image/png')
      const pdf = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4'
      })
      
      const imgWidth = 210
      const imgHeight = (canvas.height * imgWidth) / canvas.width
      
      pdf.addImage(imgData, 'PNG', 0, 0, imgWidth, imgHeight)
      pdf.save(`${filename}.pdf`)
    } finally {
      this.restoreDOM()
    }
  }
  
  // Export to HTML
  exportToHTML(elementId: string, filename: string) {
    const element = document.getElementById(elementId)
    if (!element) throw new Error('Element not found')
    
    const htmlContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="UTF-8">
        <title>${filename}</title>
        <style>
          ${this.getExportStyles()}
        </style>
      </head>
      <body>
        ${element.outerHTML}
      </body>
      </html>
    `
    
    const blob = new Blob([htmlContent], { type: 'text/html' })
    const link = document.createElement('a')
    link.download = `${filename}.html`
    link.href = URL.createObjectURL(blob)
    link.click()
  }
  
  private getExportStyles(): string {
    // Collect relevant styles from the page
    return Array.from(document.styleSheets)
      .map(sheet => {
        try {
          return Array.from(sheet.cssRules)
            .map(rule => rule.cssText)
            .join('\n')
        } catch {
          return ''
        }
      })
      .join('\n')
  }
} 