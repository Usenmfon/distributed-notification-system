import { Entity, PrimaryGeneratedColumn, Column, ManyToOne } from 'typeorm';
import { TemplateDefinition } from './template_definitions.entity';

@Entity({ name: 'template_versions' })
export class TemplateVersion {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(
    () => TemplateDefinition,
    (template_definition) => template_definition.versions,
  )
  definition: TemplateDefinition;

  @Column('int')
  version: number;

  @Column('varchar')
  language_code: string;

  @Column('jsonb')
  content: object;

  @Column('boolean', { default: true })
  is_active: boolean;
}
