import { Entity, Column, PrimaryGeneratedColumn, ManyToMany } from 'typeorm';

import Post from 'src/posts/post.entity';

@Entity('categories')
export default class Category {
  @PrimaryGeneratedColumn()
  public id: number;

  @Column()
  public name: string;

  @ManyToMany(() => Post, (post: Post) => post.categories)
  public posts: Post[];
}
