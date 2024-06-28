import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Customer } from '../models/customers';

@Injectable({
  providedIn: 'root'
})
export class CustomerService {

  pathServer: string = "https://techgroup-finance.azurewebsites.net/";
  source: string = "api/cust";

  constructor(private http:HttpClient) { }

  getCustomers(){
    return this.http.get<Customer[]>(this.pathServer + "/" + this.source);
  }

  getCustomer(id: number){
    return this.http.get<Customer>(this.pathServer + "/" + this.source + "/" + id.toString());
  }

  addCustomer(customer: Customer){
    return this.http.post<Customer>(this.pathServer + "/" + this.source, customer);
  }

  updateCustomer(customer: Customer){
    return this.http.put<Customer>(this.pathServer + "/" + this.source + "/" + customer.id.toString(), customer);
  }

  deleteCustomer(id:number){
    return this.http.delete<Customer>(this.pathServer + "/" + this.source + "/" + id.toString());
  }
}
