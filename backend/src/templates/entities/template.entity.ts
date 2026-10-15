import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  PrimaryGeneratedColumn,
} from 'typeorm';

@Entity('templates')
export class Template {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Index('idx_templates_template_key', { unique: true })
  @Column({ type: 'varchar', length: 100, unique: true, name: 'template_key' })
  templateKey!: string;

  @Column({ type: 'varchar', length: 150 })
  name!: string;

  @Column({ type: 'varchar', length: 500 })
  description!: string;

  @Column({ type: 'boolean', default: true, name: 'is_free' })
  isFree!: boolean;

  @Column({ type: 'jsonb', default: {}, name: 'layout_options' })
  layoutOptions!: Record<string, unknown>;

  @Column({ type: 'boolean', default: true, name: 'is_active' })
  isActive!: boolean;

  @CreateDateColumn({ type: 'timestamptz', name: 'created_at' })
  createdAt!: Date;
}
