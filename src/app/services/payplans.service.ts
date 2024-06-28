import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Payplan } from '../models/payplans';

@Injectable({
  providedIn: 'root'
})
export class PayplansService {

  pathServer: string = "https://techgroup-finance.azurewebsites.net/";
  source: string = "api/payplan";

  constructor(private http: HttpClient) { }

  getPayplans(){
    return this.http.get<Payplan[]>(this.pathServer + "/" + this.source);
  }

  getPayplan(id: number){
    return this.http.get<Payplan>(this.pathServer + "/" + this.source + "/" + id.toString());
  }

  addPayplan(payplan: Payplan){
    return this.http.post<Payplan>(this.pathServer + "/" + this.source, payplan);
  }

  updatePayplan(payplan: Payplan){
    return this.http.put<Payplan>(this.pathServer + "/" + this.source + "/" + payplan.id.toString(), payplan);
  }

  deletePayplan(id: number){
    return this.http.delete<Payplan>(this.pathServer + "/" + this.source + "/" + id.toString());
  }
}
