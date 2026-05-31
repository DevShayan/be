export class UserProfileEntity {
  constructor(
    public readonly userId: string,
    public readonly name: string,
    public readonly role: string,
    public readonly email: string,
  ) {}
}
