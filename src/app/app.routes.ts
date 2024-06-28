import { Routes } from '@angular/router';
import { StartComponent } from './components/start/start.component';
import { DashboardComponent } from './components/dashboard/dashboard.component';
import { HomeComponent } from './components/home/home.component';
import { CustomersComponent } from './components/customers/customers.component';
import { ProductsComponent } from './components/products/products.component';
import { SupportComponent } from './components/support/support.component';
import { SalesComponent } from './components/sales/sales.component';
import { PaymentplanComponent } from './components/paymentplan/paymentplan.component';
import { ProfileComponent } from './components/profile/profile.component';

export const routes: Routes = [
    {path:'', component:StartComponent},
    {path:'login-register',component:StartComponent},
    {path:'dashboard/:id',component:DashboardComponent,
        children:[{path:'home/:id', component:HomeComponent},
            {path:'customers/:id', component:CustomersComponent},
            {path:'products', component:ProductsComponent},
            {path:'support', component:SupportComponent},
            {path:'sales/:id', component:SalesComponent},
            {path:'paymentplan/:id', component: PaymentplanComponent},
            {path:'profile/:id', component:ProfileComponent}
        ]
    }
];
