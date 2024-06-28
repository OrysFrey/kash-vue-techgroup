import { Component, ElementRef, ViewChild } from '@angular/core';
import { SharedModule } from '../../shared/shared/shared.module';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Customer } from '../../models/customers';
import { Product } from '../../models/products';
import { Purchase } from '../../models/purchases';
import { CustomerService } from '../../services/customer.service';
import { ActivatedRoute } from '@angular/router';
import { MatSidenav, MatSidenavModule } from '@angular/material/sidenav';
import { ProductsService } from '../../services/products.service';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Payplan } from '../../models/payplans';
import { PayplansService } from '../../services/payplans.service';


interface Payment {
  number: number;
  TEM: number;
  gracePeriod: string;
  initialBalance: number;
  interest: number;
  installment: number;
  amortization: number;
  finalBalance: number;
}

@Component({
  selector: 'app-paymentplan',
  standalone: true,
  imports: [SharedModule, MatSidenavModule],
  templateUrl: './paymentplan.component.html',
  styleUrl: './paymentplan.component.css'
})
export class PaymentplanComponent {

  salesForm!: FormGroup;
  confirmForm!: FormGroup;
  IsSalesForm: boolean = true;
  clients: Customer[] = []; // Lista de clientes
  filteredClients: Customer[] = [];
  filteredProducts: Product[] = [];
  products: Product[] = []; // Lista de productos
  cart: any[] = [];
  idUser!: number;
  customer!: Customer;
  idPurchase!: number;
  selectedClient!: Customer;
  selectedCustomer!: Customer;
  selectedCustomerId!: number;

  customers: Customer[] = [];
  filteredCustomers: Customer[] = [];
  filteredCustomer!: Customer;
  isConfirm: boolean = false;
  isOverlay: boolean = false;
  codeConfirmation!: string;

  purchasesCart: any[] = [];

  totalInterests: number = 0;
  rateType!: string;
  ratePeriod!: string;
  rateCapitalization!: string;
  ratePercentage!: number;
  productPrice!: number;
  paymentDay!: number;
  interestGenerated!: number;
  moratoriumInterest: number = 0;

  validToFinance!:boolean; 


  totalPayment: number = 0;

  idPayplan!: number;
  principal1!: number;
  monthlyRate1!: number;
  numberOfPayments1!: number;
  gracePeriods1!: number;

  payments: Payment[] = [];
  graceType: 'partial' | 'total' | 'none' = 'none';
  regularInstallment!:number;
  gracePeriods: number = 0;

  myForm!: FormGroup;
  

  @ViewChild('drawer') drawer: any;
  drawerContainer!: ElementRef;


  constructor(private fb: FormBuilder, private customerService: CustomerService, private activatedRoute: ActivatedRoute,
    private productsService: ProductsService, private snackBar: MatSnackBar, private payplanService: PayplansService
  ){
    this.createForm();
    this.loadProducts();
  }

  ngOnInit(){
    this.loadClients();
    this.reactiveForm();
  }

  reactiveForm():void{
    this.myForm = this.fb.group({
      amount_finance:["", [Validators.required]],
      // initial_fee:["",[Validators.required]],
      monthly_rate:["",[Validators.required, Validators.min(1), Validators.max(99)]],
      amount_fees:["",[Validators.required, Validators.min(2)]],
      graceType:["",[Validators.required]],
      amount_grace:["",[Validators.required,]],
      // value_cok:["",[Validators.required]]
    })
  }

  isFormValid(): boolean {
    return this.myForm.valid;
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
    console.log("changeOption customer", customer);
    console.log("tipo", typeof customer);
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

  addProductToCart(product: any){
    if (this.salesForm.invalid){
      console.log("Invalid");
        return;
    }

    const quantity = this.salesForm.value.quantity;
    const selectedClientId = this.salesForm.value.selectedClient;
    this.selectedCustomerId = this.salesForm.value.selectedClient;
    this.customerService.getCustomer(selectedClientId).subscribe({
      next: (data) => {
        this.selectedClient = data;
        this.selectedCustomer = this.selectedClient;
      },
      error: (err) => {
        console.log(err);
      }
    });

    const priceTotal = product.price * quantity;

    this.purchasesCart.push(
      {productName: product.name, price: priceTotal, amount: quantity}
    );

    this.purchasesCart = [...this.purchasesCart];
    this.salesForm.reset();



  }

  removeProductFromCart(purchase: any) {
    const index = this.purchasesCart.indexOf(purchase);
    if (index > -1) {
      this.purchasesCart.splice(index, 1);
      console.log("Este es el carrito ",this.purchasesCart);
      this.purchasesCart = [...this.purchasesCart]; 
    }
  }

  newRun(){
    this.totalPayment = this.purchasesCart.reduce((total, purchase) => total + purchase.price, 0);

    if(this.totalPayment < this.selectedClient.limit){
      this.myForm.get("amount_finance")?.setValue(this.totalPayment);
    }
    else{
      // (click)="isConfirm = true" (click)="isOverlay = true"
      this.isConfirm = false;
      this.isOverlay = false;
      this.drawer.toggle();
      this.snackBar.open("Error: El monto excede el limite crediticio del cliente", "OK", {duration:5000});
      this.purchasesCart = [];
      this.purchasesCart = [...this.purchasesCart];
    }
  }



  

  // calcularVan(flujosDeCaja: number[], saldo_inicial:number){
  //   let cok=this.cok/100;
  //   let suma_total=0;
  //   console.log("Empiezan los flujos")
  //   for(let i=0;i<flujosDeCaja.length;i++){
  //     suma_total+=flujosDeCaja[i] / Math.pow(1 + cok, i+1);
  //     console.log(flujosDeCaja[i] / Math.pow(1 + cok, i+1))
    
  //   }
  //   console.log(suma_total)
  //   this.van=suma_total - saldo_inicial;
  // }
  // calcularTIR(flujosDeCaja: number[], aproximacionInicial: number, toleranciaError: number): number {
    
  //   let tir = aproximacionInicial;
  //   let nuevoTir = aproximacionInicial + 1;
  //   let valorActualNeto: number;
  //   let derivadaValorActualNeto: number;
  //   let error = 1;

  //   while (error > toleranciaError) {
  //     valorActualNeto = 0;
  //     derivadaValorActualNeto = 0;

  //     for (let i = 0; i < flujosDeCaja.length; i++) {
  //       valorActualNeto += flujosDeCaja[i] / Math.pow(1 + tir, i);
  //       derivadaValorActualNeto -= (i * flujosDeCaja[i]) / Math.pow(1 + tir, i + 1);
  //     }

  //     nuevoTir = tir - (valorActualNeto / derivadaValorActualNeto);
  //     error = Math.abs((nuevoTir - tir) / nuevoTir);
  //     tir = nuevoTir;
  //   }

  //   return tir;
  // }



  calculateFrenchPaymentPlan(
    principal: number,
    monthlyRate: number,
    numberOfPayments: number,
    gracePeriods: number,
    graceType: 'partial' | 'total' | 'none'
  ): Payment[] {
    const payments: Payment[] = [];
    let initialBalance = principal;
  
    const monthlyRateDecimal = monthlyRate / 100;
    const adjustedNumberOfPayments = numberOfPayments - gracePeriods;
  
    
    this.regularInstallment = principal * (monthlyRateDecimal * Math.pow(1 + monthlyRateDecimal, adjustedNumberOfPayments)) /
      (Math.pow(1 + monthlyRateDecimal, adjustedNumberOfPayments) - 1);
  
    for (let i = 1; i <= numberOfPayments; i++) {
      let interest = initialBalance * monthlyRateDecimal;
      let amortization = 0;
      let installment = 0;
      let gracePeriod = graceType !== 'none' && i <= gracePeriods ? (graceType === 'partial' ? 'Parcial' : 'Total') : 'Sin';
  
      if (i <= gracePeriods && graceType !== 'none') {
        if (graceType === 'partial') {
          installment = interest; 
          amortization = 0;
        } else {
          installment = 0; 
          interest = initialBalance * monthlyRateDecimal;
          amortization = 0;
        }
      } else {

        if (graceType !== 'none' && i === gracePeriods + 1) {
          this.regularInstallment = initialBalance * (monthlyRateDecimal * Math.pow(1 + monthlyRateDecimal, adjustedNumberOfPayments)) /
            (Math.pow(1 + monthlyRateDecimal, adjustedNumberOfPayments) - 1);
        }

        installment = this.regularInstallment;
        interest = initialBalance * monthlyRateDecimal;
        amortization = installment - interest;
      }
  
      let finalBalance;
      if (graceType === 'total' && i <= gracePeriods) {
        finalBalance = initialBalance + interest;
      } else {
        finalBalance = initialBalance - amortization;
      }
  
      payments.push({
        number: i,
        TEM: monthlyRateDecimal,
        gracePeriod: gracePeriod,
        initialBalance: initialBalance, 
        interest: interest,
        installment: installment,
        amortization: amortization,
        finalBalance: finalBalance
      });
  
      if (graceType === 'total' && i <= gracePeriods) {
        initialBalance += interest; 
      } else {
        initialBalance = finalBalance;
      }
    }
  
    return payments;
  }
  
  


  generatePaymentPlan(): void {
    const principal = this.totalPayment; 
    const monthlyRate = this.myForm.value.monthly_rate; 
    const numberOfPayments = this.myForm.value.amount_fees; 
    const gracePeriods = this.graceType !== 'none' ? this.gracePeriods:0; 

    this.principal1 = principal;
    this.monthlyRate1 = monthlyRate;
    this.numberOfPayments1 = numberOfPayments;
    this.gracePeriods1 = gracePeriods;
    

    this.payments = this.calculateFrenchPaymentPlan(principal, monthlyRate, numberOfPayments, gracePeriods, this.graceType);
   
    //entity
    //principla: valor a financiar
    //monthlyrate: TEM 
    //numberOfPayments: # de cuotas
    //gracePeriods: # periodos de gracia
    //graceType: tipo de los periodos de gracia

  }

  onGracePeriodsChange(periods: number): void {
    this.gracePeriods = periods;
    this.generatePaymentPlan();
  }

  onGraceTypeChange(type:any): void {
    this.graceType = type.target.value;
    this.generatePaymentPlan();

    console.log("Primero", )

    console.table(this.payments);
  }
  
  savePayPlan():void{

    const ban = this.isFormValid();
    console.log("Este es el valor ban", ban);

    const payplan: Payplan = {
      id: this.idPayplan,
      id_customer: this.selectedCustomerId,
      amount: this.principal1,
      monthlyrate: this.monthlyRate1,
      number_of_payments: this.numberOfPayments1,
      grace_periods: this.gracePeriods1,
      grace_type: this.graceType,
      date_register: this.formatDate(new Date()),
      status: "Pendiente"
    };

    this.purchasesCart = [];
    this.purchasesCart = [...this.purchasesCart];

    this.payplanService.addPayplan(payplan).subscribe({
      next: (data) => {
        this.drawer.toggle();
        this.snackBar.open("Se registró correctamente el plan de pago", "OK", {duration:4000});
      },
      error: (err) => {
        console.log(err);
      }
    });


  }

  formatDate(date: Date): string {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }

}
