export class StudentGradeEntity {
  constructor(
    public readonly studentId: string,
    public readonly name: string,
    public readonly scores: Record<string, number>,
    public readonly average: number,
  ) {}
}

export class GradebookEntity {
  constructor(
    public readonly courseId: string,
    public readonly students: StudentGradeEntity[],
  ) {}
}
