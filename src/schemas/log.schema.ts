import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { ApiProperty } from '@nestjs/swagger';
import mongoose, { HydratedDocument } from 'mongoose';


export type LogDocument = HydratedDocument<Log>;

@Schema({ timestamps: true, versionKey: false })
export class Log {
  @ApiProperty({ example: '{}', required: true })
  @Prop({ type: mongoose.Schema.Types.Mixed, required: true })
  error: any;
}

export const LogSchema = SchemaFactory.createForClass(Log);