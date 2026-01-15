import { Controller, Get, Post, Body, Put, Param, Delete } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { Log } from 'src/schemas/log.schema';
import { LogService } from 'src/services/log.service';

@ApiBearerAuth()
@ApiTags('Logs')
@Controller('logs')
export class LogsController {
  constructor(private logsService: LogService) { }

  @Get('getall')
  async findAll(): Promise<Log[]> {
    return this.logsService.findAll();
  }

  @Get('getbyid/:id')
  async findById(@Param('id') id: string): Promise<Log> {
    return this.logsService.findById(id);
  }

  @Post('create')
  async create(@Body() log: Log): Promise<Log> {
    return this.logsService.create(log);
  }

  @Put('update/:id')
  async update(@Param('id') id: string, @Body() log: Log): Promise<Log> {
    return this.logsService.update(id, log);
  }

  @Delete('delete/:id')
  async delete(@Param('id') id: string): Promise<Log> {
    return this.logsService.delete(id);
  }
}
