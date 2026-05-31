export interface SubmitAssignmentParams {
  courseId: string;
  assignmentId: string;
  fileUrl: string;
}

export interface RegisterCoursesParams {
  courseIds: string[];
}

export interface GradeResult {
  courseId: string;
  name: string;
  grade: string;
  gpa: number;
}

export interface GradesResponse {
  semester: string;
  courses: GradeResult[];
  overallGPA: number;
}
