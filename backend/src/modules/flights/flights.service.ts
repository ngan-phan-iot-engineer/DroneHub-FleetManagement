import { Injectable, Inject, NotFoundException } from '@nestjs/common';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Cache } from 'cache-manager';
import { PrismaService } from '@common/prisma/prisma.service';

@Injectable()
export class FlightsService {
  constructor(
    private prisma: PrismaService,
    @Inject(CACHE_MANAGER) private cacheManager: Cache,
  ) {}

  async findAll(userId: string, skip = 0, take = 10) {
    const cacheKey = `flights:${userId}:${skip}:${take}`;
    const cached = await this.cacheManager.get(cacheKey);
    if (cached) return cached;

    const flights = await this.prisma.flight.findMany({
      where: { userId },
      skip,
      take,
      orderBy: { departureTime: 'asc' },
    });

    await this.cacheManager.set(cacheKey, flights, 300000);
    return flights;
  }

  async findById(id: string) {
    const flight = await this.prisma.flight.findUnique({
      where: { id },
    });
    if (!flight) {
      throw new NotFoundException(`Flight with ID ${id} not found`);
    }
    return flight;
  }

  async create(userId: string, data: any) {
    const flight = await this.prisma.flight.create({
      data: {
        ...data,
        userId,
      },
    });

    // Invalidate all cache keys for this user (flights:userId:skip:take)
    try {
      const keys = await (this.cacheManager.store as any).keys();
      const userKeys = keys.filter((key: string) => key.startsWith(`flights:${userId}:`));
      for (const key of userKeys) {
        await this.cacheManager.del(key);
      }
    } catch (error) {
      // Log error but don't fail the request
      console.warn('Cache invalidation error:', error);
    }
    return flight;
  }

  async update(id: string, data: any) {
    const flight = await this.prisma.flight.update({
      where: { id },
      data,
    });

    // Invalidate all cache keys for this user
    try {
      const keys = await (this.cacheManager.store as any).keys();
      const userKeys = keys.filter((key: string) => key.startsWith(`flights:${flight.userId}:`));
      for (const key of userKeys) {
        await this.cacheManager.del(key);
      }
    } catch (error) {
      console.warn('Cache invalidation error:', error);
    }
    return flight;
  }

  async delete(id: string) {
    const flight = await this.prisma.flight.findUnique({ where: { id } });
    await this.prisma.flight.delete({ where: { id } });

    // Invalidate all cache keys for this user
    if (flight) {
      try {
        const keys = await (this.cacheManager.store as any).keys();
        const userKeys = keys.filter((key: string) => key.startsWith(`flights:${flight.userId}:`));
        for (const key of userKeys) {
          await this.cacheManager.del(key);
        }
      } catch (error) {
        console.warn('Cache invalidation error:', error);
      }
    }
    return flight;
  }
}
