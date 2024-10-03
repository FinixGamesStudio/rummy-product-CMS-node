import { COMMON_CONSTANT } from '../../constant';

class DailyReportsCommon {

  public aggrGetDailyActiveUsers = async (mQuery: any) => {
    const aggrGetDailyActiveUsers = await [
      {
        $match: mQuery
      },
      {
        $group: {
          _id: {
            $dateToString: {
              format: "%Y-%m-%d",
              date: "$createdAt",
              timezone: COMMON_CONSTANT.INDIA_TIMEZONE
            }
          },
          count: { $sum: 1 }
        }
      },
      {
        $project: {
          _id: 0,
          date: '$_id',
          count: 1
        }
      },
      { $sort: { date: 1 } }
    ];

    return aggrGetDailyActiveUsers;
  };

  public aggrGetDailyInstalls = async (mQuery: any) => {
    const aggrGetDailyInstalls = await [
      {
        $match: mQuery
      },
      {
        $group: {
          _id: {
            $dateToString: {
              format: "%Y-%m-%d",
              date: "$createdAt",
              timezone: COMMON_CONSTANT.INDIA_TIMEZONE
            }
          },
          count: { $sum: 1 }
        }
      },
      {
        $project: {
          _id: 0,
          date: '$_id',
          count: 1
        }
      },
      { $sort: { date: 1 } }
    ];

    return aggrGetDailyInstalls;
  };

}

export default DailyReportsCommon;