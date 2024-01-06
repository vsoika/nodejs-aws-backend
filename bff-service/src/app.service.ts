import { HttpService } from '@nestjs/axios';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import {
  ForbiddenException,
  HttpException,
  Inject,
  Injectable,
} from '@nestjs/common';
import { AxiosRequestConfig } from 'axios';
import { catchError, firstValueFrom } from 'rxjs';
import { Cache } from 'cache-manager';

// !!! express is used only for typing
import { Request } from 'express';

@Injectable()
export class AppService {
  constructor(
    private httpService: HttpService,
    @Inject(CACHE_MANAGER) private cacheManager: Cache,
  ) {}

  async getData(httpConfig: AxiosRequestConfig) {
    return await firstValueFrom(
      this.httpService.request(httpConfig).pipe(
        catchError((err) => {
          if (err.response) {
            const { status, data } = err.response;

            throw new HttpException(
              {
                status,
                error: data,
              },
              status,
              {
                cause: err,
              },
            );
          } else {
            throw new ForbiddenException(err.message);
          }
        }),
      ),
    );
  }

  getHttpConfig(targetURL: string, req: Request) {
    return {
      method: req.method,
      url: targetURL,
      headers: { authorization: req.headers.authorization },
      ...(Object.keys(req.body || {}).length > 0 && { data: req.body }),
    };
  }

  async getAllProductsCache(
    isGetProductListRequest: boolean,
    cacheKey: string,
  ) {
    if (!isGetProductListRequest) return undefined;

    return await this.cacheManager.get(cacheKey);
  }

  async setAllProductsCache(
    isGetProductListRequest: boolean,
    cacheKey: string,
    responseData: any,
  ) {
    const TTL = 120000;

    if (isGetProductListRequest) {
      await this.cacheManager.set(cacheKey, responseData, TTL);
    }
  }
}
