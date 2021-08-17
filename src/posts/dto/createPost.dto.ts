import { IsString, IsNotEmpty } from 'class-validator';

export default class CreatePostDto {
  @IsNotEmpty()
  @IsString()
  content: string;

  @IsNotEmpty()
  @IsString()
  title: string;
}
