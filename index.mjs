import puppeteer from 'puppeteer';

/**
 * @typedef Session
 * @property {string} date
 * @property {string} time
 * @property {string} movieName
 * @property {string} hall
 * @property {string} format
 */

/**
 * @type {Session[]}
 */
let SESSIONS = [];

const findSessionsByString = (searchString) => {
    return SESSIONS.filter(session => session.movieName.includes(searchString))
}

const getSessionFromPremierCity = async () => {
    const browser = await puppeteer.launch();
    const page = await browser.newPage();

    await page.goto('https://premiercity.com.ua/rozklad/');

    const tableElement = await page.$('body > div > main > main > section > div > table');

    if (!tableElement) {
        console.log('Не можу знайти таблицю!')
        return;
    } else {
        console.log('Знайшов таблицю із фільмами!')
    }
    
    console.log('Починаю парсити таблицю.')

    const data = await page.evaluate(table => {
        // Рядки таблиці
        const rows = Array.from(table.querySelectorAll('tr'));

        let currentDate = null;

        const result = rows.reduce((data, tr) => {
            const session = {};
            
            if (tr.classList.contains('schedule-table__row_head')) {
                currentDate = tr.querySelector('td:nth-child(1)').textContent.trim();

                return data;
            }

            session.date = currentDate
            session.time = tr.querySelector('td:nth-child(1)').textContent.trim();
            session.movieName = tr.querySelector('td:nth-child(2)').textContent.trim();
            session.hall = tr.querySelector('td:nth-child(3)').textContent.trim();
            session.format = tr.querySelector('td:nth-child(4)').textContent.trim();

            
            data.push(session);
            
            return data;
        }, []);
        
        
        return result;
    }, tableElement)

    data.forEach(session => console.log(`Дані із таблиці: ${session.date}\t${session.time}\t${session.movieName}\t${session.hall}\t${session.format}'`));

    await browser.close();

    return data;
}

const main = async () => {
    SESSIONS = await getSessionFromPremierCity();
    
    console.log('Шукаю сеанси по назві Форсаж X', findSessionsByString('Форсаж X'))
}

main();
