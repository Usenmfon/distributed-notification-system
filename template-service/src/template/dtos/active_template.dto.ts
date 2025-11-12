import { IsNotEmpty, IsString } from 'class-validator';

export class Active_Template_Query_Dto {
  @IsNotEmpty()
  @IsString()
  code: string;

  @IsNotEmpty()
  @IsString()
  lang: string;

  @IsNotEmpty()
  @IsString()
  type: string;
}
