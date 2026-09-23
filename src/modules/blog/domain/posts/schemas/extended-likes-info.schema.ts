import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';

/*Схема для поля "extendedLikesInfo" в сущности поста.*/
@Schema({ _id: false })
export class ExtendedLikesInfo {
  @Prop({ type: Number, required: true, min: 0, default: 0 })
  public likesCount: number;

  @Prop({ type: Number, required: true, min: 0, default: 0 })
  public dislikesCount: number;
}

export const ExtendedLikesInfoSchema = SchemaFactory.createForClass(ExtendedLikesInfo);
