export interface Customer{
    id: number;
    id_user: number;
    name: string;
    lastname: string;
    dni: string;
    bithdate: Date;
    phone: string;
    email: string; //personal
    rate_type: string;
    capitalization: string;
    rate: number;
    period: string;
    limit: number;
    status: string;//bloqueado
    payment_date: number; //contractual
}