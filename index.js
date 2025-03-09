// disable eslint no this file
/* eslint-disable */

import puppeteer from 'puppeteer';

async function scrapeWithPuppeteer() {
  let browser;
  try {
    // Inicia o navegador com opções ajustadas
    browser = await puppeteer.launch({
      executablePath: '/usr/bin/google-chrome', // Verifique o caminho
      headless: false, // Para depuração
      args: ['--no-sandbox', '--disable-setuid-sandbox'], // Compatibilidade WSL
      timeout: 60000, // Tempo limite global
    });

    const page = await browser.newPage(); // Aba inicial
    page.setDefaultNavigationTimeout(60000); // Tempo limite por navegação

    // Navega para a página inicial
    await page.goto('http://localhost:3000', { waitUntil: 'networkidle2' });

    // Garante que os elementos estejam visíveis antes de interagir
    await page.waitForSelector('input[name="name"]', { visible: true, timeout: 10000 });
    await page.type('input[name="name"]', 'akiaura');

    await page.waitForSelector('input[name="email"]', { visible: true, timeout: 10000 });
    await page.type('input[name="email"]', 'akiaura1@gmail.com');

    // Clica no botão de submit
    await page.waitForSelector('button[type="submit"]', { visible: true, timeout: 10000 });
    await page.click('button[type="submit"]');

    // Pausa para interação manual (clique no toast, abrir e-mail, etc.)
    await new Promise((resolve) => setTimeout(resolve, 5000)); // 60 segundos para você agir

    // Abre uma nova aba para navegar para /app
    const appPage = await browser.newPage();
    await appPage.goto('http://localhost:3000/app', { waitUntil: 'networkidle2' });

    // Obtém o HTML da página /app
    const html = await appPage.content();
    console.log(html)

    // Mantém o navegador aberto até que você decida fechar
    await new Promise(() => { }); // Mantém o script rodando indefinidamente

  } catch (error) {
    console.error('Erro durante a execução:', error);
  } finally {
    if (browser) {

      await browser.close();
    }
  }
}

scrapeWithPuppeteer();