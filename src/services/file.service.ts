require("dotenv").config({ path: ".env" });
import { Injectable } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Model } from "mongoose";
import { File, FileDocument, FileInput } from "src/schemas/file.schema";
import { v2 as cloudinary, UploadApiResponse } from "cloudinary";

// Configuration
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

@Injectable()
export class FileService {
  constructor(
    @InjectModel(File.name)
    private fileModel: Model<FileDocument>
  ) {}

  async findAll(): Promise<File[]> {
    return this.fileModel.find().exec();
  }

  async findById(id: string): Promise<File> {
    return this.fileModel.findById(id).exec();
  }

  async create(file: FileInput): Promise<File> {
    const { url, title } = file;
    // Upload an image
    const uploadResult = await cloudinary.uploader
      .upload(url, {
        public_id: title,
      })
      .catch((error) => {
        console.log(error);
      });

    const createdFile = new this.fileModel(uploadResult);
    return createdFile.save();
  }

  async update(id: string, file: File): Promise<File> {
    await this.fileModel.findByIdAndUpdate(id, file);
    return this.fileModel.findById(id).exec();
  }

  async delete(id: string): Promise<File> {
    const deletedFile = await this.fileModel.findById(id).exec();
    await this.fileModel.findByIdAndRemove(id).exec();
    return deletedFile;
  }
}
