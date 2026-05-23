import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '@common/prisma/prisma.service';

@Injectable()
export class TeamsService {
  constructor(private prisma: PrismaService) {}

  async findAll(userId: string) {
    return this.prisma.team.findMany({
      where: { userId },
      include: {
        members: true,
      },
    });
  }

  async findById(id: string) {
    const team = await this.prisma.team.findUnique({
      where: { id },
      include: {
        members: true,
      },
    });
    if (!team) {
      throw new NotFoundException(`Team with ID ${id} not found`);
    }
    return team;
  }

  async create(userId: string, data: any) {
    return this.prisma.team.create({
      data: {
        ...data,
        userId,
      },
      include: {
        members: true,
      },
    });
  }

  async update(id: string, data: any) {
    return this.prisma.team.update({
      where: { id },
      data,
      include: {
        members: true,
      },
    });
  }

  async delete(id: string) {
    return this.prisma.team.delete({
      where: { id },
    });
  }

  async addMember(
    teamId: string,
    memberId: string,
    role: import('@prisma/client').TeamRole = 'MEMBER',
  ) {
    return this.prisma.teamMember.create({
      data: {
        teamId,
        memberId,
        role,
      },
    });
  }

  async removeMember(teamId: string, memberId: string) {
    return this.prisma.teamMember.deleteMany({
      where: {
        teamId,
        memberId,
      },
    });
  }
}
