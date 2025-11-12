import { Test, TestingModule } from '@nestjs/testing';
import { HealthCheckController } from './health_check.controller';
import {
  HealthCheckService,
  TypeOrmHealthIndicator,
  HealthCheckResult,
} from '@nestjs/terminus';

const mockHealthCheckService = {
  check: jest.fn(),
};

const mockTypeOrmHealthIndicator = {
  pingCheck: jest.fn(),
};

describe('HealthController', () => {
  let controller: HealthCheckController;
  let health: HealthCheckService;

  beforeEach(async () => {
    jest.clearAllMocks();

    const module: TestingModule = await Test.createTestingModule({
      controllers: [HealthCheckController],
      providers: [
        {
          provide: HealthCheckService,
          useValue: mockHealthCheckService,
        },
        {
          provide: TypeOrmHealthIndicator,
          useValue: mockTypeOrmHealthIndicator,
        },
      ],
    }).compile();

    controller = module.get<HealthCheckController>(HealthCheckController);
    health = module.get<HealthCheckService>(HealthCheckService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('check', () => {
    it('should call the HealthCheckService and return a health check result', async () => {
      const mockResult: HealthCheckResult = {
        status: 'ok',
        info: { database: { status: 'up' } },
        error: {},
        details: { database: { status: 'up' } },
      };

      mockHealthCheckService.check.mockResolvedValue(mockResult);

      const result = await controller.check();

      expect(result).toEqual(mockResult);

      expect(health.check).toHaveBeenCalled();

      expect(health.check).toHaveBeenCalledWith(
        expect.arrayContaining([expect.any(Function)]),
      );
    });
  });
});
