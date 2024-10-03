import { Pagination, aggregatePaginate } from './Pagination';
import MongoService from './mongoService';
import _ from 'lodash';
import * as fs from 'fs';
import { ExportArray } from '../api/analytics/analytics.interface';

const getCSVArray = (
  mergeWith: string,
  array: ExportArray,
  arrayList: ExportArray
): any => {
  return _(array)
    .concat(arrayList)
    .groupBy(mergeWith)
    .map(_.spread(_.merge))
    .value();
};

const removeFile = (path: string): void => {
  return fs.unlinkSync(path);
};

const exportObject = {
  Pagination,
  aggregatePaginate,
  MongoService,
  getCSVArray,
  removeFile,
};

export = exportObject;
