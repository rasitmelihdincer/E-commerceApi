import { Injectable } from "@nestjs/common";
import { Customer, Prisma } from "@prisma/client";
import { PrismaService } from "src/shared/prisma/prisma.service";

@Injectable()
export class CustomerRepository {
    constructor(private readonly prisma: PrismaService) {}

    async list() : Promise<Customer[]>{
       return this.prisma.customer.findMany(); 
    }

    async create(data : Prisma.CustomerCreateInput) : Promise<Customer> {
        return this.prisma.customer.create({
            data,
        });
    }

    async update(id : number , data : Prisma.CustomerUpdateInput) : Promise<Customer> {
        return this.prisma.customer.update({
            where: { id },
            data,
        });
    }

    async delete(id : number) : Promise<void> {
        await this.prisma.customer.delete({
            where: { id },
        });
    }

    async findById(id : number) : Promise<Customer | null> {
        return this.prisma.customer.findUnique({
            where: { id },
        });
    }

    async findByEmail(email : string) : Promise<Customer | null> {
        return this.prisma.customer.findUnique({
            where: { email },
        });
    }
}