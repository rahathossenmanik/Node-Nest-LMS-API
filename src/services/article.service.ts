import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { FilterQuery, Model } from "mongoose";
import { Role } from "src/constants/enums/role.enum";
import { IPaginatedResult } from "src/interfaces/IPaginatedResult";
import { Article, ArticleDocument } from "src/schemas/article.schema";
import { UserDocument } from "src/schemas/user.schema";

@Injectable()
export class ArticleService {
  constructor(
    @InjectModel(Article.name)
    private articleModel: Model<ArticleDocument>
  ) {}

  async findAllForCatalog(): Promise<Article[]> {
    return this.articleModel.find().populate("author", ["_id", "name"]).exec();
  }

  async findAllForEditorList(
    user: UserDocument = {} as UserDocument
  ): Promise<Article[]> {
    const filter: FilterQuery<Article> = {};
    if (
      (user?.role === Role.Writer || user?.role === Role.Instructor) &&
      user?._id
    )
      filter.author = user?._id;
    return this.articleModel
      .find({ ...filter, status: { $ne: "Blocked" } })
      .populate("author", ["_id", "name"])
      .exec();
  }

  async findPaginatedCatalog(
    page: string = "1",
    perPage: string = "12",
    query: string = ""
  ): Promise<IPaginatedResult<Article>> {
    const filter: FilterQuery<Article> = query
      ? {
          $or: [
            { title: new RegExp(query, "i") },
            { content: new RegExp(query, "i") },
          ],
        }
      : {};
    const data = await this.articleModel
      .find({ ...filter, status: { $ne: "Blocked" } })
      .populate("author", ["_id", "name"])
      .skip((Number(page) - 1) * Number(perPage))
      .limit(Number(perPage))
      .exec();
    const totalCount = await this.articleModel.countDocuments(filter).exec();

    return { data, totalCount };
  }

  async findPaginatedList(
    page: string = "1",
    perPage: string = "12",
    query: string = "",
    user: UserDocument = {} as UserDocument
  ): Promise<IPaginatedResult<Article>> {
    const filter: FilterQuery<Article> = query
      ? {
          $or: [
            { title: new RegExp(query, "i") },
            { content: new RegExp(query, "i") },
          ],
        }
      : {};

    if (
      (user?.role === Role.Writer || user?.role === Role.Instructor) &&
      user?._id
    )
      filter.author = user?._id;
    const data = await this.articleModel
      .find(filter)
      .populate("author", ["_id", "name"])
      .skip((Number(page) - 1) * Number(perPage))
      .limit(Number(perPage))
      .exec();
    const totalCount = await this.articleModel.countDocuments(filter).exec();

    return { data, totalCount };
  }

  async findById(id: string): Promise<Article> {
    return this.articleModel
      .findById(id)
      .populate("author", ["_id", "name"])
      .exec();
  }

  async findByArticleId(articleId: number): Promise<Article> {
    const article = await this.articleModel
      .findOne({ articleId })
      .populate("author", ["_id", "name"])
      .exec();
    if (!article)
      throw new NotFoundException(
        "Article not found! It may have been deleted, moved, or the ID may be incorrect."
      );
    if (article?.status === "Blocked") {
      throw new ForbiddenException(
        "This article is blocked! It is no longer accessible by users."
      );
    }
    return article;
  }

  async create(article: Article): Promise<Article> {
    const { articleId: lastArticleId } =
      (await this.articleModel
        .findOne()
        .sort({ articleId: -1 })
        .select("articleId")
        .exec()) || {};
    article.articleId = (Number(lastArticleId) || 1000) + 1;
    const createdArticle = new this.articleModel(article);
    return createdArticle.save();
  }

  async update(
    id: string,
    article: Article,
    user: UserDocument = {} as UserDocument
  ): Promise<Article> {
    const filter: any = { _id: id };
    if (user?.role === Role.Instructor || user?.role === Role.Writer)
      filter.author = user?._id;
    const newArticle = await this.articleModel.findOneAndUpdate(
      filter,
      article,
      { new: true }
    );
    if (!newArticle)
      throw new NotFoundException(
        "Article not found! It may have been deleted, moved, or the ID may be incorrect."
      );
    return newArticle;
  }

  async block(id: string): Promise<Article> {
    const newArticle = await this.articleModel.findByIdAndUpdate(
      id,
      { status: "Blocked" },
      { new: true }
    );
    if (!newArticle)
      throw new NotFoundException(
        "Article not found! It may have been deleted, moved, or the ID may be incorrect."
      );
    return newArticle;
  }

  async unblock(id: string): Promise<Article> {
    const newArticle = await this.articleModel.findByIdAndUpdate(
      id,
      { status: "Active" },
      { new: true }
    );
    if (!newArticle)
      throw new NotFoundException(
        "Article not found! It may have been deleted, moved, or the ID may be incorrect."
      );
    return newArticle;
  }

  async delete(
    id: string,
    user: UserDocument = {} as UserDocument
  ): Promise<Article> {
    const filter: any = { _id: id };
    if (user?.role === Role.Instructor || user?.role === Role.Writer)
      filter.author = user?._id;
    const deletedArticle = await this.articleModel.findOne(filter).exec();
    if (!deletedArticle)
      throw new NotFoundException(
        "Article not found! It may have been deleted, moved, or the ID may be incorrect."
      );
    await this.articleModel.findOneAndRemove(filter).exec();
    return deletedArticle;
  }
}
