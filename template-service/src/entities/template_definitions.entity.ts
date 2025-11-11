import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  OneToMany,
  UpdateDateColumn,
  CreateDateColumn,
  Unique,
} from 'typeorm';
import { Template_Version } from './template_versions.entity';

@Entity({ name: 'template_definitions' })
@Unique(['template_code', 'notification_type'])
export class Template_Definition {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column('varchar')
  template_code: string;

  @Column('varchar')
  notification_type: string;

  @Column('text')
  description: string;

  @CreateDateColumn({ type: 'timestamp with time zone' })
  created_at: Date;

  @UpdateDateColumn({ type: 'timestamp with time zone' })
  updated_at: Date;

  @OneToMany(() => Template_Version, (version) => version.definition)
  versions: Template_Version[];
}
