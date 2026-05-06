import { IsOptional, IsString } from 'class-validator';

export class OTPFilterDTO {
  @IsOptional()
  @IsString()
  searchTerm?: string;
}
