import axios, { AxiosResponse } from 'axios';
import { MusicDetail, MusicInfo, MusicSummary } from '../common/types';

export class VibeScraper {
  // url: string = 'https://vibe.naver.com/chart/total';
  readonly url: string = 'https://apis.naver.com/vibeWeb/musicapiweb/vibe/v1/chart/track/total';
  readonly detailUrl: string =
    'https://apis.naver.com/vibeWeb/musicapiweb/album/${albumId}?includeDesc=true&includeIntro=true';

  async scrape(): Promise<MusicInfo[]> {
    const musicInfos: MusicInfo[] = [];

    try {
      const response = await axios.get(this.url);
      const tracks = response.data.response.result.chart.items.tracks;

      for (const track of tracks) {
        const musicInfo: MusicInfo = {
          musicId: track.trackId,
          summary: this.getSummary(track),
          detail: await this.getDetail(track),
        };

        musicInfos.push(musicInfo);
      }
    } catch (error) {
      console.log(error);
    }
    return musicInfos;
  }

  async getDetail(track: any): Promise<MusicDetail> {
    const albumId = track.album.albumId;
    if (!albumId) {
      throw new Error('albumId is none');
    }

    try {
      const response = await axios.get(this.detailUrl.replace('${albumId}', albumId));
      const { agencyName: agency, productionName: publisher } = response.data.response.result.album;
      const detail = {
        agency,
        publisher: publisher ?? '',
      };
      return detail;
    } catch (error) {
      throw error;
    }
  }

  getSummary(track: any): MusicSummary {
    return {
      ranking: track.rank.currentRank,
      name: track.trackTitle,
      singer: track.artists.map((obj: { artistName: string }) => obj.artistName).join(','),
      album: track.album.albumTitle,
      // albumImageUrl: track.album.imageUrl,
    };
  }
}
