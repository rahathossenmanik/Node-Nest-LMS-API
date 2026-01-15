import {
  Controller,
  Get,
  Post,
  Body,
  Put,
  Param,
  Delete,
} from "@nestjs/common";
import { ApiBearerAuth, ApiTags } from "@nestjs/swagger";
import { UploadApiResponse } from "cloudinary";
import { File, FileInput } from "src/schemas/file.schema";
import { FileService } from "src/services/file.service";

@ApiBearerAuth()
@ApiTags("Files")
@Controller("files")
export class FileController {
  constructor(private fileService: FileService) {}

  // @Get("getall")
  // async findAll(): Promise<File[]> {
  //   return this.fileService.findAll();
  // }

  // @Get("getbyid/:id")
  // async findById(@Param("id") id: string): Promise<File> {
  //   return this.fileService.findById(id);
  // }

  @Post("create")
  async create(@Body() file: FileInput): Promise<File> {
    return this.fileService.create(file);
  }

  // @Put("update/:id")
  // async update(@Param("id") id: string, @Body() file: File): Promise<File> {
  //   return this.fileService.update(id, file);
  // }

  // @Delete("delete/:id")
  // async delete(@Param("id") id: string): Promise<File> {
  //   return this.fileService.delete(id);
  // }
}
