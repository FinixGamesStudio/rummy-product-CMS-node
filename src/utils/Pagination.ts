import { COMMON_CONSTANT } from '../constant';

interface Result {
  docs: unknown;
  totalDocs: number;
  limit: number;
  page: number;
  totalPages: number;
  hasNextPage: boolean;
  nextPage: string;
  hasPrevPage: boolean;
  prevPage: string;
  pagingCounter: number;
}

// if need more fields then add them here for sorting.
interface SortObject {
  _id?: number;
}

interface Paginate {
  query?: unknown;
  select?: string;
  sort?: any;
  populate?: any;
  offset?: number;
  limit?: number;
}

const Pagination = async (
  collections: any,
  paginate?: Paginate
): Promise<Result> => {

  let options: any = {
    select: paginate?.select || '',
    sort: paginate?.sort || { createdAt: -1 },
    populate: paginate?.populate || '',
    lean: true,
    offset: paginate?.offset || 0,
    // limit: paginate?.limit || COMMON_CONSTANT.PAGINATION_LIMIT
  };

  if (paginate && paginate.limit) {
    options = {
      ...options,
      limit: paginate.limit
    }
  } else {
    options = {
      ...options,
      pagination: false
    }
  }
  
  let query = {};
  if (paginate) {
    if (paginate.query) {
      query = paginate.query
    }
    else {
      query = paginate
    }
  }

  return collections.paginate(query, options);
};

const aggregatePaginate = async (collections: any, paginate?: Paginate) => {
  const options = {
    page: paginate?.offset || 1,
    limit: paginate?.limit || COMMON_CONSTANT.PAGINATION_LIMIT
  };

  const aggregate = collections.aggregate(paginate?.query);

  return collections.aggregatePaginate(aggregate, options);
};

const exportObject = {
  Pagination,
  aggregatePaginate
};

export = exportObject;
