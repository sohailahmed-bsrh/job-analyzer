import { chromium } from 'playwright'

export async function renderPdf(document){
  const browser=await chromium.launch({headless:true})
  try{
    const page=await browser.newPage({viewport:{width:900,height:1200}})
    
    const html = document.html || `<html><body><pre>${escape(document.plainText)}</pre></body></html>`;
    
    await page.setContent(html,{waitUntil:'networkidle'})
    
    // Evaluate explicit print media injection to ensure exact colors and size
    await page.evaluate(() => {
      const style = document.createElement('style');
      style.innerHTML = '@page { margin: 0 !important; size: A4 !important; }';
      document.head.appendChild(style);
    });

    return await page.pdf({
      format:'A4',
      printBackground:true,
      preferCSSPageSize: true,
      margin:{top:0,bottom:0,left:0,right:0}
    })
  }finally{await browser.close()}
}
function escape(value){return String(value).replaceAll('&','&amp;').replaceAll('<','&lt;').replaceAll('>','&gt;').replaceAll('"','&quot;')}
