import { Injectable } from '@angular/core';
import { RidesService } from '../../../../../repositories/rides/services/rides.service';
import { StationsFacade } from '../../stations/station-store/services/stations.facade';
import { filter, forkJoin, map, Observable, of, switchMap } from 'rxjs';
import { RouteApi } from '../../../../../repositories/rides/services/models/route-api.model';
import { StationInfo } from '../../stations/models/station-info';
import { RideRoute } from '../models/route';
import { UpdateRideApi } from '../../../../../repositories/rides/services/models/update-route-api';
import { transformDateToIsoString } from '../helpers/transform-date-to-isostring';

@Injectable({
  providedIn: 'root',
})
export class RidesFacade {
  constructor(
    private readonly ridesService: RidesService,
    private stationsFacade: StationsFacade,
  ) {}

  public getStations(): Observable<StationInfo[]> {
    return this.stationsFacade.stations.pipe(
      switchMap((stations) => {
        if (stations.length === 0) {
          this.stationsFacade.getStations();
          return this.stationsFacade.stations;
        }
        return of(stations);
      }),
      filter((stations) => stations.length > 0),
    );
  }

  public getRouteRides(id: string): Observable<RideRoute> {
    return this.getStations().pipe(
      switchMap((stations) => {
        return forkJoin([this.ridesService.getRoute(id), of(stations)]);
      }),
      map(([route, stations]) => this.mapRouteWithCityNames(route, stations)),
    );
  }

  private mapRouteWithCityNames(route: RouteApi, stations: StationInfo[]): RideRoute {
    const stationMap = new Map<number, string>(stations.map((station) => [station.id, station.city]));

    const pathWithCityNames = route.path.map((id) => stationMap.get(id) || 'Unknown City');

    return {
      ...route,
      path: pathWithCityNames,
    };
  }

  public updateRide(ride: UpdateRideApi): Observable<void> {
    ride.segments.forEach((segment) => {
      segment.time = segment.time.map((t) => transformDateToIsoString(t));
    });
    return this.ridesService.updateRide(ride);
  }
}
