import { Router, Request, Response, NextFunction } from 'express';
import Controller from '../../interface/controller.interface';
import authMiddleware from '../../middleware/auth.middleware';
import Logger from '../../logger/index';
import { successMiddleware } from '../../middleware/responseAPI.middleware';
import roleMiddleware from '../../middleware/role.middleware';
import { Country, State }  from 'country-state-city';
import CountryValidation from './country.validation';

import {
  ROUTES,
  SUCCESS_MESSAGES,
  USER_CONSTANT,
  COUNTRY_CONSTANT
} from '../../constant';

class CountryController implements Controller {
  public path = `/${ROUTES.COUNTRY}`;
  public router = Router();
  private validation = new CountryValidation();

  constructor() {
    this.initializeRoutes();
  }

  private initializeRoutes() {
    this.router.post(
      `${this.path}/getAllCountries`,
      authMiddleware,
      this.getAllCountries
    );

    this.router.post(
      `${this.path}/getAllStates`,
      authMiddleware,
      this.validation.getStateOfCountryValidation(),
      this.getStatesOfCountry
    );

    this.router.post(
      `${this.path}/getAllCountryNames`,
      authMiddleware,
      this.getAllCountryNames
    );
  }

  private getAllCountries = async (
    request: Request,
    response: Response,
    next: NextFunction
  ) => {
    try {
      const countries = Country.getAllCountries();
      const responseData = countries.map(({isoCode, name}) => ({isoCode, name}))
      
      return successMiddleware(
        {
          message: SUCCESS_MESSAGES.COMMON.FETCH_SUCCESS.replace(
            ':attribute',
            'Countries'
          ),
          data: responseData
        },
        request,
        response,
        next
      );
    } catch (error) {
      Logger.error(`There was an issue into fetching all countries.: ${error}`);
      return next(error);
    }
  };

  private getStatesOfCountry = async (
    request: Request,
    response: Response,
    next: NextFunction
  ) => {
    try {
      const { isoCode } = request.body;
      const allStates = State.getStatesOfCountry(isoCode);
      const responseData = allStates.map(({isoCode, name}) => ({isoCode, name}))
      
      return successMiddleware(
        {
          message: SUCCESS_MESSAGES.COMMON.FETCH_SUCCESS.replace(
            ':attribute',
            'States'
          ),
          data: responseData
        },
        request,
        response,
        next
      );
    } catch (error) {
      Logger.error(`There was an issue into fetching all states.: ${error}`);
      return next(error);
    }
  };

  private getAllCountryNames = async (
    request: Request,
    response: Response,
    next: NextFunction
  ) => {
    try {
      const countryNames = COUNTRY_CONSTANT.VALID_COUNTRY_NAMES;
      
      return successMiddleware(
        {
          message: SUCCESS_MESSAGES.COMMON.FETCH_SUCCESS.replace(
            ':attribute',
            'Countries name'
          ),
          data: {countryNames}
        },
        request,
        response,
        next
      );
    } catch (error) {
      Logger.error(`There was an issue into fetching all country names.: ${error}`);
      return next(error);
    }
  };

  public async getCountryByCountryName(countryName: string) {    
    const countries = Country.getAllCountries();
    const responseData = countries.find((obj) => { 
      return obj.name == countryName;
    });

    return responseData;
  }

  public async getCountryByCountryIsoCode(isoCode: string) {    
    const countries = Country.getAllCountries();
    const responseData = countries.find((obj) => { 
      return obj.isoCode == isoCode;
    });

    return responseData;
  }
}

export default CountryController;
