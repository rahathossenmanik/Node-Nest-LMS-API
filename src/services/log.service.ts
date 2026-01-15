import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Log, LogDocument } from 'src/schemas/log.schema';

@Injectable()
export class LogService {
  constructor(
    @InjectModel(Log.name)
    private logModel: Model<LogDocument>
  ) { }

  async findAll(): Promise<Log[]> {
    return this.logModel.find().exec();
  }

  async findById(id: string): Promise<Log> {
    return this.logModel.findById(id).exec();
  }

  async create(log: Log): Promise<Log> {
    const createdLog = new this.logModel(log);
    return createdLog.save();
  }

  async update(id: string, log: Log): Promise<Log> {
    await this.logModel.findByIdAndUpdate(id, log);
    return this.logModel.findById(id).exec();
  }

  async delete(id: string): Promise<Log> {
    const deletedLog = await this.logModel.findById(id).exec();
    await this.logModel.findByIdAndRemove(id).exec();
    return deletedLog;
  }
}
