import { CommonModule } from '@angular/common';
import { AfterContentChecked, AfterViewInit, Component, inject, model, OnInit, signal } from '@angular/core';
import { ButtonComponent } from '../../../../common/button/button.component';
import { MatIcon } from '@angular/material/icon';
import { MatLabel } from '@angular/material/form-field';
import { MatCheckbox } from '@angular/material/checkbox';
import { MatDialog } from '@angular/material/dialog';
import { Router } from '@angular/router';
import { AuthFacade } from '../../../../core/authorization/services/auth.facade';
import { RoleService } from '../../../../core/roles/role.service';
import { AuthBuySeatComponent } from '../auth-buy-seat/auth-buy-seat.component';
import { TripDetailsResponse } from '../../models/trip-details-response.model';
import { MatIconButton } from '@angular/material/button';
import { CarriagesCarouselComponent } from '../carriages-carousel/carriages-carousel.component';
import { HttpClient } from '@angular/common/http';
import { Carriage } from '../../../admin/features/carriages/models/carriage.model';
import { CarriageRowComponent } from '../../../admin/features/carriages/components/carriage-row/carriage-row.component';

@Component({
  selector: 'TTP-trip-details',
  standalone: true,
  imports: [
    CommonModule,
    ButtonComponent,
    MatIcon,
    MatLabel,
    MatCheckbox,
    MatIconButton,
    CarriagesCarouselComponent,
    CarriageRowComponent,
  ],
  templateUrl: './trip-details.component.html',
  styleUrl: './trip-details.component.scss',
})
export class TripDetailsComponent implements AfterViewInit, OnInit, AfterContentChecked {
  public popupAuth = signal('');
  public authValue = model('');
  public dialog = inject(MatDialog);
  public userRole = '';
  public openBookSeatPopup = signal(false);
  public seatIsSelected = signal(true);
  public width!: number;
  public content!: HTMLElement;
  public rideIdResponse!: TripDetailsResponse;
  public rideCarriagesNames!: string[];
  public allAvailableAppCarriages!: Carriage[];
  public uniqueCarriageNames!: string[];
  public filteredOnlyRideCarriagesTypes!: Carriage[];
  public allRideCarriages: Carriage[] = [];
  public allFilteredRideCarriages: Carriage[] = [];
  public areCarriages = signal(false);
  public filterSliderCarriageName!: string;
  public isCarriageTypeSelected = signal('');

  constructor(
    private router: Router,
    private authFacade: AuthFacade,
    private roleService: RoleService,
    private httpClient: HttpClient,
  ) {
    this.initializeUserRole();
  }

  ngOnInit() {
    this.httpClient.get('route').subscribe({
      next: (data) => {
        console.log(data);
      },
    });
    this.httpClient.get<Carriage[]>('carriage').subscribe({
      next: (data) => {
        console.log(data);
        this.allAvailableAppCarriages = data;
      },
    });
    this.httpClient.get<TripDetailsResponse>(`search/${this.rideId}`).subscribe({
      next: (data) => {
        console.log(data);
        this.rideCarriagesNames = data.carriages;
        console.log(data.carriages);
        this.uniqueCarriageNames = [...new Set(this.rideCarriagesNames)];
        if (data.carriages.length > 0) {
          this.areCarriages.set(true);
        }
        console.log(this.uniqueCarriageNames);
        console.log(this.allRideCarriages);
        this.rideCarriagesNames.map((element) => {
          for (let i = 0; i <= this.allAvailableAppCarriages.length - 1; i++) {
            if (this.allAvailableAppCarriages[i].code === element) {
              this.allRideCarriages.push(this.allAvailableAppCarriages[i]);
              this.allFilteredRideCarriages = this.allRideCarriages;
              console.log(this.allFilteredRideCarriages);
            }
          }
        });
      },
    });
  }

  ngAfterViewInit(): void {
    this.content = document.querySelector('#carousel-content')!;
    if (!this.content) {
      throw new Error('no content out there');
    }
    if (this.content) {
      this.width = this.content.offsetWidth;
      window.addEventListener('resize', () => {
        if (!this.content) {
          throw new Error('no content out there');
        }
        this.width = this.content.offsetWidth;
      });
    }
  }

  ngAfterContentChecked() {
    if (this.filterSliderCarriageName) {
      console.log(this.filterSliderCarriageName);
      this.allRideCarriages.map((item) => console.log(item.code));
      this.allFilteredRideCarriages = this.allRideCarriages.filter(
        (item) => item.code === this.filterSliderCarriageName,
      );
      console.log(this.allRideCarriages);
    }
    if (!this.filterSliderCarriageName) {
      console.log('no name for filter provided');
      this.allFilteredRideCarriages = this.allRideCarriages;
    }
  }

  redirectToHomePage() {
    this.router.navigate(['/']);
  }

  private initializeUserRole(): void {
    this.roleService.userRole$.subscribe((role) => {
      this.userRole = role;
    });

    if (this.authFacade.isAuthenticated) {
      this.authFacade.getUserRole();
    }
  }

  public get isAuthenticated(): boolean {
    return this.authFacade.isAuthenticated;
  }

  public openAuthModal() {
    const dialogRef = this.dialog.open(AuthBuySeatComponent, {
      data: this.authValue(),
    });

    dialogRef.afterClosed().subscribe((result) => {
      if (result !== undefined) {
        this.authValue.set(result);
      }
    });
  }

  rideId = 1;

  public buyTicket() {
    console.log('call api to buy ticket and /order');
    this.httpClient.post('order', { rideId: 1, seat: 33, stationStart: 69, stationEnd: 160 }).subscribe({
      next: (data) => {
        console.log(data);
      },
      /* error: ({ error }: HttpErrorResponse) => {
        if (error.reason === 'alreadyLoggedIn') {
          this.signInForm.controls['email'].setErrors({ alreadyLoggedIn: true });
        }
        if (error.reason === 'userNotFound') {
          this.signInForm.controls['email'].setErrors({ userNotFound: true });
        }
        if (error.reason === 'invalidEmail') {
          this.signInForm.controls['email'].setErrors({ invalidEmail: true });
        }
        if (error.reason === 'invalidFields') {
          this.signInForm.controls['email'].setErrors({ invalidFields: true });
        }
      }, */
    });
  }

  moveLeft() {
    this.content.scrollBy(-(this.width + 10), 0);
  }

  moveRight() {
    this.content.scrollBy(this.width + 10, 0);
  }

  getCarriageName(item: string) {
    this.filterSliderCarriageName = item;
    console.log(this.filterSliderCarriageName);
  }
}
