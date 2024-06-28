import { Component, ElementRef, ViewChild } from '@angular/core';
import { SharedModule } from '../../shared/shared/shared.module';
import { ProductsService } from '../../services/products.service';
import { Product } from '../../models/products';
import { MatMenuModule } from '@angular/material/menu';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatSidenav, MatSidenavModule } from '@angular/material/sidenav';

@Component({
  selector: 'app-products',
  standalone: true,
  imports: [SharedModule, MatMenuModule, MatSidenavModule],
  templateUrl: './products.component.html',
  styleUrl: './products.component.css'
})
export class ProductsComponent {

  products: Product[] = [];
  filteredProducts: Product[] = [];
  id!: number;
  isInsert: boolean = true;
  selectedStockStatus: string = '';

  myForm!: FormGroup;

  // @ViewChild('sidenav') sidenav!: MatSidenav;
  // selectedProduct: any = null;

  // @ViewChild('drawer') drawer: any;
  // drawerContainer!: ElementRef;

  constructor(private productsService: ProductsService, private formBuilder: FormBuilder, 
    private snackBar: MatSnackBar
  ){}

  ngOnInit(){
    this.loadProducts();
    this.reactiveForm();
  }

  loadProducts():void{
    this.productsService.getProducts().subscribe({
      next: (data: Product[]) => {
        data.forEach((product: Product) => {
          this.products.push(product);
          console.log("Si funca produtcs");
        });
        this.filteredProducts = this.products;
      },
      error: (err) => {
        console.log(err);
        console.log("no funca");
      }
    })
  }

  filterProducts(event:Event){
    let filterValue = (event.target as HTMLInputElement).value.trim().toLowerCase();
    this.filteredProducts = this.products.filter(produt => (
      produt.name.toLowerCase().includes(filterValue)));
  }

  filterPurchasesByStockStatus(): void {
    if (this.selectedStockStatus === '') {
      this.filteredProducts = this.products;
    } else {
      this.filteredProducts = this.products.filter(product => this.getStatusStock(product.amount) === this.selectedStockStatus);
    }
  }

  reactiveForm():void{
    this.myForm = this.formBuilder.group({
      name_product:["",[Validators.required]],
      amount_product:["",[Validators.required, Validators.min(1)]],
      price_product:["",[Validators.required, Validators.min(0.10), Validators.pattern(/^\d+(?:\.\d{1,2})?$/)]]
    });
  }

  registerProduct():void{
    const product: Product = {
      id: this.id,
      name: this.myForm.get("name_product")!.value,
      amount: this.myForm.get("amount_product")!.value,
      price: this.myForm.get("price_product")!.value
    }

    if(this.isInsert){
      this.productsService.addProduct(product).subscribe({
        next: (data) => {
          this.snackBar.open("Se registró correctamente el producto", "OK", {duration:4000});
          this.myForm.reset();
          this.loadProducts();
          this.filteredProducts = [...this.filteredProducts];
        }
      })
    }
    else{
      this.productsService.updateProduct(product).subscribe({
        next: (data) => {
          window.location.reload();
          this.snackBar.open("Se actualizó correctamente el producto", "OK", {duration:7000});
          // this.drawer.toggle();
          this.myForm.reset();
          this.loadProducts();
          this.filteredProducts = [...this.filteredProducts];
        }
      })
    }
  }

  dataForm(product: Product):void{
    if(product.id != 0 && product.id != undefined){
      this.isInsert = false;
      this.productsService.getProduct(product.id).subscribe({
        next: (data) => {
          this.myForm.get("name_product")?.setValue(data.name);
          this.myForm.get("amount_product")?.setValue(data.amount);
          this.myForm.get("price_product")?.setValue(data.price);
        },
        error: (err) => {
          console.log(err);
        }
      })
    }
  }

  deleteProduct(productSelected: Product){
    this.productsService.deleteProduct(productSelected.id).subscribe({
      next: (data) => {
        this.snackBar.open("Se elimino el producto", "OK", {duration: 4000});
        this.loadProducts();
        this.filteredProducts = [...this.filteredProducts];
      },
      error: (err) => {
        console.log(err);
      }
    });
  }

  getStatusStock(stock: number):string{
    if(stock < 13){
      return 'Crítico';
    }
    else if (stock < 20){
      return 'Bajo';
    }
    else{
      return 'Bueno';
    }
  }

  getStatusStockClass(stock: number): any{
    if (stock < 13){
      return 'critical';
    }else if (stock < 20){
      return 'low';
    }
    else{
      return 'good';
    }
  }

}
