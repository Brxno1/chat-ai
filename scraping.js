// disable eslint no this file
/* eslint-disable */

import fs from 'fs/promises';
import path from 'path'

import puppeteer from 'puppeteer';

async function scrapeWithPuppeteer() {
  let browser
  let scrapingData = {}
  let nameKey

  try {
    // Inicie o navegador com opções ajustadas
    browser = await puppeteer.launch({
      executablePath: '/usr/bin/google-chrome', // chrome for WSL
      headless: true, // Para depuração
      args: [
        '--no-sandbox',
        '--disable-setuid-sandbox',
        '--start-maximized', // Abre em tela cheia
      ],
      timeout: 60000, // Tempo limite global
    });

    const page = await browser.newPage(); // Aba inicial
    await page.setViewport({ width: 1920, height: 1080, deviceScaleFactor: 1 }); // Ajusta a tela para o tamanho desejado
    await page.goto('https://www.cbdmd.com/products/cbd-gummy?variant=49608264057128', { waitUntil: 'networkidle2' }); // Navega para a página da URL

    const productData = { // Objeto com os dados do produto
      title: await page.evaluate(() => document.querySelector('.module.block-title h1')?.innerText || ''),

      description: await page.evaluate(() => document.querySelector('.metafield-rich_text_field')?.innerText || ''),

      infos: await page.evaluate(() => {
        const ul = document.querySelector('.metafield-rich_text_field ul');
        if (!ul) return [];
        const lis = ul.querySelectorAll('li');
        return Array.from(lis).map((li) => li.innerText);
      }),

      strength: await page.evaluate(() => {
        const container = document.querySelector('.swatch-group.flex.flex-wrap');
        if (!container) return [];

        const swatchElements = container.querySelectorAll('.swatch');

        return Array.from(swatchElements).map((swatch) => {
          const mg = swatch.querySelector('span.opt-value.ease-animation')?.innerText || 'without MG';
          const price = swatch.querySelector('span.opt-price.hide')?.innerText || 'without price';

          const bestValueSpan = swatch.querySelector('span.opt-badge.small-label.flex.align-items-center');
          const bestValue = !!bestValueSpan;

          return { mg, price, bestValue };
        });
      }),

      sku: await page.evaluate(() => {
        return document.querySelector('variant-sku')?.innerText || 'SKU não encontrado';
      }),

      productImageUrl: await page.evaluate(() => {
        const container = document.querySelector('.keen-slider.initialized.justify-content-center');
        if (!container) return [];

        const thumbs = container.querySelectorAll('.thumb-wrap.keen-slider-slide');
        const urls = [];

        thumbs.forEach(thumb => {
          const picture = thumb.querySelector('picture > source');
          const srcset = picture?.getAttribute('srcset');

          if (srcset) {
            const entries = srcset.split(',').map(entry => entry.trim());
            const width180Entry = entries.find(entry => entry.includes('width=180'));

            return urls.push(width180Entry);
          }
        });

        return urls;
      }),
    };

    await page.click('.swatch-group.flex.flex-wrap div.swatch:nth-child(2) span.opt-value.ease-animation');

    await page.click('button[aria-controls="content-d3ea1821-278b-4b94-95da-d55b45152f3f_201-1"]')

    // const buttonSelector = '.text-column.medium-down--one-whole .btn'; 
    await page.evaluate(() => {
      const button = document.getElementById('coa-btn');
      if (button) button.click();
    });

    const href = await page.evaluate(() => {
      const anchor = document.querySelector('div.coa-dialog-content-header div.controls-container a');
      return anchor ? anchor.href : null;
    });

    productData.linkForPdf = href;

    nameKey = productData.strength[0].mg
    scrapingData[nameKey] = productData;

    const uploadScrapingDir = path.join(process.cwd(), 'scraping')
    await fs.mkdir(uploadScrapingDir, { recursive: true })
    const filePath = path.join(uploadScrapingDir, 'data.json')

    const dataScrapingFormated = JSON.stringify(scrapingData, null, 2);

    await fs.writeFile(filePath, dataScrapingFormated, 'utf-8');
    console.log('file created successfully');

    await new Promise(() => { }); // Mantém o script rodando indefinidamente (para você interagir) 

  } catch (error) {
    if (error instanceof Error) console.error('Erro durante a execução:', error.message);
  } finally {
    if (browser) {
      await browser.close();
    }
  }
}

scrapeWithPuppeteer();