import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, OneToMany } from "typeorm";
import { Project } from "../../projects/models/project.entity";

@Entity("users")
export class User {
  @PrimaryGeneratedColumn("uuid")
  id!: string;

  @Column()
  name!: string;

  @Column({ type: "varchar", unique: true })
  email!: string;

  @Column()
  password!: string;

  @CreateDateColumn({ type: "timestamp" })
  createdAt!: Date;

  @OneToMany(() => Project, (project) => project.user)
  projects!: Project[];
}
