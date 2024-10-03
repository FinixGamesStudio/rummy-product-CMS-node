import { Country }  from 'country-state-city';

const countries = Country.getAllCountries();
const validContryNames = countries.map(({name}: any) => (name));
const validContryCodes = countries.map(({isoCode}: any) => (isoCode));
const validContryLatitude = countries.map(({latitude}: any) => (latitude));
const validContryPhoneCode = countries.map(({phonecode}: any) => (phonecode));

export = Object.freeze({
  VALID_COUNTRY_NAMES: validContryNames,

  VALID_COUNTRY_CODES: validContryCodes,

  VALID_COUNTRY_LATITUDE: validContryLatitude,

  VALID_PHONE_CODES: validContryPhoneCode
});
