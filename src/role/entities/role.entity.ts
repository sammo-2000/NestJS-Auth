import { PermissionType } from 'src/permission/permissions';
import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity()
export class Role {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ unique: true, length: 100 })
  name: string;

  @Column('simple-array')
  permissions: PermissionType[];
}
