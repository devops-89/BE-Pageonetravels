import { Column, Entity, PrimaryGeneratedColumn } from "typeorm";

export enum MealType {
  VEG = "veg",
  NON_VEG = "nonveg",
  VEGAN = "vegan",
}

export enum TitleType {
  MR = "Mr",
  MRS = "Mrs",
  MISS = "Miss",
  MASTER = "Master",
}

export enum BookingStatus {
  PENDING = "PENDING",
  CONFIRMED = "CONFIRMED",
  CANCELLED = "CANCELLED",
  CANCELPENDING = "CANCELPENDING",
}

@Entity("package_bookings")
export class PackageBooking {
  @PrimaryGeneratedColumn("uuid")
  id: string;

  @Column({ type: "uuid" })
  packageId: string;

  @Column({ type: "uuid" })
  userId: string;

 
  @Column({ type: "jsonb" })
  passengerDetails: Array<{
    title: TitleType;
    firstName: string;
    middleName: string;
    lastName: string;
    DOB: string;
    passportNumber?: string;
    passportExpiry?: string;
    meal?: MealType;
  }>;

  @Column()
  specialRequest:string;

  @Column()
  email: string;

  @Column()
  phone: string;

  @Column({
    type: "enum",
    enum: BookingStatus,
    default: BookingStatus.PENDING,
  })
  status: BookingStatus;

  @Column({ nullable: true })
  cancellationReason?: string;

  @Column({ type: "timestamp", nullable: true })
  cancelledAt?: Date;
}
