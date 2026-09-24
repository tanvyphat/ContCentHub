import { Test, TestingModule } from '@nestjs/testing';
import { MarketplacesService } from './marketplaces.service.js';

describe('MarketplacesService', () => {
  let service: MarketplacesService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [MarketplacesService],
    }).compile();

    service = module.get<MarketplacesService>(MarketplacesService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
