import { ApiProperty } from '@nestjs/swagger';

export class CheckAccessResponseDto {
  @ApiProperty({
    description: 'Whether access is allowed',
    example: true,
  })
  allowed!: boolean;
}
