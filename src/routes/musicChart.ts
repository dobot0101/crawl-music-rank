import express, { NextFunction, Request, Response } from 'express';
import { Database } from '../classes/database';
import { checkNeedScrape, scrapeByVendor } from '../common/functions';
import { MusicInfo } from '../common/types';
import logger from '../logger';

const router = express.Router();

// 상세정보 (발매사, 기획사 정보가 추가)
router.get('/:vendor/song/:musicId', async (req: Request, res: Response, next: NextFunction) => {
  const { vendor, musicId } = req.params;
  const db = new Database('db').db;

  try {
    if (checkNeedScrape(vendor, db)) {
      await scrapeByVendor(vendor, db);
    }

    const items = db.getData(`/${vendor}/items`);
    const item: MusicInfo = items.find((item: MusicInfo) => {
      return item.musicId.toString() === musicId;
    });

    if (!item) {
      throw new Error('아이디와 매칭되는 데이터가 없습니다.');
    }
    res.json(item);
  } catch (error) {
    logger.error(`스크래핑 실패: ${error}`);
  }
});

// 음원 목록
router.get('/:vendor/summary', async (req: Request, res: Response, next: NextFunction) => {
  const { vendor } = req.params;

  const db = new Database('db').db;

  try {
    if (checkNeedScrape(vendor, db)) {
      await scrapeByVendor(vendor, db);
    }

    const items = db.getData(`/${vendor}/items`);
    const summaries = items.map((data: MusicInfo) => data.summary);
    res.json(summaries);
  } catch (error) {
    logger.error(`스크래핑 실패: ${error}`);
  }
});

// 모든 음원의 목록 & 상세정보
router.get('/:vendor/songs', async (req: Request, res: Response, next: NextFunction) => {
  const { vendor } = req.params;
  const db = new Database('db').db;

  try {
    if (checkNeedScrape(vendor, db)) {
      await scrapeByVendor(vendor, db);
    }
    res.json(db.getData(`/${vendor}/items`));
  } catch (error) {
    logger.error(`스크래핑 실패: ${error}`);
  }
});

export = router;
