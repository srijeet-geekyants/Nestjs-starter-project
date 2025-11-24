import { ApiProperty } from '@nestjs/swagger';

export class MatchedPolicyDto {
  @ApiProperty({
    description: 'Policy ID',
    example: '73e48375-083b-40a1-9172-811840ea5ca2',
  })
  id!: string;

  @ApiProperty({
    description: 'Policy effect',
    example: 'ALLOW',
    enum: ['ALLOW', 'DENY'],
  })
  effect!: string;
}
