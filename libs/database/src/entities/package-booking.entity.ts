import { Column, CreateDateColumn, Entity, JoinColumn, ManyToOne, OneToOne, PrimaryGeneratedColumn, UpdateDateColumn } from 'typeorm';
import { User } from './user.entity';
import { Payment } from './payment.entity';
import { PAYMENT_STATUS } from 'libs/constants/bookingContant';
import { IsOptional, IsString } from 'class-validator';
import { Package } from './package.entity';

export enum MealType {
    VEG = 'veg',
    NON_VEG = 'nonveg',
    VEGAN = 'vegan',
}

export enum TitleType {
    MR = 'Mr',
    MRS = 'Mrs',
    MISS = 'Miss',
    MASTER = 'Master',
}

export enum BookingStatus {
    PENDING = 'PENDING',
    CONFIRMED = 'CONFIRMED',
    CANCELLED = 'CANCELLED',
    CANCELPENDING = 'CANCELPENDING',
    BOOKED='BOOKED'
}
@Entity('package_bookings')
export class PackageBooking {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column({ type: 'uuid' })
    packageId: string;

  @ManyToOne(() => Package, (pkg) => pkg.bookings, { onDelete: 'CASCADE' })
  @JoinColumn() // ensures FK is package_id
  package: Package;

    // // Add this column explicitly so TypeORM knows about it
    // @Column({ type: 'uuid', nullable: true })
    // userId: string;

    @ManyToOne(() => User, (u) => u.packageBookings, { onDelete: 'CASCADE' })
    @JoinColumn({ name: 'user_id' })
    user: User;

    @Column({ type: 'jsonb' })
    passengerDetails: Array<{
        title: TitleType;
        firstName: string;
        middleName?: string;
        lastName: string;
        DOB: string;
        passportNumber?: string;
        passportExpiry?: string;
        meal?: MealType;
    }>;

    @Column()
    email: string;

    @Column({ type: 'timestamp', name: 'start_date' })
    startDate: Date;

    @Column({ type: 'timestamp', name: 'end_date' })
    endDate: Date;

    @Column({
        type: 'enum',
        enum: BookingStatus,
        default: BookingStatus.PENDING,
    })
    status: BookingStatus;

    @Column({ nullable: true })
    cancellationReason?: string;

    @OneToOne(() => Payment, (payment) => payment.packageBooking,{
     cascade: true,         
    })
    payment: Payment;

    @Column({ type: 'timestamp', nullable: true })
    cancelledAt?: Date;

    @Column({ nullable: true })
    specialRequest: string;

    @Column({ nullable: true })
    phone: string;

     @Column({
            type: 'enum',
            enum: PAYMENT_STATUS,
            default: PAYMENT_STATUS.PENDING,
            nullable: false,
        })
        payment_status: PAYMENT_STATUS;
    
        @CreateDateColumn()
        created_at: Date;
    
        @UpdateDateColumn()
        updated_at: Date;
    
        @Column({ type: 'text', nullable: true })
        @IsOptional()
        @IsString()
        pdf_url: string;
    
}
