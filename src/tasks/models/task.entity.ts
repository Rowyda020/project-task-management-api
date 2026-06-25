import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from "typeorm";
import { Project } from "../../projects/models/project.entity";
import { TaskPriority } from "../enums/task-priority.enum";
import { TaskStatus } from "../enums/task-status.enum";

@Entity("tasks")
export class Task {
  @PrimaryGeneratedColumn("uuid")
  id!: string;

  @Column({ type: "varchar", length: 255 })
  title!: string;

  @Column({ type: "text" })
  description!: string;

  @Column({ type: "enum", enum: TaskStatus })
  status!: TaskStatus;

  @Column({ type: "enum", enum: TaskPriority })
  priority!: TaskPriority;

  @Column({ type: "timestamp" })
  dueDate!: Date;

  @ManyToOne(() => Project, (project) => project.tasks)
  project!: Project;
}
