export interface Purchase{
    id: number;
    id_customer: number;
    product_name: string; 
    price: number;
    amount: number;
    date_register: string;
    interest: number;
    status: string; //Pendiente - Pagado
}