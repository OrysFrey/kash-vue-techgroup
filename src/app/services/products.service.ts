import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Product } from '../models/products';

@Injectable({
  providedIn: 'root'
})
export class ProductsService {

  pathServer: string = "https://techgroup-finance.azurewebsites.net/";
  source: string = "api/product";

  constructor(private http: HttpClient) { }

  getProducts(){
    return this.http.get<Product[]>(this.pathServer + "/" + this.source);
  }

  getProduct(id: number){
    return this.http.get<Product>(this.pathServer + "/" + this.source + "/" + id.toString());
  }

  addProduct(product: Product){
    return this.http.post<Product>(this.pathServer + "/" + this.source, product);
  }

  updateProduct(product: Product){
    return this.http.put<Product>(this.pathServer + "/" + this.source + "/" + product.id.toString(), product);
  }

  deleteProduct(id: number){
    return this.http.delete<Product>(this.pathServer + "/" + this.source + "/" + id.toString());
  }
}
