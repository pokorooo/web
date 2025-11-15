import html2canvas from 'html2canvas'

export async function exportElementAsImage(element, filename = 'lineup.png') {
  if (!element) return
  const canvas = await html2canvas(element, {
    backgroundColor: '#ffffff',
    scale: 2,
    useCORS: true,
  })
  const dataUrl = canvas.toDataURL('image/png')
  const link = document.createElement('a')
  link.href = dataUrl
  link.download = filename
  link.click()
}

