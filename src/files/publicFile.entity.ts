import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';

@Entity('files')
class PublicFile {
  @PrimaryGeneratedColumn()
  public id: number;

  @Column()
  public url: string;

  @Column()
  public key: string;
}

export default PublicFile;
