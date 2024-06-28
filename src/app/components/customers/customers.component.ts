import { Component, ElementRef, ViewChild } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { SharedModule } from '../../shared/shared/shared.module';
import { MatTableDataSource } from '@angular/material/table';
import { ScrollingModule } from '@angular/cdk/scrolling';
import { MatMenuModule } from '@angular/material/menu';
import { MatSidenav, MatSidenavModule } from '@angular/material/sidenav';
import { CustomerService } from '../../services/customer.service';
import { Customer } from '../../models/customers';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatSnackBar } from '@angular/material/snack-bar';
import { jsPDF } from 'jspdf';
import 'jspdf-autotable';
import { PurchasesService } from '../../services/purchases.service';
import { Purchase } from '../../models/purchases';
import { ProductsService } from '../../services/products.service';
import { PayplansService } from '../../services/payplans.service';
import { Payplan } from '../../models/payplans';
import { UserService } from '../../services/user.service';


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

interface MonthlySummary {
  month : string;
  consumption: number;
  interest: number;
  status: string;
}

@Component({
  selector: 'app-customers',
  standalone: true,
  imports: [SharedModule, ScrollingModule, MatMenuModule, MatSidenavModule],
  templateUrl: './customers.component.html',
  styleUrl: './customers.component.css'
})
export class CustomersComponent {

  customers: Customer[] = [];
  customerData: Customer[] = [];
  filteredCustomers: Customer[] = [];
  countCustomers!: number;

  purchases: any[] = [
    {product: "Leche Gloria", price: 4, amount: 1, date: '2024-05-20T00:00:00', interest: 4.08, status: "Pendiente"},
    {product: "Gaseosa Coca Cola", price: 5.5, amount: 1, date: '2024-05-20T00:00:00', interest: 5.6, status: "Pendiente"},
    {product: "Mantequilla GL", price: 5, amount: 1, date: '2024-05-20T00:00:00', interest: 5.09, status: "Pendiente"},
    {product: "Leche Gloria", price: 4, amount: 1, date: '2024-05-20T00:00:00', interest: 4.08, status: "Pendiente"},
    {product: "Gaseosa Coca Cola", price: 5.5, amount: 1, date: '2024-05-20T00:00:00', interest: 5.6, status: "Pendiente"},
    {product: "Mantequilla GL", price: 5, amount: 1, date: '2024-05-20T00:00:00', interest: 5.09, status: "Pendiente"},
    {product: "Leche Gloria", price: 4, amount: 1, date: '2024-05-20T00:00:00', interest: 4.08, status: "Pendiente"},
    {product: "Gaseosa Coca Cola", price: 5.5, amount: 1, date: '2024-05-20T00:00:00', interest: 5.6, status: "Pendiente"},
    {product: "Mantequilla GL", price: 5, amount: 1, date: '2024-05-20T00:00:00', interest: 5.09, status: "Pendiente"},
    {product: "Leche Gloria", price: 4, amount: 1, date: '2024-05-20T00:00:00', interest: 4.08, status: "Pendiente"},
    {product: "Gaseosa Coca Cola", price: 5.5, amount: 1, date: '2024-05-20T00:00:00', interest: 5.6, status: "Pendiente"},
    {product: "Mantequilla GL", price: 5, amount: 1, date: '2024-05-20T00:00:00', interest: 5.09, status: "Pendiente"},
    {product: "Doritos", price: 5, amount: 1, date: '2024-05-20T00:00:00', interest: 5.09, status: "Pendiente"},
    {product: "Leche PuraV", price: 4, amount: 1, date: '2024-04-20T00:00:00', interest: 4.08, status: "Pagado"},
    {product: "Gaseosa Inca Cola", price: 5.5, amount: 1, date: '2024-04-20T00:00:00', interest: 5.6, status: "Pagado"},
    {product: "Mantequilla Mant", price: 5, amount: 1, date: '2024-04-20T00:00:00', interest: 5.09, status: "Pagado"}
  ];
  filteredPurchases: any[] = [];
  filteredPurchasesCustomer: any[] = [];
  filteredPurchasesMonth: any[] = [];
  selectedMonth!: number;
  monthlySummary: MonthlySummary[] = [];
  months: any[] = [
    { value: 0, viewValue: 'Enero' },
    { value: 1, viewValue: 'Febrero' },
    { value: 2, viewValue: 'Marzo' },
    { value: 3, viewValue: 'Abril' },
    { value: 4, viewValue: 'Mayo' },
    { value: 5, viewValue: 'Junio' },
    { value: 6, viewValue: 'Julio' },
    { value: 7, viewValue: 'Agosto' },
    { value: 8, viewValue: 'Septiembre' },
    { value: 9, viewValue: 'Octubre' },
    { value: 10, viewValue: 'Noviembre' },
    { value: 11, viewValue: 'Diciembre' }
  ];
  actualDate!: Date;

  filteredPayPlans: Payplan[] = [];

  totalInterests: number = 0;
  totalInterestsTotal: number = 0;
  totalInterestsMonthly: number = 0;
  selectedMonthForBill: number = new Date().getMonth();

  rateType!: string;
  ratePeriod!: string;
  rateCapitalization!: string;
  ratePercentage!: number;
  productPrice!: number;
  paymentDay!: number;
  interestGenerated!: number;
  moratoriumInterest: number = 0;
  moratoriumInterestMonth: number = 0;
  moratoriumInterestTotal: number = 0;
  totalPayment: number = 0;
  totalPaymentMonth: number = 0;
  totalPaymentTotal: number = 0;

  showFilterOptions: boolean = false;
  minCreditLimit!: number;
  maxCreditLimit!: number;
  nameCustomer!: string;
  lastnameCustomer!: string;
  statusCustomer!: string;
  customer!: Customer;

  allPurchases: any[] = [];

  @ViewChild('sidenav') sidenav!: MatSidenav;
  selectedCustomer: any = null;

  @ViewChild('drawer') drawer: any;
  drawerContainer!: ElementRef;

  idUser!: number;
  myForm!: FormGroup;
  EsInsertar: boolean = true;
  IsEffective: boolean = true;
  IsUpdate: boolean = true;
  typeRate!: string;
  idCustomer!: number;
  IsDetails: boolean = true;
  IsReports!: boolean;
  IsBill: boolean = false;
  IsBillMonth: boolean = false;
  IsBillTotal: boolean = false;
  pepe!: number;
  selectedCustomerId!: number;

  paymentsPlan: Payment[] = [];
  graceType: 'partial' | 'total' | 'none' = 'none';
  regularInstallment!:number;
  gracePeriods: number = 0;
  IsPayPlanSummary: boolean = false;

  amount_finance!: number;
  initial_fee!: number;
  monthly_rate!: number;
  amount_fees!: number;
  grace_type!: string;
  grace_periods!: number;

  moratoriumUser!: number;
  idUserSelected!: number;
  morita!: number;

  constructor(private router: Router, private activatedRoute: ActivatedRoute, private customerService: CustomerService,
    private formBuilder: FormBuilder, private snackBar: MatSnackBar, private purchaseService: PurchasesService, 
    private productServices: ProductsService, private payplanServices: PayplansService, 
    private userService: UserService){
    this.idUser = activatedRoute.snapshot.params["id"];
    this.actualDate = new Date();
    this.selectedMonth = this.actualDate.getMonth();
  }

  ngOnInit(){
    this.loadCustomerUser();
    console.log(this.filteredCustomers);
    this.reactiveForm();
    this.filterPurchasesByMonth();
  }

  filterCustomers(event:Event){
    let filterValue = (event.target as HTMLInputElement).value.trim().toLowerCase();
    this.filteredCustomers = this.customers.filter(customer =>
      customer.id_user == this.idUser &&
      (customer.name.toLowerCase().includes(filterValue) ||
          customer.lastname.toLowerCase().includes(filterValue) ||
          customer.phone.includes(filterValue) ||
          customer.email.toLowerCase().includes(filterValue) ||
          customer.limit.toString().includes(filterValue) ||
          customer.status.toLowerCase().includes(filterValue) ||
          customer.payment_date.toString().includes(filterValue) ||
          customer.limit >= this.minCreditLimit && customer.limit <= this.maxCreditLimit)
  );
  }


  reactiveForm():void{
    this.myForm = this.formBuilder.group({
      name_customer:["",[Validators.required]],
      lastname_customer: ["", [Validators.required]],
      dni_customer: ["", [Validators.required, Validators.minLength(8), Validators.maxLength(8)]],
      birthdate_customer:["", [Validators.required]],
      phone_customer:["", [Validators.required, Validators.minLength(9), Validators.maxLength(9)]],
      email_customer:["", [Validators.required, Validators.email]],
      rate_type:["", [Validators.required]],
      capitalization:[""],
      rate:["", [Validators.required, Validators.min(1), Validators.max(99)]],
      period:["",[Validators.required]],
      credit_limit:["", [Validators.required, Validators.min(1)]],
      status_user:["", [Validators.required]],
      payment_date:["", [Validators.required, Validators.min(1), Validators.max(30)]]
    });

    this.myForm.get('rate_type')?.valueChanges.subscribe(value => {
      this.onRateTypeChange(value);
  });
  }

  onRateTypeChange(value: string): void {
    const capitalizationControl = this.myForm.get('capitalization');
    if (value === 'NOMINAL') {
        capitalizationControl?.setValidators([Validators.required]);
    } else {
        capitalizationControl?.clearValidators();
    }
    capitalizationControl?.updateValueAndValidity();
}

  isFormValid(): boolean {
    return this.myForm.valid;
  }

  printCustomer(customerId: number):void{

    this.customerService.getCustomer(customerId).subscribe({
      next: (data) => {
        this.customer = data;
        console.log("customer ", this.customer);
        this.pepe = data.payment_date;
        console.log("pepe dentro", this.pepe);
        this.idUserSelected = data.id_user;
      },
      error: (err) => {
        console.log(err);
      }
    });

    this.filteredPurchasesCustomer = [];
    this.filteredPurchasesCustomer = [...this.filteredPurchasesCustomer];
    this.filterPurchasesByCustomer(customerId);

    console.log("pepe fuera", this.pepe);
  }

  dataForm(customer: Customer):void{
    this.selectedCustomer = customer;
    this.idCustomer = customer.id
    if(this.selectedCustomer.id != 0 && this.selectedCustomer.id != undefined){
      this.IsUpdate = true;
      this.customerService.getCustomer(this.selectedCustomer.id).subscribe({
        next: (data) => {
          this.selectedCustomerId = data.id;
          this.myForm.get("name_customer")?.setValue(data.name);
          this.myForm.get("lastname_customer")?.setValue(data.lastname);
          this.myForm.get("dni_customer")?.setValue(data.dni);
          this.myForm.get("birthdate_customer")?.setValue(data.bithdate);
          this.myForm.get("phone_customer")?.setValue(data.phone);
          this.myForm.get("email_customer")?.setValue(data.email);
          this.myForm.get("rate_type")?.setValue(data.rate_type);
          this.rateType = data.rate_type;
          // this.idUserSelected = data.id_user;
          if(data.rate_type == "NOMINAL"){
            this.IsEffective = false;
          }
          this.myForm.get("capitalization")?.setValue(data.capitalization);
          this.rateCapitalization = data.capitalization;
          this.myForm.get("rate")?.setValue(data.rate);
          this.ratePercentage	= data.rate;
          this.myForm.get("period")?.setValue(data.period);
          this.ratePeriod = data.period;
          this.myForm.get("credit_limit")?.setValue(data.limit);
          this.myForm.get("status_user")?.setValue(data.status);
          this.myForm.get("payment_date")?.setValue(data.payment_date);
          this.paymentDay = data.payment_date;
        },
        error: (err) => {
          console.log(err);
        }
      });
      console.log("El id del usuario al que pertenece el cliente", this.idUserSelected)
    }
    else{
      this.idCustomer = 0;
      this.IsUpdate = false;
    }

    console.log("El id del usuario en el calculateMoratoriumInterest", this.idUserSelected);
    this.userService.getUser(this.idUserSelected).subscribe({
      next: (data) => {
        this.moratoriumUser = data.mora;
      },
      error: (err) => {
          console.log(err);
      }
    });
  }

  saveChange():void{
    const newCstomer: Customer = {
      id: this.idCustomer,
      id_user: this.idUser,
      name: this.myForm.get("name_customer")!.value,
      lastname: this.myForm.get("lastname_customer")!.value,
      dni: this.myForm.get("dni_customer")!.value,
      bithdate: this.myForm.get("birthdate_customer")!.value,
      phone: this.myForm.get("phone_customer")!.value,
      email:this.myForm.get("email_customer")!.value,
      rate_type: this.myForm.get("rate_type")!.value,
      capitalization: this.myForm.get("capitalization")!.value,
      rate: this.myForm.get("rate")!.value,
      period: this.myForm.get("period")!.value,
      limit: this.myForm.get("credit_limit")!.value,
      status: this.myForm.get("status_user")!.value,
      payment_date: this.myForm.get("payment_date")!.value
    }

    if(this.IsUpdate){
      this.customerService.updateCustomer(newCstomer).subscribe({
        next: (data) => {
          this.snackBar.open("Se guardaron los cambios", "OK", {duration:4000});
          this.drawer.toggle();
          // window.location.reload();
          this.filteredCustomers = [];
          this.loadCustomerUser();
          this.filteredCustomers = [...this.filteredCustomers];
          this.myForm.reset();
        },
        error: (err) => {
          console.log(err);
        }
      });
    }
    else{
      console.log("El cliente que se registra con el postman es", newCstomer);
      this.customerService.addCustomer(newCstomer).subscribe({
        next: (data) => {
          this.snackBar.open("Se registro al nuevo cliente correctamente", "OK", {duration: 4000});
          this.drawer.toggle();
          this.filteredCustomers = [];
          this.loadCustomerUser();
          this.filteredCustomers = [...this.filteredCustomers];
        },
        error: (err) => {
          console.log(err);
        }
      })
    }
  }

  deleteCustomer(customer: Customer):void{
    this.idCustomer = customer.id;
    this.customerService.deleteCustomer(this.idCustomer).subscribe({
      next: (data) => {
        // window.location.reload();
        this.snackBar.open("Se elimino el cliente", "OK", {duration: 4000});
        this.loadCustomerUser();
        this.filteredCustomers = [...this.filteredCustomers];
      },
      error: (err) => {
        console.log(err);
      }
    })
  }

  ChangeValue(e:any){
    this.typeRate = e.target.value;
    if(this.typeRate == 'EFECTIVA'){
      this.IsEffective = true;
    }
    else{
      this.IsEffective = false;
    }
  }

  loadCustomerUser():void{
    
    this.idUser = this.activatedRoute.snapshot.params["id"];
    this.customerService.getCustomers().subscribe({
      next: (data: Customer[]) => {
        data.forEach((customer: Customer) => {
          if(customer.id_user == this.idUser){
            this.customers.push(customer);
            // this.filteredCustomers.push(customer);
          }
        });

        this.filteredCustomers = this.customers;
        this.customerData = this.filteredCustomers;
        this.countCustomers = this.filteredCustomers.length;
      },
      error: (err) => {
        console.log(err);
      }
    });
  }

  toggleFilterOptions() {
    this.showFilterOptions = !this.showFilterOptions;
  }

  clearFilters():void{
    this.nameCustomer = "";
    this.lastnameCustomer = "";
    this.statusCustomer = "";
    this.minCreditLimit = 0;
    this.maxCreditLimit = 0

    // this.filteredCustomers = this.customers;
    this.showFilterOptions = !this.showFilterOptions;

  }

  // generateInteres(productValue: number, dayPayment: Date):number{
  //   const currentDate = new Date(dayPayment);
  //   const dayPurchase = currentDate.getDate();
  //   const diffDays = this.paymentDay - dayPurchase


  //   if(this.rateType == "NOMINAL"){
  //     if(this.ratePeriod == "MENSUAL"){
  //       if(this.rateCapitalization == "DIARIA"){
  //         this.interestGenerated = productValue *(1+(this.ratePercentage/(100*30)))**diffDays;
  //         console.log("interes diaria el diablo", this.interestGenerated);
  //       }
  //       else{
  //         this.interestGenerated = productValue*(1+(this.ratePercentage/(100*1)))**(diffDays/30);
  //       }
  //     }
  //     else if(this.ratePeriod == "BIMESTRAL"){
  //       if(this.rateCapitalization == "DIARIA"){
  //         this.interestGenerated = productValue*(1+(this.ratePercentage/(100*60)))**diffDays;
  //       }
  //       else{
  //         this.interestGenerated = productValue*(1+(this.ratePercentage/(100*2)))**(diffDays/30);
  //       }
  //     }
  //     else if(this.ratePeriod == "TRIMESTRAL"){
  //       if(this.rateCapitalization == "DIARIA"){
  //         this.interestGenerated = productValue*(1+(this.ratePercentage/(100*90)))**diffDays;
  //       }
  //       else{
  //         this.interestGenerated = productValue*(1+(this.ratePercentage/(100*3)))**(diffDays/30);
  //       }
  //     }
  //     else if(this.ratePeriod == "CUATRIMESTRAL"){
  //       if(this.rateCapitalization == "DIARIA"){
  //         this.interestGenerated = productValue*(1+(this.ratePercentage/(100*120)))**diffDays;
  //       }
  //       else{
  //         this.interestGenerated = productValue*(1+(this.ratePercentage/(100*4)))**(diffDays/30);
  //       }
  //     }
  //     else if(this.ratePeriod == "SEMESTRAL"){
  //       if(this.rateCapitalization == "DIARIA"){
  //         this.interestGenerated = productValue*(1+(this.ratePercentage/(100*180)))**diffDays;
  //       }
  //       else{
  //         this.interestGenerated = productValue*(1+(this.ratePercentage/(100*6)))**(diffDays/30);
  //       }
  //     }
  //     else{
  //       if(this.rateCapitalization == "DIARIA"){
  //         this.interestGenerated = productValue*(1+(this.ratePercentage/(100*360)))**diffDays;
  //       }
  //       else{
  //         this.interestGenerated = productValue*(1+(this.ratePercentage/(100*12)))**(diffDays/30);
  //       }
  //     }
  //   }
  //   else{       
  //     if(this.ratePeriod == "MENSUAL"){
  //       this.interestGenerated = productValue * (1 + this.ratePercentage/100)**(diffDays/30);
  //     }
  //     else if(this.ratePeriod == "BIMESTRAL"){
  //       this.interestGenerated = productValue * (1 + this.ratePercentage/100)**(diffDays/60);
  //     }
  //     else if(this.ratePeriod == "TRIMESTRAL"){
  //       this.interestGenerated = productValue * (1 + this.ratePercentage/100)**(diffDays/90);
  //     }
  //     else if(this.ratePeriod == "CUATRIMESTRAL"){
  //       this.interestGenerated = productValue * (1 + this.ratePercentage/100)**(diffDays/120);
  //     }
  //     else if(this.ratePeriod == "SEMESTRAL"){
  //       this.interestGenerated = productValue * (1 + this.ratePercentage/100)**(diffDays/180);
  //     }
  //     else{
  //       this.interestGenerated = productValue * (1 + this.ratePercentage/100)**(diffDays/360);
  //     }
  //   }

  //   this.interestGenerated = Number(this.interestGenerated.toFixed(2));

  //   return this.interestGenerated
  // }

  filterPurchasesByCustomer(customerId: number):void{
    this.filteredPurchasesCustomer = [];
    console.log("clientefiltrr", customerId);
    this.selectedCustomerId = customerId;
    this.purchaseService.getPurchases().subscribe({
      next: (data: Purchase[]) => {
        data.forEach((purchase: Purchase) => {
          if(purchase.id_customer == customerId){
            this.filteredPurchasesCustomer.push(purchase);
            this.filteredPurchasesCustomer = [...this.filteredPurchasesCustomer];
          }
        });
      }
    });
    this.filteredPurchasesCustomer = [...this.filteredPurchasesCustomer];

    this.filterPaymentPlanByCustomer(customerId);
  }

  filterPurchasesByMonth(): void {
    // this.filteredPurchases = [];
    this.totalInterests = 0;
    console.log("selectedCustomerId para filter", this.selectedCustomerId);
    console.log("Mes", this.selectedMonth);
    this.purchaseService.getPurchases().subscribe({
      next: (data: Purchase[]) => {
        this.filteredPurchases = [];
        data.forEach((purchase: Purchase) => {
          if(purchase.id_customer == this.selectedCustomerId){
            const dateSale = new Date(purchase.date_register);
              if (dateSale.getMonth() === this.selectedMonth) {
                this.filteredPurchases.push(purchase);
                this.filteredPurchases = [...this.filteredPurchases];
                this.totalInterests = Math.round((this.totalInterests + purchase.interest) * 100) / 100;
              }
          }
        });
      }
    });



    this.filteredPurchases = [...this.filteredPurchases];

    this.calculateMonthlySummary();
  }

  calculateMonthlySummary(): void {
    const summaryMap: { [key: string]: MonthlySummary } = {};

    this.filteredPurchasesCustomer.forEach(purchase => {
      const purchaseDate = new Date(purchase.date_register);
      const month = purchaseDate.toLocaleString('default', { month: 'long' });
      const yearMonth = `${purchaseDate.getFullYear()}-${purchaseDate.getMonth()}`;
      
      if (!summaryMap[yearMonth]) {
        summaryMap[yearMonth] = {
          month: `${month} ${purchaseDate.getFullYear()}`,
          consumption: 0,
          interest: 0,
          status: 'Pagado'
        };
      }

      summaryMap[yearMonth].consumption += purchase.price;
      summaryMap[yearMonth].interest += purchase.interest;
      if (purchase.status !== 'Pagado') {
        summaryMap[yearMonth].status = 'Pendiente';
      }
    });

    this.monthlySummary = Object.values(summaryMap).map(summary => ({
      ...summary,
      consumption: parseFloat(summary.consumption.toFixed(2)),
      interest: parseFloat(summary.interest.toFixed(2))
    }));
  }


  openPaymentPopup() {
    const today = new Date();
    const currentMonth = today.getMonth();
    const paymentDate = new Date(today.getFullYear(), this.selectedMonth, this.paymentDay);
    console.log("Hola");
    console.log("paymentDate", paymentDate);

    if (today > paymentDate) {
      console.log("Hay moratoria");
      const daysLate = Math.floor((today.getTime() - paymentDate.getTime()) / (1000 * 3600 * 24));
      this.moratoriumInterest = this.calculateMoratoriumInterest(this.totalInterests, daysLate);
    } else {
      this.filteredPurchases.forEach(purchase => {
        purchase.moratoriumInterest = 0;
      });
    }

    console.log("totalInterests", this.totalInterests);
    console.log("moratoriumInterest", this.moratoriumInterest);
    this.totalPayment = Math.round((this.totalInterests + this.moratoriumInterest) * 100) / 100;
    this.IsBill = true;
  }

  calculateMoratoriumInterest(amount: number, daysLate: number): number {
    // const dailyRate = this.moratoriumRate / 365;
    

    this.morita = this.moratoriumUser;

    console.log("El interes moratorio se extrae del usuario", this.moratoriumUser);
    console.log("El interes moratorio se extrae del usuario", this.morita);

    // return Math.round((amount * ((1 + (75/100))**(daysLate/360) - 1)) * 100) / 100;
    return Math.round((amount * ((1 + (this.moratoriumUser/100))**(daysLate/360) - 1)) * 100) / 100;
    // return amount * ((1 + (75/100))**(daysLate/360) - 1);
  }

  closePaymentPopup() {
    this.IsBill = false;
    this.IsBillMonth = false;
    this.IsBillTotal = false;
  }

  confirmPayment() {
    this.filteredPurchases.forEach(purchase => {
      purchase.status = 'Pagado';
      purchase.moratoriumInterest = this.moratoriumInterest;
    });
    this.snackBar.open("Se realizó correctamente el pago", "OK", {duration:5000});
  }


  openBillForMonth(monthYear: string) {
    console.log(this.monthlySummary);
    const [monthName, year] = monthYear.split(' ');
    const monthIndex = this.getMonthIndex(monthName);
    const yearNumber = parseInt(year, 10);
    console.log(monthIndex);

    this.filteredPurchasesMonth = this.purchases.filter(purchase => {
    const purchaseDate = new Date(purchase.date);
    return purchaseDate.getMonth() === monthIndex && purchaseDate.getFullYear() === yearNumber;
  });
    console.log(this.filteredPurchasesMonth);

    this.totalInterestsMonthly = this.filteredPurchasesMonth.reduce((total, purchase) => total + purchase.interest, 0);

    // this.totalPayment = this.totalInterests + this.moratoriumInterest;
    this.totalPaymentMonth = this.totalInterestsMonthly;
    this.moratoriumInterestMonth = 0;
    this.IsBillMonth = true;
  }

  openBillTotal():void{
    console.log("openBillTotal",this.filteredPurchasesCustomer);
    const today = new Date();
    this.totalInterestsTotal = 0;
    this.moratoriumInterestTotal = 0;

    // this.filteredPurchasesCustomer.forEach((purchase: Purchase) => {
    //   if(purchase.status == "Pendiente"){
    //     this.allPurchases.push(purchase);
    //   }
    // });

    console.log("este es el cliente para el reporte total", this.selectedCustomerId);

    this.purchaseService.getPurchases().subscribe({
      next: (data: Purchase[]) => {
        data.forEach((purchase: Purchase) => {
          if(purchase.id_customer == this.selectedCustomerId){
            if(purchase.status == "Pendiente"){
              this.allPurchases.push(purchase);
              this.allPurchases = [...this.allPurchases];
            }
          }
        });
      },
      error: (err) => {
        console.log(err);
      }
    });

    console.log("Este es el allPurchases", this.allPurchases);

    this.totalInterestsTotal = this.allPurchases.reduce((total, purchase) => total + purchase.interest, 0);

    console.log("paymentDay para BillTota", this.paymentDay);
    this.allPurchases.forEach( purchase => {
      const purchaseDate = new Date(purchase.date_register);
      const currentMonth = purchaseDate.getMonth();
      const paymentDate = new Date(today.getFullYear(), currentMonth, this.paymentDay);
      const timeDifference = today.getTime() - paymentDate.getTime();
      const daysLate = Math.floor(timeDifference / (1000 * 3600 * 24));

      if(daysLate > 0){
        const interest = this.calculateMoratoriumInterest(purchase.price, daysLate);
        this.moratoriumInterestTotal += interest; 
      }
    });
    
    this.moratoriumInterestTotal = Math.round(this.moratoriumInterestTotal * 100) /100;

    this.totalPaymentTotal = Math.round((this.totalInterestsTotal + this.moratoriumInterestTotal) * 100) / 100;

    // this.IsBillTotal = true;
    this.allPurchases = [];


  }

  getMonthIndex(month: string): number {
    const monthNames = ["enero", "febrero", "marzo", "abril", "mayo", "junio", "julio", "agosto", "septiembre", "octubre", "noviembre", "diciembre"];
    return monthNames.indexOf(month);
  }

  filterPaymentPlanByCustomer(customerId: number):void{
    this.filteredPayPlans = [];
    this.payplanServices.getPayplans().subscribe({
      next: (data: Payplan[]) => {
        data.forEach((payplan: Payplan) => {
          if(payplan.id_customer == customerId){
            this.filteredPayPlans.push(payplan);
            this.filteredPayPlans = [...this.filteredPayPlans];
          }
        });
      }
    });

    this.filteredPayPlans = [...this.filteredPayPlans];
  }

  getDateRegister(date: string | Date): string {
  
    if (typeof date === 'string') {
      date = new Date(date);
    }
  
    if (isNaN(date.getTime())) {
      console.error("Invalid date:", date);
      return "Fecha inválida";
    }
  
    const year = date.getFullYear();
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const day = date.getDate().toString().padStart(2, '0');
  
    return `${year}-${month}-${day}`;
  }
  


  calculateFrenchPaymentPlan(
    principal: number,
    monthlyRate: number,
    numberOfPayments: number,
    gracePeriods: number,
    graceType: string
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
  

  openPayPlanSummary(payplan: Payplan){
    this.amount_finance = payplan.amount;
    this.initial_fee = 0;
    this.monthly_rate = payplan.monthlyrate;
    this.amount_fees = payplan.number_of_payments;
    this.grace_type = payplan.grace_type;
    this.grace_periods = payplan.grace_periods;
    this.paymentsPlan = this.calculateFrenchPaymentPlan(payplan.amount, payplan.monthlyrate, payplan.number_of_payments, payplan.grace_periods, payplan.grace_type);
  }


  payBillMonth():void{
    this.filteredPurchases.forEach(purchase => {
      const purchaseMonth: Purchase = {
        id: purchase.id,
        id_customer: purchase.id_customer,
        product_name: purchase.product_name,
        price: purchase.price,
        amount: purchase.amount,
        date_register: purchase.date_register,
        interest: purchase.interest,
        status: "Pagado"
      };

      this.purchaseService.updatePurchase(purchaseMonth).subscribe({
        next: (data) => {
          this.snackBar.open("Se canceló la compra", "OK", {duration:3000});
          this.IsBill = false;
          this.drawer.toggle();
        },
        error: (err) => {
          console.log(err);
        }
      });
    });
  }

  payBillSummaryMonth():void{
    this.filteredPurchasesMonth.forEach(purchase => {
      const purchaseMonth: Purchase = {
        id: purchase.id,
        id_customer: purchase.id_customer,
        product_name: purchase.product_name,
        price: purchase.price,
        amount: purchase.amount,
        date_register: purchase.date_register,
        interest: purchase.interest,
        status: "Pagado"
      };

      this.purchaseService.updatePurchase(purchaseMonth).subscribe({
        next: (data) => {
          this.drawer.toggle();
          this.IsBillMonth = false;
          this.snackBar.open("Se canceló la compra", "OK", {duration:3000});
        },
        error: (err) => {
          console.log(err);
        }
      });
    });
  }

  payBillTotal():void{
    this.allPurchases.forEach(purchase => {
      const purchaseMonth: Purchase = {
        id: purchase.id,
        id_customer: purchase.id_customer,
        product_name: purchase.product_name,
        price: purchase.price,
        amount: purchase.amount,
        date_register: purchase.date_register,
        interest: purchase.interest,
        status: "Pagado"
      };

      this.purchaseService.updatePurchase(purchaseMonth).subscribe({
        next: (data) => {
          this.drawer.toggle();
          this.IsBillTotal = false;
          this.snackBar.open("Se canceló la compra", "OK", {duration:3000});
        },
        error: (err) => {
          console.log(err);
        }
      });
    });
  }


  generatePDF() {
    const doc = new jsPDF();
    doc.text('Detalle de Pago', 10, 10);
    (doc as any).autoTable({
      head: [['Producto', 'Precio', 'Cantidad', 'Interés', 'Interés Moratorio']],
      body: this.filteredPurchases.map(purchase => [
        purchase.product,
        purchase.price,
        purchase.amount,
        purchase.interest,
        purchase.moratoriumInterest || 0
      ]),
    });
    doc.text(`Total Intereses: ${this.totalInterests}`, 10, (doc as any).autoTable.previous.finalY + 10);
    doc.text(`Interés Moratorio: ${this.moratoriumInterest}`, 10, (doc as any).autoTable.previous.finalY + 20);
    doc.text(`Total a Pagar: ${this.totalPayment}`, 10, (doc as any).autoTable.previous.finalY + 30);
    doc.text(`BCP:    191-26595868-0-97`, 10, (doc as any).autoTable.previous.finalY + 40);
    doc.text(`CCI:    004-191-126595 868097-50`, 10, (doc as any).autoTable.previous.finalY + 50);
    doc.text(`BBVA:   0011-0125-0300605844`, 10, (doc as any).autoTable.previous.finalY + 60);
    doc.text(`YAPE:   989548002           PLIN:   969585002`, 10, (doc as any).autoTable.previous.finalY + 70);
    doc.save(`boleta_pago_ ${this.selectedMonth} .pdf`);
  }

  generatePDFMonthly() {
    const doc = new jsPDF();
    doc.text('Detalle de Pago', 10, 10);
    (doc as any).autoTable({
      head: [['Producto', 'Precio', 'Cantidad', 'Interés', 'Interés Moratorio']],
      body: this.filteredPurchasesMonth.map(purchase => [
        purchase.product,
        purchase.price,
        purchase.amount,
        purchase.interest,
        purchase.moratoriumInterest || 0 
      ]),
    });
    doc.text(`Total Intereses: ${this.totalInterests}`, 10, (doc as any).autoTable.previous.finalY + 10);
    doc.text(`Interés Moratorio: ${this.moratoriumInterest}`, 10, (doc as any).autoTable.previous.finalY + 20);
    doc.text(`Total a Pagar: ${this.totalPayment}`, 10, (doc as any).autoTable.previous.finalY + 30);
    doc.text(`BCP:    191-26595868-0-97`, 10, (doc as any).autoTable.previous.finalY + 40);
    doc.text(`CCI:    004-191-126595 868097-50`, 10, (doc as any).autoTable.previous.finalY + 50);
    doc.text(`BBVA:   0011-0125-0300605844`, 10, (doc as any).autoTable.previous.finalY + 60);
    doc.text(`YAPE:   989548002           PLIN:   969585002`, 10, (doc as any).autoTable.previous.finalY + 70);
    doc.save(`boleta_pago_pasada_${this.selectedMonth} .pdf`);
  }
}