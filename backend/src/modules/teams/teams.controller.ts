import { Controller, Get, Post, Put, Delete, Param, Body, UseGuards, Req } from '@nestjs/common';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuthGuard } from '@modules/auth/guards/jwt-auth.guard';
import { TeamsService } from './teams.service';

@ApiTags('Teams')
@Controller('teams')
export class TeamsController {
  constructor(private teamsService: TeamsService) {}

  @Get()
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  async getAll(@Req() req: any) {
    return this.teamsService.findAll(req.user.id);
  }

  @Get(':id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  async getById(@Param('id') id: string) {
    return this.teamsService.findById(id);
  }

  @Post()
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  async create(@Req() req: any, @Body() data: any) {
    return this.teamsService.create(req.user.id, data);
  }

  @Put(':id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  async update(@Param('id') id: string, @Body() data: any) {
    return this.teamsService.update(id, data);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  async delete(@Param('id') id: string) {
    return this.teamsService.delete(id);
  }

  @Post(':teamId/members')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  async addMember(
    @Param('teamId') teamId: string,
    @Body() data: { memberId: string; role?: import('@prisma/client').TeamRole },
  ) {
    return this.teamsService.addMember(teamId, data.memberId, data.role);
  }

  @Delete(':teamId/members/:memberId')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  async removeMember(@Param('teamId') teamId: string, @Param('memberId') memberId: string) {
    return this.teamsService.removeMember(teamId, memberId);
  }
}
