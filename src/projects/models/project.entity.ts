import { Entity, PrimaryGeneratedColumn, Column, ManyToOne } from "typeorm";
import { User } from "../../users/models/user.entity";
import { ProjectStatus } from "../enums/project-status.enum";

@Entity("projects")
export class Project {
  @PrimaryGeneratedColumn("uuid")
  id!: string;

  @Column({ type: "varchar", length: 255 })
  title!: string;

  @Column({ type: "text" })
  description!: string;

  @Column({ type: "enum", enum: ProjectStatus })
  status!: ProjectStatus;

  @ManyToOne(() => User, (user) => user.projects)
  user!: User;

}