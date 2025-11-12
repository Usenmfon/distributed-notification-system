import { Entity, PrimaryGeneratedColumn, Column, ManyToOne } from 'typeorm';
import { Template_Definition } from './template_definitions.entity';

@Entity({ name: 'template_versions' })
export class Template_Version {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(
    () => Template_Definition,
    (template_definition) => template_definition.versions,
  )
  definition: Template_Definition;

  @Column('int')
  version: number;

  @Column('varchar')
  language_code: string;

  @Column('jsonb')
  content: object;

  @Column('boolean', { default: false })
  is_active: boolean;
}
