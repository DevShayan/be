export interface UploadMaterialParams {
  title: string;
  type: string;
  fileUrl: string;
  visibilityDate?: string;
}

export interface CreateAssignmentParams {
  title: string;
  dueDate?: string;
}

export interface GradeEntry {
  studentId: string;
  score: number;
}

export interface EnterGradesParams {
  assignmentId: string;
  grades: GradeEntry[];
}
