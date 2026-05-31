export interface CreateUserParams {
  role: string;
  email: string;
  name: string;
  program?: string;
}

export interface AssignRoleParams {
  role: string;
  coursePermissions?: string[];
}

export interface CreateCourseParams {
  courseId: string;
  name: string;
  credits: number;
  teacherId?: string;
}
