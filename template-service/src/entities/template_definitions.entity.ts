import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  OneToMany,
  UpdateDateColumn,
  CreateDateColumn,
} from 'typeorm';
import { TemplateVersion } from './template_versions.entity';

@Entity({ name: 'template_definitions' })
export class TemplateDefinition {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true })
  template_code: string;

  @Column('varchar')
  notification_type: string;

  @Column('text')
  description: string;

  @CreateDateColumn('timestamp with timezone')
  created_at: Date;

  @UpdateDateColumn('timestamp with timezone')
  updated_at: Date;

  @OneToMany(() => TemplateVersion, (version) => version.definition)
  versions: TemplateVersion[];
}
