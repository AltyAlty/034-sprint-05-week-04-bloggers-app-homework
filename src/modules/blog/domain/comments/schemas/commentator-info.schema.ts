import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { USER_VALIDATION_CONSTRAINTS } from '../../../../../core/validation/constraints/user.validation-constraints';

/*Схема для поля "commentatorInfo" в сущности комментария.*/
@Schema({ _id: false })
export class CommentatorInfo {
  @Prop({
    type: String,
    required: true,
    trim: true,
    minlength: USER_VALIDATION_CONSTRAINTS.ID.MIN_LENGTH,
    maxlength: USER_VALIDATION_CONSTRAINTS.ID.MAX_LENGTH,
  })
  public userId: string;

  @Prop({
    type: String,
    required: true,
    trim: true,
    minlength: USER_VALIDATION_CONSTRAINTS.LOGIN.MIN_LENGTH,
    maxlength: USER_VALIDATION_CONSTRAINTS.LOGIN.MAX_LENGTH,
  })
  public userLogin: string;
}

export const CommentatorInfoSchema = SchemaFactory.createForClass(CommentatorInfo);
