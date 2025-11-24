import { ApiProperty, PartialType, OmitType } from '@nestjs/swagger';
import { RolesDto } from '../../roles/dto/roles.dto';
import { UsersDto } from './users.dto';

export class UserRolesDto extends PartialType(OmitType(UsersDto, ['createdAt'] as const)) {
  @ApiProperty({
    title: 'Roles',
    description: 'Array of roles assigned to this user',
    type: [RolesDto],
    example: [
      {
        id: '73e48375-083b-40a1-9172-811840ea5ca2',
        tenantId: '73e48375-083b-40a1-9172-811840ea5ca2',
        code: 'USER',
        name: 'User',
        builtIn: false,
      },
    ],
  })
  roles!: RolesDto[];

  @ApiProperty({
    title: 'Created At',
    description: 'The creation date of the user',
    example: '2024-01-15T10:30:00Z',
    format: 'date-time',
    required: false,
  })
  createdAt?: string;
}
