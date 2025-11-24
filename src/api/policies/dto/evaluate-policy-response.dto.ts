import { ApiProperty } from '@nestjs/swagger';
import { AccessSource } from '../../../common/enums/access-source.enum';
import { MatchedPolicyDto } from './matched-policy.dto';

export class EvaluatePolicyResponseDto {
  @ApiProperty({
    description: 'Whether access is allowed',
    example: true,
  })
  allowed!: boolean;

  @ApiProperty({
    description: 'Source of the decision',
    example: AccessSource.ROLE_AND_POLICY,
    enum: AccessSource,
    enumName: 'AccessSource',
  })
  source!: AccessSource;

  @ApiProperty({
    description: 'Array of matched policies',
    type: [MatchedPolicyDto],
    example: [
      {
        id: '73e48375-083b-40a1-9172-811840ea5ca2',
        effect: 'ALLOW',
      },
    ],
  })
  matchedPolicies!: MatchedPolicyDto[];
}
