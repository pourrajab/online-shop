import { BlogCommentEntity } from "../entities/comment.entity";

export interface CommentsData {
  pagination: {
    totalCount: number;
    page: number;
    limit: number;
    pageCount: number;
  };
  comments: BlogCommentEntity[];
}

