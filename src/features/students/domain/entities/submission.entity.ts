export class SubmissionEntity {
  constructor(
    public readonly submissionId: string,
    public readonly message: string,
    public readonly timestamp: string,
  ) {}
}
