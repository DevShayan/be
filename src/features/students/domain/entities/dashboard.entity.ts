export class CourseProgressEntity {
  constructor(
    public readonly courseId: string,
    public readonly name: string,
    public readonly progress: number,
    public readonly nextDeadline: string | null,
    public readonly pendingAssignments: number,
  ) {}
}

export class DashboardEntity {
  constructor(
    public readonly courses: CourseProgressEntity[],
    public readonly notifications: string[],
    public readonly todoItems: string[],
  ) {}
}
