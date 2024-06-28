import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Purchase } from '../models/purchases';

@Injectable({
  providedIn: 'root'
})
export class PurchasesService {

  pathServer: string = "https://techgroup-finance.azurewebsites.net/";
  source: string = "api/Purchase";

  constructor(private http: HttpClient) { }

  getPurchases(){
    return this.http.get<Purchase[]>(this.pathServer + "/" + this.source);
  }

  getPurchase(id: number){
    return this.http.get<Purchase>(this.pathServer + "/" + this.source + "/" + id.toString());
  }

  addPurchase(purchase: Purchase){
    return this.http.post<Purchase>(this.pathServer + "/" + this.source, purchase);
  }

  updatePurchase(purchase: Purchase){
    return this.http.put<Purchase>(this.pathServer + "/" + this.source + "/" + purchase.id.toString(), purchase);
  }

  deletePurchase(id: number){
    return this.http.delete<Purchase>(this.pathServer + "/" + this.source + "/" + id.toString());
  }
}
