import {
  BadGatewayException,
  Inject,
  Injectable,
  NestMiddleware,
} from '@nestjs/common';

// !!! express is used only for typing
import { Request, Response } from 'express';
import { HttpService } from '@nestjs/axios';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Cache } from 'cache-manager';
import { AppService } from 'src/app.service';

@Injectable()
export class BffMiddleware implements NestMiddleware {
  constructor(
    private httpService: HttpService,
    private appService: AppService,
    @Inject(CACHE_MANAGER) private cacheManager: Cache,
  ) {}

  async use(req: Request, res: Response) {
    const recipient = req.originalUrl.split('/')[1];
    const recipientURL = process.env[recipient];
    const mainPath = req.originalUrl.replace(`/${recipient}`, '');
    const targetURL = `${recipientURL}${mainPath}`;

    const isGetProductListRequest =
      req.method === 'GET' && mainPath === '/products';

    if (recipientURL) {
      const httpConfig = this.appService.getHttpConfig(targetURL, req);
      const cacheKey = 'product_list_data';

      const cacheData = await this.appService.getAllProductsCache(
        isGetProductListRequest,
        cacheKey,
      );

      if (cacheData && isGetProductListRequest) {
        return res.json(cacheData);
      }

      const response = await this.appService.getData(httpConfig);

      await this.appService.setAllProductsCache(
        isGetProductListRequest,
        cacheKey,
        response.data,
      );

      res.json(response.data);
    } else {
      throw new BadGatewayException('Cannot process request');
    }
  }
}
