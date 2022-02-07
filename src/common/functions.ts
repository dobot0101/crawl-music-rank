import moment from 'moment';
import { GenieScraper } from '../classes/genieScraper';
import { MelonScraper } from '../classes/melonScraper';
import { VibeScraper } from '../classes/vibeScraper';
import logger from '../logger';
import { MusicInfo } from './types';

// 음원 사이트별 스크랩
// 스크랩 후 스크랩 시간을 업데이트한다
export async function scrapeByVendor(vendor: string, db: any) {
  logger.info('스크래핑 시작');

  let items: MusicInfo[] | null = null;
  if (vendor === 'melon') {
    const melonScraper = new MelonScraper();
    items = await melonScraper.scrape();
  } else if (vendor === 'genie') {
    const genieScraper = new GenieScraper();
    items = await genieScraper.scrape();
  } else {
    const vibeScraper = new VibeScraper();
    items = await vibeScraper.scrape();
  }

  if (items && items.length > 0) {
    db.push(`/${vendor}`, { items, scrapeTime: moment().format('YYYY-MM-DD HH:mm') });
  }

  logger.info('스크래핑 종료');
}

// 새로 스크랩 해야되는지 확인
export function checkNeedScrape(vendor: string, db: any) {
  let result = false;
  try {
    const scrapeTime = db.getData(`/${vendor}/scrapeTime`);
    if (scrapeTime) {
      const scrapeMoment = moment(scrapeTime);
      if (moment().diff(scrapeMoment, 'minute') > 30) {
        result = true;
      }
    } else {
      result = true;
    }
  } catch (error) {
    logger.info(`데이터가 없습니다.`);
    result = true;
  }

  return result;
}
