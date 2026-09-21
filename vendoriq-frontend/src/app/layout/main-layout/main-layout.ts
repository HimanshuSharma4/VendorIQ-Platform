import { Component } from '@angular/core';
import { Sidebar } from '../sidebar/sidebar'; 
import { Header } from '../header/header';   
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-main-layout',
  imports: [Sidebar, Header, RouterModule],
  templateUrl: './main-layout.html',
  styleUrl: './main-layout.css'
})
export class MainLayout {}