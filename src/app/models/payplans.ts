export interface Payplan{
    id: number;
    id_customer: number;
    amount: number;
    monthlyrate: number;
    number_of_payments: number;
    grace_periods: number;
    grace_type: string;
    date_register: string;
    status: string;
}