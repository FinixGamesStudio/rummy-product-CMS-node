import userModel from '../user/user.model';
class AnalyticsCommon {
  private User = userModel;

  public aggregatedailyActiveUserReport = async () => {

    const aggregatedailyActiveUserReport: any = [
      {
        $lookup: {
          from: "users",
          localField: "userId",
          foreignField: "_id",
          as: "user",
        },
      },
      {
        $unwind: {
          path: "$user",
          preserveNullAndEmptyArrays: true,
        },
      },
      {
        $addFields: {
          userName: "$user.userName",
          role: "$user.role",
          deviceType: "$user.deviceType",
          isBot: "$user.isBot",
        },
      },
      {
        $project: {
          date: {
            $dateToString: {
              format: "%Y-%m-%d",
              date: "$createdAt",
            },
          },
          userName: 1,
          role: 1,
          deviceType: 1,
          isBot: 1,
        },
      },
      {
        $match: {
          role: "User",
          isBot: false,
        },
      },
      {
        $group: {
          _id: "$date",
          user: {
            $push: {
              userName: "$userName",
              _id: "$_id",
            },
          },
          Android: {
            $sum: {
              $cond: [
                {
                  $eq: ["$deviceType", "Android"],
                },
                1,
                0,
              ],
            },
          },
          IOS: {
            $sum: {
              $cond: [
                {
                  $eq: ["$deviceType", "Ios"],
                },
                1,
                0,
              ],
            },
          },
        },
      },
      {
        $project: {
          _id: 0,
          date: "$_id",
          userCount: {
            $size: "$user",
          },
          Android: 1,
          IOS: 1,
          Total: {
            $sum: ["$Android", "$IOS"],
          },
        },
      },
      {
        $sort: {
          date: -1,
        },
      },
    ]

    return aggregatedailyActiveUserReport;
  };

  public aggregateDailyNewUserReport = async () => {
    const aggregateDailyNewUserReport: any = [
      {
        $project: {
          date: {
            $dateToString: {
              format: "%Y-%m-%d",
              date: "$createdAt",
            },
          },
          userName: 1,
          role: 1,
          deviceType: 1,
          isBot: 1,
        },
      },
      {
        $match: {
          role: "User",
          isBot: false,
        },
      },
      {
        $group: {
          _id: "$date",
          user: {
            $push: {
              username: "$userName",
              _id: "$_id",
            },
          },
          Android: {
            $sum: {
              $cond: [
                {
                  $eq: ["$deviceType", "Android"],
                },
                1,
                0,
              ],
            },
          },
          IOS: {
            $sum: {
              $cond: [
                {
                  $eq: ["$deviceType", "Ios"],
                },
                1,
                0,
              ],
            },
          },
        },
      },
      {
        $project: {
          _id: 0,
          date: "$_id",
          userCount: {
            $size: "$user",
          },
          Android: 1,
          IOS: 1,
          Total: {
            $sum: ["$Android", "$IOS"],
          },
        },
      },
      {
        $sort: {
          date: -1,
        },
      },
    ]

    return aggregateDailyNewUserReport

  };

  public aggregateMonthlyActiveUserReport = async () => {
    const aggregateMonthlyActiveUserReport: any = [
      {
        $project: {
          date: {
            $dateToString: {
              format: '%Y-%m',
              date: '$createdAt'
            }
          },
          userName: 1,
          role: 1,
          deviceType: 1,
          isBot : 1
        }
      },
      {
        $match: {
          role: 'User',
          isBot : false,
        }
      },
      {
        $group: {
          _id: '$date',
          user: {
            $push: {
              username: '$userName',
              _id: '$_id'
            }
          },
          Android: {
            $sum: {
              $cond: [{ $eq: ['$deviceType', 'Android'] }, 1, 0]
            }
          },
          IOS: {
            $sum: {
              $cond: [{ $eq: ['$deviceType', 'Ios'] }, 1, 0]
            }
          },
        }
      },
      {
        $project: {
          _id: 0,
          date: '$_id',
          userCount: { $size: '$user' },
          Android: 1,
          IOS: 1,
          Total: {
            $sum: ['$Android', '$IOS']
          }
        }
      },
      {
        $sort: {
          'date': -1
        }
      }
    ]

    return aggregateMonthlyActiveUserReport

  };


}

export default AnalyticsCommon;
