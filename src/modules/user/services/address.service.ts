import { Injectable, NotFoundException } from "@nestjs/common";
import { NotFoundMessage } from "src/common/enums/message.enum";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { AddressEntity } from "../entities/address.entity";
import { AddressDto, UpdateAddressDto } from "../dto/address.dto";

@Injectable()
export class AddressService {
  constructor(
    @InjectRepository(AddressEntity)
    private addressRepository: Repository<AddressEntity>
  ) {}

  async createAddress(userId: number, addressDto: AddressDto) {
    const address = this.addressRepository.create({
      ...addressDto,
      userId,
    });
    return await this.addressRepository.save(address);
  }

  async getUserAddresses(userId: number) {
    return await this.addressRepository.find({
      where: { userId },
      order: { id: "DESC" },
    });
  }

  async getAddressById(id: number, userId: number) {
    const address = await this.addressRepository.findOne({
      where: { id, userId },
    });

    if (!address) {
      throw new NotFoundException(NotFoundMessage.NotFound);
    }

    return address;
  }

  async updateAddress(
    id: number,
    userId: number,
    updateAddressDto: UpdateAddressDto
  ) {
    const address = await this.getAddressById(id, userId);
    Object.assign(address, updateAddressDto);
    return await this.addressRepository.save(address);
  }

  async deleteAddress(id: number, userId: number) {
    const address = await this.getAddressById(id, userId);
    await this.addressRepository.remove(address);
  }

  async setDefaultAddress(id: number, userId: number) {
  
    await this.addressRepository.update({ userId }, { is_default: false });


    const address = await this.getAddressById(id, userId);
    address.is_default = true;
    const saved = await this.addressRepository.save(address);
    return saved;
  }

  async getDefaultAddress(userId: number) {
    return await this.addressRepository.findOne({
      where: { userId, is_default: true },
    });
  }
}
