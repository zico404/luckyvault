import { IsString, IsNumber, IsOptional, Min, Max, IsDateString } from 'class-validator';

export class CreateDrawDto {
  @IsString()
  title: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsNumber()
  @Min(0.01)
  ticketPrice: number;

  @IsNumber()
  @Min(1)
  @Max(100000)
  maxTickets: number;

  @IsOptional()
  @IsNumber()
  @Min(1)
  winnerCount?: number;

  @IsDateString()
  scheduledAt: string;
}

export class UpdateDrawDto {
  @IsOptional()
  @IsString()
  title?: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsNumber()
  @Min(0.01)
  ticketPrice?: number;

  @IsOptional()
  @IsNumber()
  @Min(1)
  @Max(100000)
  maxTickets?: number;

  @IsOptional()
  @IsNumber()
  @Min(1)
  winnerCount?: number;

  @IsOptional()
  @IsDateString()
  scheduledAt?: string;
}
