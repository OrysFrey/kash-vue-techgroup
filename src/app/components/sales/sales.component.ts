import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { CustomerService } from '../../services/customer.service';
import { Customer } from '../../models/customers';
import { ActivatedRoute } from '@angular/router';
import { ProductsService } from '../../services/products.service';
import { Product } from '../../models/products';
import { SharedModule } from '../../shared/shared/shared.module';
import { Purchase } from '../../models/purchases';
import { PurchasesService } from '../../services/purchases.service';
import { MatSnackBar } from '@angular/material/snack-bar';

@Component({
  selector: 'app-sales',
  standalone: true,
  imports: [SharedModule],
  templateUrl: './sales.component.html',
  styleUrl: './sales.component.css'
})
export class SalesComponent {

  salesForm!: FormGroup;
  confirmForm!: FormGroup;
  IsSalesForm: boolean = true;
  clients: Customer[] = [];
  filteredClients: Customer[] = [];
  filteredProducts: Product[] = [];
  products: Product[] = [];
  cart: any[] = [];
  idUser!: number;
  customer!: Customer;
  idPurchase!: number;
  selectedClient!: Customer;
  selectedCustomer!: Customer;

  customers: Customer[] = [];
  filteredCustomers: Customer[] = [];
  filteredCustomer!: Customer;
  isConfirm: boolean = false;
  isOverlay: boolean = false;
  codeConfirmation!: string;

  
  purchasesCart: Purchase[] = [];

  totalInterests: number = 0;
  rateType!: string;
  ratePeriod!: string;
  rateCapitalization!: string;
  ratePercentage!: number;
  productPrice!: number;
  paymentDay!: number;
  interestGenerated!: number;
  moratoriumInterest: number = 0;
  totalPayment: number = 0;

constructor(private fb: FormBuilder, private customerService: CustomerService, private activatedRoute: ActivatedRoute,
  private productsService: ProductsService, private purchaseService: PurchasesService, private snackBar: MatSnackBar
) {
  this.createForm();
}

ngOnInit() {
  this.loadClients();
  this.loadProducts();
}

createForm() {
  this.salesForm = this.fb.group({
    selectedClient: ['', Validators.required],
    quantity: ['', [Validators.required, Validators.min(1)]]
  });

  this.confirmForm
}

loadClients() {
  this.idUser = this.activatedRoute.snapshot.params["id"];
  this.customerService.getCustomers().subscribe({
    next: (data: Customer[]) => {
      data.forEach((customer: Customer) => {
        if(customer.id_user == this.idUser){
          if(customer.status == "Activo"){
            this.clients.push(customer);
          }
        }
      });
      this.filteredClients = this.clients;
    },
    error: (err) => {
      console.log(err);
    }
  });
}

loadProducts() {
  this.productsService.getProducts().subscribe({
    next: (data: Product[]) => {
      data.forEach((product: Product) => {
        this.products.push(product);
      });
      this.filteredProducts = this.products;
    },
    error: (err) => {
      console.log(err);
    }
  })
}


changeOption(event: Event){
  let customer!: number;
  customer = +(event.target as HTMLSelectElement).value.trim();
  this.customerService.getCustomer(customer).subscribe({
    next: (data) => {
      this.customers.push(data);
      this.selectedClient = data;
    },
    error: (err) => {
      console.log(err);
    }
  });

  this.filteredCustomers =this.customers;
  this.filteredCustomer = this.customers[0];
  console.log(this.selectedClient);
}

// addProductToCart() {
//   const selectedProductId = this.salesForm.value.selectedProduct;
//   const quantity = this.salesForm.value.quantity;

//   const product = this.products.find(p => p.id === selectedProductId);
//   if (product) {
//     this.cart.push({ product, quantity });
//   }

//   this.salesForm.reset();
// }

confirmSale():void{

  console.log(this.codeConfirmation);
  // this.purchasesCart.forEach((purchase: Purchase) => {
  //   this.purchaseService.addPurchase(purchase).subscribe({
  //     next: (data) => {
  //       this.snackBar.open("Se registró correctamente la compra", "OK", {duration:4000});
  //     },
  //     error: (err) => {
  //       console.log(err);
  //     }
  //   });
  // });
  // this.purchasesCart = [];
  // this.purchasesCart = [...this.purchasesCart];
}

// calculateTotal() {
//   return this.cart.reduce((acc, item) => {
//     const productTotal = item.product.price * item.quantity;
//     const interest = this.calculateInterest(productTotal, item.quantity);
//     return acc + productTotal + interest;
//   }, 0);
// }

// calculateInterest(amount: number, quantity: any): number {
//   // Lógica para calcular el interés
//   return amount * 0.05; // Ejemplo de cálculo de interés del 5%
// }

saveSale(sale: any) {
  // Guardar la venta en el back (json)
}

  generateInteres(productValue: number, purchaseDate: Date, paymentDay: number, rateType: string, ratePeriod: string, rateCapitalization: string,
    ratePercentage: number):number{;
    console.log("entro generatedInterest");
    console.log("productValue", productValue);
    console.log("purchaseDate", purchaseDate);
    console.log("paymentDay", paymentDay);
    const currentDate = new Date(purchaseDate);
    const currentDay = currentDate.getDate();
    
    let daysUntilPayment = paymentDay - currentDay;
    if (daysUntilPayment < 0) {
      const daysInMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0).getDate();
      daysUntilPayment += daysInMonth;
    }


      if(rateType == "NOMINAL"){
        if(ratePeriod == "MENSUAL"){
          if(rateCapitalization == "DIARIA"){
            this.interestGenerated = productValue *(1+(ratePercentage/(100*30)))**daysUntilPayment;
          }
          else{
            this.interestGenerated = productValue*(1+(ratePercentage/(100*1)))**(daysUntilPayment/30);
          }
        }
        else if(ratePeriod == "BIMESTRAL"){
          if(rateCapitalization == "DIARIA"){
            this.interestGenerated = productValue*(1+(ratePercentage/(100*60)))**daysUntilPayment;
          }
          else{
            this.interestGenerated = productValue*(1+(ratePercentage/(100*2)))**(daysUntilPayment/30);
          }
        }
        else if(ratePeriod == "TRIMESTRAL"){
          if(rateCapitalization == "DIARIA"){
            this.interestGenerated = productValue*(1+(ratePercentage/(100*90)))**daysUntilPayment;
          }
          else{
            this.interestGenerated = productValue*(1+(ratePercentage/(100*3)))**(daysUntilPayment/30);
          }
        }
        else if(ratePeriod == "CUATRIMESTRAL"){
          if(rateCapitalization == "DIARIA"){
            this.interestGenerated = productValue*(1+(ratePercentage/(100*120)))**daysUntilPayment;
          }
          else{
            this.interestGenerated = productValue*(1+(ratePercentage/(100*4)))**(daysUntilPayment/30);
          }
        }
        else if(ratePeriod == "SEMESTRAL"){
          if(rateCapitalization == "DIARIA"){
            this.interestGenerated = productValue*(1+(ratePercentage/(100*180)))**daysUntilPayment;
          }
          else{
            this.interestGenerated = productValue*(1+(ratePercentage/(100*6)))**(daysUntilPayment/30);
          }
        }
        else{
          if(rateCapitalization == "DIARIA"){
            this.interestGenerated = productValue*(1+(ratePercentage/(100*360)))**daysUntilPayment;
          }
          else{
            this.interestGenerated = productValue*(1+(ratePercentage/(100*12)))**(daysUntilPayment/30);
          }
        }
      }
      else{       
        if(ratePeriod == "MENSUAL"){
          this.interestGenerated = productValue * (1 + ratePercentage/100)**(daysUntilPayment/30);
        }
        else if(ratePeriod == "BIMESTRAL"){
          this.interestGenerated = productValue * (1 + ratePercentage/100)**(daysUntilPayment/60);
        }
        else if(ratePeriod == "TRIMESTRAL"){
          this.interestGenerated = productValue * (1 + ratePercentage/100)**(daysUntilPayment/90);
        }
        else if(ratePeriod == "CUATRIMESTRAL"){
          this.interestGenerated = productValue * (1 + ratePercentage/100)**(daysUntilPayment/120);
        }
        else if(ratePeriod == "SEMESTRAL"){
          this.interestGenerated = productValue * (1 + ratePercentage/100)**(daysUntilPayment/180);
        }
        else{
          this.interestGenerated = productValue * (1 + ratePercentage/100)**(daysUntilPayment/360);
        }
      }

      this.interestGenerated = Number(this.interestGenerated.toFixed(2));

      return this.interestGenerated
    }


  addProductToCart(product: any) {
    if (this.salesForm.invalid) {
      console.log("Invalid");
      return;
    }
  
    const quantity = this.salesForm.value.quantity;
    console.log("tipo quantity", typeof quantity);
    const selectedClientId = this.salesForm.value.selectedClient;
    console.log("selectedClientId", selectedClientId);
    this.customerService.getCustomer(selectedClientId).subscribe({
      next: (data) => {
         this.selectedClient = data;
         console.log("data", data);
         console.log("slected data0", this.selectedClient);
         this.selectedCustomer = this.selectedClient;
      },
      error: (err) => {
        console.log(err);
      }
    });

    console.log("selectedCustomer", this.selectedCustomer);

    console.log("customer selected", this.selectedClient);

    this.interestGenerated = 0;
  
    const priceTotal = product.price * quantity;

    if(priceTotal < this.selectedClient.limit){
      const purchase: Purchase = {
        id: this.idPurchase,
        id_customer: selectedClientId,
        product_name: product.name,
        price: priceTotal,
        amount: quantity,
        date_register: this.formatDate(new Date()),
        interest: this.generateInteres(priceTotal, new Date(), this.selectedClient.payment_date, this.selectedClient.rate_type,
      this.selectedClient.period, this.selectedClient.capitalization, this.selectedClient.rate),
        status: "Pendiente"
      };

  
      console.log("customer", this.selectedClient);
      console.log("price", product.price);
      console.log("fecha0", new Date());
      console.log("paymentDay", this.paymentDay);
  
      console.log("Interest cd",purchase.interest);
    
      console.log("Este es el purchase que no sale", purchase);
      this.purchasesCart.push(purchase);
      this.purchasesCart = [...this.purchasesCart];
      this.salesForm.reset();
    }
    else{
      this.snackBar.open("El monto sobrepasa el limite crediticio del cliente", "OK", {duration:4000});
    }
  }

  formatDate(date: Date): string {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }

  removeProductFromCart(purchase: any) {
    const index = this.purchasesCart.indexOf(purchase);
    if (index > -1) {
      this.purchasesCart.splice(index, 1);
      console.log("Este es el carrito ",this.purchasesCart);
      this.purchasesCart = [...this.purchasesCart]; // Esto forzará la detección de cambios
    }
  }

  savePurchasesCart(){
    console.log(this.purchasesCart);
    this.isConfirm = true;

    this.purchasesCart.forEach((purchase: Purchase) => {
      const newPurchase = purchase;
      console.log("Este es el newPurchase", newPurchase);
      this.purchaseService.addPurchase(newPurchase).subscribe({
        next: (data) => {
          this.snackBar.open("Se registró correctamente la compra", "OK", {duration:4000});
        },
        error: (err) => {
          console.log(err);
        }
      });
    });
    this.purchasesCart = [];
    this.purchasesCart = [...this.purchasesCart];
  }

}
