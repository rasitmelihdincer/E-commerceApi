export class CustomerEntity {
    constructor(
        public id: number,
        public firstName: string,
        public lastName: string,
        public email: string,
        public hashedPassword: string,
        public createAt: Date,
        public updateAt: Date,
      ) {}
  }
  