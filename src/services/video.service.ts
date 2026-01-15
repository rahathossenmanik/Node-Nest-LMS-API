import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { FilterQuery, Model } from "mongoose";
import { Role } from "src/constants/enums/role.enum";
import { IPaginatedResult } from "src/interfaces/IPaginatedResult";
import { UserDocument } from "src/schemas/user.schema";
import { Video, VideoDocument } from "src/schemas/video.schema";

@Injectable()
export class VideoService {
  constructor(
    @InjectModel(Video.name)
    private videoModel: Model<VideoDocument>
  ) {}

  async findAllForCatalog(): Promise<Video[]> {
    return this.videoModel
      .find()
      .select("-url")
      .populate("author", ["_id", "name"])
      .exec();
  }

  async findAllForEditorList(
    user: UserDocument = {} as UserDocument
  ): Promise<Video[]> {
    const filter: FilterQuery<Video> = {};
    if (user?.role === Role.Instructor && user?._id) filter.author = user?._id;
    return this.videoModel
      .find({ ...filter, status: { $ne: "Blocked" } })
      .populate("author", ["_id", "name"])
      .exec();
  }

  async findPaginatedCatalog(
    page: string = "1",
    perPage: string = "12",
    query: string = "",
    user: UserDocument = {} as UserDocument
  ): Promise<IPaginatedResult<Video>> {
    const filter: FilterQuery<Video> = query
      ? {
          $or: [
            { title: new RegExp(query, "i") },
            { content: new RegExp(query, "i") },
          ],
        }
      : {};

    const data = await this.videoModel
      .find({ ...filter, status: { $ne: "Blocked" } })
      .select("-url")
      .populate("author", ["_id", "name"])
      .skip((Number(page) - 1) * Number(perPage))
      .limit(Number(perPage))
      .exec();
    const totalCount = await this.videoModel.countDocuments(filter).exec();

    return { data, totalCount };
  }

  async findPaginatedList(
    page: string = "1",
    perPage: string = "12",
    query: string = "",
    user: UserDocument = {} as UserDocument
  ): Promise<IPaginatedResult<Video>> {
    const filter: FilterQuery<Video> = query
      ? {
          $or: [
            { title: new RegExp(query, "i") },
            { content: new RegExp(query, "i") },
          ],
        }
      : {};

    if (user?.role === Role.Instructor && user?._id) filter.author = user?._id;

    const data = await this.videoModel
      .find(filter)
      .populate("author", ["_id", "name"])
      .skip((Number(page) - 1) * Number(perPage))
      .limit(Number(perPage))
      .exec();
    const totalCount = await this.videoModel.countDocuments(filter).exec();

    return { data, totalCount };
  }

  async findById(id: string): Promise<Video> {
    return this.videoModel
      .findById(id)
      .populate("author", ["_id", "name"])
      .exec();
  }

  async findByVideoId(videoId: number): Promise<Video> {
    const video = await this.videoModel
      .findOne({ videoId })
      .populate("author", ["_id", "name"])
      .exec();
    if (!video)
      throw new NotFoundException(
        "Video not found! It may have been deleted, moved, or the ID may be incorrect."
      );
    if (video?.status === "Blocked") {
      throw new ForbiddenException(
        "This video is blocked! It is no longer accessible by users."
      );
    }
    return video;
  }

  async create(video: Video): Promise<Video> {
    const { videoId: lastVideoId } =
      (await this.videoModel
        .findOne()
        .sort({ videoId: -1 })
        .select("videoId")
        .exec()) || {};
    video.videoId = (Number(lastVideoId) || 1000) + 1;
    const createdVideo = new this.videoModel(video);
    return createdVideo.save();
  }

  async update(
    id: string,
    video: Video,
    user: UserDocument = {} as UserDocument
  ): Promise<Video> {
    const filter: any = { _id: id };
    if (user?.role === Role.Instructor) filter.author = user?._id;
    const newVideo = await this.videoModel.findOneAndUpdate(filter, video, {
      new: true,
    });
    if (!newVideo)
      throw new NotFoundException(
        "Video not found! It may have been deleted, moved, or the ID may be incorrect."
      );
    return newVideo;
  }

  async block(id: string): Promise<Video> {
    const newVideo = await this.videoModel.findByIdAndUpdate(
      id,
      { status: "Blocked" },
      { new: true }
    );
    if (!newVideo)
      throw new NotFoundException(
        "Video not found! It may have been deleted, moved, or the ID may be incorrect."
      );
    return newVideo;
  }

  async unblock(id: string): Promise<Video> {
    const newVideo = await this.videoModel.findByIdAndUpdate(
      id,
      { status: "Active" },
      { new: true }
    );
    if (!newVideo)
      throw new NotFoundException(
        "Video not found! It may have been deleted, moved, or the ID may be incorrect."
      );
    return newVideo;
  }

  async delete(
    id: string,
    user: UserDocument = {} as UserDocument
  ): Promise<Video> {
    const filter: any = { _id: id };
    if (user?.role === Role.Instructor) filter.author = user?._id;
    const deletedVideo = await this.videoModel.findOne(filter).exec();
    if (!deletedVideo)
      throw new NotFoundException(
        "Video not found! It may have been deleted, moved, or the ID may be incorrect."
      );
    await this.videoModel.findOneAndRemove(filter).exec();
    return deletedVideo;
  }
}
