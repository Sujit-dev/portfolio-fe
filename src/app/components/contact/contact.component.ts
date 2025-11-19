import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { PortfolioService } from '../../services/portfolio.service';

@Component({
  selector: 'app-contact',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './contact.component.html',
  styleUrl: './contact.component.scss'
})
export class ContactComponent implements OnInit {
  portfolioData: any;
  contactForm = {
    name: '',
    email: '',
    phone: '',
    message: ''
  };
  submitted = false;
  isQA: boolean = false;

  constructor(private portfolioService: PortfolioService) {}

  ngOnInit() {
    this.portfolioData = this.portfolioService.getPortfolioData();
    this.isQA = this.portfolioService.getCurrentPortfolioType() === 'qa';
  }

  onSubmit() {
    // In a real application, you would send this to a backend
    console.log('Form submitted:', this.contactForm);
    this.submitted = true;
    
    // Reset form after 3 seconds
    setTimeout(() => {
      this.contactForm = {
        name: '',
        email: '',
        phone: '',
        message: ''
      };
      this.submitted = false;
    }, 3000);
  }
}

