import { Component, ElementRef, ViewChild, Inject, PLATFORM_ID, Input } from '@angular/core';
import { SharedModule } from '../../shared/shared/shared.module';
import { createChart, DeepPartial, IChartApi, LineStyle, LineType } from 'lightweight-charts';
import { isPlatformBrowser } from '@angular/common'; 
import { DateAdapter } from '@angular/material/core';
import { ActivatedRoute } from '@angular/router';
import { CustomerService } from '../../services/customer.service';
import { Customer } from '../../models/customers';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [SharedModule],
  templateUrl: './home.component.html',
  styleUrl: './home.component.css'
})
export class HomeComponent {

  @ViewChild('profitChart', { static: true }) profitChartRef!: ElementRef;
  @ViewChild('barChart', { static: true }) barChartRef!: ElementRef;


  private chart!: IChartApi;
  private chartBar!: IChartApi;

  customersData: Customer[] = [];
  idUser!: number;

  filteredCustomers: Customer[] = [];

  isBarChartVisible: boolean = false;

  selected!: Date;
  currentDate:Date = new Date();
  weekDays: string[] = ['Lun', 'Mar', 'Mie', 'Jue', 'Vie', 'Sab', 'Dom'];
  weekDates: Date[] = [];

  products: any[] = [
    {product: 'Mantequilla', stock: '7'},
    {product: 'Cocaloca 3L', stock: '15'},
    {product: 'Leche Gloria', stock: '14'},
    {product: 'Pomarola', stock: '25'},
    {product: 'Oregano', stock: '16'},
    {product: 'Atun', stock: '25'},
    {product: 'Aceite Primor', stock: '23'},
    {product: 'Volt', stock: '13'},
    {product: 'Copix', stock: '7'}
  ]

  filteredProducts!: any[];


  constructor(@Inject(PLATFORM_ID) private platformId: Object, private dateAdapter: DateAdapter<Date>,
   private activatedRoute: ActivatedRoute, private customerService: CustomerService){}

  ngOnInit(){
    this.chartLoad();
    this.loadCustomers();
    console.log(this.customersData);
    this.updateWeekDates();
    this.getProductsLowStock();
  }

  chartLoad(){
    if(isPlatformBrowser(this.platformId)){
      const data = [
        { time: '2022-01-01', value: 94 },
        { time: '2022-02-01', value: 105 },
        { time: '2022-03-01', value: 97 },
        { time: '2022-04-01', value: 104 },
        { time: '2022-05-01', value: 116 },
        { time: '2022-06-01', value: 110 },
        { time: '2022-07-01', value: 91 },
        { time: '2022-08-01', value: 113 },
        { time: '2022-09-01', value: 99 },
        { time: '2022-10-01', value: 108 },
        { time: '2022-11-01', value: 119 },
        { time: '2022-12-01', value: 94 },
        { time: '2023-01-01', value: 102 },
        { time: '2023-02-01', value: 111 },
        { time: '2023-03-01', value: 95 },
        { time: '2023-04-01', value: 106 },
        { time: '2023-05-01', value: 117 },
        { time: '2023-06-01', value: 92 },
        { time: '2023-07-01', value: 118 },
        { time: '2023-08-01', value: 98 },
        { time: '2023-09-01', value: 114 },
        { time: '2023-10-01', value: 103 },
        { time: '2023-11-01', value: 115 },
        { time: '2023-12-01', value: 100 },
        { time: '2024-01-01', value: 115 },
        { time: '2024-02-01', value: 94 },
        { time: '2024-03-01', value: 108 },
        { time: '2024-04-01', value: 97 }
      ];

      const chartContainer = this.profitChartRef.nativeElement as HTMLElement;

      this.chart = createChart(chartContainer, { width: chartContainer.clientWidth, height: 180,
        grid: {
          vertLines: {
            visible: false,
          },
          horzLines: {
            visible: true,
          },
        },
        timeScale: {
          borderVisible: false,
        },
        rightPriceScale: {
          borderVisible: false,
        },
        handleScale: true,
        handleScroll: true,
       });
      const areaSeries = this.chart.addAreaSeries({ lineColor: '#aaf9de', topColor: '#41f1b6', bottomColor: 'rgba(27, 156, 133, 0.2)'});

      const lineSeries = this.chart.addLineSeries({color:'#41f1b6'});
      lineSeries.setData(data);
      areaSeries.setData(data);

      this.chart.timeScale().fitContent();

      // const chartBarContainer = this.barChartRef.nativeElement as HTMLElement;
      // this.chartBar = createChart(chartBarContainer, { width: chartContainer.clientWidth, height: 180,
      //   grid: {
      //     vertLines: {
      //       visible: false,
      //     },
      //     horzLines: {
      //       visible: true,
      //     },
      //   },
      //   timeScale: {
      //     borderVisible: false,
      //   },
      //   rightPriceScale: {
      //     borderVisible: false,
      //   },
      //   handleScale: true,
      //   handleScroll: true,
      //  });
      // const histogramSeries = this.chartBar.addHistogramSeries({color: '#41f1b6'});
      // histogramSeries.setData(data);
      
      // this.chartBar.timeScale().fitContent();
    }
  }

  loadCustomers():void{
    this.idUser = this.activatedRoute.snapshot.params["id"];
    console.log("este es el idUser en el home", this.idUser);
    this.customerService.getCustomers().subscribe({
      next: (data: Customer[]) => {
        data.forEach((customer: Customer) => {
          if(customer.id_user == this.idUser){
            this.customersData.push(customer);
            console.log(customer);
          }
        });
        this.filteredCustomers = this.customersData.slice(0,2);
      },
      error: (err) => {
        console.log(err);
      }
    });
  }

  get currentMonthYear(): string {
    const options = { year: 'numeric', month: 'long' };
    const localDate = this.currentDate.toLocaleDateString('es-ES', { year: 'numeric', month: 'long' });
    return this.capitalizeFirstLetter(localDate);
  }

  prevWeek(): void {
    this.currentDate = this.dateAdapter.addCalendarDays(this.currentDate, -7);
    this.updateWeekDates();
  }

  nextWeek(): void {
    this.currentDate = this.dateAdapter.addCalendarDays(this.currentDate, 7);
    this.updateWeekDates();
  }

  updateWeekDates(): void {
    const startOfWeek = this.getStartOfWeek(this.currentDate);
    this.weekDates = Array.from({ length: 7 }, (_, i) => this.dateAdapter.addCalendarDays(startOfWeek, i));
  }

  getStartOfWeek(date: Date): Date {
    const day = date.getDay();
    const diff = (day === 0 ? -6 : 1) - day;
    return this.dateAdapter.addCalendarDays(date, diff);
  }

  isToday(date: Date): boolean {
    const today = new Date();
    return date.getDate() === today.getDate() &&
           date.getMonth() === today.getMonth() &&
           date.getFullYear() === today.getFullYear();
  }

  private capitalizeFirstLetter(string: string): string {
    return string.charAt(0).toUpperCase() + string.slice(1);
  }

  getStatusStockText(stock: number): any{
    if (stock < 13){
      return 'Crítico';
    }else if (stock < 20){
      return 'Bajo';
    }
  } 

  getStatusStockClass(stock: number): any{
    if (stock < 13){
      return 'critical';
    }else if (stock < 20){
      return 'low';
    }
  }

  getProductsLowStock():void{
    this.filteredProducts = this.products.filter(product => product.stock < 15);
  }

}
