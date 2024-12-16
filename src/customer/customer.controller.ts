import { Body, Controller, Delete, Get, Param, Patch, Post } from "@nestjs/common";
import { CustomerService } from "./customer.service";
import { CreateCustomerDto } from "./dto/create-customer.dto";
import { UpdateCustomerDto } from "./dto/update-customer.dto";



@Controller('customers')
export class CustomerController {
    constructor(public customerService: CustomerService) { }

    @Get()
    async list(){
        return this.customerService.list();
    }

    @Get(':id')
    async show(@Param('id') id: string){
        return await this.customerService.show(+id);
    }

    @Post()
    async create(@Body() dto: CreateCustomerDto){
        const create = await this.customerService.create(dto);
        return {
            message : 'Customer Created Successfully',
            customer :create
        }
    }

    @Patch(':id')
    async update(@Param('id') id: string, @Body() dto: UpdateCustomerDto){
        const update = await this.customerService.update(+id, dto);
        return {
            message : 'Customer Updated Successfully',
            customer : update
        }
    }

    @Delete(':id')
    async delete(@Param('id') id: string){
        await this.customerService.delete(+id);
        return {
            message : 'Customer Deleted Successfully'
        }
    }

}