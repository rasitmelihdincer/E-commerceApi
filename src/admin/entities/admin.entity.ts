export class AdminEntity {
  constructor(
    public id: number,
    public firstName: string,
    public lastName: string,
    public email: string,
    public hashedPassword: string,
    public createdAt: Date,
    public updatedAt: Date,
  ) {}
}
